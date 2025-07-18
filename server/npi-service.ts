import type { InsertClinic } from "@shared/schema";
import { getCoordinates } from "@shared/utils";

interface NPIProvider {
  DC: string; // Created date
  NPI: string; // NPI number
  Entity_Type_Code: string; // 1 = Individual, 2 = Organization
  Replacement_NPI?: string;
  Employer_Identification_Number?: string;
  Provider_Organization_Name_Legal_Business_Name?: string;
  Provider_Last_Name_Legal_Name?: string;
  Provider_First_Name?: string;
  Provider_Middle_Name?: string;
  Provider_Name_Prefix_Text?: string;
  Provider_Name_Suffix_Text?: string;
  Provider_Credential_Text?: string;
  Provider_Other_Organization_Name?: string;
  Provider_Other_Organization_Name_Type_Code?: string;
  Provider_Other_Last_Name?: string;
  Provider_Other_First_Name?: string;
  Provider_Other_Middle_Name?: string;
  Provider_Other_Name_Prefix_Text?: string;
  Provider_Other_Name_Suffix_Text?: string;
  Provider_Other_Credential_Text?: string;
  Provider_Other_Last_Name_Type_Code?: string;
  Provider_First_Line_Business_Mailing_Address?: string;
  Provider_Second_Line_Business_Mailing_Address?: string;
  Provider_Business_Mailing_Address_City_Name?: string;
  Provider_Business_Mailing_Address_State_Name?: string;
  Provider_Business_Mailing_Address_Postal_Code?: string;
  Provider_Business_Mailing_Address_Country_Code_If_outside_US?: string;
  Provider_Business_Mailing_Address_Telephone_Number?: string;
  Provider_Business_Mailing_Address_Fax_Number?: string;
  Provider_First_Line_Business_Practice_Location_Address?: string;
  Provider_Second_Line_Business_Practice_Location_Address?: string;
  Provider_Business_Practice_Location_Address_City_Name?: string;
  Provider_Business_Practice_Location_Address_State_Name?: string;
  Provider_Business_Practice_Location_Address_Postal_Code?: string;
  Provider_Business_Practice_Location_Address_Country_Code_If_outside_US?: string;
  Provider_Business_Practice_Location_Address_Telephone_Number?: string;
  Provider_Business_Practice_Location_Address_Fax_Number?: string;
  Is_Sole_Proprietor?: string;
  Is_Organization_Subpart?: string;
  Parent_Organization_LBN?: string;
  Parent_Organization_TIN?: string;
  Authorized_Official_Last_Name?: string;
  Authorized_Official_First_Name?: string;
  Authorized_Official_Middle_Name?: string;
  Authorized_Official_Title_or_Position?: string;
  Authorized_Official_Telephone_Number?: string;
  Healthcare_Provider_Taxonomy_Code_1?: string;
  Provider_License_Number_1?: string;
  Provider_License_Number_State_Code_1?: string;
  Healthcare_Provider_Primary_Taxonomy_Switch_1?: string;
  Healthcare_Provider_Taxonomy_Code_2?: string;
}

interface NPIResponse {
  result: NPIProvider[];
  resultCount: number;
}

export class NPIService {
  private readonly baseUrl = 'https://clinicaltables.nlm.nih.gov/api/npi_org/v3/search';
  private readonly speechTherapyTaxonomyCode = '235Z00000X';

  async fetchSpeechTherapyCenters(state?: string, limit = 100): Promise<InsertClinic[]> {
    try {
      // Search for providers with "speech language" in their name or practice
      const searchTerms = state ? `speech language ${state}` : 'speech language';
      const params = new URLSearchParams({
        terms: searchTerms,
        maxList: limit.toString(),
        ef: 'NPI,name.full,addr_practice.city,addr_practice.state,addr_practice.line1,addr_practice.phone'
      });

      // If state is specified, add it as a filter
      if (state) {
        params.append('q', `addr_practice.state:${state}`);
      }

      const fullUrl = `${this.baseUrl}?${params}`;
      console.log('Making NPI API request to:', fullUrl);
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        console.error(`NPI API request failed: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('Response body:', errorText);
        throw new Error(`NPI API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('NPI API response structure:', JSON.stringify(data, null, 2));
      
      // Parse the NPI API response format: [count, codes, extraFields, displayStrings]
      if (!Array.isArray(data) || data.length < 4) {
        console.error('Unexpected NPI API response format:', data);
        return [];
      }

      const [count, codes, extraFields, displayStrings] = data;
      
      if (!codes || codes.length === 0) {
        console.log('No providers found for the given criteria');
        return [];
      }

      const clinics: InsertClinic[] = [];

      for (let i = 0; i < codes.length; i++) {
        const npi = codes[i];
        const name = extraFields?.['name.full']?.[i];
        const city = extraFields?.['addr_practice.city']?.[i];
        const stateCode = extraFields?.['addr_practice.state']?.[i];
        const address = extraFields?.['addr_practice.line1']?.[i];
        const phone = extraFields?.['addr_practice.phone']?.[i];

        // Skip if missing essential data
        if (!name || !city || !stateCode) {
          continue;
        }

        // Get coordinates for the location
        const country = this.getCountryFromState(stateCode);
        const [latitude, longitude] = await getCoordinates(city, country);

        const clinic: InsertClinic = {
          name: name.trim(),
          country: this.getCountryFromState(stateCode),
          city: city.trim(),
          costLevel: 'market-rate' as const, // Default assumption for private practices
          services: ['speech-therapy', 'language-therapy'], // Default services
          languages: 'English', // Default language
          teletherapy: false, // Default value
          phone: phone || undefined,
          website: undefined, // NPI doesn't provide website info
          email: undefined, // NPI doesn't provide email info
          notes: address ? `NPI: ${npi}. Address: ${address}` : `NPI: ${npi}`,
          submitterEmail: 'npi-import@system.com',
        };

        clinics.push(clinic);
      }

      return clinics;
    } catch (error) {
      console.error('Error fetching from NPI API:', error);
      throw error;
    }
  }

  private getCountryFromState(state: string): string {
    // US states and territories
    const usStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
      'DC', 'AS', 'GU', 'MP', 'PR', 'VI'
    ];

    // Canadian provinces and territories
    const canadianProvinces = [
      'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK',
      'NT', 'NU', 'YT'
    ];

    if (usStates.includes(state.toUpperCase())) {
      return 'United States';
    } else if (canadianProvinces.includes(state.toUpperCase())) {
      return 'Canada';
    } else {
      return 'United States'; // Default assumption
    }
  }

