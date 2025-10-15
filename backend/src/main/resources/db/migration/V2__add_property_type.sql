-- Add property_type column to properties table
-- This column is used to categorize properties for comparison purposes

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS property_type VARCHAR(50);

-- Set default value for existing properties
UPDATE properties 
SET property_type = 'FLERBOSTADSHUS' 
WHERE property_type IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE properties 
ALTER COLUMN property_type SET NOT NULL;

-- Add comment to the column
COMMENT ON COLUMN properties.property_type IS 'Type of property: FLERBOSTADSHUS, SMAHUS, or VERKSAMHET';
