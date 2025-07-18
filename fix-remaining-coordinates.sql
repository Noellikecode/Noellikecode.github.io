-- Fix remaining cities that are still showing as NYC coordinates
UPDATE clinics SET latitude = 39.7391, longitude = -104.9903 WHERE UPPER(city) LIKE '%DENVER%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 39.7817, longitude = -89.6501 WHERE UPPER(city) LIKE '%SPRINGFIELD%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 30.2672, longitude = -97.7431 WHERE UPPER(city) LIKE '%AUSTIN%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 32.7767, longitude = -96.7970 WHERE UPPER(city) LIKE '%DALLAS%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 29.7604, longitude = -95.3698 WHERE UPPER(city) LIKE '%HOUSTON%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 29.4241, longitude = -98.4936 WHERE UPPER(city) LIKE '%SAN ANTONIO%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 32.2217, longitude = -110.9265 WHERE UPPER(city) LIKE '%TUCSON%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 33.4484, longitude = -112.0740 WHERE UPPER(city) LIKE '%PHOENIX%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 39.7391, longitude = -104.9903 WHERE UPPER(city) LIKE '%LAKEWOOD%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 40.0150, longitude = -105.2705 WHERE UPPER(city) LIKE '%BOULDER%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 38.8339, longitude = -104.8214 WHERE UPPER(city) LIKE '%COLORADO SPRINGS%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 39.5501, longitude = -105.7821 WHERE UPPER(city) LIKE '%ARVADA%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 39.8561, longitude = -104.6737 WHERE UPPER(city) LIKE '%AURORA%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 40.3178, longitude = -111.8910 WHERE UPPER(city) LIKE '%SALT LAKE%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 40.7608, longitude = -111.8910 WHERE UPPER(city) LIKE '%WEST VALLEY%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 40.2677, longitude = -111.6946 WHERE UPPER(city) LIKE '%PROVO%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 41.2033, longitude = -111.9738 WHERE UPPER(city) LIKE '%OGDEN%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 36.1627, longitude = -115.1099 WHERE UPPER(city) LIKE '%LAS VEGAS%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 39.5296, longitude = -119.8138 WHERE UPPER(city) LIKE '%RENO%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 38.9072, longitude = -77.0369 WHERE UPPER(city) LIKE '%WASHINGTON%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 39.2904, longitude = -76.6122 WHERE UPPER(city) LIKE '%BALTIMORE%' AND latitude BETWEEN 40.7 AND 40.72;

-- Add more random variation to prevent exact overlaps
UPDATE clinics SET 
  latitude = latitude + (RANDOM() - 0.5) * 0.005,
  longitude = longitude + (RANDOM() - 0.5) * 0.005
WHERE id IN (SELECT id FROM clinics ORDER BY RANDOM() LIMIT 500);