  private async getCoordinates(city: string, state: string): Promise<[number, number]> {
    // Major city coordinates database
    const cityCoords: Record<string, [number, number]> = {
      // US Major Cities
      'new york,ny': [40.7128, -74.0060],
      'los angeles,ca': [34.0522, -118.2437],
      'chicago,il': [41.8781, -87.6298],
      'houston,tx': [29.7604, -95.3698],
      'phoenix,az': [33.4484, -112.0740],
      'philadelphia,pa': [39.9526, -75.1652],
      'san antonio,tx': [29.4241, -98.4936],
      'san diego,ca': [32.7157, -117.1611],
      'dallas,tx': [32.7767, -96.7970],
      'san jose,ca': [37.3382, -121.8863],
      'austin,tx': [30.2672, -97.7431],
      'jacksonville,fl': [30.3322, -81.6557],
      'fort worth,tx': [32.7555, -97.3308],
      'columbus,oh': [39.9612, -82.9988],
      'charlotte,nc': [35.2271, -80.8431],
      'san francisco,ca': [37.7749, -122.4194],
      'indianapolis,in': [39.7684, -86.1581],
      'seattle,wa': [47.6062, -122.3321],
      'denver,co': [39.7392, -104.9903],
      'washington,dc': [38.9072, -77.0369],
      'boston,ma': [42.3601, -71.0589],
      'el paso,tx': [31.7619, -106.4850],
      'detroit,mi': [42.3314, -83.0458],
      'nashville,tn': [36.1627, -86.7816],
      'portland,or': [45.5152, -122.6784],
      'memphis,tn': [35.1495, -90.0490],
      'oklahoma city,ok': [35.4676, -97.5164],
      'las vegas,nv': [36.1699, -115.1398],
      'louisville,ky': [38.2527, -85.7585],
      'baltimore,md': [39.2904, -76.6122],
      'milwaukee,wi': [43.0389, -87.9065],
      'albuquerque,nm': [35.0844, -106.6504],
      'tucson,az': [32.2226, -110.9747],
      'fresno,ca': [36.7378, -119.7871],
      'mesa,az': [33.4152, -111.8315],
      'sacramento,ca': [38.5816, -121.4944],
      'atlanta,ga': [33.7490, -84.3880],
      'kansas city,mo': [39.0997, -94.5786],
      'colorado springs,co': [38.8339, -104.8214],
      'miami,fl': [25.7617, -80.1918],
      'raleigh,nc': [35.7796, -78.6382],
      'omaha,ne': [41.2565, -95.9345],
      'long beach,ca': [33.7701, -118.1937],
      'virginia beach,va': [36.8529, -75.9780],
      'oakland,ca': [37.8044, -122.2711],
      'minneapolis,mn': [44.9778, -93.2650],
      'tulsa,ok': [36.1540, -95.9928],
      'tampa,fl': [27.9506, -82.4572],
      'arlington,tx': [32.7357, -97.1081],
      'new orleans,la': [29.9511, -90.0715],
      'wichita,ks': [37.6872, -97.3301],
      'cleveland,oh': [41.4993, -81.6944],
      'bakersfield,ca': [35.3733, -119.0187],
      'aurora,co': [39.7294, -104.8319],
      'anaheim,ca': [33.8366, -117.9143],
      'honolulu,hi': [21.3099, -157.8581],
      'santa ana,ca': [33.7455, -117.8677],
      'corpus christi,tx': [27.8006, -97.3964],
      'riverside,ca': [33.9533, -117.3962],
      'lexington,ky': [38.0406, -84.5037],
      'stockton,ca': [37.9577, -121.2908],
      'henderson,nv': [36.0395, -114.9817],
      'saint paul,mn': [44.9537, -93.0900],
      'st. louis,mo': [38.6270, -90.1994],
      'cincinnati,oh': [39.1031, -84.5120],
      'pittsburgh,pa': [40.4406, -79.9959],
      
      // Canadian Major Cities
      'toronto,on': [43.6532, -79.3832],
      'montreal,qc': [45.5017, -73.5673],
      'vancouver,bc': [49.2827, -123.1207],
      'calgary,ab': [51.0447, -114.0719],
      'edmonton,ab': [53.5461, -113.4938],
      'ottawa,on': [45.4215, -75.6972],
      'winnipeg,mb': [49.8951, -97.1384],
      'quebec city,qc': [46.8139, -71.2080],
      'hamilton,on': [43.2557, -79.8711],
      'kitchener,on': [43.4516, -80.4925],
      'london,on': [42.9849, -81.2453],
      'victoria,bc': [48.4284, -123.3656],
      'halifax,ns': [44.6488, -63.5752],
      'oshawa,on': [43.8971, -78.8658],
      'windsor,on': [42.3149, -83.0364],
      'saskatoon,sk': [52.1579, -106.6702],
      'st. catharines,on': [43.1594, -79.2469],
      'regina,sk': [50.4452, -104.6189],
      'sherbrooke,qc': [45.4042, -71.8929],
      'kelowna,bc': [49.8880, -119.4960],
      'barrie,on': [44.3894, -79.6903],
      'abbotsford,bc': [49.0504, -122.3045],
      'kingston,on': [44.2312, -76.4860],
      'richmond,bc': [49.1666, -123.1336],
      'richmond hill,on': [43.8828, -79.4403],
      'markham,on': [43.8561, -79.3370],
      'vaughan,on': [43.8361, -79.4985],
      'gatineau,qc': [45.4765, -75.7013],
      'longueuil,qc': [45.5312, -73.5186],
      'burnaby,bc': [49.2488, -122.9805],
    };

    const key = `${city.toLowerCase()},${state.toLowerCase()}`;
    const coords = cityCoords[key];
    
    if (coords) {
      return coords;
    }

    // State center coordinates as fallback
    const stateCoords: Record<string, [number, number]> = {
      'AL': [32.806671, -86.791130], 'AK': [61.370716, -152.404419], 'AZ': [33.729759, -111.431221],
      'AR': [34.969704, -92.373123], 'CA': [36.116203, -119.681564], 'CO': [39.059811, -105.311104],
      'CT': [41.767, -72.677], 'DE': [39.161921, -75.526755], 'FL': [27.4148, -81.3103],
      'GA': [33.76, -84.39], 'HI': [21.30895, -157.826182], 'ID': [44.240459, -114.478828],
      'IL': [40.349457, -88.986137], 'IN': [39.790942, -86.147685], 'IA': [42.032974, -93.581543],
      'KS': [38.572954, -98.580480], 'KY': [37.669789, -84.670067], 'LA': [31.177, -91.867],
      'ME': [45.367584, -68.972168], 'MD': [39.04575, -76.641271], 'MA': [42.2352, -71.0275],
      'MI': [43.354558, -84.955255], 'MN': [45.7326, -93.9196], 'MS': [32.320, -90.207],
      'MO': [38.572954, -92.189283], 'MT': [47.052632, -110.454353], 'NE': [41.492537, -99.901813],
      'NV': [38.4199, -117.1219], 'NH': [43.452492, -71.563896], 'NJ': [40.221741, -74.756138],
      'NM': [34.307144, -106.018066], 'NY': [42.659829, -75.615142], 'NC': [35.771, -78.638],
      'ND': [47.549999, -99.784012], 'OH': [40.367474, -82.996216], 'OK': [35.482309, -97.534994],
      'OR': [44.931109, -123.029159], 'PA': [40.269789, -76.875613], 'RI': [41.82355, -71.422132],
      'SC': [33.836082, -81.163727], 'SD': [44.293293, -99.438828], 'TN': [35.747845, -86.692345],
      'TX': [31.106, -97.6475], 'UT': [39.161921, -111.892622], 'VT': [44.26639, -72.580536],
      'VA': [37.54, -78.86], 'WA': [47.042418, -122.893077], 'WV': [38.349497, -81.633294],
      'WI': [44.95, -89.57], 'WY': [42.7475, -107.2085], 'DC': [38.9072, -77.0369],
      
      // Canadian provinces
      'ON': [50.000000, -85.000000], 'QC': [52.000000, -71.000000], 'BC': [53.726669, -127.647621],
      'AB': [53.933327, -116.576504], 'MB': [53.760909, -98.813873], 'SK': [52.935397, -106.391586],
      'NS': [44.682640, -63.744311], 'NB': [46.565314, -66.461914], 'NL': [53.135509, -57.660435],
      'PE': [46.245497, -63.446442], 'NT': [61.524010, -113.749199], 'YT': [64.068865, -139.073671],
      'NU': [70.2998, -83.1076]
    };

    return stateCoords[state.toUpperCase()] || [40.7128, -74.0060]; // Default to NYC
  }
}

export const npiService = new NPIService();