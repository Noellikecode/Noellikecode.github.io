-- Comprehensive coordinate fix for major US cities using accurate lat/lng data

-- Major California cities
UPDATE clinics SET latitude = 34.0522, longitude = -118.2437 WHERE UPPER(city) LIKE '%LOS ANGELES%' OR UPPER(city) LIKE '%LA%';
UPDATE clinics SET latitude = 37.7749, longitude = -122.4194 WHERE UPPER(city) LIKE '%SAN FRANCISCO%';
UPDATE clinics SET latitude = 32.7157, longitude = -117.1611 WHERE UPPER(city) LIKE '%SAN DIEGO%';
UPDATE clinics SET latitude = 38.5816, longitude = -121.4944 WHERE UPPER(city) LIKE '%SACRAMENTO%';
UPDATE clinics SET latitude = 37.3382, longitude = -121.8863 WHERE UPPER(city) LIKE '%SAN JOSE%';
UPDATE clinics SET latitude = 33.8366, longitude = -117.9143 WHERE UPPER(city) LIKE '%ANAHEIM%';
UPDATE clinics SET latitude = 34.1478, longitude = -118.1445 WHERE UPPER(city) LIKE '%PASADENA%';

-- Texas cities
UPDATE clinics SET latitude = 29.7604, longitude = -95.3698 WHERE UPPER(city) LIKE '%HOUSTON%';
UPDATE clinics SET latitude = 32.7767, longitude = -96.7970 WHERE UPPER(city) LIKE '%DALLAS%';
UPDATE clinics SET latitude = 29.4241, longitude = -98.4936 WHERE UPPER(city) LIKE '%SAN ANTONIO%';
UPDATE clinics SET latitude = 30.2672, longitude = -97.7431 WHERE UPPER(city) LIKE '%AUSTIN%';
UPDATE clinics SET latitude = 32.7555, longitude = -97.3308 WHERE UPPER(city) LIKE '%FORT WORTH%';
UPDATE clinics SET latitude = 31.7619, longitude = -106.4850 WHERE UPPER(city) LIKE '%EL PASO%';

-- Florida cities
UPDATE clinics SET latitude = 25.7617, longitude = -80.1918 WHERE UPPER(city) LIKE '%MIAMI%';
UPDATE clinics SET latitude = 30.3322, longitude = -81.6557 WHERE UPPER(city) LIKE '%JACKSONVILLE%';
UPDATE clinics SET latitude = 27.9506, longitude = -82.4572 WHERE UPPER(city) LIKE '%TAMPA%';
UPDATE clinics SET latitude = 28.5383, longitude = -81.3792 WHERE UPPER(city) LIKE '%ORLANDO%';
UPDATE clinics SET latitude = 26.1224, longitude = -80.1373 WHERE UPPER(city) LIKE '%FORT LAUDERDALE%';

-- New York state cities (NOT NYC)
UPDATE clinics SET latitude = 42.8864, longitude = -78.8784 WHERE UPPER(city) LIKE '%BUFFALO%';
UPDATE clinics SET latitude = 43.0481, longitude = -76.1474 WHERE UPPER(city) LIKE '%SYRACUSE%';
UPDATE clinics SET latitude = 42.6526, longitude = -73.7562 WHERE UPPER(city) LIKE '%ALBANY%';
UPDATE clinics SET latitude = 43.1009, longitude = -77.6109 WHERE UPPER(city) LIKE '%ROCHESTER%' AND UPPER(city) NOT LIKE '%NEW YORK%';

-- Illinois cities
UPDATE clinics SET latitude = 41.8781, longitude = -87.6298 WHERE UPPER(city) LIKE '%CHICAGO%';
UPDATE clinics SET latitude = 39.7817, longitude = -89.6501 WHERE UPPER(city) LIKE '%SPRINGFIELD%' AND country = 'United States';

-- Ohio cities
UPDATE clinics SET latitude = 39.9612, longitude = -82.9988 WHERE UPPER(city) LIKE '%COLUMBUS%' AND country = 'United States';
UPDATE clinics SET latitude = 41.4993, longitude = -81.6944 WHERE UPPER(city) LIKE '%CLEVELAND%';
UPDATE clinics SET latitude = 39.1031, longitude = -84.5120 WHERE UPPER(city) LIKE '%CINCINNATI%';

-- Michigan cities
UPDATE clinics SET latitude = 42.3314, longitude = -83.0458 WHERE UPPER(city) LIKE '%DETROIT%';

-- Pennsylvania cities
UPDATE clinics SET latitude = 39.9526, longitude = -75.1652 WHERE UPPER(city) LIKE '%PHILADELPHIA%';
UPDATE clinics SET latitude = 40.4406, longitude = -79.9959 WHERE UPPER(city) LIKE '%PITTSBURGH%';

