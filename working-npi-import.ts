import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

// Import and fix coordinates in one comprehensive process
async function importAndFixNPI() {
  console.log('🎯 Starting complete NPI import with accurate coordinate mapping...');
  
  // Comprehensive city-to-state mapping for accuracy
  const CITY_STATE_MAP: { [key: string]: string } = {
    // Critical examples that were problematic
    'EAST LANSING': 'MI', 'ANN ARBOR': 'MI', 'LANSING': 'MI', 'GRAND RAPIDS': 'MI', 'KALAMAZOO': 'MI',
    'DETROIT': 'MI', 'FLINT': 'MI', 'STERLING HEIGHTS': 'MI', 'WARREN': 'MI', 'TROY': 'MI',
    'FARMINGTON HILLS': 'MI', 'LIVONIA': 'MI', 'WESTLAND': 'MI', 'NOVI': 'MI', 'SOUTHFIELD': 'MI',
    
    // California
    'LOS ANGELES': 'CA', 'SAN FRANCISCO': 'CA', 'SAN DIEGO': 'CA', 'SAN JOSE': 'CA', 'SACRAMENTO': 'CA',
    'FRESNO': 'CA', 'LONG BEACH': 'CA', 'OAKLAND': 'CA', 'BAKERSFIELD': 'CA', 'ANAHEIM': 'CA',
    'SANTA ANA': 'CA', 'RIVERSIDE': 'CA', 'STOCKTON': 'CA', 'IRVINE': 'CA', 'FREMONT': 'CA',
    'BURBANK': 'CA', 'TORRANCE': 'CA', 'PASADENA': 'CA', 'GLENDALE': 'CA', 'BERKELEY': 'CA',
    
    // Texas
    'HOUSTON': 'TX', 'SAN ANTONIO': 'TX', 'DALLAS': 'TX', 'AUSTIN': 'TX', 'FORT WORTH': 'TX',
    'EL PASO': 'TX', 'ARLINGTON': 'TX', 'CORPUS CHRISTI': 'TX', 'PLANO': 'TX', 'LUBBOCK': 'TX',
    'LAREDO': 'TX', 'IRVING': 'TX', 'GARLAND': 'TX', 'AMARILLO': 'TX', 'MCKINNEY': 'TX',
    'FRISCO': 'TX', 'CARROLLTON': 'TX', 'RICHARDSON': 'TX', 'ALLEN': 'TX', 'PEARLAND': 'TX',
    
    // Florida  
    'JACKSONVILLE': 'FL', 'MIAMI': 'FL', 'TAMPA': 'FL', 'ORLANDO': 'FL', 'ST. PETERSBURG': 'FL',
    'HIALEAH': 'FL', 'TALLAHASSEE': 'FL', 'FORT LAUDERDALE': 'FL', 'PORT ST. LUCIE': 'FL',
    'CAPE CORAL': 'FL', 'PEMBROKE PINES': 'FL', 'HOLLYWOOD': 'FL', 'MIRAMAR': 'FL', 'GAINESVILLE': 'FL',
    'CORAL SPRINGS': 'FL', 'PALM BAY': 'FL', 'WEST PALM BEACH': 'FL', 'CLEARWATER': 'FL',
    'DAVIE': 'FL', 'BOCA RATON': 'FL', 'PLANTATION': 'FL', 'SUNRISE': 'FL', 'DELRAY BEACH': 'FL',
    
    // New York
    'NEW YORK': 'NY', 'BUFFALO': 'NY', 'ROCHESTER': 'NY', 'YONKERS': 'NY', 'SYRACUSE': 'NY',
    'ALBANY': 'NY', 'NEW ROCHELLE': 'NY', 'MOUNT VERNON': 'NY', 'SCHENECTADY': 'NY', 'UTICA': 'NY',
    'WHITE PLAINS': 'NY', 'BROOKLYN': 'NY', 'QUEENS': 'NY', 'BRONX': 'NY', 'STATEN ISLAND': 'NY',
    
    // Illinois
    'CHICAGO': 'IL', 'AURORA': 'IL', 'ROCKFORD': 'IL', 'JOLIET': 'IL', 'NAPERVILLE': 'IL',
    'SPRINGFIELD': 'IL', 'PEORIA': 'IL', 'ELGIN': 'IL', 'WAUKEGAN': 'IL', 'CICERO': 'IL',
    'EVANSTON': 'IL', 'SCHAUMBURG': 'IL', 'BOLINGBROOK': 'IL', 'PALATINE': 'IL', 'SKOKIE': 'IL',
    
    // Ohio
    'COLUMBUS': 'OH', 'CLEVELAND': 'OH', 'CINCINNATI': 'OH', 'TOLEDO': 'OH', 'AKRON': 'OH',
    'DAYTON': 'OH', 'PARMA': 'OH', 'CANTON': 'OH', 'YOUNGSTOWN': 'OH', 'HAMILTON': 'OH',
    
    // Pennsylvania  
    'PHILADELPHIA': 'PA', 'PITTSBURGH': 'PA', 'ALLENTOWN': 'PA', 'ERIE': 'PA', 'READING': 'PA',
    'SCRANTON': 'PA', 'BETHLEHEM': 'PA', 'LANCASTER': 'PA', 'HARRISBURG': 'PA', 'YORK': 'PA',
    
    // Arizona
    'PHOENIX': 'AZ', 'TUCSON': 'AZ', 'MESA': 'AZ', 'CHANDLER': 'AZ', 'GLENDALE': 'AZ',
    'SCOTTSDALE': 'AZ', 'GILBERT': 'AZ', 'TEMPE': 'AZ', 'PEORIA': 'AZ', 'SURPRISE': 'AZ',
    'YUMA': 'AZ', 'AVONDALE': 'AZ', 'GOODYEAR': 'AZ', 'FLAGSTAFF': 'AZ', 'CASA GRANDE': 'AZ',
    
    // Washington
    'SEATTLE': 'WA', 'SPOKANE': 'WA', 'TACOMA': 'WA', 'VANCOUVER': 'WA', 'BELLEVUE': 'WA',
    'KENT': 'WA', 'EVERETT': 'WA', 'RENTON': 'WA', 'YAKIMA': 'WA', 'FEDERAL WAY': 'WA',
    'SPOKANE VALLEY': 'WA', 'BELLINGHAM': 'WA', 'KENNEWICK': 'WA', 'AUBURN': 'WA', 'PASCO': 'WA',
    
    // Colorado
    'DENVER': 'CO', 'COLORADO SPRINGS': 'CO', 'AURORA': 'CO', 'FORT COLLINS': 'CO', 'LAKEWOOD': 'CO',
    'THORNTON': 'CO', 'ARVADA': 'CO', 'WESTMINSTER': 'CO', 'PUEBLO': 'CO', 'CENTENNIAL': 'CO',
    
    // Georgia
    'ATLANTA': 'GA', 'AUGUSTA': 'GA', 'COLUMBUS': 'GA', 'SAVANNAH': 'GA', 'ATHENS': 'GA',
    'SANDY SPRINGS': 'GA', 'ROSWELL': 'GA', 'MACON': 'GA', 'JOHNS CREEK': 'GA', 'ALBANY': 'GA',
    
    // North Carolina  
    'CHARLOTTE': 'NC', 'RALEIGH': 'NC', 'GREENSBORO': 'NC', 'DURHAM': 'NC', 'WINSTON-SALEM': 'NC',
    'FAYETTEVILLE': 'NC', 'CARY': 'NC', 'WILMINGTON': 'NC', 'HIGH POINT': 'NC', 'GREENVILLE': 'NC',
    
    // Virginia
    'VIRGINIA BEACH': 'VA', 'NORFOLK': 'VA', 'CHESAPEAKE': 'VA', 'RICHMOND': 'VA', 'NEWPORT NEWS': 'VA',
    'ALEXANDRIA': 'VA', 'HAMPTON': 'VA', 'PORTSMOUTH': 'VA', 'SUFFOLK': 'VA', 'LYNCHBURG': 'VA'
  };
  
  // Precise geocoding function
  async function getAccurateCoordinates(city: string, state: string): Promise<{ lat: number, lon: number } | null> {
    try {
      // Use US Census Bureau for highest accuracy
      const censusUrl = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(`${city}, ${state}`)}&benchmark=2020&format=json`;
      
      const response = await fetch(censusUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.result?.addressMatches?.length > 0) {
          const match = data.result.addressMatches[0];
          const lat = parseFloat(match.coordinates.y);
          const lon = parseFloat(match.coordinates.x);
          
          if (lat >= 18.0 && lat <= 72.0 && lon >= -180.0 && lon <= -65.0) {
            return { lat, lon };
          }
        }
      }
      
      // Fallback to Nominatim
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=USA&limit=1`;
      const nominatimResponse = await fetch(nominatimUrl, {
        headers: { 'User-Agent': 'SpeechTherapyMap/2.0' }
      });
      
      if (nominatimResponse.ok) {
        const data = await nominatimResponse.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          
          if (lat >= 18.0 && lat <= 72.0 && lon >= -180.0 && lon <= -65.0) {
            return { lat, lon };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Geocoding error for ${city}, ${state}:`, error);
      return null;
    }
  }
  
  // Get NPI data and import with accurate coordinates
  const url = 'https://clinicaltables.nlm.nih.gov/api/npi_org/v3/search?terms=speech%20language&maxList=5000&ef=name.full,addr_practice.city,addr_practice.state,addr_practice.line1,addr_practice.phone';
  
  try {
    console.log('📥 Fetching speech-language pathology providers from NPI...');
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`📊 Found ${data[0]} speech therapy providers`);
    
    if (!data[1] || !data[2]) {
      console.error('❌ Unexpected NPI API response structure');
      return;
    }
    
    const npis = data[1];
    const extraFields = data[2];
    
    let imported = 0;
    let skipped = 0;
    const coordinateCache = new Map<string, { lat: number, lon: number }>();
    const stateStats: { [state: string]: number } = {};
    
    for (let i = 0; i < npis.length; i++) {
      const npi = npis[i];
      const name = extraFields['name.full']?.[i];
      const city = extraFields['addr_practice.city']?.[i];
      const stateFromData = extraFields['addr_practice.state']?.[i];
      const address = extraFields['addr_practice.line1']?.[i];
      const phone = extraFields['addr_practice.phone']?.[i];
      
      if (!name || !city) {
        console.log(`[${i + 1}/${npis.length}] Skipping ${name || 'unnamed'} - missing data`);
        skipped++;
        continue;
      }
      
      console.log(`[${i + 1}/${npis.length}] Processing: ${name} in ${city}`);
      
      // Determine accurate state
      const cityUpper = city.toUpperCase().trim();
      const state = CITY_STATE_MAP[cityUpper] || stateFromData;
      
      if (!state) {
        console.log(`  ❌ No state found for ${city}`);
        skipped++;
        continue;
      }
      
      console.log(`  State: ${state}`);
      
      // Get or retrieve coordinates
      const cacheKey = `${cityUpper}-${state}`;
      let coordinates = coordinateCache.get(cacheKey);
      
      if (!coordinates) {
        coordinates = await getAccurateCoordinates(city, state);
        if (coordinates) {
          coordinateCache.set(cacheKey, coordinates);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      if (!coordinates) {
        console.log(`  ❌ Failed to geocode ${city}, ${state}`);
        skipped++;
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
        
        console.log(`  ✅ Imported: ${coordinates.lat}, ${coordinates.lon}`);
        imported++;
        stateStats[state] = (stateStats[state] || 0) + 1;
        
      } catch (error) {
        console.log(`  ❌ Database error: ${error}`);
        skipped++;
      }
    }
    
    console.log(`\n📊 Import complete:`);
    console.log(`  ✅ Successfully imported: ${imported} clinics`);
    console.log(`  ❌ Skipped: ${skipped} clinics`);
    
    console.log('\n📍 Clinics by state:');
    Object.entries(stateStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([state, count]) => {
        console.log(`  ${state}: ${count} clinics`);
      });
    
    // Verify East Lansing fix
    const eastLansingCheck = await sql`
      SELECT name, latitude, longitude 
      FROM clinics 
      WHERE city ILIKE '%east lansing%'
    `;
    
    if (eastLansingCheck.length > 0) {
      console.log(`\n🔍 East Lansing verification:`);
      eastLansingCheck.forEach(clinic => {
        const inMichigan = clinic.latitude >= 41.7 && clinic.latitude <= 48.3 && 
                          clinic.longitude >= -90.4 && clinic.longitude <= -82.1;
        console.log(`  ${clinic.name}: ${clinic.latitude}, ${clinic.longitude} ${inMichigan ? '✅ In Michigan' : '❌ Wrong location'}`);
      });
    }
    
    console.log('\n🎉 Complete accurate coordinate system built!');
    
  } catch (error) {
    console.error('Error in NPI import:', error);
  }
}

importAndFixNPI().catch(console.error);