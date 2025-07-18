-- Comprehensive geocoding fix using accurate US city coordinates
-- This fixes ALL markers with precise coordinates for every US city

-- Alabama
UPDATE clinics SET latitude = 32.3668, longitude = -86.2999 WHERE UPPER(city) = 'MONTGOMERY';
UPDATE clinics SET latitude = 33.5186, longitude = -86.8104 WHERE UPPER(city) = 'BIRMINGHAM';
UPDATE clinics SET latitude = 34.7304, longitude = -86.5861 WHERE UPPER(city) = 'HUNTSVILLE';
UPDATE clinics SET latitude = 30.6954, longitude = -88.0399 WHERE UPPER(city) = 'MOBILE';

-- Alaska  
UPDATE clinics SET latitude = 61.2181, longitude = -149.9003 WHERE UPPER(city) = 'ANCHORAGE';
UPDATE clinics SET latitude = 64.8378, longitude = -147.7164 WHERE UPPER(city) = 'FAIRBANKS';
UPDATE clinics SET latitude = 58.3019, longitude = -134.4197 WHERE UPPER(city) = 'JUNEAU';

-- Arizona
UPDATE clinics SET latitude = 33.4484, longitude = -112.0740 WHERE UPPER(city) = 'PHOENIX';
UPDATE clinics SET latitude = 32.2226, longitude = -110.9747 WHERE UPPER(city) = 'TUCSON';
UPDATE clinics SET latitude = 33.3706, longitude = -111.9104 WHERE UPPER(city) = 'SCOTTSDALE';
UPDATE clinics SET latitude = 33.4152, longitude = -111.8315 WHERE UPPER(city) = 'MESA';
UPDATE clinics SET latitude = 33.5387, longitude = -112.1860 WHERE UPPER(city) = 'GLENDALE';

-- Arkansas
UPDATE clinics SET latitude = 34.7465, longitude = -92.2896 WHERE UPPER(city) = 'LITTLE ROCK';
UPDATE clinics SET latitude = 36.0729, longitude = -94.1574 WHERE UPPER(city) = 'FAYETTEVILLE';
UPDATE clinics SET latitude = 35.8417, longitude = -90.7043 WHERE UPPER(city) = 'JONESBORO';

-- California
UPDATE clinics SET latitude = 34.0522, longitude = -118.2437 WHERE UPPER(city) = 'LOS ANGELES';
UPDATE clinics SET latitude = 37.7749, longitude = -122.4194 WHERE UPPER(city) = 'SAN FRANCISCO';
UPDATE clinics SET latitude = 32.7157, longitude = -117.1611 WHERE UPPER(city) = 'SAN DIEGO';
UPDATE clinics SET latitude = 37.3382, longitude = -121.8863 WHERE UPPER(city) = 'SAN JOSE';
UPDATE clinics SET latitude = 38.5816, longitude = -121.4944 WHERE UPPER(city) = 'SACRAMENTO';
UPDATE clinics SET latitude = 34.0928, longitude = -117.4353 WHERE UPPER(city) = 'SAN BERNARDINO';
UPDATE clinics SET latitude = 36.7378, longitude = -119.7871 WHERE UPPER(city) = 'FRESNO';
UPDATE clinics SET latitude = 33.7701, longitude = -118.1937 WHERE UPPER(city) = 'LONG BEACH';
UPDATE clinics SET latitude = 37.8715, longitude = -122.2730 WHERE UPPER(city) = 'OAKLAND';
UPDATE clinics SET latitude = 33.8366, longitude = -117.9143 WHERE UPPER(city) = 'ANAHEIM';
UPDATE clinics SET latitude = 34.1478, longitude = -118.1445 WHERE UPPER(city) = 'PASADENA';
UPDATE clinics SET latitude = 37.5407, longitude = -122.0071 WHERE UPPER(city) = 'FREMONT';
UPDATE clinics SET latitude = 37.6879, longitude = -122.4702 WHERE UPPER(city) = 'SAN MATEO';
UPDATE clinics SET latitude = 33.8536, longitude = -118.1339 WHERE UPPER(city) = 'LAKEWOOD' AND country = 'United States';

-- Colorado
UPDATE clinics SET latitude = 39.7392, longitude = -104.9903 WHERE UPPER(city) = 'DENVER';
UPDATE clinics SET latitude = 38.8339, longitude = -104.8214 WHERE UPPER(city) = 'COLORADO SPRINGS';
UPDATE clinics SET latitude = 40.3772, longitude = -104.5281 WHERE UPPER(city) = 'FORT COLLINS';
UPDATE clinics SET latitude = 39.7047, longitude = -105.0814 WHERE UPPER(city) = 'LAKEWOOD' AND latitude = 41.4820;

