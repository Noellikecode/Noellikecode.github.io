import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

interface Clinic {
  id: string;
  name: string;
  city: string;
  notes: string;
}

interface ParsedAddress {
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
}

interface AccurateCoordinate {
  lat: number;
  lon: number;
  confidence: number;
}

// State abbreviation mapping
const STATE_NAMES_TO_ABBREV: { [key: string]: string } = {
  'ALABAMA': 'AL', 'ALASKA': 'AK', 'ARIZONA': 'AZ', 'ARKANSAS': 'AR', 'CALIFORNIA': 'CA',
  'COLORADO': 'CO', 'CONNECTICUT': 'CT', 'DELAWARE': 'DE', 'FLORIDA': 'FL', 'GEORGIA': 'GA',
  'HAWAII': 'HI', 'IDAHO': 'ID', 'ILLINOIS': 'IL', 'INDIANA': 'IN', 'IOWA': 'IA',
  'KANSAS': 'KS', 'KENTUCKY': 'KY', 'LOUISIANA': 'LA', 'MAINE': 'ME', 'MARYLAND': 'MD',
  'MASSACHUSETTS': 'MA', 'MICHIGAN': 'MI', 'MINNESOTA': 'MN', 'MISSISSIPPI': 'MS', 'MISSOURI': 'MO',
  'MONTANA': 'MT', 'NEBRASKA': 'NE', 'NEVADA': 'NV', 'NEW HAMPSHIRE': 'NH', 'NEW JERSEY': 'NJ',
  'NEW MEXICO': 'NM', 'NEW YORK': 'NY', 'NORTH CAROLINA': 'NC', 'NORTH DAKOTA': 'ND', 'OHIO': 'OH',
  'OKLAHOMA': 'OK', 'OREGON': 'OR', 'PENNSYLVANIA': 'PA', 'RHODE ISLAND': 'RI', 'SOUTH CAROLINA': 'SC',
  'SOUTH DAKOTA': 'SD', 'TENNESSEE': 'TN', 'TEXAS': 'TX', 'UTAH': 'UT', 'VERMONT': 'VT',
  'VIRGINIA': 'VA', 'WASHINGTON': 'WA', 'WEST VIRGINIA': 'WV', 'WISCONSIN': 'WI', 'WYOMING': 'WY'
};

// City to state mapping for disambiguation
const KNOWN_CITY_STATES: { [key: string]: string } = {
  'EAST LANSING': 'MI', 'ANN ARBOR': 'MI', 'GRAND RAPIDS': 'MI', 'LANSING': 'MI', 'KALAMAZOO': 'MI',
  'DETROIT': 'MI', 'FLINT': 'MI', 'STERLING HEIGHTS': 'MI', 'WARREN': 'MI', 'TROY': 'MI',
  'BURBANK': 'CA', 'TORRANCE': 'CA', 'FREMONT': 'CA', 'BERKELEY': 'CA', 'PASADENA': 'CA',
  'GLENDALE': 'CA', 'SANTA MONICA': 'CA', 'BEVERLY HILLS': 'CA', 'WEST HOLLYWOOD': 'CA',
  'PLANO': 'TX', 'GARLAND': 'TX', 'IRVING': 'TX', 'RICHARDSON': 'TX', 'CARROLLTON': 'TX',
  'MCKINNEY': 'TX', 'FRISCO': 'TX', 'ALLEN': 'TX', 'MESQUITE': 'TX',
  'CORAL SPRINGS': 'FL', 'PEMBROKE PINES': 'FL', 'DAVIE': 'FL', 'MIRAMAR': 'FL', 'PLANTATION': 'FL',
  'HOLLYWOOD': 'FL', 'FORT LAUDERDALE': 'FL', 'BOCA RATON': 'FL', 'DELRAY BEACH': 'FL',
  'BELLEVUE': 'WA', 'TACOMA': 'WA', 'SPOKANE': 'WA', 'VANCOUVER': 'WA', 'KENT': 'WA',
  'RENTON': 'WA', 'FEDERAL WAY': 'WA', 'YAKIMA': 'WA', 'BELLINGHAM': 'WA',
  'CHANDLER': 'AZ', 'TEMPE': 'AZ', 'MESA': 'AZ', 'SCOTTSDALE': 'AZ', 'PEORIA': 'AZ',
  'SURPRISE': 'AZ', 'GOODYEAR': 'AZ', 'AVONDALE': 'AZ', 'BUCKEYE': 'AZ'
};

function parseNPIAddress(notes: string, cityName: string): ParsedAddress | null {
  try {
    // Extract address from NPI notes
    const addressMatch = notes.match(/Address:\s*(.+?)(?:,\s*$|$)/);
    if (!addressMatch) return null;
    
    const rawAddress = addressMatch[1].trim();
    
    // Determine state from known city mappings or try to extract from address
    let state = KNOWN_CITY_STATES[cityName.toUpperCase()];
    
    if (!state) {
      // Try to extract state from address pattern
      const stateMatch = rawAddress.match(/,\s*([A-Z]{2})\s*\d{5}/);
      if (stateMatch) {
        state = stateMatch[1];
      }
    }
    
    // Extract zip code if present
    const zipMatch = rawAddress.match(/\b(\d{5}(?:-\d{4})?)\b/);
    const zipCode = zipMatch ? zipMatch[1] : '';
    
    // Clean the street address
    let streetAddress = rawAddress.replace(/,\s*[A-Z]{2}\s*\d{5}.*$/, '').trim();
    
    // Parse street number and name
    const streetMatch = streetAddress.match(/^(\d+)\s+(.+)/);
    const streetNumber = streetMatch ? streetMatch[1] : '';
    const streetName = streetMatch ? streetMatch[2] : streetAddress;
    
    return {
      streetNumber,
      streetName,
      city: cityName,
      state: state || '',
      zipCode,
      fullAddress: `${streetAddress}, ${cityName}, ${state || ''} ${zipCode}`.trim()
    };
  } catch (error) {
    console.error('Error parsing address:', error);
    return null;
  }
}

