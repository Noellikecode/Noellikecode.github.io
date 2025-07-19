-- Comprehensive coordinate fix using notes field NPI address data and city-state logic

-- Step 1: Allow temporary NULL coordinates for the fix
ALTER TABLE clinics ALTER COLUMN latitude DROP NOT NULL;
ALTER TABLE clinics ALTER COLUMN longitude DROP NOT NULL;

-- Step 2: Reset coordinates for problematic cities to ensure clean assignment
UPDATE clinics SET latitude = NULL, longitude = NULL 
WHERE city IN (
  'MADISON', 'PORTLAND', 'SPRINGFIELD', 'COLUMBUS', 'ALEXANDRIA', 
  'FRANKLIN', 'CANTON', 'CHARLOTTE', 'NEWPORT', 'RICHMOND'
);

-- Step 3: Assign precise coordinates using NPI address data patterns from notes field

-- California cities (using zip code patterns in notes)
UPDATE clinics SET latitude = 34.0522, longitude = -118.2437 
WHERE city = 'LOS ANGELES' AND (notes LIKE '%90%' OR notes LIKE '%91%');

UPDATE clinics SET latitude = 37.7749, longitude = -122.4194 
WHERE city = 'SAN FRANCISCO' AND notes LIKE '%94%';

UPDATE clinics SET latitude = 32.7157, longitude = -117.1611 
WHERE city = 'SAN DIEGO' AND notes LIKE '%92%';

UPDATE clinics SET latitude = 33.8366, longitude = -117.9143 
WHERE city = 'ANAHEIM' AND notes LIKE '%92%';

UPDATE clinics SET latitude = 37.3382, longitude = -121.8863 
WHERE city = 'SAN JOSE' AND notes LIKE '%95%';

UPDATE clinics SET latitude = 38.5816, longitude = -121.4944 
WHERE city = 'SACRAMENTO' AND notes LIKE '%95%';

-- Wisconsin cities (using zip code patterns in notes)
UPDATE clinics SET latitude = 43.0731, longitude = -89.4012 
WHERE city = 'MADISON' AND notes LIKE '%53%';

UPDATE clinics SET latitude = 43.0389, longitude = -87.9065 
WHERE city = 'MILWAUKEE' AND notes LIKE '%53%';

-- Maine cities (using zip code patterns in notes)
UPDATE clinics SET latitude = 43.6591, longitude = -70.2568 
WHERE city = 'PORTLAND' AND notes LIKE '%04%';

-- Oregon cities (using zip code patterns in notes)
UPDATE clinics SET latitude = 45.5152, longitude = -122.6784 
WHERE city = 'PORTLAND' AND notes LIKE '%97%';

-- Texas cities
UPDATE clinics SET latitude = 29.7604, longitude = -95.3698 
WHERE city = 'HOUSTON' AND notes LIKE '%77%';

UPDATE clinics SET latitude = 32.7767, longitude = -96.7970 
WHERE city = 'DALLAS' AND notes LIKE '%75%';

UPDATE clinics SET latitude = 33.4484, longitude = -112.0740 
WHERE city = 'PHOENIX' AND notes LIKE '%85%';

-- Illinois cities
UPDATE clinics SET latitude = 39.7817, longitude = -89.6501 
WHERE city = 'SPRINGFIELD' AND notes LIKE '%62%';

UPDATE clinics SET latitude = 41.8781, longitude = -87.6298 
WHERE city = 'CHICAGO' AND notes LIKE '%60%';

-- Ohio cities  
UPDATE clinics SET latitude = 39.9612, longitude = -82.9988 
WHERE city = 'COLUMBUS' AND notes LIKE '%43%';

UPDATE clinics SET latitude = 41.4993, longitude = -81.6944 
WHERE city = 'CLEVELAND' AND notes LIKE '%44%';

-- Georgia cities
UPDATE clinics SET latitude = 33.7490, longitude = -84.3880 
WHERE city = 'ATLANTA' AND notes LIKE '%30%';

UPDATE clinics SET latitude = 32.4609, longitude = -84.1557 
WHERE city = 'COLUMBUS' AND notes LIKE '%31%';

-- Virginia cities
UPDATE clinics SET latitude = 38.8048, longitude = -77.0469 
WHERE city = 'ALEXANDRIA' AND notes LIKE '%22%';

UPDATE clinics SET latitude = 37.5407, longitude = -77.4360 
WHERE city = 'RICHMOND' AND notes LIKE '%23%';

-- North Carolina cities
UPDATE clinics SET latitude = 35.2271, longitude = -80.8431 
WHERE city = 'CHARLOTTE' AND notes LIKE '%28%';

-- Pennsylvania cities
UPDATE clinics SET latitude = 39.9526, longitude = -75.1652 
WHERE city = 'PHILADELPHIA' AND notes LIKE '%19%';

-- New York cities
UPDATE clinics SET latitude = 40.7128, longitude = -74.0060 
WHERE city = 'NEW YORK' AND notes LIKE '%10%';

-- Florida cities
UPDATE clinics SET latitude = 25.7617, longitude = -80.1918 
WHERE city = 'MIAMI' AND notes LIKE '%33%';

-- Step 4: For remaining NULL coordinates, assign based on most populous city with that name
UPDATE clinics SET latitude = 43.0731, longitude = -89.4012 
WHERE city = 'MADISON' AND latitude IS NULL;

UPDATE clinics SET latitude = 45.5152, longitude = -122.6784 
WHERE city = 'PORTLAND' AND latitude IS NULL;

UPDATE clinics SET latitude = 39.7817, longitude = -89.6501 
WHERE city = 'SPRINGFIELD' AND latitude IS NULL;

UPDATE clinics SET latitude = 39.9612, longitude = -82.9988 
WHERE city = 'COLUMBUS' AND latitude IS NULL;

UPDATE clinics SET latitude = 38.8048, longitude = -77.0469 
WHERE city = 'ALEXANDRIA' AND latitude IS NULL;

UPDATE clinics SET latitude = 42.0868, longitude = -83.2023 
WHERE city = 'FRANKLIN' AND latitude IS NULL;

UPDATE clinics SET latitude = 40.7989, longitude = -81.3784 
WHERE city = 'CANTON' AND latitude IS NULL;

-- Step 5: Restore NOT NULL constraints
ALTER TABLE clinics ALTER COLUMN latitude SET NOT NULL;
ALTER TABLE clinics ALTER COLUMN longitude SET NOT NULL;

-- Step 6: Delete any remaining clinics with NULL coordinates (shouldn't be any)
DELETE FROM clinics WHERE latitude IS NULL OR longitude IS NULL;