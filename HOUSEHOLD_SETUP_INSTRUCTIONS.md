# Household Management Setup Instructions

## Issue: 500 Internal Server Error when creating households

The error occurs because the `households` table doesn't exist in your database yet.

## Solution: Run the Household Setup Script

### Step 1: Access your MySQL database
1. Open phpMyAdmin or your MySQL client
2. Select your UIMS database

### Step 2: Run the household setup script
1. Go to the SQL tab
2. Copy and paste the contents of `household_setup.sql` file
3. Click "Go" to execute the script

### Step 3: Verify the table was created
Run this query to check if the table exists:
```sql
SHOW TABLES LIKE 'households';
```

You should see the `households` table listed.

### Step 4: Test household creation
1. Go back to your UIMS application
2. Try creating a household again
3. It should now work without the 500 error

## What the setup script does:
- Creates the `households` table with proper structure
- Adds `household_id` column to the `residents` table
- Inserts sample household data
- Sets up proper indexes and constraints

## Alternative: Manual Table Creation
If you prefer to create the table manually, run this SQL:

```sql
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

ALTER TABLE `residents` 
ADD COLUMN IF NOT EXISTS `household_id` int(11) DEFAULT NULL AFTER `purok`,
ADD KEY IF NOT EXISTS `household_id` (`household_id`);
```

## After Setup:
Once the table is created, you should be able to:
- Create new households
- Edit existing households
- Delete households
- Assign residents to households
- View household members

The error should be resolved and household management should work properly.
