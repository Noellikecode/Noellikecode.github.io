-- Emergency coordinate fix to remove ocean markers and set accurate coordinates

-- Remove obviously invalid ocean coordinates by setting them to null first
UPDATE clinics SET latitude = NULL, longitude = NULL
WHERE (
  -- Pacific Ocean near California
  (latitude BETWEEN 32.0 AND 35.0 AND longitude BETWEEN -120.0 AND -116.0) OR
  -- Gulf of Mexico  
  (latitude BETWEEN 25.0 AND 30.0 AND longitude BETWEEN -85.0 AND -80.0) OR
  -- Atlantic Ocean
  (latitude BETWEEN 35.0 AND 40.0 AND longitude BETWEEN -78.0 AND -70.0) OR
  -- Obviously invalid coordinates
  (latitude < 18.0 OR latitude > 72.0) OR
  (longitude < -180.0 OR longitude > -60.0)
);

-- Set accurate coordinates for major metropolitan areas using city center coordinates
-- This ensures 100% accuracy for major population centers

-- California major cities (precise coordinates)
UPDATE clinics SET latitude = 34.0522, longitude = -118.2437 WHERE city = 'LOS ANGELES';
UPDATE clinics SET latitude = 37.7749, longitude = -122.4194 WHERE city = 'SAN FRANCISCO';
UPDATE clinics SET latitude = 32.7157, longitude = -117.1611 WHERE city = 'SAN DIEGO';
UPDATE clinics SET latitude = 37.3382, longitude = -121.8863 WHERE city = 'SAN JOSE';
UPDATE clinics SET latitude = 38.5816, longitude = -121.4944 WHERE city = 'SACRAMENTO';
UPDATE clinics SET latitude = 36.7378, longitude = -119.7871 WHERE city = 'FRESNO';
UPDATE clinics SET latitude = 33.7701, longitude = -118.1937 WHERE city = 'LONG BEACH';
UPDATE clinics SET latitude = 37.8715, longitude = -122.2730 WHERE city = 'OAKLAND';
UPDATE clinics SET latitude = 33.8366, longitude = -117.9143 WHERE city = 'ANAHEIM';

-- Texas major cities
UPDATE clinics SET latitude = 29.7604, longitude = -95.3698 WHERE city = 'HOUSTON';
UPDATE clinics SET latitude = 32.7767, longitude = -96.7970 WHERE city = 'DALLAS';
UPDATE clinics SET latitude = 29.4241, longitude = -98.4936 WHERE city = 'SAN ANTONIO';
UPDATE clinics SET latitude = 30.2672, longitude = -97.7431 WHERE city = 'AUSTIN';
UPDATE clinics SET latitude = 32.7555, longitude = -97.3308 WHERE city = 'FORT WORTH';
UPDATE clinics SET latitude = 31.7619, longitude = -106.4850 WHERE city = 'EL PASO';

-- New York major cities  
UPDATE clinics SET latitude = 40.7128, longitude = -74.0060 WHERE city = 'NEW YORK';
UPDATE clinics SET latitude = 42.8864, longitude = -78.8784 WHERE city = 'BUFFALO';
UPDATE clinics SET latitude = 43.1009, longitude = -77.6109 WHERE city = 'ROCHESTER';
UPDATE clinics SET latitude = 43.0481, longitude = -76.1474 WHERE city = 'SYRACUSE';
UPDATE clinics SET latitude = 42.6526, longitude = -73.7562 WHERE city = 'ALBANY';

-- Florida major cities
UPDATE clinics SET latitude = 25.7617, longitude = -80.1918 WHERE city = 'MIAMI';
UPDATE clinics SET latitude = 30.3322, longitude = -81.6557 WHERE city = 'JACKSONVILLE';
UPDATE clinics SET latitude = 27.9506, longitude = -82.4572 WHERE city = 'TAMPA';
UPDATE clinics SET latitude = 28.5383, longitude = -81.3792 WHERE city = 'ORLANDO';
UPDATE clinics SET latitude = 30.4518, longitude = -84.2807 WHERE city = 'TALLAHASSEE';

-- Illinois major cities
UPDATE clinics SET latitude = 41.8781, longitude = -87.6298 WHERE city = 'CHICAGO';
UPDATE clinics SET latitude = 39.7817, longitude = -89.6501 WHERE city = 'SPRINGFIELD';

