import { db } from './db.js';
import { clinics } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

interface GeocodeResult {
  lat: string;
  lon: string;
  display_name: string;
}

export class GeocodingService {
  private static instance: GeocodingService;
  private baseURL = 'https://nominatim.openstreetmap.org/search';
  private requestDelay = 1100; // Respect 1 req/sec limit + buffer

  public static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService();
    }
    return GeocodingService.instance;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async geocodeLocation(city: string, state?: string): Promise<GeocodeResult | null> {
    try {
      // Construct search query with state bias for US locations
      const query = state ? `${city}, ${state}, United States` : `${city}, United States`;
      
      const response = await fetch(`${this.baseURL}?` + new URLSearchParams({
        q: query,
        format: 'json',
        limit: '1',
        countrycodes: 'us', // Restrict to US only
        addressdetails: '1'
      }), {
        headers: {
          'User-Agent': 'Speech-Access-Map/1.0 (contact@example.com)' // Required by Nominatim
        }
      });

      if (!response.ok) {
        console.warn(`Geocoding failed for ${query}: ${response.status}`);
        return null;
      }

      const results = await response.json();
      
      if (results && results.length > 0) {
        const result = results[0];
        console.log(`✓ Geocoded ${query}: ${result.lat}, ${result.lon}`);
        return result;
      }

      console.warn(`No results found for: ${query}`);
      return null;
    } catch (error) {
      console.error(`Geocoding error for ${city}:`, error);
      return null;
    }
  }

  public async fixAllCoordinates(): Promise<void> {
    console.log('🚀 Starting comprehensive geocoding fix...');
    
    // Get all clinics with problematic coordinates
    const allClinics = await db.select().from(clinics);
    
    // Group by city to minimize API calls
    const cityGroups = new Map<string, typeof allClinics>();
    
    allClinics.forEach(clinic => {
      const city = clinic.city?.toUpperCase().trim();
      if (!city) return;
      
      if (!cityGroups.has(city)) {
        cityGroups.set(city, []);
      }
      cityGroups.get(city)!.push(clinic);
    });

    console.log(`📍 Found ${cityGroups.size} unique cities to geocode`);
    
    let processedCities = 0;
    let successfulGeocode = 0;
    let failedGeocode = 0;

    for (const [city, cityClinicsList] of cityGroups) {
      processedCities++;
      console.log(`[${processedCities}/${cityGroups.size}] Processing ${city} (${cityClinicsList.length} clinics)`);
      
      // Try geocoding with common state abbreviations for ambiguous cities
      let result = await this.geocodeLocation(city);
      
      if (!result) {
        // Try with common state suffixes for ambiguous city names
        const commonStates = ['CA', 'TX', 'FL', 'NY', 'OH', 'PA', 'IL', 'MI', 'GA', 'NC'];
        for (const state of commonStates) {
          result = await this.geocodeLocation(city, state);
          if (result) break;
          await this.sleep(this.requestDelay);
        }
      }

      if (result) {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        
        // Validate coordinates are within reasonable US bounds
        const isValidUS = (
          (lat >= 24.0 && lat <= 50.0 && lon >= -130.0 && lon <= -65.0) || // Continental US
          (lat >= 60.0 && lat <= 72.0 && lon >= -180.0 && lon <= -140.0) || // Alaska
          (lat >= 18.0 && lat <= 23.0 && lon >= -162.0 && lon <= -154.0)    // Hawaii
        );

        if (isValidUS) {
          // Update all clinics in this city
          for (const clinic of cityClinicsList) {
            await db.update(clinics)
              .set({ 
                latitude: lat, 
                longitude: lon 
              })
              .where(eq(clinics.id, clinic.id));
          }
          
          successfulGeocode++;
          console.log(`✅ Updated ${cityClinicsList.length} clinics in ${city} to ${lat}, ${lon}`);
        } else {
          failedGeocode++;
          console.warn(`❌ Invalid coordinates for ${city}: ${lat}, ${lon}`);
        }
      } else {
        failedGeocode++;
        console.warn(`❌ Failed to geocode ${city}`);
      }

      // Respect rate limits
      await this.sleep(this.requestDelay);
    }

    console.log(`🎯 Geocoding complete!`);
    console.log(`✅ Successfully geocoded: ${successfulGeocode} cities`);
    console.log(`❌ Failed to geocode: ${failedGeocode} cities`);
    console.log(`📊 Total processed: ${processedCities} cities`);
  }

  public async fixSpecificCities(problematicCities: string[]): Promise<void> {
    console.log(`🎯 Fixing specific problematic cities: ${problematicCities.join(', ')}`);
    
    for (const city of problematicCities) {
      const cityClinicsList = await db.select().from(clinics).where(eq(clinics.city, city.toUpperCase()));
      
      if (cityClinicsList.length === 0) {
        console.log(`No clinics found for ${city}`);
        continue;
      }

      console.log(`Processing ${city} (${cityClinicsList.length} clinics)`);
      
      const result = await this.geocodeLocation(city);
      
      if (result) {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        
        // Update all clinics in this city
        for (const clinic of cityClinicsList) {
          await db.update(clinics)
            .set({ 
              latitude: lat, 
              longitude: lon 
            })
            .where(eq(clinics.id, clinic.id));
        }
        
        console.log(`✅ Fixed ${city}: ${cityClinicsList.length} clinics updated to ${lat}, ${lon}`);
      } else {
        console.warn(`❌ Failed to geocode ${city}`);
      }

      await this.sleep(this.requestDelay);
    }
  }
}