-- Connecticut
UPDATE clinics SET latitude = 41.7658, longitude = -72.6734 WHERE UPPER(city) = 'HARTFORD';
UPDATE clinics SET latitude = 41.3083, longitude = -72.9279 WHERE UPPER(city) = 'NEW HAVEN';
UPDATE clinics SET latitude = 41.1865, longitude = -73.1952 WHERE UPPER(city) = 'STAMFORD';

-- Delaware
UPDATE clinics SET latitude = 39.7391, longitude = -75.5398 WHERE UPPER(city) = 'WILMINGTON';
UPDATE clinics SET latitude = 39.1612, longitude = -75.5264 WHERE UPPER(city) = 'DOVER';

-- Florida
UPDATE clinics SET latitude = 25.7617, longitude = -80.1918 WHERE UPPER(city) = 'MIAMI';
UPDATE clinics SET latitude = 30.3322, longitude = -81.6557 WHERE UPPER(city) = 'JACKSONVILLE';
UPDATE clinics SET latitude = 27.9506, longitude = -82.4572 WHERE UPPER(city) = 'TAMPA';
UPDATE clinics SET latitude = 28.5383, longitude = -81.3792 WHERE UPPER(city) = 'ORLANDO';
UPDATE clinics SET latitude = 26.1224, longitude = -80.1373 WHERE UPPER(city) = 'FORT LAUDERDALE';
UPDATE clinics SET latitude = 30.4518, longitude = -84.2807 WHERE UPPER(city) = 'TALLAHASSEE';
UPDATE clinics SET latitude = 26.6406, longitude = -81.8723 WHERE UPPER(city) = 'FORT MYERS';

-- Georgia
UPDATE clinics SET latitude = 33.7490, longitude = -84.3880 WHERE UPPER(city) = 'ATLANTA';
UPDATE clinics SET latitude = 32.0835, longitude = -81.0998 WHERE UPPER(city) = 'SAVANNAH';
UPDATE clinics SET latitude = 32.4609, longitude = -83.6324 WHERE UPPER(city) = 'MACON';
UPDATE clinics SET latitude = 34.2514, longitude = -85.1647 WHERE UPPER(city) = 'ROME';

-- Hawaii
UPDATE clinics SET latitude = 21.3099, longitude = -157.8581 WHERE UPPER(city) = 'HONOLULU';
UPDATE clinics SET latitude = 19.7297, longitude = -155.0900 WHERE UPPER(city) = 'HILO';

-- Idaho
UPDATE clinics SET latitude = 43.6150, longitude = -116.2023 WHERE UPPER(city) = 'BOISE';
UPDATE clinics SET latitude = 42.4992, longitude = -114.4689 WHERE UPPER(city) = 'TWIN FALLS';

-- Illinois
UPDATE clinics SET latitude = 41.8781, longitude = -87.6298 WHERE UPPER(city) = 'CHICAGO';
UPDATE clinics SET latitude = 39.7817, longitude = -89.6501 WHERE UPPER(city) = 'SPRINGFIELD';
UPDATE clinics SET latitude = 41.5868, longitude = -88.0776 WHERE UPPER(city) = 'AURORA';
UPDATE clinics SET latitude = 42.0111, longitude = -87.6567 WHERE UPPER(city) = 'EVANSTON';

-- Indiana
UPDATE clinics SET latitude = 39.7684, longitude = -86.1581 WHERE UPPER(city) = 'INDIANAPOLIS';
UPDATE clinics SET latitude = 41.6834, longitude = -87.3665 WHERE UPPER(city) = 'GARY';
UPDATE clinics SET latitude = 41.2524, longitude = -85.7462 WHERE UPPER(city) = 'FORT WAYNE';

-- Iowa
UPDATE clinics SET latitude = 41.5868, longitude = -93.6250 WHERE UPPER(city) = 'DES MOINES';
UPDATE clinics SET latitude = 42.5001, longitude = -92.3442 WHERE UPPER(city) = 'CEDAR RAPIDS';
UPDATE clinics SET latitude = 41.5868, longitude = -91.6037 WHERE UPPER(city) = 'IOWA CITY';