-- Georgia cities
UPDATE clinics SET latitude = 33.7490, longitude = -84.3880 WHERE UPPER(city) LIKE '%ATLANTA%';

-- North Carolina cities
UPDATE clinics SET latitude = 35.2271, longitude = -80.8431 WHERE UPPER(city) LIKE '%CHARLOTTE%';
UPDATE clinics SET latitude = 35.7796, longitude = -78.6382 WHERE UPPER(city) LIKE '%RALEIGH%';

-- Washington state cities
UPDATE clinics SET latitude = 47.6062, longitude = -122.3321 WHERE UPPER(city) LIKE '%SEATTLE%';
UPDATE clinics SET latitude = 47.2529, longitude = -122.4443 WHERE UPPER(city) LIKE '%TACOMA%';

-- Oregon cities  
UPDATE clinics SET latitude = 45.5152, longitude = -122.6784 WHERE UPPER(city) LIKE '%PORTLAND%' AND country = 'United States';

-- Colorado cities
UPDATE clinics SET latitude = 39.7392, longitude = -104.9903 WHERE UPPER(city) LIKE '%DENVER%';

-- Arizona cities
UPDATE clinics SET latitude = 33.4484, longitude = -112.0740 WHERE UPPER(city) LIKE '%PHOENIX%';
UPDATE clinics SET latitude = 32.2226, longitude = -110.9747 WHERE UPPER(city) LIKE '%TUCSON%';

-- Nevada cities
UPDATE clinics SET latitude = 36.1699, longitude = -115.1398 WHERE UPPER(city) LIKE '%LAS VEGAS%';
UPDATE clinics SET latitude = 39.5296, longitude = -119.8138 WHERE UPPER(city) LIKE '%RENO%';

-- Utah cities
UPDATE clinics SET latitude = 40.7608, longitude = -111.8910 WHERE UPPER(city) LIKE '%SALT LAKE%';

-- Louisiana cities
UPDATE clinics SET latitude = 29.9511, longitude = -90.0715 WHERE UPPER(city) LIKE '%NEW ORLEANS%';
UPDATE clinics SET latitude = 30.4515, longitude = -91.1871 WHERE UPPER(city) LIKE '%BATON ROUGE%';

-- Tennessee cities
UPDATE clinics SET latitude = 36.1627, longitude = -86.7816 WHERE UPPER(city) LIKE '%NASHVILLE%';
UPDATE clinics SET latitude = 35.1495, longitude = -90.0490 WHERE UPPER(city) LIKE '%MEMPHIS%';

-- Kentucky cities
UPDATE clinics SET latitude = 38.2527, longitude = -85.7585 WHERE UPPER(city) LIKE '%LOUISVILLE%';

-- Indiana cities
UPDATE clinics SET latitude = 39.7684, longitude = -86.1581 WHERE UPPER(city) LIKE '%INDIANAPOLIS%';

-- Missouri cities
UPDATE clinics SET latitude = 39.0458, longitude = -94.5795 WHERE UPPER(city) LIKE '%KANSAS CITY%' AND country = 'United States';
UPDATE clinics SET latitude = 38.6270, longitude = -90.1994 WHERE UPPER(city) LIKE '%ST LOUIS%';
UPDATE clinics SET latitude = 38.9517, longitude = -92.3341 WHERE UPPER(city) LIKE '%COLUMBIA%' AND country = 'United States';

-- Wisconsin cities
UPDATE clinics SET latitude = 43.0389, longitude = -87.9065 WHERE UPPER(city) LIKE '%MILWAUKEE%';

-- Minnesota cities
UPDATE clinics SET latitude = 44.9778, longitude = -93.2650 WHERE UPPER(city) LIKE '%MINNEAPOLIS%';
UPDATE clinics SET latitude = 44.9537, longitude = -93.0900 WHERE UPPER(city) LIKE '%SAINT PAUL%' OR UPPER(city) LIKE '%ST PAUL%';

-- Alabama cities
UPDATE clinics SET latitude = 33.5186, longitude = -86.8104 WHERE UPPER(city) LIKE '%BIRMINGHAM%' AND country = 'United States';

-- South Carolina cities
UPDATE clinics SET latitude = 32.7765, longitude = -79.9311 WHERE UPPER(city) LIKE '%CHARLESTON%' AND country = 'United States';

-- Oklahoma cities
UPDATE clinics SET latitude = 35.4676, longitude = -97.5164 WHERE UPPER(city) LIKE '%OKLAHOMA CITY%';
UPDATE clinics SET latitude = 36.1540, longitude = -95.9928 WHERE UPPER(city) LIKE '%TULSA%';

