-- Fix cities that are unique to specific states but placed incorrectly
-- These cities should ONLY exist in one state

-- California-specific cities (should never be outside CA)
UPDATE clinics SET latitude = 34.1478, longitude = -118.1445 WHERE city = 'PASADENA'; -- Los Angeles County, CA
UPDATE clinics SET latitude = 34.1808, longitude = -118.3090 WHERE city = 'BURBANK'; -- Los Angeles County, CA  
UPDATE clinics SET latitude = 34.1425, longitude = -118.2551 WHERE city = 'GLENDALE'; -- Los Angeles County, CA
UPDATE clinics SET latitude = 33.8358, longitude = -118.3406 WHERE city = 'TORRANCE'; -- Los Angeles County, CA
UPDATE clinics SET latitude = 37.5485, longitude = -121.9886 WHERE city = 'FREMONT'; -- Alameda County, CA
UPDATE clinics SET latitude = 37.8715, longitude = -122.2730 WHERE city = 'BERKELEY'; -- Alameda County, CA
UPDATE clinics SET latitude = 37.6688, longitude = -122.0808 WHERE city = 'HAYWARD'; -- Alameda County, CA
UPDATE clinics SET latitude = 37.3688, longitude = -122.0363 WHERE city = 'SUNNYVALE'; -- Santa Clara County, CA
UPDATE clinics SET latitude = 37.4419, longitude = -122.1430 WHERE city = 'PALO ALTO'; -- Santa Clara County, CA
UPDATE clinics SET latitude = 37.3861, longitude = -122.0839 WHERE city = 'MOUNTAIN VIEW'; -- Santa Clara County, CA
UPDATE clinics SET latitude = 34.0928, longitude = -117.4353 WHERE city = 'POMONA'; -- Los Angeles County, CA
UPDATE clinics SET latitude = 33.8303, longitude = -117.9147 WHERE city = 'FULLERTON'; -- Orange County, CA
UPDATE clinics SET latitude = 33.8847, longitude = -117.9233 WHERE city = 'BUENA PARK'; -- Orange County, CA
UPDATE clinics SET latitude = 33.9425, longitude = -118.4081 WHERE city = 'MANHATTAN BEACH'; -- Los Angeles County, CA
UPDATE clinics SET latitude = 34.0194, longitude = -118.4912 WHERE city = 'SANTA MONICA'; -- Los Angeles County, CA

-- Texas-specific cities (should never be outside TX)
UPDATE clinics SET latitude = 33.0198, longitude = -96.6989 WHERE city = 'PLANO'; -- Collin County, TX
UPDATE clinics SET latitude = 32.9126, longitude = -96.6389 WHERE city = 'GARLAND'; -- Dallas County, TX
UPDATE clinics SET latitude = 32.8140, longitude = -96.9489 WHERE city = 'IRVING'; -- Dallas County, TX
UPDATE clinics SET latitude = 32.7668, longitude = -96.5992 WHERE city = 'MESQUITE'; -- Dallas County, TX
UPDATE clinics SET latitude = 32.9537, longitude = -96.8903 WHERE city = 'CARROLLTON'; -- Dallas County, TX
UPDATE clinics SET latitude = 32.9483, longitude = -96.7298 WHERE city = 'RICHARDSON'; -- Dallas County, TX
UPDATE clinics SET latitude = 29.5583, longitude = -98.6117 WHERE city = 'LEAGUE CITY'; -- Galveston County, TX
UPDATE clinics SET latitude = 29.6077, longitude = -95.6341 WHERE city = 'MISSOURI CITY'; -- Fort Bend County, TX
UPDATE clinics SET latitude = 26.2034, longitude = -98.2300 WHERE city = 'MCALLEN'; -- Hidalgo County, TX
UPDATE clinics SET latitude = 32.7357, longitude = -97.1081 WHERE city = 'GRAND PRAIRIE'; -- Dallas County, TX

