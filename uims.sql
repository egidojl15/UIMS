-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 01, 2025 at 05:03 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `uims`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `AuthenticateUser` (IN `p_username` VARCHAR(50), IN `p_password_hash` VARCHAR(255))   BEGIN
    DECLARE user_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO user_count
    FROM user_login_view
    WHERE username = p_username AND password_hash = p_password_hash;
    
    IF user_count > 0 THEN
        -- Update last login
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP 
        WHERE username = p_username;
        
        -- Return user details
        SELECT 
            user_id,
            username,
            full_name,
            email,
            role_name,
            dashboard_url
        FROM user_login_view
        WHERE username = p_username;
        
        -- Log successful login
        INSERT INTO login_history (user_id, login_status)
        SELECT user_id, 'success' FROM users WHERE username = p_username;
    ELSE
        -- Log failed login attempt
        INSERT INTO login_history (user_id, login_status)
        VALUES (NULL, 'failed');
        
        SELECT NULL as user_id, 'Invalid credentials' as message;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetDashboardStats` (IN `p_user_role` VARCHAR(50))   BEGIN
    SELECT 
        (SELECT COUNT(*) FROM residents WHERE is_active = TRUE) as total_residents,
        (SELECT COUNT(*) FROM certificate_requests WHERE status IN ('pending', 'processing')) as pending_certificates,
        (SELECT COUNT(*) FROM complaints WHERE status NOT IN ('resolved', 'dismissed')) as active_complaints,
        (SELECT COUNT(*) FROM blotter_records WHERE status = 'active') as active_blotter_records;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `barangay_information`
--

CREATE TABLE `barangay_information` (
  `info_id` int(11) NOT NULL,
  `barangay_name` varchar(100) NOT NULL,
  `municipality` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `region` varchar(100) NOT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  `total_population` int(11) DEFAULT 0,
  `total_households` int(11) DEFAULT 0,
  `land_area` decimal(10,2) DEFAULT NULL,
  `barangay_code` varchar(20) DEFAULT NULL,
  `updated_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `barangay_information`
--

INSERT INTO `barangay_information` (`info_id`, `barangay_name`, `municipality`, `province`, `region`, `zip_code`, `total_population`, `total_households`, `land_area`, `barangay_code`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'Sample Barangay', 'Sample Municipality', 'Sample Province', 'Region XIII', '8000', 0, 0, NULL, NULL, 1, '2025-08-01 14:57:51', '2025-08-01 14:57:51');

-- --------------------------------------------------------

--
-- Table structure for table `blotter_records`
--