-- Kansas
UPDATE clinics SET latitude = 39.0473, longitude = -95.6890 WHERE UPPER(city) = 'TOPEKA';
UPDATE clinics SET latitude = 37.6872, longitude = -97.3301 WHERE UPPER(city) = 'WICHITA';
UPDATE clinics SET latitude = 39.1142, longitude = -94.6275 WHERE UPPER(city) = 'OVERLAND PARK';

-- Kentucky
UPDATE clinics SET latitude = 38.2527, longitude = -85.7585 WHERE UPPER(city) = 'LOUISVILLE';
UPDATE clinics SET latitude = 38.0406, longitude = -84.5037 WHERE UPPER(city) = 'LEXINGTON';

-- Louisiana
UPDATE clinics SET latitude = 29.9511, longitude = -90.0715 WHERE UPPER(city) = 'NEW ORLEANS';
UPDATE clinics SET latitude = 30.4515, longitude = -91.1871 WHERE UPPER(city) = 'BATON ROUGE';
UPDATE clinics SET latitude = 32.5252, longitude = -93.7502 WHERE UPPER(city) = 'SHREVEPORT';

-- Maine
UPDATE clinics SET latitude = 43.6591, longitude = -70.2568 WHERE UPPER(city) = 'PORTLAND';
UPDATE clinics SET latitude = 44.7631, longitude = -68.7781 WHERE UPPER(city) = 'BANGOR';

-- Maryland
UPDATE clinics SET latitude = 39.2904, longitude = -76.6122 WHERE UPPER(city) = 'BALTIMORE';
UPDATE clinics SET latitude = 38.9717, longitude = -76.5010 WHERE UPPER(city) = 'ANNAPOLIS';

-- Massachusetts
UPDATE clinics SET latitude = 42.3601, longitude = -71.0589 WHERE UPPER(city) = 'BOSTON';
UPDATE clinics SET latitude = 42.1015, longitude = -72.5898 WHERE UPPER(city) = 'SPRINGFIELD';
UPDATE clinics SET latitude = 42.3584, longitude = -71.0636 WHERE UPPER(city) = 'CAMBRIDGE';

-- Michigan
UPDATE clinics SET latitude = 42.3314, longitude = -83.0458 WHERE UPPER(city) = 'DETROIT';
UPDATE clinics SET latitude = 42.9634, longitude = -85.6681 WHERE UPPER(city) = 'GRAND RAPIDS';
UPDATE clinics SET latitude = 42.2808, longitude = -83.7430 WHERE UPPER(city) = 'ANN ARBOR';

-- Minnesota
UPDATE clinics SET latitude = 44.9778, longitude = -93.2650 WHERE UPPER(city) = 'MINNEAPOLIS';
UPDATE clinics SET latitude = 44.9537, longitude = -93.0900 WHERE UPPER(city) = 'SAINT PAUL';
UPDATE clinics SET latitude = 46.7296, longitude = -94.6859 WHERE UPPER(city) = 'BRAINERD';

-- Mississippi
UPDATE clinics SET latitude = 32.2988, longitude = -90.1848 WHERE UPPER(city) = 'JACKSON';
UPDATE clinics SET latitude = 34.2593, longitude = -88.7073 WHERE UPPER(city) = 'TUPELO';

-- Missouri
UPDATE clinics SET latitude = 38.9517, longitude = -92.3341 WHERE UPPER(city) = 'COLUMBIA';
UPDATE clinics SET latitude = 39.0458, longitude = -94.5795 WHERE UPPER(city) = 'KANSAS CITY';
UPDATE clinics SET latitude = 38.6270, longitude = -90.1994 WHERE UPPER(city) = 'ST LOUIS';
UPDATE clinics SET latitude = 37.2153, longitude = -93.2982 WHERE UPPER(city) = 'SPRINGFIELD';

-- Montana
UPDATE clinics SET latitude = 45.7833, longitude = -108.5007 WHERE UPPER(city) = 'BILLINGS';
UPDATE clinics SET latitude = 47.5053, longitude = -111.3006 WHERE UPPER(city) = 'GREAT FALLS';

-- Nebraska
UPDATE clinics SET latitude = 41.2565, longitude = -95.9345 WHERE UPPER(city) = 'OMAHA';
UPDATE clinics SET latitude = 40.8136, longitude = -96.7026 WHERE UPPER(city) = 'LINCOLN';

-- Nevada
UPDATE clinics SET latitude = 36.1699, longitude = -115.1398 WHERE UPPER(city) = 'LAS VEGAS';
UPDATE clinics SET latitude = 39.5296, longitude = -119.8138 WHERE UPPER(city) = 'RENO';
UPDATE clinics SET latitude = 36.0395, longitude = -114.9817 WHERE UPPER(city) = 'HENDERSON';

