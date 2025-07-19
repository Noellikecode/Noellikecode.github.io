-- Emergency fix for major coordinate misplacements using accurate coordinates

-- Michigan cities (were scattered across other states)
UPDATE clinics SET latitude = 42.7370, longitude = -84.4839 WHERE city = 'EAST LANSING';
UPDATE clinics SET latitude = 42.3314, longitude = -84.5951 WHERE city = 'ANN ARBOR';
UPDATE clinics SET latitude = 42.9634, longitude = -85.6681 WHERE city = 'GRAND RAPIDS';
UPDATE clinics SET latitude = 42.2917, longitude = -85.5872 WHERE city = 'KALAMAZOO';
UPDATE clinics SET latitude = 42.7369, longitude = -84.5555 WHERE city = 'LANSING';
UPDATE clinics SET latitude = 42.4534, longitude = -84.0733 WHERE city = 'LIVONIA';
UPDATE clinics SET latitude = 42.5803, longitude = -83.0302 WHERE city = 'STERLING HEIGHTS';
UPDATE clinics SET latitude = 42.3912, longitude = -84.8755 WHERE city = 'NOVI';
UPDATE clinics SET latitude = 42.4668, longitude = -83.2119 WHERE city = 'TROY';
UPDATE clinics SET latitude = 42.5047, longitude = -83.7264 WHERE city = 'FARMINGTON HILLS';

-- New York cities (likely misplaced)
UPDATE clinics SET latitude = 40.7128, longitude = -74.0060 WHERE city = 'NEW YORK';
UPDATE clinics SET latitude = 40.6892, longitude = -74.0445 WHERE city = 'BROOKLYN';
UPDATE clinics SET latitude = 40.7505, longitude = -73.8365 WHERE city = 'QUEENS';
UPDATE clinics SET latitude = 40.8152, longitude = -73.8779 WHERE city = 'BRONX';
UPDATE clinics SET latitude = 40.5795, longitude = -74.1502 WHERE city = 'STATEN ISLAND';
UPDATE clinics SET latitude = 42.6526, longitude = -73.7562 WHERE city = 'ALBANY';
UPDATE clinics SET latitude = 43.0481, longitude = -76.1474 WHERE city = 'SYRACUSE';
UPDATE clinics SET latitude = 43.2081, longitude = -77.6109 WHERE city = 'ROCHESTER';
UPDATE clinics SET latitude = 42.8864, longitude = -78.8784 WHERE city = 'BUFFALO';
UPDATE clinics SET latitude = 40.9176, longitude = -72.8012 WHERE city = 'PATCHOGUE';

-- Illinois cities (Chicago area)
UPDATE clinics SET latitude = 41.8781, longitude = -87.6298 WHERE city = 'CHICAGO';
UPDATE clinics SET latitude = 42.0451, longitude = -87.6877 WHERE city = 'EVANSTON';
UPDATE clinics SET latitude = 41.8369, longitude = -87.8847 WHERE city = 'OAK PARK';
UPDATE clinics SET latitude = 42.0667, longitude = -87.8040 WHERE city = 'SKOKIE';
UPDATE clinics SET latitude = 41.7658, longitude = -88.3201 WHERE city = 'NAPERVILLE';
UPDATE clinics SET latitude = 41.8806, longitude = -88.0814 WHERE city = 'LOMBARD';
UPDATE clinics SET latitude = 41.8789, longitude = -87.9937 WHERE city = 'ELMHURST';

-- Ohio cities
UPDATE clinics SET latitude = 39.9612, longitude = -82.9988 WHERE city = 'COLUMBUS';
UPDATE clinics SET latitude = 41.4993, longitude = -81.6944 WHERE city = 'CLEVELAND';
UPDATE clinics SET latitude = 39.1031, longitude = -84.5120 WHERE city = 'CINCINNATI';
UPDATE clinics SET latitude = 40.4173, longitude = -82.9071 WHERE city = 'MANSFIELD';
UPDATE clinics SET latitude = 41.0732, longitude = -81.5179 WHERE city = 'AKRON';
UPDATE clinics SET latitude = 39.7589, longitude = -84.1916 WHERE city = 'DAYTON';
UPDATE clinics SET latitude = 41.6528, longitude = -83.5379 WHERE city = 'TOLEDO';

