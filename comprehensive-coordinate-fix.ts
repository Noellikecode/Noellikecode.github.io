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
  state?: string;
  confidence: number;
}

// State boundaries for validation
const STATE_BOUNDARIES = {
  'CALIFORNIA': { minLat: 32.5, maxLat: 42.0, minLon: -125.0, maxLon: -114.0 },
  'TEXAS': { minLat: 25.8, maxLat: 36.5, minLon: -106.6, maxLon: -93.5 },
  'FLORIDA': { minLat: 24.4, maxLat: 31.0, minLon: -87.6, maxLon: -80.0 },
  'NEW YORK': { minLat: 40.4, maxLat: 45.0, minLon: -79.8, maxLon: -71.8 },
  'MICHIGAN': { minLat: 41.7, maxLat: 48.3, minLon: -90.4, maxLon: -82.1 },
  'WASHINGTON': { minLat: 45.5, maxLat: 49.0, minLon: -125.0, maxLon: -116.9 },
  'ARIZONA': { minLat: 31.3, maxLat: 37.0, minLon: -115.0, maxLon: -109.0 },
  'COLORADO': { minLat: 37.0, maxLat: 41.0, minLon: -109.1, maxLon: -102.0 },
  'VIRGINIA': { minLat: 36.5, maxLat: 39.5, minLon: -83.7, maxLon: -75.2 },
  'NORTH CAROLINA': { minLat: 33.8, maxLat: 36.6, minLon: -84.3, maxLon: -75.4 }
};

// City to state mapping for disambiguation
const CITY_STATE_MAP = {
  'EAST LANSING': 'MICHIGAN',
  'LANSING': 'MICHIGAN',
  'ANN ARBOR': 'MICHIGAN',
  'GRAND RAPIDS': 'MICHIGAN',
  'KALAMAZOO': 'MICHIGAN',
  'BURBANK': 'CALIFORNIA',
  'TORRANCE': 'CALIFORNIA',
  'FREMONT': 'CALIFORNIA',
  'BERKELEY': 'CALIFORNIA',
  'PASADENA': 'CALIFORNIA',
  'PLANO': 'TEXAS',
  'GARLAND': 'TEXAS',
  'IRVING': 'TEXAS',
  'RICHARDSON': 'TEXAS',
  'CARROLLTON': 'TEXAS',
  'CORAL SPRINGS': 'FLORIDA',
  'PEMBROKE PINES': 'FLORIDA',
  'DAVIE': 'FLORIDA',
  'MIRAMAR': 'FLORIDA',
  'PLANTATION': 'FLORIDA',
  'BELLEVUE': 'WASHINGTON',
  'TACOMA': 'WASHINGTON',
  'SPOKANE': 'WASHINGTON',
  'VANCOUVER': 'WASHINGTON',
  'CHANDLER': 'ARIZONA',
  'TEMPE': 'ARIZONA',
  'MESA': 'ARIZONA',
  'SCOTTSDALE': 'ARIZONA',
  'GLENDALE': 'ARIZONA',
  'ARVADA': 'COLORADO',
  'THORNTON': 'COLORADO',
  'WESTMINSTER': 'COLORADO',
  'ASHBURN': 'VIRGINIA',
  'ALEXANDRIA': 'VIRGINIA',
  'FAIRFAX': 'VIRGINIA',
  'RESTON': 'VIRGINIA'
};

