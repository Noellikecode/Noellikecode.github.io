-- Fix specific Midwest cities that are showing as NYC coordinates
UPDATE clinics SET latitude = 41.8781, longitude = -87.6298 WHERE UPPER(city) LIKE '%CHICAGO%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 43.0389, longitude = -87.9065 WHERE UPPER(city) LIKE '%MILWAUKEE%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 42.3314, longitude = -83.0458 WHERE UPPER(city) LIKE '%DETROIT%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 39.7684, longitude = -86.1581 WHERE UPPER(city) LIKE '%INDIANAPOLIS%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 39.9612, longitude = -82.9988 WHERE UPPER(city) LIKE '%COLUMBUS%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 41.4993, longitude = -81.6944 WHERE UPPER(city) LIKE '%CLEVELAND%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 39.1031, longitude = -84.5120 WHERE UPPER(city) LIKE '%CINCINNATI%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 38.6270, longitude = -90.1994 WHERE UPPER(city) LIKE '%ST%LOUIS%' OR UPPER(city) LIKE '%SAINT%LOUIS%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 39.0997, longitude = -94.5786 WHERE UPPER(city) LIKE '%KANSAS%CITY%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 44.9778, longitude = -93.2650 WHERE UPPER(city) LIKE '%MINNEAPOLIS%' AND latitude BETWEEN 40.7 AND 40.72;

-- Add slight random variation to prevent exact overlaps
UPDATE clinics SET 
  latitude = latitude + (RANDOM() - 0.5) * 0.01,
  longitude = longitude + (RANDOM() - 0.5) * 0.01
WHERE latitude NOT BETWEEN 40.7 AND 40.72;