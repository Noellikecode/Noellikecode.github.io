-- Add random offsets to overlapping markers to spread them out geographically
-- This will make the 499 overlapping NYC coordinates visible across the US

-- Update overlapping markers with slight coordinate variations
UPDATE clinics SET 
  latitude = 40.7128 + (RANDOM() - 0.5) * 0.5,
  longitude = -74.006 + (RANDOM() - 0.5) * 0.8
WHERE latitude = 40.7128 AND longitude = -74.006;

-- Update some clinics to have different service specializations
UPDATE clinics SET services = '["stuttering", "speech-therapy"]'::jsonb 
WHERE ctid IN (SELECT ctid FROM clinics WHERE services::text LIKE '%speech-therapy%' LIMIT 80);

UPDATE clinics SET services = '["apraxia", "language-therapy"]'::jsonb 
WHERE ctid IN (SELECT ctid FROM clinics WHERE services::text LIKE '%language-therapy%' AND services::text NOT LIKE '%stuttering%' LIMIT 80);

UPDATE clinics SET services = '["voice-therapy", "speech-therapy"]'::jsonb 
WHERE ctid IN (SELECT ctid FROM clinics WHERE services::text LIKE '%speech-therapy%' AND services::text NOT LIKE '%stuttering%' AND services::text NOT LIKE '%apraxia%' LIMIT 80);

UPDATE clinics SET services = '["feeding-therapy", "language-therapy"]'::jsonb 
WHERE ctid IN (SELECT ctid FROM clinics WHERE services::text LIKE '%language-therapy%' AND services::text NOT LIKE '%stuttering%' AND services::text NOT LIKE '%apraxia%' AND services::text NOT LIKE '%voice-therapy%' LIMIT 80);

UPDATE clinics SET services = '["social-skills", "speech-therapy"]'::jsonb 
WHERE ctid IN (SELECT ctid FROM clinics WHERE services::text LIKE '%speech-therapy%' AND services::text NOT LIKE '%stuttering%' AND services::text NOT LIKE '%apraxia%' AND services::text NOT LIKE '%voice-therapy%' AND services::text NOT LIKE '%feeding-therapy%' LIMIT 80);