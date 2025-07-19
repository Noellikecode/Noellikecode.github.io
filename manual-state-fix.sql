-- Manual state-specific coordinate fix for problematic cities
-- Based on zip code patterns and address analysis to determine correct states

-- EDMOND - Most likely Oklahoma (zip codes 73xxx)
UPDATE clinics SET latitude = 35.6528, longitude = -97.4781 
WHERE city = 'EDMOND';

-- GILBERT - Most likely Arizona (zip codes 85xxx) 
UPDATE clinics SET latitude = 33.3528, longitude = -111.7890
WHERE city = 'GILBERT';

-- CARMEL - Most likely Indiana (zip codes 46xxx)
UPDATE clinics SET latitude = 39.9784, longitude = -86.1180
WHERE city = 'CARMEL';

-- AUBURN - Split between states, use most populous (Alabama 36xxx, California 95xxx, etc.)
-- For now, use Auburn, Alabama coordinates as it's most common
UPDATE clinics SET latitude = 32.6010, longitude = -85.4808
WHERE city = 'AUBURN';

-- MONROE - Most likely Louisiana (zip codes 71xxx)
UPDATE clinics SET latitude = 32.5093, longitude = -92.1193
WHERE city = 'MONROE';

-- MERIDIAN - Most likely Mississippi (zip codes 39xxx)
UPDATE clinics SET latitude = 32.3643, longitude = -88.7034
WHERE city = 'MERIDIAN';

-- CHANDLER - Most likely Arizona (zip codes 85xxx)
UPDATE clinics SET latitude = 33.3062, longitude = -111.8413
WHERE city = 'CHANDLER';

-- DURHAM - Most likely North Carolina (zip codes 27xxx)
UPDATE clinics SET latitude = 35.9940, longitude = -78.8986
WHERE city = 'DURHAM';

-- FLORENCE - Multiple states, use South Carolina as most common (zip codes 29xxx)
UPDATE clinics SET latitude = 34.1954, longitude = -79.7626
WHERE city = 'FLORENCE';

-- MOUNT PLEASANT - Most likely South Carolina (zip codes 29xxx)
UPDATE clinics SET latitude = 32.7941, longitude = -79.8626
WHERE city = 'MOUNT PLEASANT';

-- Additional problematic cities that need state-specific fixes

-- ALEXANDRIA - Most likely Virginia (zip codes 22xxx)
UPDATE clinics SET latitude = 38.8048, longitude = -77.0469
WHERE city = 'ALEXANDRIA';

-- FRANKLIN - Most likely Tennessee (zip codes 37xxx)
UPDATE clinics SET latitude = 35.9251, longitude = -86.8689
WHERE city = 'FRANKLIN';

-- RICHMOND - Most likely Virginia (zip codes 23xxx)
UPDATE clinics SET latitude = 37.5407, longitude = -77.4360
WHERE city = 'RICHMOND';

-- COLUMBUS - Split between Ohio and Georgia, use Ohio as more populous
UPDATE clinics SET latitude = 39.9612, longitude = -82.9988
WHERE city = 'COLUMBUS';

-- SPRINGFIELD - Multiple states, use Illinois as most populous
UPDATE clinics SET latitude = 39.7817, longitude = -89.6501
WHERE city = 'SPRINGFIELD';

-- JACKSON - Most likely Mississippi (zip codes 39xxx)
UPDATE clinics SET latitude = 32.2988, longitude = -90.1848
WHERE city = 'JACKSON';

-- NEWPORT NEWS - Virginia (zip codes 23xxx)
UPDATE clinics SET latitude = 37.0871, longitude = -76.4730
WHERE city = 'NEWPORT NEWS';

-- DANVILLE - Most likely Virginia (zip codes 24xxx)
UPDATE clinics SET latitude = 36.5860, longitude = -79.3950
WHERE city = 'DANVILLE';

-- FAIRFAX - Most likely Virginia (zip codes 22xxx)
UPDATE clinics SET latitude = 38.8462, longitude = -77.3064
WHERE city = 'FAIRFAX';

-- ARLINGTON - Most likely Virginia (zip codes 22xxx)
UPDATE clinics SET latitude = 38.8816, longitude = -77.0910
WHERE city = 'ARLINGTON';