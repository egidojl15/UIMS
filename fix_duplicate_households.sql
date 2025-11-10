-- Fix Duplicate Household Numbers
-- This script will help resolve duplicate household_number issues

-- First, let's see what household numbers exist
SELECT household_number, COUNT(*) as count 
FROM households 
GROUP BY household_number 
HAVING COUNT(*) > 1;

-- If there are duplicates, you can either:

-- Option 1: Delete duplicate entries (keeping the first one)
-- WARNING: This will delete duplicate households, make sure you want to do this
/*
DELETE h1 FROM households h1
INNER JOIN households h2 
WHERE h1.household_id > h2.household_id 
AND h1.household_number = h2.household_number;
*/

-- Option 2: Update duplicate numbers to make them unique
-- This will rename duplicates to have unique numbers
SET @row_number = 0;
UPDATE households 
SET household_number = CONCAT('HH', LPAD(@row_number := @row_number + 1, 3, '0'))
WHERE household_id IN (
    SELECT household_id FROM (
        SELECT household_id, ROW_NUMBER() OVER (PARTITION BY household_number ORDER BY household_id) as rn
        FROM households
    ) t WHERE rn > 1
);

-- Option 3: Reset all household numbers to be sequential
-- This will renumber all households starting from HH001
/*
SET @row_number = 0;
UPDATE households 
SET household_number = CONCAT('HH', LPAD(@row_number := @row_number + 1, 3, '0'))
ORDER BY household_id;
*/

-- After running one of the above options, verify the fix:
SELECT household_number, COUNT(*) as count 
FROM households 
GROUP BY household_number 
HAVING COUNT(*) > 1;

-- This should return no rows if the fix was successful