-- Florida-specific cities (should never be outside FL)
UPDATE clinics SET latitude = 26.0073, longitude = -80.2962 WHERE city = 'PEMBROKE PINES'; -- Broward County, FL
UPDATE clinics SET latitude = 26.2712, longitude = -80.2706 WHERE city = 'CORAL SPRINGS'; -- Broward County, FL
UPDATE clinics SET latitude = 25.9873, longitude = -80.2322 WHERE city = 'MIRAMAR'; -- Broward County, FL
UPDATE clinics SET latitude = 26.0765, longitude = -80.2728 WHERE city = 'DAVIE'; -- Broward County, FL
UPDATE clinics SET latitude = 26.1267, longitude = -80.2331 WHERE city = 'PLANTATION'; -- Broward County, FL
UPDATE clinics SET latitude = 26.1669, longitude = -80.2564 WHERE city = 'SUNRISE'; -- Broward County, FL
UPDATE clinics SET latitude = 26.3587, longitude = -80.0831 WHERE city = 'BOCA RATON'; -- Palm Beach County, FL
UPDATE clinics SET latitude = 26.2379, longitude = -80.1248 WHERE city = 'DELRAY BEACH'; -- Palm Beach County, FL
UPDATE clinics SET latitude = 25.7907, longitude = -80.1300 WHERE city = 'AVENTURA'; -- Miami-Dade County, FL
UPDATE clinics SET latitude = 25.9565, longitude = -80.2389 WHERE city = 'HOLLYWOOD'; -- Broward County, FL

-- Washington-specific cities (should never be outside WA)
UPDATE clinics SET latitude = 47.6101, longitude = -122.2015 WHERE city = 'BELLEVUE'; -- King County, WA
UPDATE clinics SET latitude = 47.2529, longitude = -122.4443 WHERE city = 'TACOMA'; -- Pierce County, WA
UPDATE clinics SET latitude = 47.6587, longitude = -117.4260 WHERE city = 'SPOKANE'; -- Spokane County, WA
UPDATE clinics SET latitude = 45.6387, longitude = -122.6615 WHERE city = 'VANCOUVER'; -- Clark County, WA
UPDATE clinics SET latitude = 47.3809, longitude = -122.2348 WHERE city = 'KENT'; -- King County, WA
UPDATE clinics SET latitude = 47.4829, longitude = -122.2071 WHERE city = 'RENTON'; -- King County, WA
UPDATE clinics SET latitude = 47.8021, longitude = -122.2015 WHERE city = 'BOTHELL'; -- King County, WA
UPDATE clinics SET latitude = 47.7379, longitude = -122.2021 WHERE city = 'REDMOND'; -- King County, WA

-- Arizona-specific cities (should never be outside AZ)
UPDATE clinics SET latitude = 33.3062, longitude = -111.8413 WHERE city = 'CHANDLER'; -- Maricopa County, AZ
UPDATE clinics SET latitude = 33.5722, longitude = -112.0901 WHERE city = 'GLENDALE'; -- Maricopa County, AZ (AZ, not CA)
UPDATE clinics SET latitude = 33.5432, longitude = -112.4686 WHERE city = 'PEORIA'; -- Maricopa County, AZ
UPDATE clinics SET latitude = 33.4734, longitude = -111.9010 WHERE city = 'TEMPE'; -- Maricopa County, AZ
UPDATE clinics SET latitude = 33.4152, longitude = -111.8315 WHERE city = 'MESA'; -- Maricopa County, AZ
UPDATE clinics SET latitude = 33.5292, longitude = -112.2645 WHERE city = 'SURPRISE'; -- Maricopa County, AZ

-- Colorado-specific cities
UPDATE clinics SET latitude = 39.8431, longitude = -105.1195 WHERE city = 'ARVADA'; -- Jefferson County, CO
UPDATE clinics SET latitude = 39.7348, longitude = -104.8608 WHERE city = 'AURORA'; -- Arapahoe County, CO
UPDATE clinics SET latitude = 39.9208, longitude = -105.0319 WHERE city = 'WESTMINSTER'; -- Adams County, CO
UPDATE clinics SET latitude = 39.8617, longitude = -105.0372 WHERE city = 'THORNTON'; -- Adams County, CO

-- Virginia-specific cities (Northern Virginia)
UPDATE clinics SET latitude = 39.0359, longitude = -77.4627 WHERE city = 'ASHBURN'; -- Loudoun County, VA
UPDATE clinics SET latitude = 38.9517, longitude = -77.4481 WHERE city = 'HERNDON'; -- Fairfax County, VA
UPDATE clinics SET latitude = 38.9284, longitude = -77.3411 WHERE city = 'FAIRFAX'; -- Fairfax County, VA
UPDATE clinics SET latitude = 38.8816, longitude = -77.0910 WHERE city = 'ARLINGTON'; -- Arlington County, VA