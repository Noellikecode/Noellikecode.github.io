import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

// Quick targeted import for more diversity
async function quickAddMore() {
  console.log('🎯 Adding more speech therapy providers for better coverage...');
  
  // Import additional data with different search terms for diversity
  const searchTerms = [
    'speech therapy',
    'speech pathologist', 
    'language pathologist',
    'communication disorders'
  ];
  
  let totalImported = 0;
  const coordinateCache = new Map<string, { lat: number, lon: number }>();
  
  for (const term of searchTerms) {
    const encodedTerm = encodeURIComponent(term);
    const url = `https://clinicaltables.nlm.nih.gov/api/npi_org/v3/search?terms=${encodedTerm}&maxList=300&ef=name.full,addr_practice.city,addr_practice.state,addr_practice.line1,addr_practice.phone`;
    
    console.log(`📥 Fetching "${term}" providers...`);
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`Found ${data[0]} providers for "${term}"`);
      
      if (!data[1] || !data[2]) continue;
      
      const npis = data[1];
      const extraFields = data[2];
      
      for (let i = 0; i < Math.min(npis.length, 75); i++) { // Process first 75 per term
        const npi = npis[i];
        const name = extraFields['name.full']?.[i];
        const city = extraFields['addr_practice.city']?.[i];
        const state = extraFields['addr_practice.state']?.[i];
        const address = extraFields['addr_practice.line1']?.[i];
        const phone = extraFields['addr_practice.phone']?.[i];
        
        if (!name || !city || !state) continue;
        
        // Check if already exists
        const existing = await sql`
          SELECT id FROM clinics WHERE notes = ${'NPI: ' + npi + '. Address: ' + (address || 'Not provided')}
        `;
        
        if (existing.length > 0) continue; // Skip if already imported
        
        console.log(`[${i + 1}/75] ${name} in ${city}, ${state}`);
        
        // Get coordinates (use cache if available)
        const cacheKey = `${city.toUpperCase()}-${state}`;
        let coordinates = coordinateCache.get(cacheKey);
        
        if (!coordinates) {
          // Use US Census Bureau geocoding
          try {
            const censusUrl = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(`${city}, ${state}`)}&benchmark=2020&format=json`;
            const geoResponse = await fetch(censusUrl);
            
            if (geoResponse.ok) {
              const geoData = await geoResponse.json();
              if (geoData.result?.addressMatches?.length > 0) {
                const match = geoData.result.addressMatches[0];
                const lat = parseFloat(match.coordinates.y);
                const lon = parseFloat(match.coordinates.x);
                
                if (lat >= 18.0 && lat <= 72.0 && lon >= -180.0 && lon <= -65.0) {
                  coordinates = { lat, lon };
                  coordinateCache.set(cacheKey, coordinates);
                }
              }
            }
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.log(`  ❌ Geocoding error: ${error}`);
          }
        }
        
        if (!coordinates) {
          console.log(`  ❌ No coordinates for ${city}, ${state}`);
          continue;
        }
        
        // Insert into database
        try {
          await sql`
            INSERT INTO clinics (
              name, country, city, latitude, longitude, cost_level, services, 
              languages, teletherapy, phone, website, 
              notes, verified, submitted_by, submitter_email
            ) VALUES (
              ${name.slice(0, 200)},
              'United States',
              ${city.slice(0, 100)},
              ${coordinates.lat},
              ${coordinates.lon},
              'free',
              ${'["language-therapy"]'},
              'English',
              false,
              ${phone || null},
              null,
              ${'NPI: ' + npi + '. Address: ' + (address || 'Not provided')},
              true,
              'NPI Import Service',
              'npi-import@system.com'
            )
          `;
          
          console.log(`  ✅ Added: ${coordinates.lat}, ${coordinates.lon}`);
          totalImported++;
          
        } catch (error) {
          console.log(`  ❌ Database error: ${error}`);
        }
        
        // Small delay to be respectful
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error(`Error processing "${term}":`, error);
    }
    
    console.log(`Completed "${term}" - imported ${totalImported} total so far\n`);
  }
  
  console.log(`🎉 Import complete! Added ${totalImported} new speech therapy centers.`);
  
  // Final count
  const finalCount = await sql`SELECT COUNT(*) as count FROM clinics`;
  console.log(`📊 Total clinics now: ${finalCount[0].count}`);
}

quickAddMore().catch(console.error);