-- Pennsylvania cities  
UPDATE clinics SET latitude = 39.9526, longitude = -75.1652 WHERE city = 'PHILADELPHIA';
UPDATE clinics SET latitude = 40.4406, longitude = -79.9959 WHERE city = 'PITTSBURGH';
UPDATE clinics SET latitude = 40.2732, longitude = -76.8839 WHERE city = 'HARRISBURG';
UPDATE clinics SET latitude = 40.6010, longitude = -75.4714 WHERE city = 'ALLENTOWN';
UPDATE clinics SET latitude = 41.2033, longitude = -77.1945 WHERE city = 'WILLIAMSPORT';
UPDATE clinics SET latitude = 40.3573, longitude = -75.9277 WHERE city = 'READING';

-- Georgia cities
UPDATE clinics SET latitude = 33.7490, longitude = -84.3880 WHERE city = 'ATLANTA';
UPDATE clinics SET latitude = 32.4609, longitude = -84.1557 WHERE city = 'COLUMBUS';
UPDATE clinics SET latitude = 32.0835, longitude = -81.0998 WHERE city = 'SAVANNAH';
UPDATE clinics SET latitude = 33.9519, longitude = -83.3576 WHERE city = 'ATHENS';
UPDATE clinics SET latitude = 31.5804, longitude = -84.1557 WHERE city = 'ALBANY';
UPDATE clinics SET latitude = 32.5407, longitude = -83.6324 WHERE city = 'MACON';

-- North Carolina cities
UPDATE clinics SET latitude = 35.2271, longitude = -80.8431 WHERE city = 'CHARLOTTE';
UPDATE clinics SET latitude = 35.7796, longitude = -78.6382 WHERE city = 'RALEIGH';
UPDATE clinics SET latitude = 36.0726, longitude = -79.7920 WHERE city = 'GREENSBORO';
UPDATE clinics SET latitude = 35.9940, longitude = -78.8986 WHERE city = 'DURHAM';
UPDATE clinics SET latitude = 36.0999, longitude = -80.2442 WHERE city = 'WINSTON-SALEM';
UPDATE clinics SET latitude = 35.3499, longitude = -80.7453 WHERE city = 'GASTONIA';

-- South Carolina cities
UPDATE clinics SET latitude = 32.7767, longitude = -79.9311 WHERE city = 'CHARLESTON';
UPDATE clinics SET latitude = 34.8526, longitude = -82.3940 WHERE city = 'GREENVILLE';
UPDATE clinics SET latitude = 34.0007, longitude = -81.0348 WHERE city = 'COLUMBIA';
UPDATE clinics SET latitude = 32.7941, longitude = -79.8626 WHERE city = 'MOUNT PLEASANT';
UPDATE clinics SET latitude = 34.1954, longitude = -79.7626 WHERE city = 'FLORENCE';

-- Tennessee cities
UPDATE clinics SET latitude = 36.1627, longitude = -86.7816 WHERE city = 'NASHVILLE';
UPDATE clinics SET latitude = 35.0928, longitude = -85.3097 WHERE city = 'CHATTANOOGA';
UPDATE clinics SET latitude = 35.9606, longitude = -83.9207 WHERE city = 'KNOXVILLE';
UPDATE clinics SET latitude = 35.1495, longitude = -90.0490 WHERE city = 'MEMPHIS';
UPDATE clinics SET latitude = 35.9251, longitude = -86.8689 WHERE city = 'FRANKLIN';

-- Kentucky cities  
UPDATE clinics SET latitude = 38.2527, longitude = -85.7585 WHERE city = 'LOUISVILLE';
UPDATE clinics SET latitude = 38.0406, longitude = -84.5037 WHERE city = 'LEXINGTON';
UPDATE clinics SET latitude = 39.0458, longitude = -84.5120 WHERE city = 'COVINGTON';
UPDATE clinics SET latitude = 37.0778, longitude = -88.6039 WHERE city = 'PADUCAH';

-- Indiana cities
UPDATE clinics SET latitude = 39.7684, longitude = -86.1581 WHERE city = 'INDIANAPOLIS';
UPDATE clinics SET latitude = 41.5868, longitude = -87.3464 WHERE city = 'GARY';
UPDATE clinics SET latitude = 39.1612, longitude = -87.4089 WHERE city = 'TERRE HAUTE';
UPDATE clinics SET latitude = 39.9784, longitude = -86.1180 WHERE city = 'CARMEL';
UPDATE clinics SET latitude = 41.6834, longitude = -86.2500 WHERE city = 'SOUTH BEND';

