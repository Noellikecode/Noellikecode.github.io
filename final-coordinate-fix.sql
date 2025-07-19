-- Final comprehensive coordinate fix using state-based assignment

-- First, fix the remaining ocean coordinates with proper state-based coordinates

-- California cities (ensuring they're in California, not the ocean)
UPDATE clinics SET latitude = 33.8366, longitude = -117.9143 WHERE city = 'ANAHEIM';
UPDATE clinics SET latitude = 34.0693, longitude = -118.4062 WHERE city = 'BEVERLY HILLS';
UPDATE clinics SET latitude = 33.9425, longitude = -118.2081 WHERE city = 'LYNWOOD';
UPDATE clinics SET latitude = 33.7461, longitude = -117.8284 WHERE city = 'TUSTIN';
UPDATE clinics SET latitude = 33.5985, longitude = -117.2704 WHERE city = 'WILDOMAR';

-- Florida cities (ensuring they're in Florida, not the Gulf)
UPDATE clinics SET latitude = 25.7617, longitude = -80.1918 WHERE city = 'MIAMI';
UPDATE clinics SET latitude = 26.1224, longitude = -80.1373 WHERE city = 'FORT LAUDERDALE';
UPDATE clinics SET latitude = 29.1872, longitude = -82.1401 WHERE city = 'OCALA';

-- East Coast cities (ensuring they're on land, not in Atlantic)
UPDATE clinics SET latitude = 39.7391, longitude = -75.5398 WHERE city = 'WILMINGTON';
UPDATE clinics SET latitude = 39.9526, longitude = -75.1652 WHERE city = 'PHILADELPHIA';
UPDATE clinics SET latitude = 37.0871, longitude = -76.4730 WHERE city = 'NEWPORT NEWS';
UPDATE clinics SET latitude = 38.9697, longitude = -77.3861 WHERE city = 'LANGLEY';
UPDATE clinics SET latitude = 38.9943, longitude = -77.0909 WHERE city = 'SILVER SPRING';
UPDATE clinics SET latitude = 38.9579, longitude = -76.9219 WHERE city = 'RIVERDALE PARK';
UPDATE clinics SET latitude = 38.9013, longitude = -77.2652 WHERE city = 'VIENNA';
UPDATE clinics SET latitude = 41.9628, longitude = -72.5507 WHERE city = 'WEST SUFFIELD';

-- Fix duplicate coordinate issues - cities that got assigned wrong state coordinates
UPDATE clinics SET latitude = 41.6033, longitude = -87.8646 WHERE city = 'OAK LAWN'; -- Illinois, not LA
UPDATE clinics SET latitude = 37.3861, longitude = -122.0839 WHERE city = 'ASHLAND' AND name LIKE '%ROOPER%'; -- California Ashland

-- State-specific coordinate assignments for accuracy

-- Alabama
UPDATE clinics SET latitude = 32.3668, longitude = -86.2999 WHERE city = 'MONTGOMERY' AND state IS NULL;
UPDATE clinics SET latitude = 33.5207, longitude = -86.8025 WHERE city = 'BIRMINGHAM' AND state IS NULL;

-- Arizona  
UPDATE clinics SET latitude = 33.4484, longitude = -112.0740 WHERE city = 'PHOENIX';
UPDATE clinics SET latitude = 32.2226, longitude = -110.9747 WHERE city = 'TUCSON';
UPDATE clinics SET latitude = 33.3528, longitude = -112.4194 WHERE city = 'GLENDALE' AND state IS NULL;

-- Arkansas
UPDATE clinics SET latitude = 34.7465, longitude = -92.2896 WHERE city = 'LITTLE ROCK' AND state IS NULL;

-- Colorado
UPDATE clinics SET latitude = 39.7392, longitude = -104.9903 WHERE city = 'DENVER';
UPDATE clinics SET latitude = 38.8339, longitude = -104.8214 WHERE city = 'COLORADO SPRINGS';
UPDATE clinics SET latitude = 40.5853, longitude = -105.0844 WHERE city = 'FORT COLLINS';

-- Connecticut
UPDATE clinics SET latitude = 41.7658, longitude = -72.6734 WHERE city = 'HARTFORD' AND state IS NULL;
UPDATE clinics SET latitude = 41.3083, longitude = -72.9279 WHERE city = 'NEW HAVEN' AND state IS NULL;

-- Delaware  
UPDATE clinics SET latitude = 39.7391, longitude = -75.5398 WHERE city = 'WILMINGTON';

-- Georgia
UPDATE clinics SET latitude = 33.7490, longitude = -84.3880 WHERE city = 'ATLANTA';
UPDATE clinics SET latitude = 32.0835, longitude = -81.0998 WHERE city = 'SAVANNAH';
UPDATE clinics SET latitude = 32.4609, longitude = -84.1557 WHERE city = 'COLUMBUS' AND state IS NULL;

-- Idaho
UPDATE clinics SET latitude = 43.6150, longitude = -116.2023 WHERE city = 'BOISE' AND state IS NULL;

-- Indiana
UPDATE clinics SET latitude = 39.7684, longitude = -86.1581 WHERE city = 'INDIANAPOLIS';
UPDATE clinics SET latitude = 41.5868, longitude = -87.3467 WHERE city = 'HAMMOND' AND state IS NULL;

-- Iowa
UPDATE clinics SET latitude = 41.5868, longitude = -93.6250 WHERE city = 'DES MOINES' AND state IS NULL;
UPDATE clinics SET latitude = 42.0046, longitude = -91.6656 WHERE city = 'IOWA CITY' AND state IS NULL;

-- Kansas
UPDATE clinics SET latitude = 39.0473, longitude = -95.6890 WHERE city = 'LAWRENCE' AND state IS NULL;
UPDATE clinics SET latitude = 37.6922, longitude = -97.3370 WHERE city = 'WICHITA' AND state IS NULL;

-- Kentucky
UPDATE clinics SET latitude = 38.2527, longitude = -85.7585 WHERE city = 'LOUISVILLE';
UPDATE clinics SET latitude = 38.0406, longitude = -84.5037 WHERE city = 'LEXINGTON' AND state IS NULL;

-- Louisiana
UPDATE clinics SET latitude = 29.9511, longitude = -90.0715 WHERE city = 'NEW ORLEANS';
UPDATE clinics SET latitude = 30.4515, longitude = -91.1871 WHERE city = 'BATON ROUGE';

-- Maine
UPDATE clinics SET latitude = 43.6591, longitude = -70.2568 WHERE city = 'PORTLAND' AND state IS NULL;

-- Maryland
UPDATE clinics SET latitude = 39.2904, longitude = -76.6122 WHERE city = 'BALTIMORE' AND state IS NULL;

-- Massachusetts
UPDATE clinics SET latitude = 42.3601, longitude = -71.0589 WHERE city = 'BOSTON' AND state IS NULL;
UPDATE clinics SET latitude = 42.1015, longitude = -72.5898 WHERE city = 'SPRINGFIELD' AND state IS NULL;

-- Minnesota
UPDATE clinics SET latitude = 44.9778, longitude = -93.2650 WHERE city = 'MINNEAPOLIS' AND state IS NULL;
UPDATE clinics SET latitude = 44.9537, longitude = -93.0900 WHERE city = 'SAINT PAUL' AND state IS NULL;

-- Mississippi
UPDATE clinics SET latitude = 32.2988, longitude = -90.1848 WHERE city = 'JACKSON' AND state IS NULL;

-- Nebraska
UPDATE clinics SET latitude = 41.2565, longitude = -95.9345 WHERE city = 'OMAHA' AND state IS NULL;

-- New Mexico
UPDATE clinics SET latitude = 35.0844, longitude = -106.6504 WHERE city = 'ALBUQUERQUE' AND state IS NULL;

-- Oregon
UPDATE clinics SET latitude = 45.5152, longitude = -122.6784 WHERE city = 'PORTLAND' AND state IS NULL;
UPDATE clinics SET latitude = 44.0521, longitude = -123.0868 WHERE city = 'EUGENE' AND state IS NULL;

-- South Carolina
UPDATE clinics SET latitude = 32.0835, longitude = -81.0998 WHERE city = 'COLUMBIA' AND state IS NULL;
UPDATE clinics SET latitude = 32.7765, longitude = -79.9311 WHERE city = 'CHARLESTON' AND state IS NULL;

-- Utah
UPDATE clinics SET latitude = 40.7608, longitude = -111.8910 WHERE city = 'SALT LAKE CITY' AND state IS NULL;

-- Vermont
UPDATE clinics SET latitude = 44.2601, longitude = -72.5806 WHERE city = 'MONTPELIER' AND state IS NULL;

-- Virginia
UPDATE clinics SET latitude = 37.5407, longitude = -77.4360 WHERE city = 'RICHMOND' AND state IS NULL;
UPDATE clinics SET latitude = 36.8485, longitude = -75.9774 WHERE city = 'VIRGINIA BEACH' AND state IS NULL;

-- West Virginia
UPDATE clinics SET latitude = 38.3498, longitude = -81.6326 WHERE city = 'CHARLESTON' AND state IS NULL;

-- Wisconsin
UPDATE clinics SET latitude = 43.0731, longitude = -89.4012 WHERE city = 'MADISON' AND state IS NULL;
UPDATE clinics SET latitude = 43.0389, longitude = -87.9065 WHERE city = 'MILWAUKEE';

-- Wyoming
UPDATE clinics SET latitude = 41.1400, longitude = -104.8197 WHERE city = 'CHEYENNE' AND state IS NULL;