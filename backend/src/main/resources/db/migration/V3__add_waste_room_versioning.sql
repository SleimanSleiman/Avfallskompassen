-- Add versioning columns to waste_room table
ALTER TABLE waste_room
ADD COLUMN version_number INT NOT NULL DEFAULT 1,
ADD COLUMN created_by VARCHAR(50) NOT NULL DEFAULT 'user',
ADD COLUMN admin_username VARCHAR(255),
ADD COLUMN version_name VARCHAR(255),
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Create index on property_id and name for faster version lookups
CREATE INDEX idx_waste_room_property_name ON waste_room(property_id, name);

-- Create index on property_id and is_active for finding active versions
CREATE INDEX idx_waste_room_property_active ON waste_room(property_id, is_active);
