-- Add steps column to methods table if it doesn't exist
-- Run this in Supabase SQL Editor

ALTER TABLE methods 
ADD COLUMN steps JSONB DEFAULT '[]'::jsonb;

-- Example structure for steps:
-- [
--   {
--     "order": 1,
--     "title": "Prepare ingredients",
--     "description": "Wash and slice the cucumbers..."
--   },
--   {
--     "order": 2,
--     "title": "Make brine",
--     "description": "Mix water, vinegar, and salt..."
--   }
-- ]