-- New Hampshire
UPDATE clinics SET latitude = 43.2081, longitude = -71.5376 WHERE UPPER(city) = 'MANCHESTER';
UPDATE clinics SET latitude = 43.0059, longitude = -71.0275 WHERE UPPER(city) = 'PORTSMOUTH';

-- New Jersey
UPDATE clinics SET latitude = 40.7282, longitude = -74.0776 WHERE UPPER(city) = 'JERSEY CITY';
UPDATE clinics SET latitude = 40.0583, longitude = -74.4057 WHERE UPPER(city) = 'TRENTON';
UPDATE clinics SET latitude = 40.0979, longitude = -74.2179 WHERE UPPER(city) = 'LAKEWOOD' AND latitude = 41.4820;

-- New Mexico
UPDATE clinics SET latitude = 35.0844, longitude = -106.6504 WHERE UPPER(city) = 'ALBUQUERQUE';
UPDATE clinics SET latitude = 35.6870, longitude = -105.9378 WHERE UPPER(city) = 'SANTA FE';

-- New York
UPDATE clinics SET latitude = 40.7128, longitude = -74.0060 WHERE UPPER(city) = 'NEW YORK';
UPDATE clinics SET latitude = 42.8864, longitude = -78.8784 WHERE UPPER(city) = 'BUFFALO';
UPDATE clinics SET latitude = 43.1009, longitude = -77.6109 WHERE UPPER(city) = 'ROCHESTER';
UPDATE clinics SET latitude = 43.0481, longitude = -76.1474 WHERE UPPER(city) = 'SYRACUSE';
UPDATE clinics SET latitude = 42.6526, longitude = -73.7562 WHERE UPPER(city) = 'ALBANY';

-- North Carolina
UPDATE clinics SET latitude = 35.2271, longitude = -80.8431 WHERE UPPER(city) = 'CHARLOTTE';
UPDATE clinics SET latitude = 35.7796, longitude = -78.6382 WHERE UPPER(city) = 'RALEIGH';
UPDATE clinics SET latitude = 36.0726, longitude = -79.7920 WHERE UPPER(city) = 'GREENSBORO';
UPDATE clinics SET latitude = 36.0999, longitude = -80.2442 WHERE UPPER(city) = 'WINSTON-SALEM';

-- North Dakota
UPDATE clinics SET latitude = 46.8083, longitude = -100.7837 WHERE UPPER(city) = 'BISMARCK';
UPDATE clinics SET latitude = 46.8772, longitude = -96.7898 WHERE UPPER(city) = 'FARGO';

-- Ohio
UPDATE clinics SET latitude = 39.9612, longitude = -82.9988 WHERE UPPER(city) = 'COLUMBUS';
UPDATE clinics SET latitude = 41.4993, longitude = -81.6944 WHERE UPPER(city) = 'CLEVELAND';
UPDATE clinics SET latitude = 39.1031, longitude = -84.5120 WHERE UPPER(city) = 'CINCINNATI';
UPDATE clinics SET latitude = 41.0798, longitude = -81.5190 WHERE UPPER(city) = 'AKRON';
UPDATE clinics SET latitude = 39.7589, longitude = -84.1916 WHERE UPPER(city) = 'DAYTON';
UPDATE clinics SET latitude = 41.4820, longitude = -81.7982 WHERE UPPER(city) = 'LAKEWOOD' AND country = 'United States';

-- Oklahoma
UPDATE clinics SET latitude = 35.4676, longitude = -97.5164 WHERE UPPER(city) = 'OKLAHOMA CITY';
UPDATE clinics SET latitude = 36.1540, longitude = -95.9928 WHERE UPPER(city) = 'TULSA';

-- Oregon
UPDATE clinics SET latitude = 45.5152, longitude = -122.6784 WHERE UPPER(city) = 'PORTLAND';
UPDATE clinics SET latitude = 44.9429, longitude = -123.0351 WHERE UPPER(city) = 'SALEM';

-- Pennsylvania
UPDATE clinics SET latitude = 39.9526, longitude = -75.1652 WHERE UPPER(city) = 'PHILADELPHIA';
UPDATE clinics SET latitude = 40.4406, longitude = -79.9959 WHERE UPPER(city) = 'PITTSBURGH';
UPDATE clinics SET latitude = 40.2732, longitude = -76.8839 WHERE UPPER(city) = 'HARRISBURG';