CREATE TABLE `blotter_records` (
  `blotter_id` int(11) NOT NULL,
  `complaint_id` int(11) DEFAULT NULL,
  `incident_type` varchar(100) NOT NULL,
  `incident_date` date NOT NULL,
  `incident_time` time DEFAULT NULL,
  `location` text NOT NULL,
  `persons_involved` text NOT NULL,
  `incident_details` text NOT NULL,
  `action_taken` text DEFAULT NULL,
  `reported_by` varchar(100) DEFAULT NULL,
  `recorded_by` int(11) NOT NULL,
  `status` enum('active','resolved','closed') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `certificate_requests`
--

CREATE TABLE `certificate_requests` (
  `request_id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `cert_type_id` int(11) NOT NULL,
  `purpose` text NOT NULL,
  `request_date` date DEFAULT curdate(),
  `status` enum('pending','processing','ready','released','rejected') DEFAULT 'pending',
  `processed_by` int(11) DEFAULT NULL,
  `processed_date` date DEFAULT NULL,
  `released_by` int(11) DEFAULT NULL,
  `released_date` date DEFAULT NULL,
  `fee_paid` decimal(10,2) DEFAULT 0.00,
  `or_number` varchar(50) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `certificate_requests_view`
-- (See below for the actual view)
--
CREATE TABLE `certificate_requests_view` (
`request_id` int(11)
,`resident_id` int(11)
,`cert_type_id` int(11)
,`purpose` text
,`request_date` date
,`status` enum('pending','processing','ready','released','rejected')
,`processed_by` int(11)
,`processed_date` date
,`released_by` int(11)
,`released_date` date
,`fee_paid` decimal(10,2)
,`or_number` varchar(50)
,`remarks` text
,`created_at` timestamp
,`updated_at` timestamp
,`resident_name` varchar(152)
,`contact_number` varchar(20)
,`type_name` varchar(100)
,`standard_fee` decimal(10,2)
,`processed_by_name` varchar(100)
,`released_by_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Table structure for table `certificate_types`
--

CREATE TABLE `certificate_types` (
  `cert_type_id` int(11) NOT NULL,
  `type_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `fee` decimal(10,2) DEFAULT 0.00,
  `requirements` text DEFAULT NULL,
  `processing_days` int(11) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificate_types`
--

INSERT INTO `certificate_types` (`cert_type_id`, `type_name`, `description`, `fee`, `requirements`, `processing_days`, `is_active`) VALUES
(1, 'Barangay Clearance', 'Certificate of Good Moral Character', 50.00, NULL, 1, 1),
(2, 'Certificate of Residency', 'Proof of Residence in the Barangay', 30.00, NULL, 1, 1),
(3, 'Certificate of Indigency', 'Certificate for Low-Income Residents', 0.00, NULL, 1, 1),
(4, 'Business Permit', 'Permit for Small Business Operations', 200.00, NULL, 3, 1),
(5, 'Certificate of No Pending Case', 'Certificate of Good Standing', 25.00, NULL, 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `complaint_id` int(11) NOT NULL,
  `complainant_id` int(11) NOT NULL,
  `respondent_name` varchar(100) NOT NULL,
  `respondent_address` text DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `incident_date` date NOT NULL,
  `incident_time` time DEFAULT NULL,
  `incident_location` text NOT NULL,
  `description` text NOT NULL,
  `status` enum('filed','under_investigation','for_hearing','resolved','dismissed') DEFAULT 'filed',
  `filed_date` date DEFAULT curdate(),
  `assigned_to` int(11) DEFAULT NULL,
  `resolution` text DEFAULT NULL,
  `resolved_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `complaints_view`
-- (See below for the actual view)
--
CREATE TABLE `complaints_view` (
`complaint_id` int(11)
,`complainant_id` int(11)
,`respondent_name` varchar(100)
,`respondent_address` text
,`category_id` int(11)
,`incident_date` date
,`incident_time` time
,`incident_location` text
,`description` text
,`status` enum('filed','under_investigation','for_hearing','resolved','dismissed')
,`filed_date` date
,`assigned_to` int(11)
,`resolution` text
,`resolved_date` date
,`created_at` timestamp
,`updated_at` timestamp
,`complainant_name` varchar(152)
,`complainant_contact` varchar(20)
,`category_name` varchar(100)
,`assigned_to_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Table structure for table `complaint_categories`
--

CREATE TABLE `complaint_categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `complaint_categories`
--

INSERT INTO `complaint_categories` (`category_id`, `category_name`, `description`, `is_active`) VALUES
(1, 'Noise Complaint', 'Complaints about excessive noise', 1),
(2, 'Property Dispute', 'Disputes over property boundaries or ownership', 1),
(3, 'Domestic Violence', 'Cases involving family violence', 1),
(4, 'Theft', 'Reported theft cases', 1),
(5, 'Public Disturbance', 'Disturbances in public places', 1),
(6, 'Environmental', 'Environmental concerns and violations', 1),
(7, 'Others', 'Other types of complaints', 1);

-- --------------------------------------------------------

--
-- Table structure for table `login_history`
--

CREATE TABLE `login_history` (
  `login_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `login_status` enum('success','failed') DEFAULT 'success'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medical_referrals`
--

CREATE TABLE `medical_referrals` (
  `referral_id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `bhw_id` int(11) NOT NULL,
  `referred_to` varchar(100) NOT NULL,
  `referral_reason` text NOT NULL,
  `referral_date` date NOT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_types`
--

CREATE TABLE `report_types` (
  `report_type_id` int(11) NOT NULL,
  `type_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `residents`
--

CREATE TABLE `residents` (
  `resident_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `civil_status` enum('Single','Married','Widowed','Separated','Divorced') NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text NOT NULL,
  `purok` varchar(50) DEFAULT NULL,
  `is_registered_voter` tinyint(1) DEFAULT 0,
  `is_pwd` tinyint(1) DEFAULT 0,
  `is_senior_citizen` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `registered_date` date DEFAULT curdate(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `resident_details_view`
-- (See below for the actual view)
--
CREATE TABLE `resident_details_view` (
`resident_id` int(11)
,`first_name` varchar(50)
,`middle_name` varchar(50)
,`last_name` varchar(50)
,`suffix` varchar(10)
,`date_of_birth` date
,`gender` enum('Male','Female')
,`civil_status` enum('Single','Married','Widowed','Separated','Divorced')
,`contact_number` varchar(20)
,`email` varchar(100)
,`address` text
,`purok` varchar(50)
,`is_registered_voter` tinyint(1)
,`is_pwd` tinyint(1)
,`is_senior_citizen` tinyint(1)
,`is_active` tinyint(1)
,`registered_date` date
,`created_at` timestamp
,`updated_at` timestamp
,`blood_type` varchar(5)
,`height` decimal(5,2)
,`weight` decimal(5,2)
,`medical_conditions` text
,`allergies` text
,`emergency_contact_name` varchar(100)
,`emergency_contact_number` varchar(20)
);

-- --------------------------------------------------------

--
-- Table structure for table `resident_health_records`
--

CREATE TABLE `resident_health_records` (
  `health_record_id` int(11) NOT NULL,
  `resident_id` int(11) NOT NULL,
  `blood_type` varchar(5) DEFAULT NULL,
  `height` decimal(5,2) DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `medical_conditions` text DEFAULT NULL,
  `allergies` text DEFAULT NULL,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `summary_reports`
--

CREATE TABLE `summary_reports` (
  `report_id` int(11) NOT NULL,
  `report_type_id` int(11) NOT NULL,
  `report_title` varchar(200) NOT NULL,
  `report_period_start` date DEFAULT NULL,
  `report_period_end` date DEFAULT NULL,
  `generated_by` int(11) NOT NULL,
  `report_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`report_data`)),
  `file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `role_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `full_name`, `role_id`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'captain', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'captain@barangay.gov.ph', 'Juan Dela Cruz', 1, 1, NULL, '2025-08-01 14:57:27', '2025-08-01 14:57:27'),
(2, 'secretary', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'secretary@barangay.gov.ph', 'Maria Santos', 2, 1, NULL, '2025-08-01 14:57:27', '2025-08-01 14:57:27'),
(3, 'councilor1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'councilor1@barangay.gov.ph', 'Pedro Garcia', 3, 1, NULL, '2025-08-01 14:57:27', '2025-08-01 14:57:27'),
(4, 'bhw1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'bhw1@barangay.gov.ph', 'Ana Reyes', 4, 1, NULL, '2025-08-01 14:57:27', '2025-08-01 14:57:27');

-- --------------------------------------------------------

--
-- Stand-in structure for view `user_login_view`
-- (See below for the actual view)
--
CREATE TABLE `user_login_view` (
`user_id` int(11)
,`username` varchar(50)
,`password_hash` varchar(255)
,`full_name` varchar(100)
,`email` varchar(100)
,`is_active` tinyint(1)
,`role_name` varchar(50)
,`dashboard_url` varchar(100)
);

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `role_description` text DEFAULT NULL,
  `dashboard_url` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`role_id`, `role_name`, `role_description`, `dashboard_url`, `created_at`) VALUES
(1, 'barangay_captain', 'Barangay Captain - Full system access', '/dashboard/captain', '2025-08-01 14:54:16'),
(2, 'barangay_secretary', 'Barangay Secretary - Administrative access', '/dashboard/secretary', '2025-08-01 14:54:16'),
(3, 'barangay_councilor', 'Barangay Councilor - Limited access', '/dashboard/councilor', '2025-08-01 14:54:16'),
(4, 'barangay_health_worker', 'Barangay Health Worker - Health records access', '/dashboard/bhw', '2025-08-01 14:54:16'),
(5, 'admin', 'System Administrator', '/dashboard/admin', '2025-08-01 14:54:16');

-- --------------------------------------------------------

--
-- Structure for view `certificate_requests_view`
--
DROP TABLE IF EXISTS `certificate_requests_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `certificate_requests_view`  AS SELECT `cr`.`request_id` AS `request_id`, `cr`.`resident_id` AS `resident_id`, `cr`.`cert_type_id` AS `cert_type_id`, `cr`.`purpose` AS `purpose`, `cr`.`request_date` AS `request_date`, `cr`.`status` AS `status`, `cr`.`processed_by` AS `processed_by`, `cr`.`processed_date` AS `processed_date`, `cr`.`released_by` AS `released_by`, `cr`.`released_date` AS `released_date`, `cr`.`fee_paid` AS `fee_paid`, `cr`.`or_number` AS `or_number`, `cr`.`remarks` AS `remarks`, `cr`.`created_at` AS `created_at`, `cr`.`updated_at` AS `updated_at`, concat(`r`.`first_name`,' ',ifnull(`r`.`middle_name`,''),' ',`r`.`last_name`) AS `resident_name`, `r`.`contact_number` AS `contact_number`, `ct`.`type_name` AS `type_name`, `ct`.`fee` AS `standard_fee`, `pb`.`full_name` AS `processed_by_name`, `rb`.`full_name` AS `released_by_name` FROM ((((`certificate_requests` `cr` join `residents` `r` on(`cr`.`resident_id` = `r`.`resident_id`)) join `certificate_types` `ct` on(`cr`.`cert_type_id` = `ct`.`cert_type_id`)) left join `users` `pb` on(`cr`.`processed_by` = `pb`.`user_id`)) left join `users` `rb` on(`cr`.`released_by` = `rb`.`user_id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `complaints_view`
--
DROP TABLE IF EXISTS `complaints_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `complaints_view`  AS SELECT `c`.`complaint_id` AS `complaint_id`, `c`.`complainant_id` AS `complainant_id`, `c`.`respondent_name` AS `respondent_name`, `c`.`respondent_address` AS `respondent_address`, `c`.`category_id` AS `category_id`, `c`.`incident_date` AS `incident_date`, `c`.`incident_time` AS `incident_time`, `c`.`incident_location` AS `incident_location`, `c`.`description` AS `description`, `c`.`status` AS `status`, `c`.`filed_date` AS `filed_date`, `c`.`assigned_to` AS `assigned_to`, `c`.`resolution` AS `resolution`, `c`.`resolved_date` AS `resolved_date`, `c`.`created_at` AS `created_at`, `c`.`updated_at` AS `updated_at`, concat(`r`.`first_name`,' ',ifnull(`r`.`middle_name`,''),' ',`r`.`last_name`) AS `complainant_name`, `r`.`contact_number` AS `complainant_contact`, `cc`.`category_name` AS `category_name`, `u`.`full_name` AS `assigned_to_name` FROM (((`complaints` `c` join `residents` `r` on(`c`.`complainant_id` = `r`.`resident_id`)) join `complaint_categories` `cc` on(`c`.`category_id` = `cc`.`category_id`)) left join `users` `u` on(`c`.`assigned_to` = `u`.`user_id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `resident_details_view`
--
DROP TABLE IF EXISTS `resident_details_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `resident_details_view`  AS SELECT `r`.`resident_id` AS `resident_id`, `r`.`first_name` AS `first_name`, `r`.`middle_name` AS `middle_name`, `r`.`last_name` AS `last_name`, `r`.`suffix` AS `suffix`, `r`.`date_of_birth` AS `date_of_birth`, `r`.`gender` AS `gender`, `r`.`civil_status` AS `civil_status`, `r`.`contact_number` AS `contact_number`, `r`.`email` AS `email`, `r`.`address` AS `address`, `r`.`purok` AS `purok`, `r`.`is_registered_voter` AS `is_registered_voter`, `r`.`is_pwd` AS `is_pwd`, `r`.`is_senior_citizen` AS `is_senior_citizen`, `r`.`is_active` AS `is_active`, `r`.`registered_date` AS `registered_date`, `r`.`created_at` AS `created_at`, `r`.`updated_at` AS `updated_at`, `rhr`.`blood_type` AS `blood_type`, `rhr`.`height` AS `height`, `rhr`.`weight` AS `weight`, `rhr`.`medical_conditions` AS `medical_conditions`, `rhr`.`allergies` AS `allergies`, `rhr`.`emergency_contact_name` AS `emergency_contact_name`, `rhr`.`emergency_contact_number` AS `emergency_contact_number` FROM (`residents` `r` left join `resident_health_records` `rhr` on(`r`.`resident_id` = `rhr`.`resident_id`)) WHERE `r`.`is_active` = 1 ;

-- --------------------------------------------------------

--
-- Structure for view `user_login_view`
--
DROP TABLE IF EXISTS `user_login_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `user_login_view`  AS SELECT `u`.`user_id` AS `user_id`, `u`.`username` AS `username`, `u`.`password_hash` AS `password_hash`, `u`.`full_name` AS `full_name`, `u`.`email` AS `email`, `u`.`is_active` AS `is_active`, `ur`.`role_name` AS `role_name`, `ur`.`dashboard_url` AS `dashboard_url` FROM (`users` `u` join `user_roles` `ur` on(`u`.`role_id` = `ur`.`role_id`)) WHERE `u`.`is_active` = 1 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `barangay_information`
--
ALTER TABLE `barangay_information`
  ADD PRIMARY KEY (`info_id`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `blotter_records`
--
ALTER TABLE `blotter_records`
  ADD PRIMARY KEY (`blotter_id`),
  ADD KEY `complaint_id` (`complaint_id`),
  ADD KEY `recorded_by` (`recorded_by`);

--
-- Indexes for table `certificate_requests`
--
ALTER TABLE `certificate_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `resident_id` (`resident_id`),
  ADD KEY `cert_type_id` (`cert_type_id`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `released_by` (`released_by`),
  ADD KEY `idx_cert_requests_status` (`status`),
  ADD KEY `idx_cert_requests_date` (`request_date`);

--
-- Indexes for table `certificate_types`
--
ALTER TABLE `certificate_types`
  ADD PRIMARY KEY (`cert_type_id`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`complaint_id`),
  ADD KEY `complainant_id` (`complainant_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `assigned_to` (`assigned_to`),
  ADD KEY `idx_complaints_status` (`status`),
  ADD KEY `idx_complaints_date` (`filed_date`);

--
-- Indexes for table `complaint_categories`
--
ALTER TABLE `complaint_categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `login_history`
--
ALTER TABLE `login_history`
  ADD PRIMARY KEY (`login_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_login_history_time` (`login_time`);

--
-- Indexes for table `medical_referrals`
--
ALTER TABLE `medical_referrals`
  ADD PRIMARY KEY (`referral_id`),
  ADD KEY `resident_id` (`resident_id`),
  ADD KEY `bhw_id` (`bhw_id`);

--
-- Indexes for table `report_types`
--
ALTER TABLE `report_types`
  ADD PRIMARY KEY (`report_type_id`);

--
-- Indexes for table `residents`
--
ALTER TABLE `residents`
  ADD PRIMARY KEY (`resident_id`),
  ADD KEY `idx_residents_name` (`last_name`,`first_name`),
  ADD KEY `idx_residents_active` (`is_active`);

--
-- Indexes for table `resident_health_records`
--
ALTER TABLE `resident_health_records`
  ADD PRIMARY KEY (`health_record_id`),
  ADD KEY `resident_id` (`resident_id`);

--
-- Indexes for table `summary_reports`
--
ALTER TABLE `summary_reports`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `report_type_id` (`report_type_id`),
  ADD KEY `generated_by` (`generated_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `idx_users_username` (`username`),
  ADD KEY `idx_users_active` (`is_active`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `barangay_information`
--
ALTER TABLE `barangay_information`
  MODIFY `info_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `blotter_records`
--
ALTER TABLE `blotter_records`
  MODIFY `blotter_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `certificate_requests`
--
ALTER TABLE `certificate_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `certificate_types`
--
ALTER TABLE `certificate_types`
  MODIFY `cert_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `complaint_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `complaint_categories`
--
ALTER TABLE `complaint_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `login_history`
--
ALTER TABLE `login_history`
  MODIFY `login_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `medical_referrals`
--
ALTER TABLE `medical_referrals`
  MODIFY `referral_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `report_types`
--
ALTER TABLE `report_types`
  MODIFY `report_type_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `residents`
--
ALTER TABLE `residents`
  MODIFY `resident_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resident_health_records`
--
ALTER TABLE `resident_health_records`
  MODIFY `health_record_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `summary_reports`
--
ALTER TABLE `summary_reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `barangay_information`
--
ALTER TABLE `barangay_information`
  ADD CONSTRAINT `barangay_information_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `blotter_records`
--
ALTER TABLE `blotter_records`
  ADD CONSTRAINT `blotter_records_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`complaint_id`),
  ADD CONSTRAINT `blotter_records_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `certificate_requests`
--
ALTER TABLE `certificate_requests`
  ADD CONSTRAINT `certificate_requests_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`),
  ADD CONSTRAINT `certificate_requests_ibfk_2` FOREIGN KEY (`cert_type_id`) REFERENCES `certificate_types` (`cert_type_id`),
  ADD CONSTRAINT `certificate_requests_ibfk_3` FOREIGN KEY (`processed_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `certificate_requests_ibfk_4` FOREIGN KEY (`released_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`complainant_id`) REFERENCES `residents` (`resident_id`),
  ADD CONSTRAINT `complaints_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `complaint_categories` (`category_id`),
  ADD CONSTRAINT `complaints_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `login_history`
--
ALTER TABLE `login_history`
  ADD CONSTRAINT `login_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `medical_referrals`
--
ALTER TABLE `medical_referrals`
  ADD CONSTRAINT `medical_referrals_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`),
  ADD CONSTRAINT `medical_referrals_ibfk_2` FOREIGN KEY (`bhw_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `resident_health_records`
--
ALTER TABLE `resident_health_records`
  ADD CONSTRAINT `resident_health_records_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`resident_id`) ON DELETE CASCADE;

--
-- Constraints for table `summary_reports`
--
ALTER TABLE `summary_reports`
  ADD CONSTRAINT `summary_reports_ibfk_1` FOREIGN KEY (`report_type_id`) REFERENCES `report_types` (`report_type_id`),
  ADD CONSTRAINT `summary_reports_ibfk_2` FOREIGN KEY (`generated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `user_roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
