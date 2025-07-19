import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

// Load full NPI dataset
async function importFullNPIDataset() {
  console.log('🔄 Loading complete NPI Speech-Language Pathology dataset...');
  
  const searchUrl = 'https://clinicaltables.nlm.nih.gov/api/npi_org/v3/search';
  const params = new URLSearchParams({
    terms: '235Z00000X', // Speech-Language Pathologist taxonomy
    maxList: '10000',
    ef: 'name.full,addr_practice.city,addr_practice.state,addr_practice.line1,addr_practice.phone,NPI'
  });
  
  try {
    const response = await fetch(`${searchUrl}?${params.toString()}`);
    const data = await response.json();
    
    console.log(`📊 Found ${data[0]} speech therapy providers`);
    
    let insertedCount = 0;
    
    for (const provider of data[1]) {
      const [name, city, state, address, phone, npi] = provider;
      
      if (!name || !city || !state) continue;
      
      const insertData = {
        name: name.slice(0, 200), // Truncate if too long
        country: 'United States',
        city: city.slice(0, 100),
        cost_level: 'free' as const,
        services: ['language-therapy'],
        primary_language: 'English',
        accepts_insurance: false,
        phone_number: phone || null,
        website: null,
        notes: `NPI: ${npi}. Address: ${address || 'Not provided'}`,
        is_verified: true,
        created_by: 'NPI Import Service',
        created_by_email: 'npi-import@system.com'
      };
      
      try {
        await sql`
          INSERT INTO clinics (
            name, country, city, latitude, longitude, cost_level, services, 
            primary_language, accepts_insurance, phone_number, website, 
            notes, is_verified, created_by, created_by_email
          ) VALUES (
            ${insertData.name},
            ${insertData.country},
            ${insertData.city},
            36.0, -95.0, -- Temporary coordinates (center of US)
            ${insertData.cost_level},
            ${JSON.stringify(insertData.services)},
            ${insertData.primary_language},
            ${insertData.accepts_insurance},
            ${insertData.phone_number},
            ${insertData.website},
            ${insertData.notes},
            ${insertData.is_verified},
            ${insertData.created_by},
            ${insertData.created_by_email}
          )
        `;
        insertedCount++;
      } catch (error) {
        console.warn(`Failed to insert ${name}: ${error}`);
      }
    }
    
    console.log(`✅ Imported ${insertedCount} speech therapy centers`);
    return insertedCount;
    
  } catch (error) {
    console.error('Error importing NPI data:', error);
    return 0;
  }
}

