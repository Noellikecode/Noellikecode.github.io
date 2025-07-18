-- Fix LAKEWOOD coordinates based on actual locations
-- Many Lakewoods exist in different states - need to distinguish them properly

-- Lakewood, Ohio (Cleveland area) - Most likely the bulk of these
UPDATE clinics SET latitude = 41.4820, longitude = -81.7982 
WHERE city = 'LAKEWOOD' AND latitude = 34.0522;

-- Note: Without state information, we can't perfectly distinguish between:
-- - Lakewood, California (LA area): 33.8536, -118.1339
-- - Lakewood, Colorado (Denver area): 39.7047, -105.0814  
-- - Lakewood, Ohio (Cleveland area): 41.4820, -81.7982
-- - Lakewood, New Jersey: 40.0979, -74.2179
-- - Lakewood, Washington: 47.1718, -122.5185

-- For now, assume most are Ohio since that had many clustered there originally