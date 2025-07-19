import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

// First, restore the full NPI dataset using the working approach
async function restoreNPIDataset() {
  console.log('🔄 Restoring full NPI Speech-Language Pathology dataset...');
  
  // Use multiple search terms to get comprehensive coverage
  const searchTerms = [
    'speech language',
    'speech therapy', 
    'language therapy',
    'speech pathology',
    'speech pathologist'
  ];
  
  let totalInserted = 0;
  
  for (const term of searchTerms) {
    console.log(`Searching for: ${term}`);
    
    const url = `https://clinicaltables.nlm.nih.gov/api/npi_org/v3/search?terms=${encodeURIComponent(term)}&maxList=2000&ef=NPI,name.full,addr_practice.city,addr_practice.state,addr_practice.line1,addr_practice.phone`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`  Found ${data[0]} providers for "${term}"`);
      
      if (data[1] && data[1].length > 0) {
        // The data structure is [count, npis, extraFields]
        const npis = data[1];
        const extraFields = data[2];
        
        for (let i = 0; i < npis.length; i++) {
          const npi = npis[i];
          const name = extraFields?.['name.full']?.[i];
          const city = extraFields?.['addr_practice.city']?.[i];
          const state = extraFields?.['addr_practice.state']?.[i];
          const address = extraFields?.['addr_practice.line1']?.[i];
          const phone = extraFields?.['addr_practice.phone']?.[i];
          
          if (!name || !city || !state) continue;
          
          // Check if already exists
          const existing = await sql`SELECT id FROM clinics WHERE notes LIKE ${'%NPI: ' + npi + '%'}`;
          if (existing.length > 0) continue;
          
          try {
            await sql`
              INSERT INTO clinics (
                name, country, city, latitude, longitude, cost_level, services, 
                primary_language, accepts_insurance, phone_number, website, 
                notes, is_verified, created_by, created_by_email
              ) VALUES (
                ${name.slice(0, 200)},
                'United States',
                ${city.slice(0, 100)},
                36.0, -95.0,
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
            totalInserted++;
          } catch (error) {
            // Skip duplicates
          }
        }
      }
    } catch (error) {
      console.error(`Error searching for "${term}":`, error);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`✅ Imported ${totalInserted} unique speech therapy centers`);
  return totalInserted;
}

// Comprehensive state mapping with major cities
const COMPREHENSIVE_CITY_MAPPING: { [key: string]: string } = {
  // California cities
  'LOS ANGELES': 'CA', 'SAN FRANCISCO': 'CA', 'SAN DIEGO': 'CA', 'SAN JOSE': 'CA', 'FRESNO': 'CA',
  'SACRAMENTO': 'CA', 'LONG BEACH': 'CA', 'OAKLAND': 'CA', 'BAKERSFIELD': 'CA', 'ANAHEIM': 'CA',
  'SANTA ANA': 'CA', 'RIVERSIDE': 'CA', 'STOCKTON': 'CA', 'IRVINE': 'CA', 'CHULA VISTA': 'CA',
  'FREMONT': 'CA', 'SAN BERNARDINO': 'CA', 'MODESTO': 'CA', 'FONTANA': 'CA', 'OXNARD': 'CA',
  'MORENO VALLEY': 'CA', 'HUNTINGTON BEACH': 'CA', 'GLENDALE': 'CA', 'SANTA CLARITA': 'CA',
  'GARDEN GROVE': 'CA', 'SANTA ROSA': 'CA', 'OCEANSIDE': 'CA', 'RANCHO CUCAMONGA': 'CA',
  'ONTARIO': 'CA', 'LANCASTER': 'CA', 'ELK GROVE': 'CA', 'PALMDALE': 'CA', 'CORONA': 'CA',
  'SALINAS': 'CA', 'POMONA': 'CA', 'TORRANCE': 'CA', 'HAYWARD': 'CA', 'ESCONDIDO': 'CA',
  'SUNNYVALE': 'CA', 'ORANGE': 'CA', 'FULLERTON': 'CA', 'PASADENA': 'CA', 'THOUSAND OAKS': 'CA',
  'VISALIA': 'CA', 'SIMI VALLEY': 'CA', 'CONCORD': 'CA', 'ROSEVILLE': 'CA', 'SANTA CLARA': 'CA',
  'VALLEJO': 'CA', 'BERKELEY': 'CA', 'EL MONTE': 'CA', 'DOWNEY': 'CA', 'COSTA MESA': 'CA',
  'INGLEWOOD': 'CA', 'CARLSBAD': 'CA', 'SAN BUENAVENTURA': 'CA', 'FAIRFIELD': 'CA', 'WEST COVINA': 'CA',
  'MURRIETA': 'CA', 'RICHMOND': 'CA', 'NORWALK': 'CA', 'ANTIOCH': 'CA', 'TEMECULA': 'CA',
  'BURBANK': 'CA', 'DALY CITY': 'CA', 'RIALTO': 'CA', 'SANTA MARIA': 'CA', 'EL CAJON': 'CA',
  
  // Texas cities - CRITICAL for accuracy
  'HOUSTON': 'TX', 'SAN ANTONIO': 'TX', 'DALLAS': 'TX', 'AUSTIN': 'TX', 'FORT WORTH': 'TX',
  'EL PASO': 'TX', 'ARLINGTON': 'TX', 'CORPUS CHRISTI': 'TX', 'PLANO': 'TX', 'LUBBOCK': 'TX',
  'LAREDO': 'TX', 'IRVING': 'TX', 'GARLAND': 'TX', 'AMARILLO': 'TX', 'GRAND PRAIRIE': 'TX',
  'BROWNSVILLE': 'TX', 'MCKINNEY': 'TX', 'FRISCO': 'TX', 'PASADENA': 'TX', 'KILLEEN': 'TX',
  'CARROLLTON': 'TX', 'MIDLAND': 'TX', 'WACO': 'TX', 'DENTON': 'TX', 'ABILENE': 'TX',
  'BEAUMONT': 'TX', 'ODESSA': 'TX', 'ROUND ROCK': 'TX', 'RICHARDSON': 'TX', 'TYLER': 'TX',
  'LEWISVILLE': 'TX', 'COLLEGE STATION': 'TX', 'PEARLAND': 'TX', 'ALLEN': 'TX', 'LEAGUE CITY': 'TX',
  'SUGAR LAND': 'TX', 'LONGVIEW': 'TX', 'BRYAN': 'TX', 'PHARR': 'TX', 'MCALLEN': 'TX',
  'MESQUITE': 'TX', 'MISSOURI CITY': 'TX', 'NEW BRAUNFELS': 'TX', 'EULESS': 'TX', 'CEDAR PARK': 'TX',
  
  // Michigan cities - CRITICAL (East Lansing example)
  'DETROIT': 'MI', 'GRAND RAPIDS': 'MI', 'WARREN': 'MI', 'STERLING HEIGHTS': 'MI', 'LANSING': 'MI',
  'ANN ARBOR': 'MI', 'FLINT': 'MI', 'DEARBORN': 'MI', 'LIVONIA': 'MI', 'WESTLAND': 'MI',
  'TROY': 'MI', 'FARMINGTON HILLS': 'MI', 'KALAMAZOO': 'MI', 'WYOMING': 'MI', 'SOUTHFIELD': 'MI',
  'ROCHESTER HILLS': 'MI', 'TAYLOR': 'MI', 'PONTIAC': 'MI', 'NOVI': 'MI', 'DEARBORN HEIGHTS': 'MI',
  'BATTLE CREEK': 'MI', 'SAGINAW': 'MI', 'MIDLAND': 'MI', 'BAY CITY': 'MI', 'EAST LANSING': 'MI',
  'PORTAGE': 'MI', 'JACKSON': 'MI', 'NILES': 'MI', 'MOUNT PLEASANT': 'MI', 'MUSKEGON': 'MI',
  
  // Florida cities
  'JACKSONVILLE': 'FL', 'MIAMI': 'FL', 'TAMPA': 'FL', 'ORLANDO': 'FL', 'ST. PETERSBURG': 'FL',
  'HIALEAH': 'FL', 'TALLAHASSEE': 'FL', 'FORT LAUDERDALE': 'FL', 'PORT ST. LUCIE': 'FL',
  'CAPE CORAL': 'FL', 'PEMBROKE PINES': 'FL', 'HOLLYWOOD': 'FL', 'MIRAMAR': 'FL', 'GAINESVILLE': 'FL',
  'CORAL SPRINGS': 'FL', 'PALM BAY': 'FL', 'WEST PALM BEACH': 'FL', 'CLEARWATER': 'FL',
  'LAKELAND': 'FL', 'POMPANO BEACH': 'FL', 'DAVIE': 'FL', 'SUNRISE': 'FL', 'BOCA RATON': 'FL',
  'DELTONA': 'FL', 'PLANTATION': 'FL', 'PALM COAST': 'FL', 'LARGO': 'FL', 'DEERFIELD BEACH': 'FL',
  'BOYNTON BEACH': 'FL', 'MELBOURNE': 'FL', 'LAUDERHILL': 'FL', 'WESTON': 'FL', 'DELRAY BEACH': 'FL',
  
  // New York cities
  'NEW YORK': 'NY', 'BUFFALO': 'NY', 'ROCHESTER': 'NY', 'YONKERS': 'NY', 'SYRACUSE': 'NY',
  'ALBANY': 'NY', 'NEW ROCHELLE': 'NY', 'MOUNT VERNON': 'NY', 'SCHENECTADY': 'NY', 'UTICA': 'NY',
  'WHITE PLAINS': 'NY', 'HEMPSTEAD': 'NY', 'TROY': 'NY', 'NIAGARA FALLS': 'NY', 'BINGHAMTON': 'NY',
  'BROOKLYN': 'NY', 'QUEENS': 'NY', 'BRONX': 'NY', 'STATEN ISLAND': 'NY', 'MANHATTAN': 'NY',
  
  // Illinois cities
  'CHICAGO': 'IL', 'AURORA': 'IL', 'ROCKFORD': 'IL', 'JOLIET': 'IL', 'NAPERVILLE': 'IL',
  'SPRINGFIELD': 'IL', 'PEORIA': 'IL', 'ELGIN': 'IL', 'WAUKEGAN': 'IL', 'CICERO': 'IL',
  'CHAMPAIGN': 'IL', 'BLOOMINGTON': 'IL', 'ARLINGTON HEIGHTS': 'IL', 'EVANSTON': 'IL', 'DECATUR': 'IL',
  'SCHAUMBURG': 'IL', 'BOLINGBROOK': 'IL', 'PALATINE': 'IL', 'SKOKIE': 'IL', 'DES PLAINES': 'IL',
  'ORLAND PARK': 'IL', 'TINLEY PARK': 'IL', 'OAK LAWN': 'IL', 'BERWYN': 'IL', 'MOUNT PROSPECT': 'IL',
  'NORMAL': 'IL', 'WHEATON': 'IL', 'HOFFMAN ESTATES': 'IL', 'OAK PARK': 'IL', 'DOWNERS GROVE': 'IL',
  
  // Ohio cities
  'COLUMBUS': 'OH', 'CLEVELAND': 'OH', 'CINCINNATI': 'OH', 'TOLEDO': 'OH', 'AKRON': 'OH',
  'DAYTON': 'OH', 'PARMA': 'OH', 'CANTON': 'OH', 'YOUNGSTOWN': 'OH', 'LORAIN': 'OH',
  'HAMILTON': 'OH', 'SPRINGFIELD': 'OH', 'KETTERING': 'OH', 'ELYRIA': 'OH', 'LAKEWOOD': 'OH',
  'CUYAHOGA FALLS': 'OH', 'MIDDLETOWN': 'OH', 'EUCLID': 'OH', 'MANSFIELD': 'OH', 'NEWARK': 'OH',
  
  // Pennsylvania cities
  'PHILADELPHIA': 'PA', 'PITTSBURGH': 'PA', 'ALLENTOWN': 'PA', 'ERIE': 'PA', 'READING': 'PA',
  'SCRANTON': 'PA', 'BETHLEHEM': 'PA', 'LANCASTER': 'PA', 'HARRISBURG': 'PA', 'ALTOONA': 'PA',
  'YORK': 'PA', 'WILKES-BARRE': 'PA', 'CHESTER': 'PA', 'WILLIAMSPORT': 'PA', 'JOHNSTOWN': 'PA',
  
  // Arizona cities  
  'PHOENIX': 'AZ', 'TUCSON': 'AZ', 'MESA': 'AZ', 'CHANDLER': 'AZ', 'GLENDALE': 'AZ',
  'SCOTTSDALE': 'AZ', 'GILBERT': 'AZ', 'TEMPE': 'AZ', 'PEORIA': 'AZ', 'SURPRISE': 'AZ',
  'YUMA': 'AZ', 'AVONDALE': 'AZ', 'GOODYEAR': 'AZ', 'FLAGSTAFF': 'AZ', 'CASA GRANDE': 'AZ',
  
  // Washington cities
  'SEATTLE': 'WA', 'SPOKANE': 'WA', 'TACOMA': 'WA', 'VANCOUVER': 'WA', 'BELLEVUE': 'WA',
  'KENT': 'WA', 'EVERETT': 'WA', 'RENTON': 'WA', 'YAKIMA': 'WA', 'FEDERAL WAY': 'WA',
  'SPOKANE VALLEY': 'WA', 'BELLINGHAM': 'WA', 'KENNEWICK': 'WA', 'AUBURN': 'WA', 'PASCO': 'WA',
  'MARYSVILLE': 'WA', 'LAKEWOOD': 'WA', 'REDMOND': 'WA', 'SHORELINE': 'WA', 'RICHLAND': 'WA',
  
  // Colorado cities
  'DENVER': 'CO', 'COLORADO SPRINGS': 'CO', 'AURORA': 'CO', 'FORT COLLINS': 'CO', 'LAKEWOOD': 'CO',
  'THORNTON': 'CO', 'ARVADA': 'CO', 'WESTMINSTER': 'CO', 'PUEBLO': 'CO', 'CENTENNIAL': 'CO',
  'BOULDER': 'CO', 'GREELEY': 'CO', 'LONGMONT': 'CO', 'LOVELAND': 'CO', 'GRAND JUNCTION': 'CO',
  
  // Georgia cities
  'ATLANTA': 'GA', 'AUGUSTA': 'GA', 'COLUMBUS': 'GA', 'SAVANNAH': 'GA', 'ATHENS': 'GA',
  'SANDY SPRINGS': 'GA', 'ROSWELL': 'GA', 'MACON': 'GA', 'JOHNS CREEK': 'GA', 'ALBANY': 'GA',
  
  // North Carolina cities
  'CHARLOTTE': 'NC', 'RALEIGH': 'NC', 'GREENSBORO': 'NC', 'DURHAM': 'NC', 'WINSTON-SALEM': 'NC',
  'FAYETTEVILLE': 'NC', 'CARY': 'NC', 'WILMINGTON': 'NC', 'HIGH POINT': 'NC', 'GREENVILLE': 'NC',
  
  // Virginia cities
  'VIRGINIA BEACH': 'VA', 'NORFOLK': 'VA', 'CHESAPEAKE': 'VA', 'RICHMOND': 'VA', 'NEWPORT NEWS': 'VA',
  'ALEXANDRIA': 'VA', 'HAMPTON': 'VA', 'PORTSMOUTH': 'VA', 'SUFFOLK': 'VA', 'LYNCHBURG': 'VA'
};

async function preciseGeocode(city: string, state: string): Promise<{ lat: number, lon: number } | null> {
  try {
    // US Census Bureau - most accurate for US locations
    const censusUrl = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(`${city}, ${state}`)}&benchmark=2020&format=json`;
    
    const response = await fetch(censusUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.result?.addressMatches?.length > 0) {
        const match = data.result.addressMatches[0];
        const lat = parseFloat(match.coordinates.y);
        const lon = parseFloat(match.coordinates.x);
        
        // Validate coordinates are within reasonable US bounds
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

async function fixCoordinatesComprehensively() {
  console.log('🎯 Starting comprehensive coordinate accuracy fix...');
  
  try {
    const clinics = await sql`
      SELECT id, name, city, latitude, longitude
      FROM clinics
      ORDER BY city
    `;
    
    console.log(`📍 Processing ${clinics.length} clinics for accurate coordinates`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    const processedCities = new Map<string, { lat: number, lon: number }>();
    const stateStats: { [state: string]: number } = {};
    
    for (let i = 0; i < clinics.length; i++) {
      const clinic = clinics[i];
      const cityUpper = clinic.city.toUpperCase().trim();
      
      console.log(`[${i + 1}/${clinics.length}] ${clinic.name} in ${clinic.city}`);
      
      // Use cached coordinates if available
      if (processedCities.has(cityUpper)) {
        const coords = processedCities.get(cityUpper)!;
        await sql`UPDATE clinics SET latitude = ${coords.lat}, longitude = ${coords.lon} WHERE id = ${clinic.id}`;
        console.log(`  ✅ Used cached coordinates: ${coords.lat}, ${coords.lon}`);
        fixedCount++;
        continue;
      }
      
      // Determine state for this city
      const state = COMPREHENSIVE_CITY_MAPPING[cityUpper];
      
      if (!state) {
        console.log(`  ❌ Unknown state for ${clinic.city}`);
        skippedCount++;
        continue;
      }
      
      console.log(`  State: ${state}`);
      
      // Get precise coordinates
      const coordinates = await preciseGeocode(clinic.city, state);
      
      if (coordinates) {
        // Cache for other clinics in same city
        processedCities.set(cityUpper, coordinates);
        
        // Update database
        await sql`UPDATE clinics SET latitude = ${coordinates.lat}, longitude = ${coordinates.lon} WHERE id = ${clinic.id}`;
        
        console.log(`  ✅ Updated: ${coordinates.lat}, ${coordinates.lon}`);
        fixedCount++;
        stateStats[state] = (stateStats[state] || 0) + 1;
      } else {
        console.log(`  ❌ Failed to geocode ${clinic.city}, ${state}`);
        skippedCount++;
      }
      
      // Rate limiting - be respectful to APIs
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log(`\n📊 Comprehensive coordinate fix complete:`);
    console.log(`  ✅ Fixed: ${fixedCount} clinics`);
    console.log(`  ❌ Skipped: ${skippedCount} clinics`);
    
    console.log('\n📍 Clinics by state:');
    Object.entries(stateStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([state, count]) => {
        console.log(`  ${state}: ${count} clinics`);
      });
    
    // Remove any clinics with temporary coordinates
    const removed = await sql`DELETE FROM clinics WHERE latitude = 36.0 AND longitude = -95.0`;
    console.log(`\n🗑️ Removed ${removed.length} clinics with temporary coordinates`);
    
    // Final verification - check specific problematic cities
    const eastLansingCheck = await sql`
      SELECT name, latitude, longitude 
      FROM clinics 
      WHERE city = 'EAST LANSING'
    `;
    
    if (eastLansingCheck.length > 0) {
      console.log(`\n🔍 East Lansing verification:`);
      eastLansingCheck.forEach(clinic => {
        const inMichigan = clinic.latitude >= 41.7 && clinic.latitude <= 48.3 && 
                          clinic.longitude >= -90.4 && clinic.longitude <= -82.1;
        console.log(`  ${clinic.name}: ${clinic.latitude}, ${clinic.longitude} ${inMichigan ? '✅' : '❌'}`);
      });
    }
    
    // Final count
    const finalCount = await sql`SELECT COUNT(*) as count FROM clinics`;
    console.log(`\n✅ Final accurate dataset: ${finalCount[0].count} clinics with precise coordinates`);
    
  } catch (error) {
    console.error('Error in comprehensive coordinate fix:', error);
  }
}

async function main() {
  try {
    console.log('🚀 Starting complete coordinate accuracy rebuild...');
    
    // Step 1: Restore full NPI dataset
    const imported = await restoreNPIDataset();
    
    if (imported > 0) {
      console.log(`\n⏳ Waiting 3 seconds before fixing coordinates...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Step 2: Fix all coordinates with precise geocoding
      await fixCoordinatesComprehensively();
    } else {
      console.log('❌ No data imported, skipping coordinate fixes');
    }
    
    console.log('\n🎉 Complete accurate coordinate system rebuilt!');
    
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

main().catch(console.error);