-- Check Current Household Numbers
-- Run this to see what household numbers currently exist

-- Show all household numbers
SELECT household_id, household_number, household_head_name, address 
FROM households 
ORDER BY household_id;

-- Show duplicate household numbers (if any)
SELECT household_number, COUNT(*) as count 
FROM households 
GROUP BY household_number 
HAVING COUNT(*) > 1;

-- Show the highest household number
SELECT MAX(CAST(SUBSTRING(household_number, 3) AS UNSIGNED)) as max_number
FROM households 
WHERE household_number LIKE 'HH%';

-- Show next available household number
SELECT CONCAT('HH', LPAD(COALESCE(MAX(CAST(SUBSTRING(household_number, 3) AS UNSIGNED)), 0) + 1, 3, '0')) as next_available_number
FROM households 
WHERE household_number LIKE 'HH%';