// Comprehensive US city-state mapping
const US_CITY_STATE_MAP: { [key: string]: string } = {
  // Major cities by state - comprehensive mapping
  // California
  'LOS ANGELES': 'CA', 'SAN FRANCISCO': 'CA', 'SAN DIEGO': 'CA', 'SAN JOSE': 'CA', 'FRESNO': 'CA',
  'SACRAMENTO': 'CA', 'LONG BEACH': 'CA', 'OAKLAND': 'CA', 'BAKERSFIELD': 'CA', 'ANAHEIM': 'CA',
  'SANTA ANA': 'CA', 'RIVERSIDE': 'CA', 'STOCKTON': 'CA', 'IRVINE': 'CA', 'CHULA VISTA': 'CA',
  'FREMONT': 'CA', 'SAN BERNARDINO': 'CA', 'MODESTO': 'CA', 'FONTANA': 'CA', 'OXNARD': 'CA',
  'HUNTINGTON BEACH': 'CA', 'GLENDALE': 'CA', 'SANTA CLARITA': 'CA', 'GARDEN GROVE': 'CA',
  'OCEANSIDE': 'CA', 'RANCHO CUCAMONGA': 'CA', 'ONTARIO': 'CA', 'LANCASTER': 'CA', 'ELK GROVE': 'CA',
  'CORONA': 'CA', 'PALMDALE': 'CA', 'SALINAS': 'CA', 'POMONA': 'CA', 'TORRANCE': 'CA', 'HAYWARD': 'CA',
  'ESCONDIDO': 'CA', 'SUNNYVALE': 'CA', 'ORANGE': 'CA', 'FULLERTON': 'CA', 'PASADENA': 'CA',
  'THOUSAND OAKS': 'CA', 'VISALIA': 'CA', 'SIMI VALLEY': 'CA', 'CONCORD': 'CA', 'ROSEVILLE': 'CA',
  'SANTA CLARA': 'CA', 'VALLEJO': 'CA', 'BERKELEY': 'CA', 'EL MONTE': 'CA', 'DOWNEY': 'CA',
  'COSTA MESA': 'CA', 'INGLEWOOD': 'CA', 'CARLSBAD': 'CA', 'SAN BUENAVENTURA': 'CA', 'FAIRFIELD': 'CA',
  'WEST COVINA': 'CA', 'MURRIETA': 'CA', 'RICHMOND': 'CA', 'NORWALK': 'CA', 'ANTIOCH': 'CA',
  'TEMECULA': 'CA', 'BURBANK': 'CA', 'DALY CITY': 'CA', 'RIALTO': 'CA', 'SANTA MARIA': 'CA',
  'EL CAJON': 'CA', 'SAN MATEO': 'CA', 'REDWOOD CITY': 'CA', 'CHICO': 'CA', 'TRACY': 'CA',
  
  // Texas
  'HOUSTON': 'TX', 'SAN ANTONIO': 'TX', 'DALLAS': 'TX', 'AUSTIN': 'TX', 'FORT WORTH': 'TX',
  'EL PASO': 'TX', 'ARLINGTON': 'TX', 'CORPUS CHRISTI': 'TX', 'PLANO': 'TX', 'LUBBOCK': 'TX',
  'LAREDO': 'TX', 'IRVING': 'TX', 'GARLAND': 'TX', 'AMARILLO': 'TX', 'GRAND PRAIRIE': 'TX',
  'BROWNSVILLE': 'TX', 'MCKINNEY': 'TX', 'FRISCO': 'TX', 'PASADENA': 'TX', 'KILLEEN': 'TX',
  'CARROLLTON': 'TX', 'MIDLAND': 'TX', 'WACO': 'TX', 'DENTON': 'TX', 'ABILENE': 'TX',
  'BEAUMONT': 'TX', 'ODESSA': 'TX', 'ROUND ROCK': 'TX', 'RICHARDSON': 'TX', 'TYLER': 'TX',
  'LEWISVILLE': 'TX', 'COLLEGE STATION': 'TX', 'PEARLAND': 'TX', 'ALLEN': 'TX', 'LEAGUE CITY': 'TX',
  'SUGAR LAND': 'TX', 'LONGVIEW': 'TX', 'BRYAN': 'TX', 'PHARR': 'TX', 'MCALLEN': 'TX',
  'MESQUITE': 'TX', 'MISSOURI CITY': 'TX', 'NEW BRAUNFELS': 'TX', 'EULESS': 'TX', 'CEDAR PARK': 'TX',
  
  // Florida
  'JACKSONVILLE': 'FL', 'MIAMI': 'FL', 'TAMPA': 'FL', 'ORLANDO': 'FL', 'ST. PETERSBURG': 'FL',
  'HIALEAH': 'FL', 'TALLAHASSEE': 'FL', 'FORT LAUDERDALE': 'FL', 'PORT ST. LUCIE': 'FL',
  'CAPE CORAL': 'FL', 'PEMBROKE PINES': 'FL', 'HOLLYWOOD': 'FL', 'MIRAMAR': 'FL', 'GAINESVILLE': 'FL',
  'CORAL SPRINGS': 'FL', 'PALM BAY': 'FL', 'WEST PALM BEACH': 'FL', 'CLEARWATER': 'FL',
  'LAKELAND': 'FL', 'POMPANO BEACH': 'FL', 'DAVIE': 'FL', 'SUNRISE': 'FL', 'BOCA RATON': 'FL',
  'DELTONA': 'FL', 'PLANTATION': 'FL', 'PALM COAST': 'FL', 'LARGO': 'FL', 'DEERFIELD BEACH': 'FL',
  'BOYNTON BEACH': 'FL', 'MELBOURNE': 'FL', 'LAUDERHILL': 'FL', 'WESTON': 'FL', 'DELRAY BEACH': 'FL',
  
  // New York
  'NEW YORK': 'NY', 'BUFFALO': 'NY', 'ROCHESTER': 'NY', 'YONKERS': 'NY', 'SYRACUSE': 'NY',
  'ALBANY': 'NY', 'NEW ROCHELLE': 'NY', 'MOUNT VERNON': 'NY', 'SCHENECTADY': 'NY', 'UTICA': 'NY',
  'WHITE PLAINS': 'NY', 'HEMPSTEAD': 'NY', 'TROY': 'NY', 'NIAGARA FALLS': 'NY', 'BINGHAMTON': 'NY',
  'FREEPORT': 'NY', 'VALLEY STREAM': 'NY', 'BROOKLYN': 'NY', 'QUEENS': 'NY', 'BRONX': 'NY',
  'STATEN ISLAND': 'NY', 'MANHATTAN': 'NY', 'LONG ISLAND': 'NY', 'ELMIRA': 'NY', 'JAMESTOWN': 'NY',
  
  // Michigan
  'DETROIT': 'MI', 'GRAND RAPIDS': 'MI', 'WARREN': 'MI', 'STERLING HEIGHTS': 'MI', 'LANSING': 'MI',
  'ANN ARBOR': 'MI', 'FLINT': 'MI', 'DEARBORN': 'MI', 'LIVONIA': 'MI', 'WESTLAND': 'MI',
  'TROY': 'MI', 'FARMINGTON HILLS': 'MI', 'KALAMAZOO': 'MI', 'WYOMING': 'MI', 'SOUTHFIELD': 'MI',
  'ROCHESTER HILLS': 'MI', 'TAYLOR': 'MI', 'PONTIAC': 'MI', 'NOVI': 'MI', 'DEARBORN HEIGHTS': 'MI',
  'BATTLE CREEK': 'MI', 'SAGINAW': 'MI', 'MIDLAND': 'MI', 'BAY CITY': 'MI', 'EAST LANSING': 'MI',
  'PORTAGE': 'MI', 'JACKSON': 'MI', 'NILES': 'MI', 'MOUNT PLEASANT': 'MI', 'MUSKEGON': 'MI',
  
  // Illinois
  'CHICAGO': 'IL', 'AURORA': 'IL', 'ROCKFORD': 'IL', 'JOLIET': 'IL', 'NAPERVILLE': 'IL',
  'SPRINGFIELD': 'IL', 'PEORIA': 'IL', 'ELGIN': 'IL', 'WAUKEGAN': 'IL', 'CICERO': 'IL',
  'CHAMPAIGN': 'IL', 'BLOOMINGTON': 'IL', 'ARLINGTON HEIGHTS': 'IL', 'EVANSTON': 'IL', 'DECATUR': 'IL',
  'SCHAUMBURG': 'IL', 'BOLINGBROOK': 'IL', 'PALATINE': 'IL', 'SKOKIE': 'IL', 'DES PLAINES': 'IL',
  'ORLAND PARK': 'IL', 'TINLEY PARK': 'IL', 'OAK LAWN': 'IL', 'BERWYN': 'IL', 'MOUNT PROSPECT': 'IL',
  'NORMAL': 'IL', 'WHEATON': 'IL', 'HOFFMAN ESTATES': 'IL', 'OAK PARK': 'IL', 'DOWNERS GROVE': 'IL',
  
  // Ohio
  'COLUMBUS': 'OH', 'CLEVELAND': 'OH', 'CINCINNATI': 'OH', 'TOLEDO': 'OH', 'AKRON': 'OH',
  'DAYTON': 'OH', 'PARMA': 'OH', 'CANTON': 'OH', 'YOUNGSTOWN': 'OH', 'LORAIN': 'OH',
  'HAMILTON': 'OH', 'SPRINGFIELD': 'OH', 'KETTERING': 'OH', 'ELYRIA': 'OH', 'LAKEWOOD': 'OH',
  'CUYAHOGA FALLS': 'OH', 'MIDDLETOWN': 'OH', 'EUCLID': 'OH', 'MANSFIELD': 'OH', 'NEWARK': 'OH',
  
  // Pennsylvania
  'PHILADELPHIA': 'PA', 'PITTSBURGH': 'PA', 'ALLENTOWN': 'PA', 'ERIE': 'PA', 'READING': 'PA',
  'SCRANTON': 'PA', 'BETHLEHEM': 'PA', 'LANCASTER': 'PA', 'HARRISBURG': 'PA', 'ALTOONA': 'PA',
  'YORK': 'PA', 'WILKES-BARRE': 'PA', 'CHESTER': 'PA', 'WILLIAMSPORT': 'PA', 'JOHNSTOWN': 'PA',
  
  // Washington
  'SEATTLE': 'WA', 'SPOKANE': 'WA', 'TACOMA': 'WA', 'VANCOUVER': 'WA', 'BELLEVUE': 'WA',
  'KENT': 'WA', 'EVERETT': 'WA', 'RENTON': 'WA', 'YAKIMA': 'WA', 'FEDERAL WAY': 'WA',
  'SPOKANE VALLEY': 'WA', 'BELLINGHAM': 'WA', 'KENNEWICK': 'WA', 'AUBURN': 'WA', 'PASCO': 'WA',
  'MARYSVILLE': 'WA', 'LAKEWOOD': 'WA', 'REDMOND': 'WA', 'SHORELINE': 'WA', 'RICHLAND': 'WA',
  
  // Arizona
  'PHOENIX': 'AZ', 'TUCSON': 'AZ', 'MESA': 'AZ', 'CHANDLER': 'AZ', 'GLENDALE': 'AZ',
  'SCOTTSDALE': 'AZ', 'GILBERT': 'AZ', 'TEMPE': 'AZ', 'PEORIA': 'AZ', 'SURPRISE': 'AZ',
  'YUMA': 'AZ', 'AVONDALE': 'AZ', 'GOODYEAR': 'AZ', 'FLAGSTAFF': 'AZ', 'CASA GRANDE': 'AZ',
  'LAKE HAVASU CITY': 'AZ', 'SIERRA VISTA': 'AZ', 'MARICOPA': 'AZ', 'ORO VALLEY': 'AZ', 'PRESCOTT': 'AZ',
  
  // Colorado
  'DENVER': 'CO', 'COLORADO SPRINGS': 'CO', 'AURORA': 'CO', 'FORT COLLINS': 'CO', 'LAKEWOOD': 'CO',
  'THORNTON': 'CO', 'ARVADA': 'CO', 'WESTMINSTER': 'CO', 'PUEBLO': 'CO', 'CENTENNIAL': 'CO',
  'BOULDER': 'CO', 'GREELEY': 'CO', 'LONGMONT': 'CO', 'LOVELAND': 'CO', 'GRAND JUNCTION': 'CO',
  
  // Add more states as needed...
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

// Geocoding with multiple services
async function geocodeLocation(city: string, state: string): Promise<{ lat: number, lon: number } | null> {
  try {
    // Try US Census Bureau first (most accurate)
    const censusUrl = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(`${city}, ${state}`)}&benchmark=2020&format=json`;
    
    const censusResponse = await fetch(censusUrl);
    if (censusResponse.ok) {
      const data = await censusResponse.json();
      if (data.result?.addressMatches?.length > 0) {
        const match = data.result.addressMatches[0];
        return {
          lat: parseFloat(match.coordinates.y),
          lon: parseFloat(match.coordinates.x)
        };
      }
    }
    
    // Fallback to Nominatim
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=USA&limit=1`;
    
    const nominatimResponse = await fetch(nominatimUrl, {
      headers: { 'User-Agent': 'SpeechTherapyMap/1.0' }
    });
    
    if (nominatimResponse.ok) {
      const data = await nominatimResponse.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Geocoding error for ${city}, ${state}:`, error);
    return null;
  }
}

async function fixAllCoordinates() {
  console.log('🎯 Fixing coordinates for all clinics using accurate city-state mapping...');
  
  try {
    const clinics = await sql`
      SELECT id, name, city, latitude, longitude
      FROM clinics
      ORDER BY city
    `;
    
    console.log(`📍 Processing ${clinics.length} clinics`);
    
    let fixed = 0;
    let skipped = 0;
    const processedCities = new Map<string, { lat: number, lon: number }>();
    
    for (let i = 0; i < clinics.length; i++) {
      const clinic = clinics[i];
      const cityKey = clinic.city.toUpperCase().trim();
      
      console.log(`[${i + 1}/${clinics.length}] ${clinic.name} in ${clinic.city}`);
      
      // Check if we've already processed this city
      if (processedCities.has(cityKey)) {
        const coords = processedCities.get(cityKey)!;
        await sql`UPDATE clinics SET latitude = ${coords.lat}, longitude = ${coords.lon} WHERE id = ${clinic.id}`;
        console.log(`  ✅ Used cached coordinates: ${coords.lat}, ${coords.lon}`);
        fixed++;
        continue;
      }
      
      // Look up state for this city
      const state = US_CITY_STATE_MAP[cityKey];
      if (!state) {
        console.log(`  ❌ Unknown state for ${clinic.city}`);
        skipped++;
        continue;
      }
      
      // Geocode the city
      const coordinates = await geocodeLocation(clinic.city, state);
      if (coordinates) {
        // Cache for future use
        processedCities.set(cityKey, coordinates);
        
        // Update database
        await sql`UPDATE clinics SET latitude = ${coordinates.lat}, longitude = ${coordinates.lon} WHERE id = ${clinic.id}`;
        console.log(`  ✅ Updated: ${coordinates.lat}, ${coordinates.lon} (${state})`);
        fixed++;
      } else {
        console.log(`  ❌ Failed to geocode ${clinic.city}, ${state}`);
        skipped++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log(`\n📊 Coordinate fix complete:`);
    console.log(`  ✅ Fixed: ${fixed} clinics`);
    console.log(`  ❌ Skipped: ${skipped} clinics`);
    
    // Remove clinics without coordinates
    const removed = await sql`DELETE FROM clinics WHERE latitude = 36.0 AND longitude = -95.0`;
    console.log(`🗑️ Removed ${removed.length} clinics with temporary coordinates`);
    
    // Final count
    const finalCount = await sql`SELECT COUNT(*) as count FROM clinics`;
    console.log(`✅ Final accurate dataset: ${finalCount[0].count} clinics`);
    
  } catch (error) {
    console.error('Error fixing coordinates:', error);
  }
}

async function main() {
  try {
    // Import full dataset
    const importedCount = await importFullNPIDataset();
    
    if (importedCount > 0) {
      console.log('\n⏳ Waiting 5 seconds before starting coordinate fixes...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Fix coordinates
      await fixAllCoordinates();
    }
    
    console.log('\n🎉 Complete coordinate accuracy system rebuilt!');
    
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

main().catch(console.error);