async function geocodeWithMultipleServices(address: string, city: string, expectedState?: string): Promise<GeocodeResult | null> {
  const results: GeocodeResult[] = [];
  
  // Clean the address
  const cleanAddress = address.replace(/NPI: \d+\.\s*Address:\s*/, '').trim();
  const expectedStateCode = expectedState ? getStateAbbreviation(expectedState) : '';
  
  console.log(`  Geocoding: ${cleanAddress}, ${city}, ${expectedStateCode}`);
  
  // Service 1: Nominatim with state specification
  try {
    const fullAddress = expectedStateCode 
      ? `${cleanAddress}, ${city}, ${expectedStateCode}, USA`
      : `${cleanAddress}, ${city}, USA`;
    
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=3&countrycodes=us&addressdetails=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: { 'User-Agent': 'GlobalSpeechAccessMap/2.0 (precise-coordinate-fixing)' }
    });
    
    if (response.ok) {
      const data = await response.json();
      for (const result of data) {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        const state = result.address?.state || '';
        
        if (isValidUSCoordinate(lat, lon)) {
          const confidence = calculateConfidence(result, city, expectedState);
          results.push({
            lat,
            lon,
            display_name: result.display_name,
            state,
            confidence
          });
        }
      }
    }
  } catch (error) {
    console.warn(`  Nominatim error: ${error}`);
  }
  
  // Rate limiting between services
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Service 2: Census.gov geocoding (very accurate for US addresses)
  try {
    const censusAddress = `${cleanAddress}, ${city}, ${expectedStateCode || ''}`.replace(/\s+/g, ' ');
    const censusUrl = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(censusAddress)}&benchmark=2020&format=json`;
    
    const response = await fetch(censusUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.result?.addressMatches?.length > 0) {
        const match = data.result.addressMatches[0];
        const lat = parseFloat(match.coordinates.y);
        const lon = parseFloat(match.coordinates.x);
        
        if (isValidUSCoordinate(lat, lon)) {
          results.push({
            lat,
            lon,
            display_name: match.matchedAddress,
            confidence: 95 // Census data is highly reliable
          });
        }
      }
    }
  } catch (error) {
    console.warn(`  Census geocoding error: ${error}`);
  }
  
  // Rate limiting
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Service 3: MapQuest (backup service)
  try {
    const mapquestAddress = `${cleanAddress}, ${city}, ${expectedStateCode || 'USA'}`;
    const mapquestUrl = `http://www.mapquestapi.com/geocoding/v1/address?key=consumer&location=${encodeURIComponent(mapquestAddress)}`;
    
    const response = await fetch(mapquestUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.results?.[0]?.locations?.length > 0) {
        const location = data.results[0].locations[0];
        const lat = parseFloat(location.latLng.lat);
        const lon = parseFloat(location.latLng.lng);
        
        if (isValidUSCoordinate(lat, lon) && location.geocodeQuality !== 'POINT') {
          results.push({
            lat,
            lon,
            display_name: location.displayLatLng,
            confidence: location.geocodeQuality === 'ADDRESS' ? 90 : 70
          });
        }
      }
    }
  } catch (error) {
    console.warn(`  MapQuest error: ${error}`);
  }
  
  // Select the best result
  if (results.length === 0) return null;
  
  // If we have an expected state, prioritize results in that state
  if (expectedState) {
    const stateResults = results.filter(r => {
      const bounds = STATE_BOUNDARIES[expectedState];
      return bounds && 
             r.lat >= bounds.minLat && r.lat <= bounds.maxLat && 
             r.lon >= bounds.minLon && r.lon <= bounds.maxLon;
    });
    
    if (stateResults.length > 0) {
      return stateResults.sort((a, b) => b.confidence - a.confidence)[0];
    }
  }
  
  // Return highest confidence result
  return results.sort((a, b) => b.confidence - a.confidence)[0];
}

function calculateConfidence(result: any, expectedCity: string, expectedState?: string): number {
  let confidence = 50;
  
  const resultCity = result.address?.city || result.address?.town || result.address?.village || '';
  const resultState = result.address?.state || '';
  
  // City match bonus
  if (resultCity.toLowerCase().includes(expectedCity.toLowerCase())) {
    confidence += 30;
  }
  
  // State match bonus
  if (expectedState && resultState.toLowerCase().includes(expectedState.toLowerCase())) {
    confidence += 20;
  }
  
  // Address type bonus
  if (result.address?.house_number) confidence += 10;
  if (result.address?.road) confidence += 10;
  
  return Math.min(confidence, 100);
}

function isValidUSCoordinate(lat: number, lon: number): boolean {
  return (
    (lat >= 24.0 && lat <= 50.0 && lon >= -130.0 && lon <= -65.0) || // Continental US
    (lat >= 60.0 && lat <= 72.0 && lon >= -180.0 && lon <= -140.0) || // Alaska
    (lat >= 18.0 && lat <= 23.0 && lon >= -162.0 && lon <= -154.0)    // Hawaii
  );
}

