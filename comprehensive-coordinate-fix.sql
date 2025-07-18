-- Comprehensive coordinate fix for cities that exist in multiple states
-- Need to handle ambiguous city names more carefully

-- Reset LAKEWOOD to Ohio coordinates (most common in NPI data)
UPDATE clinics SET latitude = 41.4820, longitude = -81.7982 
WHERE city = 'LAKEWOOD' AND country = 'United States';

-- Fix COLUMBIA (multiple states)
-- Columbia, Missouri (most common)
UPDATE clinics SET latitude = 38.9517, longitude = -92.3341 
WHERE city = 'COLUMBIA' AND country = 'United States';

-- Fix FAYETTEVILLE (multiple states) 
-- Fayetteville, Arkansas (most common)
UPDATE clinics SET latitude = 36.0729, longitude = -94.1574 
WHERE city = 'FAYETTEVILLE' AND country = 'United States';

-- Fix CHARLESTON (multiple states)
-- Charleston, South Carolina (most common)
UPDATE clinics SET latitude = 32.7765, longitude = -79.9311 
WHERE city = 'CHARLESTON' AND country = 'United States';

-- Fix KNOXVILLE (should be Tennessee)
UPDATE clinics SET latitude = 35.9606, longitude = -83.9207 
WHERE city = 'KNOXVILLE' AND country = 'United States';

-- Fix BOISE (should be Idaho)
UPDATE clinics SET latitude = 43.6150, longitude = -116.2023 
WHERE city = 'BOISE' AND country = 'United States';

-- Fix RENO (should be Nevada)
UPDATE clinics SET latitude = 39.5296, longitude = -119.8138 
WHERE city = 'RENO' AND country = 'United States';

-- Fix HENDERSON (should be Nevada)
UPDATE clinics SET latitude = 36.0395, longitude = -114.9817 
WHERE city = 'HENDERSON' AND country = 'United States';

-- Fix MANCHESTER (likely New Hampshire)
UPDATE clinics SET latitude = 43.2081, longitude = -71.5376 
WHERE city = 'MANCHESTER' AND country = 'United States';

-- Fix RICHMOND (likely Virginia)
UPDATE clinics SET latitude = 37.5407, longitude = -77.4360 
WHERE city = 'RICHMOND' AND country = 'United States';

-- Fix LINCOLN (likely Nebraska)
UPDATE clinics SET latitude = 40.8136, longitude = -96.7026 
WHERE city = 'LINCOLN' AND country = 'United States';

-- Fix JACKSON (likely Mississippi)
UPDATE clinics SET latitude = 32.2988, longitude = -90.1848 
WHERE city = 'JACKSON' AND country = 'United States';

-- Fix BIRMINGHAM (likely Alabama)
UPDATE clinics SET latitude = 33.5186, longitude = -86.8104 
WHERE city = 'BIRMINGHAM' AND country = 'United States';

-- Fix WILMINGTON (likely Delaware)
UPDATE clinics SET latitude = 39.7391, longitude = -75.5398 
WHERE city = 'WILMINGTON' AND country = 'United States';

-- Fix SPRINGFIELD (likely Illinois - most populous)
UPDATE clinics SET latitude = 39.7817, longitude = -89.6501 
WHERE city = 'SPRINGFIELD' AND country = 'United States';

-- Fix ROCHESTER (likely New York)
UPDATE clinics SET latitude = 43.1566, longitude = -77.6088 
WHERE city = 'ROCHESTER' AND country = 'United States';

-- Fix COLUMBUS (likely Ohio)
UPDATE clinics SET latitude = 39.9612, longitude = -82.9988 
WHERE city = 'COLUMBUS' AND country = 'United States';

-- Fix PORTLAND (likely Oregon)
UPDATE clinics SET latitude = 45.5152, longitude = -122.6784 
WHERE city = 'PORTLAND' AND country = 'United States';