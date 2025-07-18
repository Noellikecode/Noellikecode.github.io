import { GeocodingService } from './server/geocoding-service.js';

async function main() {
  console.log('🌍 Starting accurate geocoding fix for all speech therapy centers...');
  
  const geocoder = GeocodingService.getInstance();
  
  // First, fix the most problematic cities we identified
  const problematicCities = [
    'MILBANK',
    'COLDWATER', 
    'WATERBURY',
    'WATERTOWN',
    'CLEARWATER',
    'WATERLOO',
    'STILLWATER'
  ];
  
  console.log('🔧 First fixing known problematic cities...');
  await geocoder.fixSpecificCities(problematicCities);
  
  console.log('\n🌐 Now running comprehensive geocoding for all cities...');
  await geocoder.fixAllCoordinates();
  
  console.log('\n✨ Geocoding fix complete! All markers should now be accurately placed.');
}

main().catch(console.error);