function getStateAbbreviation(stateName: string): string {
  const stateMap: { [key: string]: string } = {
    'CALIFORNIA': 'CA', 'TEXAS': 'TX', 'FLORIDA': 'FL', 'NEW YORK': 'NY',
    'MICHIGAN': 'MI', 'WASHINGTON': 'WA', 'ARIZONA': 'AZ', 'COLORADO': 'CO',
    'VIRGINIA': 'VA', 'NORTH CAROLINA': 'NC', 'ILLINOIS': 'IL', 'OHIO': 'OH'
  };
  return stateMap[stateName] || '';
}

async function fixAllCoordinates() {
  console.log('🎯 Starting comprehensive coordinate accuracy fix using multiple geocoding services...');
  
  try {
    // Get all clinics that need coordinate fixes
    const clinics = await sql<Clinic[]>`
      SELECT id, name, city, notes, latitude, longitude
      FROM clinics 
      WHERE notes IS NOT NULL AND notes LIKE '%Address:%'
      ORDER BY city, name
    `;
    
    console.log(`📍 Processing ${clinics.length} clinics for coordinate accuracy`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < clinics.length; i++) {
      const clinic = clinics[i];
      console.log(`[${i + 1}/${clinics.length}] Processing: ${clinic.name} in ${clinic.city}`);
      
      // Extract address from notes
      const addressMatch = clinic.notes.match(/Address:\s*(.+?)(?:,\s*$|$)/);
      if (!addressMatch) {
        console.warn(`  No address found for ${clinic.name}`);
        skippedCount++;
        continue;
      }
      
      const address = addressMatch[1].trim();
      const expectedState = CITY_STATE_MAP[clinic.city.toUpperCase()];
      
      console.log(`  Current: ${clinic.latitude}, ${clinic.longitude}`);
      console.log(`  Expected state: ${expectedState || 'Unknown'}`);
      
      // Get accurate coordinates
      const result = await geocodeWithMultipleServices(address, clinic.city, expectedState);
      
      if (result && result.confidence > 70) {
        // Check if coordinates need updating (significant difference)
        const latDiff = Math.abs(result.lat - clinic.latitude);
        const lonDiff = Math.abs(result.lon - clinic.longitude);
        
        if (latDiff > 0.1 || lonDiff > 0.1) { // Update if more than ~11km difference
          await sql`
            UPDATE clinics 
            SET latitude = ${result.lat}, longitude = ${result.lon}
            WHERE id = ${clinic.id}
          `;
          
          console.log(`  ✅ Updated to: ${result.lat}, ${result.lon} (confidence: ${result.confidence}%)`);
          fixedCount++;
        } else {
          console.log(`  ➡️ Coordinates already accurate`);
          skippedCount++;
        }
      } else {
        console.warn(`  ❌ Could not get reliable coordinates (confidence: ${result?.confidence || 0}%)`);
        skippedCount++;
      }
      
      // Rate limiting - be respectful to geocoding services
      if (i < clinics.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
    }
    
    console.log(`\n📊 Coordinate accuracy fix complete:`);
    console.log(`  ✅ Fixed: ${fixedCount} clinics`);
    console.log(`  ➡️ Already accurate: ${skippedCount} clinics`);
    
    // Final validation
    const validation = await sql`
      SELECT 
        CASE 
          WHEN latitude BETWEEN 32.5 AND 42.0 AND longitude BETWEEN -125.0 AND -114.0 THEN 'California'
          WHEN latitude BETWEEN 41.7 AND 48.3 AND longitude BETWEEN -90.4 AND -82.1 THEN 'Michigan'
          WHEN latitude BETWEEN 29.0 AND 37.0 AND longitude BETWEEN -106.6 AND -93.5 THEN 'Texas'
          WHEN latitude BETWEEN 25.0 AND 31.0 AND longitude BETWEEN -87.6 AND -80.0 THEN 'Florida'
          WHEN latitude BETWEEN 47.0 AND 49.0 AND longitude BETWEEN -125.0 AND -116.9 THEN 'Washington'
          ELSE 'Other State'
        END as region,
        COUNT(*) as count
      FROM clinics 
      GROUP BY region
      ORDER BY count DESC
    `;
    
    console.log('\n📍 Final geographic distribution:');
    validation.forEach(row => {
      console.log(`  ${row.region}: ${row.count} clinics`);
    });
    
  } catch (error) {
    console.error('Error in comprehensive coordinate fix:', error);
  }
}

fixAllCoordinates().catch(console.error);