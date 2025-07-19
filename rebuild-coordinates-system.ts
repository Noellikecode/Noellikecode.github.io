import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

interface Clinic {
  id: string;
  name: string;
  city: string;
  notes: string;
}

interface GeocodeResult {
  lat: number;
  lon: number;
  display_name: string;
}

async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    const cleanAddress = address.replace(/NPI: \d+\.\s*Address:\s*/, '');
    const encodedAddress = encodeURIComponent(cleanAddress + ', United States');
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=us`,
      {
        headers: {
          'User-Agent': 'GlobalSpeechAccessMap/1.0 (speech-therapy-map)'
        }
      }
    );
    
    if (!response.ok) {
      console.warn(`Geocoding failed for: ${address}`);
      return null;
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error geocoding ${address}:`, error);
    return null;
  }
}

async function rebuildAllCoordinates() {
  console.log('🌍 Starting complete coordinate rebuild using authentic address geocoding...');
  
  try {
    // Step 1: Get all clinics with their address data
    const clinics = await sql<Clinic[]>`
      SELECT id, name, city, notes 
      FROM clinics 
      WHERE notes IS NOT NULL AND notes LIKE '%Address:%'
      ORDER BY city, name
    `;
    
    console.log(`📍 Found ${clinics.length} clinics with address data to geocode`);
    
    let successCount = 0;
    let failureCount = 0;
    
    // Step 2: Process each clinic individually with rate limiting
    for (let i = 0; i < clinics.length; i++) {
      const clinic = clinics[i];
      
      console.log(`[${i + 1}/${clinics.length}] Processing: ${clinic.name} in ${clinic.city}`);
      
      // Extract address from notes field
      const addressMatch = clinic.notes.match(/Address:\s*(.+?)(?:,|$)/);
      if (!addressMatch) {
        console.warn(`No address found for clinic: ${clinic.name}`);
        failureCount++;
        continue;
      }
      
      const address = addressMatch[1].trim();
      console.log(`  Address: ${address}, ${clinic.city}`);
      
      // Geocode the full address
      const geocodeResult = await geocodeAddress(`${address}, ${clinic.city}`);
      
      if (geocodeResult) {
        // Validate coordinates are within US bounds
        const isValidUS = (
          (geocodeResult.lat >= 24.0 && geocodeResult.lat <= 50.0 && 
           geocodeResult.lon >= -130.0 && geocodeResult.lon <= -65.0) ||
          (geocodeResult.lat >= 60.0 && geocodeResult.lat <= 72.0 && 
           geocodeResult.lon >= -180.0 && geocodeResult.lon <= -140.0) ||
          (geocodeResult.lat >= 18.0 && geocodeResult.lat <= 23.0 && 
           geocodeResult.lon >= -162.0 && geocodeResult.lon <= -154.0)
        );
        
        if (isValidUS) {
          // Update database with accurate coordinates
          await sql`UPDATE clinics SET latitude = ${geocodeResult.lat}, longitude = ${geocodeResult.lon} WHERE id = ${clinic.id}`;
          
          console.log(`  ✅ Updated: ${geocodeResult.lat}, ${geocodeResult.lon}`);
          successCount++;
        } else {
          console.warn(`  ❌ Invalid coordinates for ${clinic.name}: ${geocodeResult.lat}, ${geocodeResult.lon}`);
          failureCount++;
        }
      } else {
        console.warn(`  ❌ Failed to geocode: ${clinic.name}`);
        failureCount++;
      }
      
      // Rate limiting: 1 request per second to respect Nominatim usage policy
      if (i < clinics.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Step 3: Handle any remaining clinics without addresses using city-level geocoding
    console.log('\n🏙️ Processing clinics without specific addresses...');
    
    const cityOnlyClinics = await sql<{city: string}[]>`
      SELECT DISTINCT city 
      FROM clinics 
      WHERE latitude IS NULL OR longitude IS NULL
    `;
    
    for (const cityClinic of cityOnlyClinics) {
      console.log(`Geocoding city: ${cityClinic.city}`);
      
      const cityResult = await geocodeAddress(`${cityClinic.city}, United States`);
      if (cityResult) {
        await sql`UPDATE clinics SET latitude = ${cityResult.lat}, longitude = ${cityResult.lon} WHERE city = ${cityClinic.city} AND (latitude IS NULL OR longitude IS NULL)`;
        console.log(`  ✅ Updated city ${cityClinic.city}: ${cityResult.lat}, ${cityResult.lon}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Step 4: Final cleanup - remove any clinics that still couldn't be geocoded
    const removedResult = await sql`DELETE FROM clinics WHERE latitude IS NULL OR longitude IS NULL`;
    const removedCount = removedResult.length;
    
    console.log(`\n📊 Coordinate rebuild complete:`);
    console.log(`  ✅ Successfully geocoded: ${successCount} clinics`);
    console.log(`  ❌ Failed to geocode: ${failureCount} clinics`);
    console.log(`  🗑️ Removed invalid records: ${removedCount} clinics`);
    
    // Step 5: Verify final accuracy
    const verification = await sql`
      SELECT 
        CASE 
          WHEN latitude BETWEEN 24.0 AND 50.0 AND longitude BETWEEN -130.0 AND -65.0 THEN 'Valid US coordinates'
          WHEN latitude BETWEEN 60.0 AND 72.0 AND longitude BETWEEN -180.0 AND -140.0 THEN 'Alaska coordinates'
          WHEN latitude BETWEEN 18.0 AND 23.0 AND longitude BETWEEN -162.0 AND -154.0 THEN 'Hawaii coordinates'
          ELSE 'Invalid coordinates'
        END as coord_status,
        COUNT(*) as count
      FROM clinics 
      GROUP BY coord_status
      ORDER BY count DESC
    `;
    
    console.log('\n📍 Final coordinate accuracy:');
    verification.forEach(row => {
      console.log(`  ${row.coord_status}: ${row.count} clinics`);
    });
    
  } catch (error) {
    console.error('Error rebuilding coordinates:', error);
  }
}

// Allow NULL coordinates temporarily for the rebuild
async function prepareForRebuild() {
  try {
    await sql`ALTER TABLE clinics ALTER COLUMN latitude DROP NOT NULL`;
    await sql`ALTER TABLE clinics ALTER COLUMN longitude DROP NOT NULL`;
    await sql`UPDATE clinics SET latitude = NULL, longitude = NULL`;
    console.log('✅ Database prepared for coordinate rebuild');
  } catch (error) {
    console.error('Error preparing database:', error);
  }
}

async function main() {
  await prepareForRebuild();
  await rebuildAllCoordinates();
}

if (require.main === module) {
  main().catch(console.error);
}