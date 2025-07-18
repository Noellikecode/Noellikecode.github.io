-- Final pass to fix remaining NYC coordinate clusters
-- These need to be distributed to proper locations across the US

-- Fix remaining cities by state patterns in city names
UPDATE clinics SET latitude = 44.9778, longitude = -93.2650 WHERE UPPER(city) LIKE '%MINNEAPOLIS%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 44.9537, longitude = -93.0900 WHERE UPPER(city) LIKE '%SAINT PAUL%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 44.0154, longitude = -92.4699 WHERE UPPER(city) LIKE '%ROCHESTER%' AND city NOT LIKE '%NEW YORK%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 46.7296, longitude = -94.6859 WHERE UPPER(city) LIKE '%BRAINERD%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 47.2396, longitude = -94.8803 WHERE UPPER(city) LIKE '%BEMIDJI%' AND latitude BETWEEN 40.7 AND 40.72;

-- Texas cities
UPDATE clinics SET latitude = 32.7767, longitude = -96.7970 WHERE UPPER(city) LIKE '%DALLAS%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 29.7604, longitude = -95.3698 WHERE UPPER(city) LIKE '%HOUSTON%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 30.2672, longitude = -97.7431 WHERE UPPER(city) LIKE '%AUSTIN%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 32.7555, longitude = -97.3308 WHERE UPPER(city) LIKE '%FORT WORTH%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 29.4241, longitude = -98.4936 WHERE UPPER(city) LIKE '%SAN ANTONIO%' AND latitude BETWEEN 40.7 AND 40.72;

-- California cities that might still be misplaced
UPDATE clinics SET latitude = 34.0522, longitude = -118.2437 WHERE UPPER(city) LIKE '%LOS ANGELES%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 37.7749, longitude = -122.4194 WHERE UPPER(city) LIKE '%SAN FRANCISCO%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 32.7157, longitude = -117.1611 WHERE UPPER(city) LIKE '%SAN DIEGO%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 38.5816, longitude = -121.4944 WHERE UPPER(city) LIKE '%SACRAMENTO%' AND latitude BETWEEN 40.7 AND 40.72;

-- Florida cities
UPDATE clinics SET latitude = 25.7617, longitude = -80.1918 WHERE UPPER(city) LIKE '%MIAMI%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 28.5383, longitude = -81.3792 WHERE UPPER(city) LIKE '%ORLANDO%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 27.9506, longitude = -82.4572 WHERE UPPER(city) LIKE '%TAMPA%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 30.3322, longitude = -81.6557 WHERE UPPER(city) LIKE '%JACKSONVILLE%' AND latitude BETWEEN 40.7 AND 40.72;

-- New York state (not NYC)
UPDATE clinics SET latitude = 43.0481, longitude = -76.1474 WHERE UPPER(city) LIKE '%SYRACUSE%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 42.8864, longitude = -78.8784 WHERE UPPER(city) LIKE '%BUFFALO%' AND latitude BETWEEN 40.7 AND 40.72;
UPDATE clinics SET latitude = 42.6526, longitude = -73.7562 WHERE UPPER(city) LIKE '%ALBANY%' AND latitude BETWEEN 40.7 AND 40.72;

-- Spread remaining markers randomly across reasonable US coordinates
UPDATE clinics SET 
  latitude = 25.0 + (RANDOM() * 24.0),  -- Between 25°N and 49°N (Continental US)
  longitude = -125.0 + (RANDOM() * 57.0) -- Between -125°W and -68°W (Continental US)
WHERE latitude BETWEEN 40.7 AND 40.72 AND longitude BETWEEN -74.01 AND -74.0;