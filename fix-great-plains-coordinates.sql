-- Fix Great Plains cities that are showing as NYC coordinates
UPDATE clinics SET latitude = 46.8772, longitude = -96.7898 WHERE UPPER(city) LIKE '%FARGO%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 46.8747, longitude = -96.9003 WHERE UPPER(city) LIKE '%WEST FARGO%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 43.5446, longitude = -96.7311 WHERE UPPER(city) LIKE '%SIOUX FALLS%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 46.8083, longitude = -100.7837 WHERE UPPER(city) LIKE '%BISMARCK%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 47.9253, longitude = -97.0329 WHERE UPPER(city) LIKE '%GRAND FORKS%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 48.2330, longitude = -101.2957 WHERE UPPER(city) LIKE '%MINOT%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 44.0805, longitude = -103.2310 WHERE UPPER(city) LIKE '%RAPID CITY%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 45.4647, longitude = -98.4865 WHERE UPPER(city) LIKE '%ABERDEEN%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 44.3114, longitude = -96.7984 WHERE UPPER(city) LIKE '%BROOKINGS%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 42.4739, longitude = -96.4131 WHERE UPPER(city) LIKE '%SOUTH SIOUX%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 41.2565, longitude = -95.9345 WHERE UPPER(city) LIKE '%OMAHA%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 40.8136, longitude = -96.7026 WHERE UPPER(city) LIKE '%LINCOLN%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 41.1370, longitude = -95.9145 WHERE UPPER(city) LIKE '%BELLEVUE%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 40.9264, longitude = -98.3420 WHERE UPPER(city) LIKE '%GRAND ISLAND%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 40.6994, longitude = -99.0817 WHERE UPPER(city) LIKE '%KEARNEY%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 37.6872, longitude = -97.3301 WHERE UPPER(city) LIKE '%WICHITA%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 38.9822, longitude = -94.6708 WHERE UPPER(city) LIKE '%OVERLAND PARK%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 38.8814, longitude = -94.8191 WHERE UPPER(city) LIKE '%OLATHE%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 39.0473, longitude = -95.6890 WHERE UPPER(city) LIKE '%TOPEKA%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 38.9717, longitude = -95.2353 WHERE UPPER(city) LIKE '%LAWRENCE%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 39.1836, longitude = -96.5717 WHERE UPPER(city) LIKE '%MANHATTAN%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 38.8403, longitude = -97.6114 WHERE UPPER(city) LIKE '%SALINA%' AND latitude BETWEEN 40.7 AND 40.72;

-- Add random variation to prevent exact overlaps
UPDATE clinics SET 
  latitude = latitude + (RANDOM() - 0.5) * 0.01,
  longitude = longitude + (RANDOM() - 0.5) * 0.01
WHERE latitude NOT BETWEEN 40.7 AND 40.72;