-- Wisconsin cities
UPDATE clinics SET latitude = 43.0389, longitude = -87.9065 WHERE city = 'MILWAUKEE';
UPDATE clinics SET latitude = 43.0731, longitude = -89.4012 WHERE city = 'MADISON';
UPDATE clinics SET latitude = 44.5133, longitude = -88.0133 WHERE city = 'GREEN BAY';
UPDATE clinics SET latitude = 42.5583, longitude = -87.8215 WHERE city = 'KENOSHA';
UPDATE clinics SET latitude = 42.7335, longitude = -87.7898 WHERE city = 'RACINE';

-- Minnesota cities
UPDATE clinics SET latitude = 44.9778, longitude = -93.2650 WHERE city = 'MINNEAPOLIS';
UPDATE clinics SET latitude = 44.9537, longitude = -93.0900 WHERE city = 'SAINT PAUL';
UPDATE clinics SET latitude = 46.7296, longitude = -94.6859 WHERE city = 'BRAINERD';
UPDATE clinics SET latitude = 47.9211, longitude = -97.0779 WHERE city = 'GRAND FORKS';

-- Iowa cities
UPDATE clinics SET latitude = 41.5868, longitude = -93.6250 WHERE city = 'DES MOINES';
UPDATE clinics SET latitude = 41.6611, longitude = -91.5302 WHERE city = 'IOWA CITY';
UPDATE clinics SET latitude = 42.5083, longitude = -92.3426 WHERE city = 'WATERLOO';

-- Missouri cities  
UPDATE clinics SET latitude = 38.6270, longitude = -90.1994 WHERE city = 'SAINT LOUIS';
UPDATE clinics SET latitude = 39.0997, longitude = -94.5786 WHERE city = 'KANSAS CITY';
UPDATE clinics SET latitude = 37.2153, longitude = -93.2982 WHERE city = 'SPRINGFIELD';

-- Alabama cities
UPDATE clinics SET latitude = 33.5186, longitude = -86.8104 WHERE city = 'BIRMINGHAM';
UPDATE clinics SET latitude = 32.5990, longitude = -85.4808 WHERE city = 'AUBURN';
UPDATE clinics SET latitude = 32.3617, longitude = -86.2792 WHERE city = 'MONTGOMERY';
UPDATE clinics SET latitude = 34.7304, longitude = -86.5861 WHERE city = 'HUNTSVILLE';

-- Mississippi cities
UPDATE clinics SET latitude = 32.2988, longitude = -90.1848 WHERE city = 'JACKSON';
UPDATE clinics SET latitude = 32.3643, longitude = -88.7034 WHERE city = 'MERIDIAN';

-- Louisiana cities
UPDATE clinics SET latitude = 29.9511, longitude = -90.0715 WHERE city = 'NEW ORLEANS';
UPDATE clinics SET latitude = 30.4515, longitude = -91.1871 WHERE city = 'BATON ROUGE';
UPDATE clinics SET latitude = 32.5093, longitude = -92.1193 WHERE city = 'MONROE';
UPDATE clinics SET latitude = 30.2241, longitude = -92.0198 WHERE city = 'LAFAYETTE';

-- Arkansas cities
UPDATE clinics SET latitude = 34.7465, longitude = -92.2896 WHERE city = 'LITTLE ROCK';
UPDATE clinics SET latitude = 36.1867, longitude = -94.1324 WHERE city = 'BENTONVILLE';

-- Oklahoma cities
UPDATE clinics SET latitude = 35.4676, longitude = -97.5164 WHERE city = 'OKLAHOMA CITY';
UPDATE clinics SET latitude = 36.1540, longitude = -95.9928 WHERE city = 'TULSA';
UPDATE clinics SET latitude = 35.6528, longitude = -97.4781 WHERE city = 'EDMOND';

-- Kansas cities
UPDATE clinics SET latitude = 39.0997, longitude = -94.5786 WHERE city = 'KANSAS CITY';
UPDATE clinics SET latitude = 39.0473, longitude = -95.6890 WHERE city = 'LAWRENCE';
UPDATE clinics SET latitude = 37.6872, longitude = -97.3301 WHERE city = 'WICHITA';

-- Nebraska cities
UPDATE clinics SET latitude = 41.2565, longitude = -95.9345 WHERE city = 'OMAHA';
UPDATE clinics SET latitude = 40.8136, longitude = -96.7026 WHERE city = 'LINCOLN';