-- Add parent fields to child_immunizations table
-- This script adds parent name fields to the child_immunizations table

-- Add parent name fields to child_immunizations table
ALTER TABLE `child_immunizations` 
ADD COLUMN `parent_name` varchar(200) DEFAULT NULL AFTER `mother_resident_id`,
ADD COLUMN `father_name` varchar(100) DEFAULT NULL AFTER `parent_name`,
ADD COLUMN `mother_name` varchar(100) DEFAULT NULL AFTER `father_name`;

-- Add indexes for better search performance
ALTER TABLE `child_immunizations` 
ADD KEY `parent_name` (`parent_name`),
ADD KEY `father_name` (`father_name`),
ADD KEY `mother_name` (`mother_name`);

-- Update existing records to populate parent names from resident data
-- This will populate the new fields with existing data
UPDATE child_immunizations ci
LEFT JOIN residents m ON ci.mother_resident_id = m.resident_id
SET ci.mother_name = CONCAT(m.first_name, ' ', m.last_name)
WHERE ci.mother_resident_id IS NOT NULL AND m.resident_id IS NOT NULL;
