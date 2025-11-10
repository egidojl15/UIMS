-- Household Management System Setup
-- This script creates the household table and updates the residents table

-- Create households table
CREATE TABLE IF NOT EXISTS `households` (
  `household_id` int(11) NOT NULL AUTO_INCREMENT,
  `household_number` varchar(20) NOT NULL,
  `household_head_id` int(11) DEFAULT NULL,
  `household_head_name` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `purok` varchar(50) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`household_id`),
  UNIQUE KEY `household_number` (`household_number`),
  KEY `household_head_id` (`household_head_id`),
  KEY `purok` (`purok`),
  KEY `is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add household_id column to residents table if it doesn't exist
ALTER TABLE `residents` 
ADD COLUMN IF NOT EXISTS `household_id` int(11) DEFAULT NULL AFTER `purok`,
ADD KEY IF NOT EXISTS `household_id` (`household_id`);

-- Add foreign key constraint (optional, can be added later)
-- ALTER TABLE `residents` 
-- ADD CONSTRAINT `fk_residents_household` 
-- FOREIGN KEY (`household_id`) REFERENCES `households` (`household_id`) 
-- ON DELETE SET NULL ON UPDATE CASCADE;

-- Insert sample households (optional)
INSERT INTO `households` (`household_number`, `household_head_name`, `address`, `purok`, `contact_number`) VALUES
('HH001', 'Juan Dela Cruz', '123 Main Street, Barangay Sample', 'Purok 1', '09123456789'),
('HH002', 'Maria Santos', '456 Oak Avenue, Barangay Sample', 'Purok 2', '09123456790'),
('HH003', 'Pedro Garcia', '789 Pine Street, Barangay Sample', 'Purok 1', '09123456791'),
('HH004', 'Ana Reyes', '321 Elm Street, Barangay Sample', 'Purok 3', '09123456792');

-- Update existing residents to assign them to households (optional)
-- UPDATE `residents` SET `household_id` = 1 WHERE `resident_id` IN (1, 2, 3);
-- UPDATE `residents` SET `household_id` = 2 WHERE `resident_id` IN (4, 5, 6);
-- UPDATE `residents` SET `household_id` = 3 WHERE `resident_id` IN (7, 8, 9);
-- UPDATE `residents` SET `household_id` = 4 WHERE `resident_id` IN (10, 11, 12);
