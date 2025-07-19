import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

interface Clinic {
  id: string;
  name: string;
  city: string;
  notes: string;
}

// Comprehensive city-to-state mapping based on major US cities
const COMPREHENSIVE_CITY_STATE_MAP: { [key: string]: string } = {
  // Major California cities
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
  
  // Major Texas cities
  'HOUSTON': 'TX', 'SAN ANTONIO': 'TX', 'DALLAS': 'TX', 'AUSTIN': 'TX', 'FORT WORTH': 'TX',
  'EL PASO': 'TX', 'ARLINGTON': 'TX', 'CORPUS CHRISTI': 'TX', 'PLANO': 'TX', 'LUBBOCK': 'TX',
  'LAREDO': 'TX', 'IRVING': 'TX', 'GARLAND': 'TX', 'AMARILLO': 'TX', 'GRAND PRAIRIE': 'TX',
  'BROWNSVILLE': 'TX', 'MCKINNEY': 'TX', 'FRISCO': 'TX', 'PASADENA': 'TX', 'KILLEEN': 'TX',
  'CARROLLTON': 'TX', 'MIDLAND': 'TX', 'WACO': 'TX', 'DENTON': 'TX', 'ABILENE': 'TX',
  'BEAUMONT': 'TX', 'ODESSA': 'TX', 'ROUND ROCK': 'TX', 'RICHARDSON': 'TX', 'TYLER': 'TX',
  'LEWISVILLE': 'TX', 'COLLEGE STATION': 'TX', 'PEARLAND': 'TX', 'ALLEN': 'TX', 'LEAGUE CITY': 'TX',
  'SUGAR LAND': 'TX', 'LONGVIEW': 'TX', 'BRYAN': 'TX', 'PHARR': 'TX', 'MCALLEN': 'TX',
  'MESQUITE': 'TX', 'MISSOURI CITY': 'TX', 'NEW BRAUNFELS': 'TX', 'EULESS': 'TX', 'CEDAR PARK': 'TX',
  
  // Major Florida cities
  'JACKSONVILLE': 'FL', 'MIAMI': 'FL', 'TAMPA': 'FL', 'ORLANDO': 'FL', 'ST. PETERSBURG': 'FL',
  'HIALEAH': 'FL', 'TALLAHASSEE': 'FL', 'FORT LAUDERDALE': 'FL', 'PORT ST. LUCIE': 'FL',
  'CAPE CORAL': 'FL', 'PEMBROKE PINES': 'FL', 'HOLLYWOOD': 'FL', 'MIRAMAR': 'FL', 'GAINESVILLE': 'FL',
  'CORAL SPRINGS': 'FL', 'PALM BAY': 'FL', 'WEST PALM BEACH': 'FL', 'CLEARWATER': 'FL',
  'LAKELAND': 'FL', 'POMPANO BEACH': 'FL', 'DAVIE': 'FL', 'SUNRISE': 'FL', 'BOCA RATON': 'FL',
  'DELTONA': 'FL', 'PLANTATION': 'FL', 'PALM COAST': 'FL', 'LARGO': 'FL', 'DEERFIELD BEACH': 'FL',
  'BOYNTON BEACH': 'FL', 'MELBOURNE': 'FL', 'LAUDERHILL': 'FL', 'WESTON': 'FL', 'DELRAY BEACH': 'FL',
  
  // Major New York cities
  'NEW YORK': 'NY', 'BUFFALO': 'NY', 'ROCHESTER': 'NY', 'YONKERS': 'NY', 'SYRACUSE': 'NY',
  'ALBANY': 'NY', 'NEW ROCHELLE': 'NY', 'MOUNT VERNON': 'NY', 'SCHENECTADY': 'NY', 'UTICA': 'NY',
  'WHITE PLAINS': 'NY', 'HEMPSTEAD': 'NY', 'TROY': 'NY', 'NIAGARA FALLS': 'NY', 'BINGHAMTON': 'NY',
  'FREEPORT': 'NY', 'VALLEY STREAM': 'NY', 'BROOKLYN': 'NY', 'QUEENS': 'NY', 'BRONX': 'NY',
  'STATEN ISLAND': 'NY', 'MANHATTAN': 'NY', 'LONG ISLAND': 'NY', 'ELMIRA': 'NY', 'JAMESTOWN': 'NY',
  
  // Major Michigan cities  
  'DETROIT': 'MI', 'GRAND RAPIDS': 'MI', 'WARREN': 'MI', 'STERLING HEIGHTS': 'MI', 'LANSING': 'MI',
  'ANN ARBOR': 'MI', 'FLINT': 'MI', 'DEARBORN': 'MI', 'LIVONIA': 'MI', 'WESTLAND': 'MI',
  'TROY': 'MI', 'FARMINGTON HILLS': 'MI', 'KALAMAZOO': 'MI', 'WYOMING': 'MI', 'SOUTHFIELD': 'MI',
  'ROCHESTER HILLS': 'MI', 'TAYLOR': 'MI', 'PONTIAC': 'MI', 'NOVI': 'MI', 'DEARBORN HEIGHTS': 'MI',
  'BATTLE CREEK': 'MI', 'SAGINAW': 'MI', 'MIDLAND': 'MI', 'BAY CITY': 'MI', 'EAST LANSING': 'MI',
  'PORTAGE': 'MI', 'JACKSON': 'MI', 'NILES': 'MI', 'MOUNT PLEASANT': 'MI', 'MUSKEGON': 'MI',
  
  // Major Illinois cities
  'CHICAGO': 'IL', 'AURORA': 'IL', 'ROCKFORD': 'IL', 'JOLIET': 'IL', 'NAPERVILLE': 'IL',
  'SPRINGFIELD': 'IL', 'PEORIA': 'IL', 'ELGIN': 'IL', 'WAUKEGAN': 'IL', 'CICERO': 'IL',
  'CHAMPAIGN': 'IL', 'BLOOMINGTON': 'IL', 'ARLINGTON HEIGHTS': 'IL', 'EVANSTON': 'IL', 'DECATUR': 'IL',
  'SCHAUMBURG': 'IL', 'BOLINGBROOK': 'IL', 'PALATINE': 'IL', 'SKOKIE': 'IL', 'DES PLAINES': 'IL',
  'ORLAND PARK': 'IL', 'TINLEY PARK': 'IL', 'OAK LAWN': 'IL', 'BERWYN': 'IL', 'MOUNT PROSPECT': 'IL',
  'NORMAL': 'IL', 'WHEATON': 'IL', 'HOFFMAN ESTATES': 'IL', 'OAK PARK': 'IL', 'DOWNERS GROVE': 'IL',
  
  // Major Ohio cities
  'COLUMBUS': 'OH', 'CLEVELAND': 'OH', 'CINCINNATI': 'OH', 'TOLEDO': 'OH', 'AKRON': 'OH',
  'DAYTON': 'OH', 'PARMA': 'OH', 'CANTON': 'OH', 'YOUNGSTOWN': 'OH', 'LORAIN': 'OH',
  'HAMILTON': 'OH', 'SPRINGFIELD': 'OH', 'KETTERING': 'OH', 'ELYRIA': 'OH', 'LAKEWOOD': 'OH',
  'CUYAHOGA FALLS': 'OH', 'MIDDLETOWN': 'OH', 'EUCLID': 'OH', 'MANSFIELD': 'OH', 'NEWARK': 'OH',
  'MENTOR': 'OH', 'CLEVELAND HEIGHTS': 'OH', 'BEAVERCREEK': 'OH', 'STRONGSVILLE': 'OH', 'DUBLIN': 'OH',
  
  // Major Pennsylvania cities
  'PHILADELPHIA': 'PA', 'PITTSBURGH': 'PA', 'ALLENTOWN': 'PA', 'ERIE': 'PA', 'READING': 'PA',
  'SCRANTON': 'PA', 'BETHLEHEM': 'PA', 'LANCASTER': 'PA', 'HARRISBURG': 'PA', 'ALTOONA': 'PA',
  'YORK': 'PA', 'WILKES-BARRE': 'PA', 'CHESTER': 'PA', 'WILLIAMSPORT': 'PA', 'JOHNSTOWN': 'PA',
  
  // Major Georgia cities
  'ATLANTA': 'GA', 'AUGUSTA': 'GA', 'COLUMBUS': 'GA', 'SAVANNAH': 'GA', 'ATHENS': 'GA',
  'SANDY SPRINGS': 'GA', 'ROSWELL': 'GA', 'MACON': 'GA', 'JOHNS CREEK': 'GA', 'ALBANY': 'GA',
  'WARNER ROBINS': 'GA', 'ALPHARETTA': 'GA', 'MARIETTA': 'GA', 'VALDOSTA': 'GA', 'SMYRNA': 'GA',
  
  // Major North Carolina cities
  'CHARLOTTE': 'NC', 'RALEIGH': 'NC', 'GREENSBORO': 'NC', 'DURHAM': 'NC', 'WINSTON-SALEM': 'NC',
  'FAYETTEVILLE': 'NC', 'CARY': 'NC', 'WILMINGTON': 'NC', 'HIGH POINT': 'NC', 'GREENVILLE': 'NC',
  'ASHEVILLE': 'NC', 'CONCORD': 'NC', 'GASTONIA': 'NC', 'JACKSONVILLE': 'NC', 'CHAPEL HILL': 'NC',
  
  // Major Washington cities
  'SEATTLE': 'WA', 'SPOKANE': 'WA', 'TACOMA': 'WA', 'VANCOUVER': 'WA', 'BELLEVUE': 'WA',
  'KENT': 'WA', 'EVERETT': 'WA', 'RENTON': 'WA', 'YAKIMA': 'WA', 'FEDERAL WAY': 'WA',
  'SPOKANE VALLEY': 'WA', 'BELLINGHAM': 'WA', 'KENNEWICK': 'WA', 'AUBURN': 'WA', 'PASCO': 'WA',
  'MARYSVILLE': 'WA', 'LAKEWOOD': 'WA', 'REDMOND': 'WA', 'SHORELINE': 'WA', 'RICHLAND': 'WA',
  
  // Major Virginia cities
  'VIRGINIA BEACH': 'VA', 'NORFOLK': 'VA', 'CHESAPEAKE': 'VA', 'RICHMOND': 'VA', 'NEWPORT NEWS': 'VA',
  'ALEXANDRIA': 'VA', 'HAMPTON': 'VA', 'PORTSMOUTH': 'VA', 'SUFFOLK': 'VA', 'LYNCHBURG': 'VA',
  'ROANOKE': 'VA', 'DANVILLE': 'VA', 'CHARLOTTESVILLE': 'VA', 'FAIRFAX': 'VA', 'ARLINGTON': 'VA',
  'ASHBURN': 'VA', 'HERNDON': 'VA', 'RESTON': 'VA', 'STERLING': 'VA', 'LEESBURG': 'VA',
  
  // Major Arizona cities
  'PHOENIX': 'AZ', 'TUCSON': 'AZ', 'MESA': 'AZ', 'CHANDLER': 'AZ', 'GLENDALE': 'AZ',
  'SCOTTSDALE': 'AZ', 'GILBERT': 'AZ', 'TEMPE': 'AZ', 'PEORIA': 'AZ', 'SURPRISE': 'AZ',
  'YUMA': 'AZ', 'AVONDALE': 'AZ', 'GOODYEAR': 'AZ', 'FLAGSTAFF': 'AZ', 'CASA GRANDE': 'AZ',
  'LAKE HAVASU CITY': 'AZ', 'SIERRA VISTA': 'AZ', 'MARICOPA': 'AZ', 'ORO VALLEY': 'AZ', 'PRESCOTT': 'AZ',
  
  // Major Colorado cities
  'DENVER': 'CO', 'COLORADO SPRINGS': 'CO', 'AURORA': 'CO', 'FORT COLLINS': 'CO', 'LAKEWOOD': 'CO',
  'THORNTON': 'CO', 'ARVADA': 'CO', 'WESTMINSTER': 'CO', 'PUEBLO': 'CO', 'CENTENNIAL': 'CO',
  'BOULDER': 'CO', 'GREELEY': 'CO', 'LONGMONT': 'CO', 'LOVELAND': 'CO', 'GRAND JUNCTION': 'CO'
};

