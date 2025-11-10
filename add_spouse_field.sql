-- Add spouse field to households table
-- This script adds a spouse_name field to the households table

-- Add spouse_name column to households table
ALTER TABLE `households` 
ADD COLUMN `spouse_name` varchar(100) DEFAULT NULL AFTER `household_head_name`;

-- Add index for spouse_name for better search performance
ALTER TABLE `households` 
ADD KEY `spouse_name` (`spouse_name`);

-- Update existing households to have spouse information (optional)
-- You can manually update these or leave them as NULL
-- UPDATE `households` SET `spouse_name` = 'Maria Dela Cruz' WHERE `household_id` = 1;
-- UPDATE `households` SET `spouse_name` = 'Jose Santos' WHERE `household_id` = 2;