-- Kansas cities
UPDATE clinics SET latitude = 39.1142, longitude = -94.6275 WHERE UPPER(city) LIKE '%OVERLAND PARK%';

-- Iowa cities
UPDATE clinics SET latitude = 41.5868, longitude = -93.6250 WHERE UPPER(city) LIKE '%DES MOINES%';

-- Arkansas cities
UPDATE clinics SET latitude = 34.7465, longitude = -92.2896 WHERE UPPER(city) LIKE '%LITTLE ROCK%';

-- Mississippi cities
UPDATE clinics SET latitude = 32.2988, longitude = -90.1848 WHERE UPPER(city) LIKE '%JACKSON%' AND country = 'United States';

-- New Mexico cities
UPDATE clinics SET latitude = 35.0844, longitude = -106.6504 WHERE UPPER(city) LIKE '%ALBUQUERQUE%';

-- Idaho cities
UPDATE clinics SET latitude = 43.6150, longitude = -116.2023 WHERE UPPER(city) LIKE '%BOISE%';

-- Montana cities
UPDATE clinics SET latitude = 45.7833, longitude = -108.5007 WHERE UPPER(city) LIKE '%BILLINGS%';

-- Wyoming cities
UPDATE clinics SET latitude = 41.1400, longitude = -104.8197 WHERE UPPER(city) LIKE '%CHEYENNE%';

-- North Dakota cities  
UPDATE clinics SET latitude = 46.8083, longitude = -100.7837 WHERE UPPER(city) LIKE '%BISMARCK%';
UPDATE clinics SET latitude = 46.8772, longitude = -96.7898 WHERE UPPER(city) LIKE '%FARGO%';

-- South Dakota cities
UPDATE clinics SET latitude = 43.5460, longitude = -96.7313 WHERE UPPER(city) LIKE '%SIOUX FALLS%';
UPDATE clinics SET latitude = 44.3683, longitude = -100.3510 WHERE UPPER(city) LIKE '%PIERRE%';

-- Nebraska cities
UPDATE clinics SET latitude = 41.2565, longitude = -95.9345 WHERE UPPER(city) LIKE '%OMAHA%';
UPDATE clinics SET latitude = 40.8136, longitude = -96.7026 WHERE UPPER(city) LIKE '%LINCOLN%' AND country = 'United States';

-- Alaska cities (proper Alaska coordinates)
UPDATE clinics SET latitude = 61.2181, longitude = -149.9003 WHERE UPPER(city) LIKE '%ANCHORAGE%';
UPDATE clinics SET latitude = 64.8378, longitude = -147.7164 WHERE UPPER(city) LIKE '%FAIRBANKS%';

-- Hawaii cities (proper Hawaii coordinates)
UPDATE clinics SET latitude = 21.3099, longitude = -157.8581 WHERE UPPER(city) LIKE '%HONOLULU%';

-- Connecticut cities
UPDATE clinics SET latitude = 41.7658, longitude = -72.6734 WHERE UPPER(city) LIKE '%HARTFORD%';

-- Maryland cities
UPDATE clinics SET latitude = 39.2904, longitude = -76.6122 WHERE UPPER(city) LIKE '%BALTIMORE%';

-- Massachusetts cities
UPDATE clinics SET latitude = 42.3601, longitude = -71.0589 WHERE UPPER(city) LIKE '%BOSTON%';

-- Maine cities
UPDATE clinics SET latitude = 43.6591, longitude = -70.2568 WHERE UPPER(city) LIKE '%PORTLAND%' AND country = 'United States';

-- New Hampshire cities
UPDATE clinics SET latitude = 43.2081, longitude = -71.5376 WHERE UPPER(city) LIKE '%MANCHESTER%' AND country = 'United States';

-- Vermont cities
UPDATE clinics SET latitude = 44.2601, longitude = -72.5806 WHERE UPPER(city) LIKE '%MONTPELIER%';

-- Rhode Island cities
UPDATE clinics SET latitude = 41.8240, longitude = -71.4128 WHERE UPPER(city) LIKE '%PROVIDENCE%';

-- Delaware cities
UPDATE clinics SET latitude = 39.7391, longitude = -75.5398 WHERE UPPER(city) LIKE '%WILMINGTON%' AND country = 'United States';

-- West Virginia cities
UPDATE clinics SET latitude = 38.3498, longitude = -81.6326 WHERE UPPER(city) LIKE '%CHARLESTON%' AND country = 'United States';

-- Virginia cities
UPDATE clinics SET latitude = 36.8508, longitude = -75.9776 WHERE UPPER(city) LIKE '%VIRGINIA BEACH%';
UPDATE clinics SET latitude = 37.5407, longitude = -77.4360 WHERE UPPER(city) LIKE '%RICHMOND%' AND country = 'United States';