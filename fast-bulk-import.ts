import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

// Fast bulk import with pre-known coordinates for major cities
async function fastBulkImport() {
  console.log('🚀 Fast bulk import of speech therapy providers...');
  
  // Major US cities with known coordinates
  const cityCoords: { [key: string]: { lat: number, lon: number, state: string } } = {
    'NEW YORK': { lat: 40.7128, lon: -74.0060, state: 'NY' },
    'LOS ANGELES': { lat: 34.0522, lon: -118.2437, state: 'CA' },
    'CHICAGO': { lat: 41.8781, lon: -87.6298, state: 'IL' },
    'HOUSTON': { lat: 29.7604, lon: -95.3698, state: 'TX' },
    'PHILADELPHIA': { lat: 39.9526, lon: -75.1652, state: 'PA' },
    'PHOENIX': { lat: 33.4484, lon: -112.0740, state: 'AZ' },
    'SAN ANTONIO': { lat: 29.4241, lon: -98.4936, state: 'TX' },
    'SAN DIEGO': { lat: 32.7157, lon: -117.1611, state: 'CA' },
    'DALLAS': { lat: 32.7767, lon: -96.7970, state: 'TX' },
    'SAN JOSE': { lat: 37.3382, lon: -121.8863, state: 'CA' },
    'AUSTIN': { lat: 30.2672, lon: -97.7431, state: 'TX' },
    'INDIANAPOLIS': { lat: 39.7684, lon: -86.1581, state: 'IN' },
    'JACKSONVILLE': { lat: 30.3322, lon: -81.6557, state: 'FL' },
    'SAN FRANCISCO': { lat: 37.7749, lon: -122.4194, state: 'CA' },
    'COLUMBUS': { lat: 39.9612, lon: -82.9988, state: 'OH' },
    'CHARLOTTE': { lat: 35.2271, lon: -80.8431, state: 'NC' },
    'FORT WORTH': { lat: 32.7555, lon: -97.3308, state: 'TX' },
    'DETROIT': { lat: 42.3314, lon: -83.0458, state: 'MI' },
    'EL PASO': { lat: 31.7619, lon: -106.4850, state: 'TX' },
    'DENVER': { lat: 39.7392, lon: -104.9903, state: 'CO' },
    'WASHINGTON': { lat: 38.9072, lon: -77.0369, state: 'DC' },
    'MEMPHIS': { lat: 35.1495, lon: -90.0490, state: 'TN' },
    'BOSTON': { lat: 42.3601, lon: -71.0589, state: 'MA' },
    'SEATTLE': { lat: 47.6062, lon: -122.3321, state: 'WA' },
    'NASHVILLE': { lat: 36.1627, lon: -86.7816, state: 'TN' },
    'BALTIMORE': { lat: 39.2904, lon: -76.6122, state: 'MD' },
    'OKLAHOMA CITY': { lat: 35.4676, lon: -97.5164, state: 'OK' },
    'LOUISVILLE': { lat: 38.2527, lon: -85.7585, state: 'KY' },
    'PORTLAND': { lat: 45.5152, lon: -122.6784, state: 'OR' },
    'LAS VEGAS': { lat: 36.1699, lon: -115.1398, state: 'NV' },
    'MILWAUKEE': { lat: 43.0389, lon: -87.9065, state: 'WI' },
    'ALBUQUERQUE': { lat: 35.0844, lon: -106.6504, state: 'NM' },
    'TUCSON': { lat: 32.2226, lon: -110.9747, state: 'AZ' },
    'FRESNO': { lat: 36.7378, lon: -119.7871, state: 'CA' },
    'SACRAMENTO': { lat: 38.5816, lon: -121.4944, state: 'CA' },
    'KANSAS CITY': { lat: 39.0997, lon: -94.5786, state: 'MO' },
    'MESA': { lat: 33.4152, lon: -111.8315, state: 'AZ' },
    'VIRGINIA BEACH': { lat: 36.8529, lon: -75.9780, state: 'VA' },
    'ATLANTA': { lat: 33.7490, lon: -84.3880, state: 'GA' },
    'COLORADO SPRINGS': { lat: 38.8339, lon: -104.8214, state: 'CO' },
    'OMAHA': { lat: 41.2565, lon: -95.9345, state: 'NE' },
    'RALEIGH': { lat: 35.7796, lon: -78.6382, state: 'NC' },
    'MIAMI': { lat: 25.7617, lon: -80.1918, state: 'FL' },
    'LONG BEACH': { lat: 33.7701, lon: -118.1937, state: 'CA' },
    'MINNEAPOLIS': { lat: 44.9778, lon: -93.2650, state: 'MN' },
    'TULSA': { lat: 36.1540, lon: -95.9928, state: 'OK' },
    'CLEVELAND': { lat: 41.4993, lon: -81.6944, state: 'OH' },
    'WICHITA': { lat: 37.6872, lon: -97.3301, state: 'KS' },
    'ARLINGTON': { lat: 32.7357, lon: -97.1081, state: 'TX' },
    'NEW ORLEANS': { lat: 29.9511, lon: -90.0715, state: 'LA' },
    'BAKERSFIELD': { lat: 35.3733, lon: -119.0187, state: 'CA' },
    'HONOLULU': { lat: 21.3099, lon: -157.8581, state: 'HI' },
    'ANAHEIM': { lat: 33.8366, lon: -117.9143, state: 'CA' },
    'TAMPA': { lat: 27.9506, lon: -82.4572, state: 'FL' },
    'AURORA': { lat: 39.7294, lon: -104.8319, state: 'CO' },
    'SANTA ANA': { lat: 33.7455, lon: -117.8677, state: 'CA' },
    'ST. LOUIS': { lat: 38.6270, lon: -90.1994, state: 'MO' },
    'RIVERSIDE': { lat: 33.9533, lon: -117.3962, state: 'CA' },
    'CORPUS CHRISTI': { lat: 27.8006, lon: -97.3964, state: 'TX' },
    'PITTSBURGH': { lat: 40.4406, lon: -79.9959, state: 'PA' },
    'LEXINGTON': { lat: 38.0406, lon: -84.5037, state: 'KY' },
    'ANCHORAGE': { lat: 61.2181, lon: -149.9003, state: 'AK' },
    'STOCKTON': { lat: 37.9577, lon: -121.2908, state: 'CA' },
    'CINCINNATI': { lat: 39.1031, lon: -84.5120, state: 'OH' },
    'ST. PAUL': { lat: 44.9537, lon: -93.0900, state: 'MN' },
    'TOLEDO': { lat: 41.6528, lon: -83.5379, state: 'OH' },
    'GREENSBORO': { lat: 36.0726, lon: -79.7920, state: 'NC' },
    'NEWARK': { lat: 40.7357, lon: -74.1724, state: 'NJ' },
    'PLANO': { lat: 33.0198, lon: -96.6989, state: 'TX' },
    'HENDERSON': { lat: 36.0395, lon: -114.9817, state: 'NV' },
    'LINCOLN': { lat: 40.8136, lon: -96.7026, state: 'NE' },
    'BUFFALO': { lat: 42.8864, lon: -78.8784, state: 'NY' },
    'JERSEY CITY': { lat: 40.7282, lon: -74.0776, state: 'NJ' },
    'CHULA VISTA': { lat: 32.6401, lon: -117.0842, state: 'CA' },
    'FORT WAYNE': { lat: 41.0793, lon: -85.1394, state: 'IN' },
    'ORLANDO': { lat: 28.5383, lon: -81.3792, state: 'FL' },
    'ST. PETERSBURG': { lat: 27.7676, lon: -82.6404, state: 'FL' },
    'CHANDLER': { lat: 33.3062, lon: -111.8413, state: 'AZ' },
    'LAREDO': { lat: 27.5306, lon: -99.4803, state: 'TX' },
    'NORFOLK': { lat: 36.8468, lon: -76.2852, state: 'VA' },
    'DURHAM': { lat: 35.9940, lon: -78.8986, state: 'NC' },
    'MADISON': { lat: 43.0731, lon: -89.4012, state: 'WI' },
    'LUBBOCK': { lat: 33.5779, lon: -101.8552, state: 'TX' },
    'IRVINE': { lat: 33.6846, lon: -117.8265, state: 'CA' },
    'WINSTON SALEM': { lat: 36.0999, lon: -80.2442, state: 'NC' },
    'GLENDALE': { lat: 33.5387, lon: -112.1860, state: 'AZ' },
    'GARLAND': { lat: 32.9126, lon: -96.6389, state: 'TX' },
    'HIALEAH': { lat: 25.8576, lon: -80.2781, state: 'FL' },
    'RENO': { lat: 39.5296, lon: -119.8138, state: 'NV' },
    'CHESAPEAKE': { lat: 36.7682, lon: -76.2875, state: 'VA' },
    'GILBERT': { lat: 33.3528, lon: -111.7890, state: 'AZ' },
    'BATON ROUGE': { lat: 30.4515, lon: -91.1871, state: 'LA' },
    'IRVING': { lat: 32.8140, lon: -96.9489, state: 'TX' },
    'SCOTTSDALE': { lat: 33.4942, lon: -111.9211, state: 'AZ' },
    'NORTH LAS VEGAS': { lat: 36.1989, lon: -115.1175, state: 'NV' },
    'FREMONT': { lat: 37.5485, lon: -121.9886, state: 'CA' },
    'BOISE': { lat: 43.6150, lon: -116.2023, state: 'ID' },
    'RICHMOND': { lat: 37.5407, lon: -77.4360, state: 'VA' },
    'SAN BERNARDINO': { lat: 34.1083, lon: -117.2898, state: 'CA' },
    'BIRMINGHAM': { lat: 33.5186, lon: -86.8104, state: 'AL' },
    'SPOKANE': { lat: 47.6587, lon: -117.4260, state: 'WA' },
    'ROCHESTER': { lat: 43.1566, lon: -77.6088, state: 'NY' },
    'DES MOINES': { lat: 41.5868, lon: -93.6250, state: 'IA' },
    'MODESTO': { lat: 37.6391, lon: -120.9969, state: 'CA' },
    'FAYETTEVILLE': { lat: 35.0527, lon: -78.8784, state: 'NC' },
    'TACOMA': { lat: 47.2529, lon: -122.4443, state: 'WA' },
    'OXNARD': { lat: 34.1975, lon: -119.1771, state: 'CA' },
    'FONTANA': { lat: 34.0922, lon: -117.4350, state: 'CA' },
    'COLUMBUS': { lat: 32.4609, lon: -84.9877, state: 'GA' },
    'MONTGOMERY': { lat: 32.3617, lon: -86.2792, state: 'AL' },
    'MORENO VALLEY': { lat: 33.9425, lon: -117.2297, state: 'CA' },
    'SHREVEPORT': { lat: 32.5252, lon: -93.7502, state: 'LA' },
    'AURORA': { lat: 41.7606, lon: -88.3201, state: 'IL' },
    'YONKERS': { lat: 40.9312, lon: -73.8988, state: 'NY' },
    'AKRON': { lat: 41.0814, lon: -81.5190, state: 'OH' },
    'HUNTINGTON BEACH': { lat: 33.6595, lon: -117.9988, state: 'CA' },
    'LITTLE ROCK': { lat: 34.7465, lon: -92.2896, state: 'AR' },
    'AUGUSTA': { lat: 33.4735, lon: -82.0105, state: 'GA' },
    'AMARILLO': { lat: 35.2220, lon: -101.8313, state: 'TX' },
    'GLENDALE': { lat: 34.1425, lon: -118.2551, state: 'CA' },
    'MOBILE': { lat: 30.6954, lon: -88.0399, state: 'AL' },
    'GRAND RAPIDS': { lat: 42.9634, lon: -85.6681, state: 'MI' },
    'SALT LAKE CITY': { lat: 40.7608, lon: -111.8910, state: 'UT' },
    'TALLAHASSEE': { lat: 30.4518, lon: -84.2807, state: 'FL' },
    'HUNTSVILLE': { lat: 34.7304, lon: -86.5861, state: 'AL' },
    'GRAND PRAIRIE': { lat: 32.7460, lon: -96.9978, state: 'TX' },
    'KNOXVILLE': { lat: 35.9606, lon: -83.9207, state: 'TN' },
    'WORCESTER': { lat: 42.2626, lon: -71.8023, state: 'MA' },
    'NEWPORT NEWS': { lat: 37.0871, lon: -76.4730, state: 'VA' },
    'BROWNSVILLE': { lat: 25.9018, lon: -97.4975, state: 'TX' },
    'OVERLAND PARK': { lat: 38.9822, lon: -94.6708, state: 'KS' },
    'SANTA CLARITA': { lat: 34.3917, lon: -118.5426, state: 'CA' },
    'PROVIDENCE': { lat: 41.8240, lon: -71.4128, state: 'RI' },
    'GARDEN GROVE': { lat: 33.7739, lon: -117.9415, state: 'CA' },
    'CHATTANOOGA': { lat: 35.0456, lon: -85.3097, state: 'TN' },
    'OCEANSIDE': { lat: 33.1959, lon: -117.3795, state: 'CA' },
    'JACKSON': { lat: 32.2988, lon: -90.1848, state: 'MS' },
    'FORT LAUDERDALE': { lat: 26.1224, lon: -80.1373, state: 'FL' },
    'SANTA ROSA': { lat: 38.4404, lon: -122.7141, state: 'CA' },
    'RANCHO CUCAMONGA': { lat: 34.1064, lon: -117.5931, state: 'CA' },
    'PORT ST. LUCIE': { lat: 27.2939, lon: -80.3501, state: 'FL' },
    'TEMPE': { lat: 33.4255, lon: -111.9400, state: 'AZ' },
    'ONTARIO': { lat: 34.0633, lon: -117.6509, state: 'CA' },
    'VANCOUVER': { lat: 45.6387, lon: -122.6615, state: 'WA' },
    'CAPE CORAL': { lat: 26.5629, lon: -81.9495, state: 'FL' },
    'SIOUX FALLS': { lat: 43.5446, lon: -96.7311, state: 'SD' },
    'SPRINGFIELD': { lat: 39.7817, lon: -89.6501, state: 'IL' },
    'PEORIA': { lat: 40.6936, lon: -89.5890, state: 'IL' },
    'PEMBROKE PINES': { lat: 26.0073, lon: -80.2962, state: 'FL' },
    'ELK GROVE': { lat: 38.4088, lon: -121.3716, state: 'CA' },
    'ROCKFORD': { lat: 42.2711, lon: -89.0940, state: 'IL' },
    'CORONA': { lat: 33.8753, lon: -117.5664, state: 'CA' },
    'LANCASTER': { lat: 34.6868, lon: -118.1542, state: 'CA' },
    'EUGENE': { lat: 44.0521, lon: -123.0868, state: 'OR' },
    'PALMDALE': { lat: 34.5794, lon: -118.1165, state: 'CA' },
    'SALINAS': { lat: 36.6777, lon: -121.6555, state: 'CA' }
  };
  
  // Get fresh data from multiple search terms
  const searchTerms = ['speech therapy', 'speech pathologist'];
  let totalImported = 0;
  
  for (const term of searchTerms) {
    console.log(`\n📥 Processing "${term}" providers...`);
    
    const encodedTerm = encodeURIComponent(term);
    const url = `https://clinicaltables.nlm.nih.gov/api/npi_org/v3/search?terms=${encodedTerm}&maxList=400&ef=name.full,addr_practice.city,addr_practice.state,addr_practice.line1,addr_practice.phone`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`Found ${data[0]} providers for "${term}"`);
      
      if (!data[1] || !data[2]) continue;
      
      const npis = data[1];
      const extraFields = data[2];
      
      let imported = 0;
      
      for (let i = 0; i < Math.min(npis.length, 200); i++) { // Process first 200 per term
        const npi = npis[i];
        const name = extraFields['name.full']?.[i];
        const city = extraFields['addr_practice.city']?.[i]?.toUpperCase();
        const state = extraFields['addr_practice.state']?.[i];
        const address = extraFields['addr_practice.line1']?.[i];
        const phone = extraFields['addr_practice.phone']?.[i];
        
        if (!name || !city || !state) continue;
        
        // Check if we have coordinates for this city
        const coords = cityCoords[city];
        if (!coords) {
          continue; // Skip cities we don't have coordinates for
        }
        
        // Check if already exists
        try {
          const existing = await sql`
            SELECT id FROM clinics WHERE notes = ${'NPI: ' + npi + '. Address: ' + (address || 'Not provided')}
          `;
          
          if (existing.length > 0) continue; // Skip if already imported
        } catch (error) {
          continue; // Skip on database error
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
              ${coords.lat},
              ${coords.lon},
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
          
          imported++;
          totalImported++;
          
          if (imported % 25 === 0) {
            console.log(`  ✅ Processed ${imported} clinics for "${term}"`);
          }
          
        } catch (error) {
          // Skip on database error
        }
      }
      
      console.log(`✅ Imported ${imported} clinics from "${term}"`);
      
    } catch (error) {
      console.error(`Error processing "${term}":`, error);
    }
  }
  
  // Final statistics
  const finalCount = await sql`SELECT COUNT(*) as count FROM clinics`;
  console.log(`\n🎉 Import complete!`);
  console.log(`📊 Added ${totalImported} new clinics`);
  console.log(`📍 Total clinics now: ${finalCount[0].count}`);
  
  // Show geographic distribution
  const stateStats = await sql`
    SELECT 
      CASE 
        WHEN notes ~ 'Address:.*, ([A-Z]{2})$' 
        THEN SUBSTRING(notes FROM 'Address:.*, ([A-Z]{2})$')
        ELSE 'Unknown'
      END as state,
      COUNT(*) as count
    FROM clinics 
    WHERE notes LIKE '%Address:%'
    GROUP BY state
    ORDER BY count DESC
    LIMIT 15
  `;
  
  console.log('\n📍 Top states by clinic count:');
  stateStats.forEach(row => {
    console.log(`  ${row.state}: ${row.count} clinics`);
  });
}

fastBulkImport().catch(console.error);