async function geocodeWithCityState(city: string, state: string): Promise<{ lat: number, lon: number } | null> {
  try {
    // Use Nominatim with city,state query
    const query = `${city}, ${state}, USA`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=us`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'SpeechTherapyMap/1.0' }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      
      // Validate US coordinates
      if (lat >= 18.0 && lat <= 72.0 && lon >= -180.0 && lon <= -65.0) {
        return { lat, lon };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

async function fixCoordinatesWithCityMapping() {
  console.log('🎯 Starting city-to-state mapping coordinate fix...');
  
  try {
    // Get all clinics without coordinates
    const clinics = await sql<Clinic[]>`
      SELECT id, name, city, notes 
      FROM clinics 
      WHERE latitude IS NULL OR longitude IS NULL
    `;
    
    console.log(`📍 Processing ${clinics.length} clinics without coordinates`);
    
    let successCount = 0;
    let failureCount = 0;
    const processedStates: { [state: string]: number } = {};
    
    for (let i = 0; i < clinics.length; i++) {
      const clinic = clinics[i];
      const cityKey = clinic.city.toUpperCase();
      
      console.log(`[${i + 1}/${clinics.length}] ${clinic.name} in ${clinic.city}`);
      
      // Look up state for this city
      const state = COMPREHENSIVE_CITY_STATE_MAP[cityKey];
      
      if (!state) {
        console.log(`  ❌ Unknown state for city: ${clinic.city}`);
        failureCount++;
        continue;
      }
      
      console.log(`  State identified: ${state}`);
      
      // Geocode using city + state
      const coordinates = await geocodeWithCityState(clinic.city, state);
      
      if (coordinates) {
        await sql`
          UPDATE clinics 
          SET latitude = ${coordinates.lat}, longitude = ${coordinates.lon}
          WHERE id = ${clinic.id}
        `;
        
        console.log(`  ✅ Updated: ${coordinates.lat}, ${coordinates.lon}`);
        successCount++;
        processedStates[state] = (processedStates[state] || 0) + 1;
      } else {
        console.log(`  ❌ Failed to geocode ${clinic.city}, ${state}`);
        failureCount++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n📊 City-state mapping complete:`);
    console.log(`  ✅ Successfully fixed: ${successCount} clinics`);
    console.log(`  ❌ Failed: ${failureCount} clinics`);
    
    console.log('\n📍 Fixed clinics by state:');
    Object.entries(processedStates)
      .sort(([,a], [,b]) => b - a)
      .forEach(([state, count]) => {
        console.log(`  ${state}: ${count} clinics`);
      });
    
    // Final cleanup - remove any remaining null coordinates
    const removedResult = await sql`DELETE FROM clinics WHERE latitude IS NULL OR longitude IS NULL`;
    console.log(`\n🗑️ Removed ${removedResult.length} clinics without coordinates`);
    
    // Get final count
    const finalCount = await sql`SELECT COUNT(*) as count FROM clinics`;
    console.log(`\n✅ Final dataset: ${finalCount[0].count} clinics with accurate coordinates`);
    
    // Restore constraints
    await sql`ALTER TABLE clinics ALTER COLUMN latitude SET NOT NULL`;
    await sql`ALTER TABLE clinics ALTER COLUMN longitude SET NOT NULL`;
    
  } catch (error) {
    console.error('Error in city-state coordinate fix:', error);
  }
}

fixCoordinatesWithCityMapping().catch(console.error);