async function geocodeWithUSCensus(address: ParsedAddress): Promise<AccurateCoordinate | null> {
  try {
    // Use US Census Geocoding API - most accurate for US addresses
    const addressString = `${address.streetNumber} ${address.streetName}, ${address.city}, ${address.state}`;
    const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(addressString)}&benchmark=2020&format=json`;
    
    console.log(`  Census geocoding: ${addressString}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SpeechTherapyMap/1.0 (accurate-geocoding)',
      }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.result?.addressMatches?.length > 0) {
      const match = data.result.addressMatches[0];
      const lat = parseFloat(match.coordinates.y);
      const lon = parseFloat(match.coordinates.x);
      
      // Validate coordinates are in reasonable US bounds
      if (lat >= 18.0 && lat <= 72.0 && lon >= -180.0 && lon <= -65.0) {
        console.log(`  ✅ Census result: ${lat}, ${lon}`);
        return {
          lat,
          lon,
          confidence: 95 // Census data is highly reliable
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Census geocoding error:', error);
    return null;
  }
}

async function geocodeWithNominatim(address: ParsedAddress): Promise<AccurateCoordinate | null> {
  try {
    // Fallback to Nominatim with structured query
    const params = new URLSearchParams({
      format: 'json',
      housenumber: address.streetNumber,
      street: address.streetName,
      city: address.city,
      state: address.state,
      country: 'USA',
      limit: '1',
      addressdetails: '1'
    });
    
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    console.log(`  Nominatim geocoding: ${address.city}, ${address.state}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SpeechTherapyMap/1.0 (fallback-geocoding)',
      }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);
      
      // Validate coordinates
      if (lat >= 18.0 && lat <= 72.0 && lon >= -180.0 && lon <= -65.0) {
        console.log(`  ✅ Nominatim result: ${lat}, ${lon}`);
        return {
          lat,
          lon,
          confidence: 80
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Nominatim geocoding error:', error);
    return null;
  }
}

async function intelligentGeocoding() {
  console.log('🎯 Starting intelligent address-based coordinate system...');
  console.log('Using structured address parsing + US Census Bureau geocoding');
  
  try {
    // Get all clinics
    const clinics = await sql<Clinic[]>`
      SELECT id, name, city, notes 
      FROM clinics 
      WHERE notes IS NOT NULL AND notes LIKE '%Address:%'
      ORDER BY city, name
    `;
    
    console.log(`📍 Processing ${clinics.length} clinics with intelligent geocoding`);
    
    let successCount = 0;
    let failureCount = 0;
    const stateStats: { [state: string]: number } = {};
    
    for (let i = 0; i < clinics.length; i++) {
      const clinic = clinics[i];
      console.log(`\n[${i + 1}/${clinics.length}] ${clinic.name} in ${clinic.city}`);
      
      // Parse the address intelligently
      const parsedAddress = parseNPIAddress(clinic.notes, clinic.city);
      if (!parsedAddress || !parsedAddress.state) {
        console.warn('  ❌ Could not parse address or determine state');
        failureCount++;
        continue;
      }
      
      console.log(`  Parsed: ${parsedAddress.fullAddress}`);
      console.log(`  State: ${parsedAddress.state}`);
      
      // Try US Census geocoding first (most accurate)
      let coordinate = await geocodeWithUSCensus(parsedAddress);
      
      // Rate limiting for Census API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Fallback to Nominatim if Census fails
      if (!coordinate) {
        coordinate = await geocodeWithNominatim(parsedAddress);
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
      
      if (coordinate && coordinate.confidence >= 75) {
        // Update database
        await sql`
          UPDATE clinics 
          SET latitude = ${coordinate.lat}, longitude = ${coordinate.lon}
          WHERE id = ${clinic.id}
        `;
        
        console.log(`  ✅ Updated: ${coordinate.lat}, ${coordinate.lon} (confidence: ${coordinate.confidence}%)`);
        successCount++;
        
        // Track state statistics
        const state = parsedAddress.state;
        stateStats[state] = (stateStats[state] || 0) + 1;
      } else {
        console.warn(`  ❌ Failed to get reliable coordinates`);
        failureCount++;
      }
    }
    
    console.log(`\n📊 Intelligent geocoding complete:`);
    console.log(`  ✅ Successfully geocoded: ${successCount} clinics`);
    console.log(`  ❌ Failed: ${failureCount} clinics`);
    
    console.log('\n📍 Clinics by state:');
    Object.entries(stateStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([state, count]) => {
        console.log(`  ${state}: ${count} clinics`);
      });
    
    // Remove any clinics that couldn't be geocoded
    const removedResult = await sql`DELETE FROM clinics WHERE latitude IS NULL OR longitude IS NULL`;
    console.log(`\n🗑️ Removed ${removedResult.length} clinics without valid coordinates`);
    
    // Restore NOT NULL constraints
    await sql`ALTER TABLE clinics ALTER COLUMN latitude SET NOT NULL`;
    await sql`ALTER TABLE clinics ALTER COLUMN longitude SET NOT NULL`;
    
    console.log('\n✅ Coordinate system rebuilt with intelligent address parsing');
    
  } catch (error) {
    console.error('Error in intelligent geocoding:', error);
  }
}

intelligentGeocoding().catch(console.error);