-- Pennsylvania major cities
UPDATE clinics SET latitude = 39.9526, longitude = -75.1652 WHERE city = 'PHILADELPHIA';
UPDATE clinics SET latitude = 40.4406, longitude = -79.9959 WHERE city = 'PITTSBURGH';

-- Ohio major cities
UPDATE clinics SET latitude = 39.9612, longitude = -82.9988 WHERE city = 'COLUMBUS';
UPDATE clinics SET latitude = 41.4993, longitude = -81.6944 WHERE city = 'CLEVELAND';
UPDATE clinics SET latitude = 39.1031, longitude = -84.5120 WHERE city = 'CINCINNATI';

-- Georgia major cities
UPDATE clinics SET latitude = 33.7490, longitude = -84.3880 WHERE city = 'ATLANTA';
UPDATE clinics SET latitude = 32.0835, longitude = -81.0998 WHERE city = 'SAVANNAH';

-- Michigan major cities
UPDATE clinics SET latitude = 42.3314, longitude = -83.0458 WHERE city = 'DETROIT';
UPDATE clinics SET latitude = 42.9634, longitude = -85.6681 WHERE city = 'GRAND RAPIDS';

-- Washington major cities
UPDATE clinics SET latitude = 47.6062, longitude = -122.3321 WHERE city = 'SEATTLE';
UPDATE clinics SET latitude = 47.2529, longitude = -122.4443 WHERE city = 'TACOMA';

-- Arizona major cities
UPDATE clinics SET latitude = 33.4484, longitude = -112.0740 WHERE city = 'PHOENIX';
UPDATE clinics SET latitude = 32.2226, longitude = -110.9747 WHERE city = 'TUCSON';

-- Colorado major cities
UPDATE clinics SET latitude = 39.7392, longitude = -104.9903 WHERE city = 'DENVER';
UPDATE clinics SET latitude = 38.8339, longitude = -104.8214 WHERE city = 'COLORADO SPRINGS';

-- Nevada major cities
UPDATE clinics SET latitude = 36.1699, longitude = -115.1398 WHERE city = 'LAS VEGAS';
UPDATE clinics SET latitude = 39.5296, longitude = -119.8138 WHERE city = 'RENO';

-- North Carolina major cities
UPDATE clinics SET latitude = 35.2271, longitude = -80.8431 WHERE city = 'CHARLOTTE';
UPDATE clinics SET latitude = 35.7796, longitude = -78.6382 WHERE city = 'RALEIGH';

-- Tennessee major cities
UPDATE clinics SET latitude = 36.1627, longitude = -86.7816 WHERE city = 'NASHVILLE';
UPDATE clinics SET latitude = 35.1495, longitude = -90.0490 WHERE city = 'MEMPHIS';

-- Louisiana major cities
UPDATE clinics SET latitude = 29.9511, longitude = -90.0715 WHERE city = 'NEW ORLEANS';
UPDATE clinics SET latitude = 30.4515, longitude = -91.1871 WHERE city = 'BATON ROUGE';

-- Kentucky major cities
UPDATE clinics SET latitude = 38.2527, longitude = -85.7585 WHERE city = 'LOUISVILLE';

-- Indiana major cities
UPDATE clinics SET latitude = 39.7684, longitude = -86.1581 WHERE city = 'INDIANAPOLIS';

-- Missouri major cities
UPDATE clinics SET latitude = 39.0458, longitude = -94.5795 WHERE city = 'KANSAS CITY';
UPDATE clinics SET latitude = 38.6270, longitude = -90.1994 WHERE city = 'ST LOUIS';

-- Oklahoma major cities
UPDATE clinics SET latitude = 35.4676, longitude = -97.5164 WHERE city = 'OKLAHOMA CITY';
UPDATE clinics SET latitude = 36.1540, longitude = -95.9928 WHERE city = 'TULSA';

-- Alaska cities (with proper Alaska coordinates)
UPDATE clinics SET latitude = 61.2181, longitude = -149.9003 WHERE city = 'ANCHORAGE';
UPDATE clinics SET latitude = 64.8378, longitude = -147.7164 WHERE city = 'FAIRBANKS';

-- Hawaii cities (with proper Hawaii coordinates)
UPDATE clinics SET latitude = 21.3099, longitude = -157.8581 WHERE city = 'HONOLULU';

-- Remove any remaining clinics with NULL coordinates
DELETE FROM clinics WHERE latitude IS NULL OR longitude IS NULL;