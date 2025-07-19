import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

interface Clinic {
  id: string;
  name: string;
  city: string;
  notes: string;
  latitude: number;
  longitude: number;
}

interface GeocodeResult {
  lat: number;
  lon: number;
  display_name: string;
  address: any;
}

async function geocodeWithStateValidation(address: string, expectedCity: string): Promise<GeocodeResult | null> {
  try {
    // Clean and format the address
    const cleanAddress = address.replace(/NPI: \d+\.\s*Address:\s*/, '').trim();
    const fullAddress = `${cleanAddress}, ${expectedCity}, United States`;
    const encodedAddress = encodeURIComponent(fullAddress);
    
    console.log(`  Geocoding: ${fullAddress}`);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=3&countrycodes=us&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'GlobalSpeechAccessMap/1.0 (speech-therapy-coordinate-validation)'
        }
      }
    );
    
    if (!response.ok) {
      console.warn(`  Geocoding API failed for: ${fullAddress}`);
      return null;
    }
    
    const data = await response.json();
    if (!data || data.length === 0) {
      console.warn(`  No results found for: ${fullAddress}`);
      return null;
    }
    
    // Find the result that best matches the expected city
    for (const result of data) {
      const resultCity = result.address?.city || result.address?.town || result.address?.village || '';
      const resultState = result.address?.state || '';
      
      // Check if this result matches the expected city and is in a reasonable location
      if (resultCity.toLowerCase().includes(expectedCity.toLowerCase()) || 
          result.display_name.toLowerCase().includes(expectedCity.toLowerCase())) {
        
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        
        // Validate coordinates are within US bounds
        const isValidUS = (
          (lat >= 24.0 && lat <= 50.0 && lon >= -130.0 && lon <= -65.0) ||
          (lat >= 60.0 && lat <= 72.0 && lon >= -180.0 && lon <= -140.0) ||
          (lat >= 18.0 && lat <= 23.0 && lon >= -162.0 && lon <= -154.0)
        );
        
        if (isValidUS) {
          console.log(`  ✅ Found valid result: ${lat}, ${lon} in ${resultState}`);
          return {
            lat,
            lon,
            display_name: result.display_name,
            address: result.address
          };
        }
      }
    }
    
    console.warn(`  ❌ No valid results found for ${fullAddress}`);
    return null;
    
  } catch (error) {
    console.error(`  Error geocoding ${address}:`, error);
    return null;
  }
}

async function fixProblematicCoordinates() {
  console.log('🔧 Starting precision geocoding fix for problematic coordinates...');
  
  try {
    // Step 1: Find clinics that are clearly in wrong locations
    const problematicClinics = await sql<Clinic[]>`
      SELECT id, name, city, notes, latitude, longitude
      FROM clinics 
      WHERE city IN (
        SELECT city 
        FROM clinics 
        GROUP BY city 
        HAVING COUNT(*) > 5 AND COUNT(DISTINCT ROUND(latitude::numeric, 2)) > 3
      )
      ORDER BY city, name
    `;
    
    console.log(`📍 Found ${problematicClinics.length} clinics in cities with coordinate inconsistencies`);
    
    let fixedCount = 0;
    let failedCount = 0;
    
    // Step 2: Re-geocode problematic clinics with enhanced validation
    for (let i = 0; i < problematicClinics.length; i++) {
      const clinic = problematicClinics[i];
      
      console.log(`[${i + 1}/${problematicClinics.length}] Fixing: ${clinic.name} in ${clinic.city}`);
      console.log(`  Current coordinates: ${clinic.latitude}, ${clinic.longitude}`);
      
      // Extract address from notes
      const addressMatch = clinic.notes.match(/Address:\s*(.+?)(?:,\s*$|$)/);
      if (!addressMatch) {
        console.warn(`  No address found in notes: ${clinic.notes}`);
        failedCount++;
        continue;
      }
      
      const address = addressMatch[1].trim();
      const geocodeResult = await geocodeWithStateValidation(address, clinic.city);
      
      if (geocodeResult) {
        // Check if the new coordinates are significantly different and better
        const latDiff = Math.abs(geocodeResult.lat - clinic.latitude);
        const lonDiff = Math.abs(geocodeResult.lon - clinic.longitude);
        
        if (latDiff > 0.01 || lonDiff > 0.01) { // Only update if coordinates changed significantly
          await sql`
            UPDATE clinics 
            SET latitude = ${geocodeResult.lat}, longitude = ${geocodeResult.lon} 
            WHERE id = ${clinic.id}
          `;
          
          console.log(`  ✅ Updated to: ${geocodeResult.lat}, ${geocodeResult.lon}`);
          console.log(`  State: ${geocodeResult.address?.state || 'Unknown'}`);
          fixedCount++;
        } else {
          console.log(`  ➡️ Coordinates unchanged (minimal difference)`);
        }
      } else {
        console.warn(`  ❌ Failed to get better coordinates`);
        failedCount++;
      }
      
      // Rate limiting
      if (i < problematicClinics.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1200)); // Slightly slower for precision
      }
    }
    
    console.log(`\n📊 Precision geocoding complete:`);
    console.log(`  ✅ Fixed: ${fixedCount} clinics`);
    console.log(`  ❌ Failed: ${failedCount} clinics`);
    
    // Step 3: Final validation
    const validation = await sql`
      SELECT city, COUNT(*) as count,
             COUNT(DISTINCT ROUND(latitude::numeric, 2)) as unique_lats,
             COUNT(DISTINCT ROUND(longitude::numeric, 2)) as unique_lngs
      FROM clinics 
      GROUP BY city
      HAVING COUNT(*) > 5 AND COUNT(DISTINCT ROUND(latitude::numeric, 2)) > 3
      ORDER BY count DESC
    `;
    
    console.log(`\n📍 Remaining coordinate inconsistencies:`);
    validation.forEach(row => {
      console.log(`  ${row.city}: ${row.count} clinics, ${row.unique_lats} unique latitudes`);
    });
    
  } catch (error) {
    console.error('Error in precision geocoding fix:', error);
  }
}

fixProblematicCoordinates().catch(console.error);