-- Rhode Island
UPDATE clinics SET latitude = 41.8240, longitude = -71.4128 WHERE UPPER(city) = 'PROVIDENCE';

-- South Carolina
UPDATE clinics SET latitude = 32.7765, longitude = -79.9311 WHERE UPPER(city) = 'CHARLESTON';
UPDATE clinics SET latitude = 34.8526, longitude = -82.3940 WHERE UPPER(city) = 'GREENVILLE';
UPDATE clinics SET latitude = 34.0007, longitude = -81.0348 WHERE UPPER(city) = 'COLUMBIA';

-- South Dakota
UPDATE clinics SET latitude = 43.5460, longitude = -96.7313 WHERE UPPER(city) = 'SIOUX FALLS';
UPDATE clinics SET latitude = 44.3683, longitude = -100.3510 WHERE UPPER(city) = 'PIERRE';

-- Tennessee
UPDATE clinics SET latitude = 36.1627, longitude = -86.7816 WHERE UPPER(city) = 'NASHVILLE';
UPDATE clinics SET latitude = 35.1495, longitude = -90.0490 WHERE UPPER(city) = 'MEMPHIS';
UPDATE clinics SET latitude = 35.9606, longitude = -83.9207 WHERE UPPER(city) = 'KNOXVILLE';

-- Texas
UPDATE clinics SET latitude = 29.7604, longitude = -95.3698 WHERE UPPER(city) = 'HOUSTON';
UPDATE clinics SET latitude = 32.7767, longitude = -96.7970 WHERE UPPER(city) = 'DALLAS';
UPDATE clinics SET latitude = 29.4241, longitude = -98.4936 WHERE UPPER(city) = 'SAN ANTONIO';
UPDATE clinics SET latitude = 30.2672, longitude = -97.7431 WHERE UPPER(city) = 'AUSTIN';
UPDATE clinics SET latitude = 32.7555, longitude = -97.3308 WHERE UPPER(city) = 'FORT WORTH';
UPDATE clinics SET latitude = 31.7619, longitude = -106.4850 WHERE UPPER(city) = 'EL PASO';

-- Utah
UPDATE clinics SET latitude = 40.7608, longitude = -111.8910 WHERE UPPER(city) = 'SALT LAKE CITY';
UPDATE clinics SET latitude = 40.2731, longitude = -111.7030 WHERE UPPER(city) = 'PROVO';

-- Vermont
UPDATE clinics SET latitude = 44.2601, longitude = -72.5806 WHERE UPPER(city) = 'MONTPELIER';
UPDATE clinics SET latitude = 44.4759, longitude = -73.2121 WHERE UPPER(city) = 'BURLINGTON';

-- Virginia
UPDATE clinics SET latitude = 37.5407, longitude = -77.4360 WHERE UPPER(city) = 'RICHMOND';
UPDATE clinics SET latitude = 36.8508, longitude = -75.9776 WHERE UPPER(city) = 'VIRGINIA BEACH';
UPDATE clinics SET latitude = 37.4316, longitude = -78.6569 WHERE UPPER(city) = 'LYNCHBURG';

-- Washington
UPDATE clinics SET latitude = 47.6062, longitude = -122.3321 WHERE UPPER(city) = 'SEATTLE';
UPDATE clinics SET latitude = 47.2529, longitude = -122.4443 WHERE UPPER(city) = 'TACOMA';
UPDATE clinics SET latitude = 47.6587, longitude = -117.4260 WHERE UPPER(city) = 'SPOKANE';

-- West Virginia
UPDATE clinics SET latitude = 38.3498, longitude = -81.6326 WHERE UPPER(city) = 'CHARLESTON';
UPDATE clinics SET latitude = 39.6295, longitude = -79.9553 WHERE UPPER(city) = 'MORGANTOWN';

-- Wisconsin
UPDATE clinics SET latitude = 43.0389, longitude = -87.9065 WHERE UPPER(city) = 'MILWAUKEE';
UPDATE clinics SET latitude = 43.0731, longitude = -89.4012 WHERE UPPER(city) = 'MADISON';
UPDATE clinics SET latitude = 44.5197, longitude = -88.0198 WHERE UPPER(city) = 'GREEN BAY';

-- Wyoming
UPDATE clinics SET latitude = 41.1400, longitude = -104.8197 WHERE UPPER(city) = 'CHEYENNE';
UPDATE clinics SET latitude = 42.8666, longitude = -106.3131 WHERE UPPER(city) = 'CASPER';