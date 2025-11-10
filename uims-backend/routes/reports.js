const express = require("express");

module.exports = (pool, authenticateToken) => {
  const router = express.Router();
  console.log("[routes] reports.js loaded");

  async function safeRows(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows || [];
    } catch (e) {
      console.warn("safeRows error:", e?.message || e);
      return [];
    }
  }

  // Helper function to calculate totals for specific age groups
  function calculateTableTotal(ageDistributionData, ageGroups) {
    let maleTotal = 0;
    let femaleTotal = 0;

    ageGroups.forEach((ageGroup) => {
      const item = ageDistributionData.find(
        (data) => data.ageGroup === ageGroup
      );
      if (item) {
        maleTotal += item.male;
        femaleTotal += item.female;
      }
    });

    return {
      male: maleTotal,
      female: femaleTotal,
      total: maleTotal + femaleTotal,
    };
  }

  // Generate Age Grouping Report
  router.post("/age-grouping", authenticateToken, async (req, res) => {
    try {
      const { dateFrom, dateTo, purok, preview = false } = req.body;

      let whereClause = "WHERE r.is_active = 1";
      const params = [];

      if (dateFrom && dateTo) {
        whereClause += " AND r.created_at BETWEEN ? AND ?";
        params.push(dateFrom, dateTo);
      }

      if (purok) {
        whereClause += " AND r.purok = ?";
        params.push(purok);
      }

      // Generate detailed age distribution table
      const detailedAgeGroups = [
        { label: "0-5 mos", minMonths: 0, maxMonths: 5 },
        { label: "0-11 mos", minMonths: 0, maxMonths: 11 },
        { label: "1 Y.O", minMonths: 12, maxMonths: 23 },
        { label: "2 Y.O", minMonths: 24, maxMonths: 35 },
        { label: "3 Y.O", minMonths: 36, maxMonths: 47 },
        { label: "4 Y.O", minMonths: 48, maxMonths: 59 },
        { label: "5 Y.O", minMonths: 60, maxMonths: 71 },
        { label: "6 Y.O", minMonths: 72, maxMonths: 83 },
        { label: "7 Y.O", minMonths: 84, maxMonths: 95 },
        { label: "8 Y.O", minMonths: 96, maxMonths: 107 },
        { label: "9 Y.O", minMonths: 108, maxMonths: 119 },
        { label: "10 Y.O", minMonths: 120, maxMonths: 131 },
        { label: "11 Y.O", minMonths: 132, maxMonths: 143 },
        { label: "12 Y.O", minMonths: 144, maxMonths: 155 },
        { label: "13 Y.O", minMonths: 156, maxMonths: 167 },
        { label: "14 Y.O", minMonths: 168, maxMonths: 179 },
        { label: "15 Y.O", minMonths: 180, maxMonths: 191 },
        { label: "16 Y.O", minMonths: 192, maxMonths: 203 },
        { label: "17 Y.O", minMonths: 204, maxMonths: 215 },
        { label: "18 Y.O", minMonths: 216, maxMonths: 227 },
        { label: "19 Y.O", minMonths: 228, maxMonths: 239 },
        { label: "20 Y.O", minMonths: 240, maxMonths: 251 },
        { label: "21 Y.O", minMonths: 252, maxMonths: 263 },
        { label: "22 Y.O", minMonths: 264, maxMonths: 275 },
        { label: "23 Y.O", minMonths: 276, maxMonths: 287 },
        { label: "24 Y.O", minMonths: 288, maxMonths: 299 },
        { label: "25 Y.O", minMonths: 300, maxMonths: 311 },
        { label: "26 Y.O", minMonths: 312, maxMonths: 323 },
        { label: "27 Y.O", minMonths: 324, maxMonths: 335 },
        { label: "28 Y.O", minMonths: 336, maxMonths: 347 },
        { label: "29 Y.O", minMonths: 348, maxMonths: 359 },
        { label: "30 Y.O", minMonths: 360, maxMonths: 371 },
        { label: "31 Y.O", minMonths: 372, maxMonths: 383 },
        { label: "32 Y.O", minMonths: 384, maxMonths: 395 },
        { label: "33 Y.O", minMonths: 396, maxMonths: 407 },
        { label: "34 Y.O", minMonths: 408, maxMonths: 419 },
        { label: "35 Y.O", minMonths: 420, maxMonths: 431 },
        { label: "36 Y.O", minMonths: 432, maxMonths: 443 },
        { label: "37 Y.O", minMonths: 444, maxMonths: 455 },
        { label: "38 Y.O", minMonths: 456, maxMonths: 467 },
        { label: "39 Y.O", minMonths: 468, maxMonths: 479 },
        { label: "40 Y.O", minMonths: 480, maxMonths: 491 },
        { label: "41 Y.O", minMonths: 492, maxMonths: 503 },
        { label: "42 Y.O", minMonths: 504, maxMonths: 515 },
        { label: "43 Y.O", minMonths: 516, maxMonths: 527 },
        { label: "44 Y.O", minMonths: 528, maxMonths: 539 },
        { label: "45 Y.O", minMonths: 540, maxMonths: 551 },
        { label: "46 Y.O", minMonths: 552, maxMonths: 563 },
        { label: "47 Y.O", minMonths: 564, maxMonths: 575 },
        { label: "48 Y.O", minMonths: 576, maxMonths: 587 },
        { label: "49 Y.O", minMonths: 588, maxMonths: 599 },
        { label: "50 Y.O", minMonths: 600, maxMonths: 611 },
        { label: "51 Y.O", minMonths: 612, maxMonths: 623 },
        { label: "52 Y.O", minMonths: 624, maxMonths: 635 },
        { label: "53 Y.O", minMonths: 636, maxMonths: 647 },
        { label: "54 Y.O", minMonths: 648, maxMonths: 659 },
        { label: "55 Y.O", minMonths: 660, maxMonths: 671 },
        { label: "56 Y.O", minMonths: 672, maxMonths: 683 },
        { label: "57 Y.O", minMonths: 684, maxMonths: 695 },
        { label: "58 Y.O", minMonths: 696, maxMonths: 707 },
        { label: "59 Y.O", minMonths: 708, maxMonths: 719 },
        { label: "60+ Y.O", minMonths: 720, maxMonths: 9999 },
      ];

      // Get detailed age distribution data
      const ageDistributionData = [];

      for (const ageGroup of detailedAgeGroups) {
        const sql = `
          SELECT 
            r.gender,
            COUNT(*) as count
          FROM residents r
          ${whereClause}
          AND TIMESTAMPDIFF(MONTH, r.date_of_birth, CURDATE()) BETWEEN ? AND ?
          GROUP BY r.gender
        `;

        const groupParams = [...params, ageGroup.minMonths, ageGroup.maxMonths];
        const groupData = await safeRows(sql, groupParams);

        const maleCount =
          groupData.find((item) => item.gender === "Male")?.count || 0;
        const femaleCount =
          groupData.find((item) => item.gender === "Female")?.count || 0;
        const total = maleCount + femaleCount;

        ageDistributionData.push({
          ageGroup: ageGroup.label,
          male: maleCount,
          female: femaleCount,
          total: total,
        });
      }

      // Calculate individual table totals
      const firstTableTotal = calculateTableTotal(ageDistributionData, [
        "0-5 mos",
        "0-11 mos",
        "1 Y.O",
        "2 Y.O",
        "3 Y.O",
        "4 Y.O",
        "5 Y.O",
        "6 Y.O",
        "7 Y.O",
        "8 Y.O",
        "9 Y.O",
        "10 Y.O",
      ]);
      const secondTableTotal = calculateTableTotal(ageDistributionData, [
        "11 Y.O",
        "12 Y.O",
        "13 Y.O",
        "14 Y.O",
        "15 Y.O",
        "16 Y.O",
        "17 Y.O",
        "18 Y.O",
        "19 Y.O",
        "20 Y.O",
        "21 Y.O",
        "22 Y.O",
      ]);
      const thirdTableTotal = calculateTableTotal(ageDistributionData, [
        "23 Y.O",
        "24 Y.O",
        "25 Y.O",
        "26 Y.O",
        "27 Y.O",
        "28 Y.O",
        "29 Y.O",
        "30 Y.O",
        "31 Y.O",
        "32 Y.O",
        "33 Y.O",
        "34 Y.O",
      ]);
      const fourthTableTotal = calculateTableTotal(ageDistributionData, [
        "35 Y.O",
        "36 Y.O",
        "37 Y.O",
        "38 Y.O",
        "39 Y.O",
        "40 Y.O",
        "41 Y.O",
        "42 Y.O",
        "43 Y.O",
        "44 Y.O",
        "45 Y.O",
        "46 Y.O",
      ]);
      const fifthTableTotal = calculateTableTotal(ageDistributionData, [
        "47 Y.O",
        "48 Y.O",
        "49 Y.O",
        "50 Y.O",
        "51 Y.O",
        "52 Y.O",
        "53 Y.O",
        "54 Y.O",
        "55 Y.O",
        "56 Y.O",
        "57 Y.O",
        "58 Y.O",
        "59 Y.O",
        "60+ Y.O",
      ]);

      // Calculate grand totals
      const totalMale = ageDistributionData.reduce(
        (sum, item) => sum + item.male,
        0
      );
      const totalFemale = ageDistributionData.reduce(
        (sum, item) => sum + item.female,
        0
      );
      const grandTotal = totalMale + totalFemale;

      // Add totals row for each table
      ageDistributionData.push({
        ageGroup: "Total",
        male: totalMale,
        female: totalFemale,
        total: grandTotal,
        tableTotals: {
          firstTable: firstTableTotal,
          secondTable: secondTableTotal,
          thirdTable: thirdTableTotal,
          fourthTable: fourthTableTotal,
          fifthTable: fifthTableTotal,
        },
      });

      // Also get the original grouped data for backward compatibility
      const originalSql = `
        SELECT 
          CASE 
            WHEN TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) < 1 THEN 'Infant (0-11 months)'
            WHEN TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) BETWEEN 1 AND 4 THEN 'Toddler (1-4 years)'
            WHEN TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) BETWEEN 5 AND 9 THEN 'Child (5-9 years)'
            WHEN TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) BETWEEN 10 AND 14 THEN 'Adolescent (10-14 years)'
            WHEN TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) BETWEEN 15 AND 19 THEN 'Youth (15-19 years)'
            WHEN TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) BETWEEN 20 AND 39 THEN 'Adult (20-39 years)'
            WHEN TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) BETWEEN 40 AND 59 THEN 'Middle-aged (40-59 years)'
            WHEN TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) >= 60 THEN 'Senior (60+ years)'
            ELSE 'Unknown'
          END as age_group,
          COUNT(*) as count,
          r.purok
        FROM residents r
        ${whereClause}
        GROUP BY age_group, r.purok
        ORDER BY 
          CASE 
            WHEN age_group = 'Infant (0-11 months)' THEN 1
            WHEN age_group = 'Toddler (1-4 years)' THEN 2
            WHEN age_group = 'Child (5-9 years)' THEN 3
            WHEN age_group = 'Adolescent (10-14 years)' THEN 4
            WHEN age_group = 'Youth (15-19 years)' THEN 5
            WHEN age_group = 'Adult (20-39 years)' THEN 6
            WHEN age_group = 'Middle-aged (40-59 years)' THEN 7
            WHEN age_group = 'Senior (60+ years)' THEN 8
            ELSE 9
          END, r.purok
      `;

      const originalData = await safeRows(originalSql, params);

      res.json({
        success: true,
        data: originalData,
        detailedAgeDistribution: ageDistributionData,
        total: originalData.length,
        reportType: "age-grouping",
        generatedAt: new Date().toISOString(),
        filters: { dateFrom, dateTo, purok },
      });
    } catch (err) {
      console.error("Age grouping report error:", err?.message || err);
      res.status(500).json({
        success: false,
        message: "Failed to generate age grouping report",
      });
    }
  });

  // Generate 4Ps Members Report
  router.post("/4ps-members", authenticateToken, async (req, res) => {
    try {
      const { dateFrom, dateTo, purok, preview = false } = req.body;

      let whereClause = "WHERE r.is_active = 1 AND r.is_4ps = 1";
      const params = [];

      if (dateFrom && dateTo) {
        whereClause += " AND r.created_at BETWEEN ? AND ?";
        params.push(dateFrom, dateTo);
      }

      if (purok) {
        whereClause += " AND r.purok = ?";
        params.push(purok);
      }

      const sql = `
        SELECT 
          r.resident_id,
          CONCAT(r.first_name, ' ', COALESCE(r.middle_name, ''), ' ', r.last_name, ' ', COALESCE(r.suffix, '')) as full_name,
          r.date_of_birth,
          TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) as age,
          r.gender,
          r.purok,
          r.contact_number,
          r.household_id,
          COALESCE(h.household_number, 'Not Assigned') as household_number,
          h.household_head_name,
          r.created_at as registered_date
        FROM residents r
        LEFT JOIN households h ON r.household_id = h.household_id
        ${whereClause}
        ORDER BY r.purok, r.last_name, r.first_name
      `;

      const data = await safeRows(sql, params);

      // Debug logging
      console.log("4Ps Members Report Query Result:", {
        totalRecords: data.length,
        sampleRecord: data[0],
        householdAssignments: data.map((r) => ({
          name: r.full_name,
          household_id: r.household_id,
          household_number: r.household_number,
        })),
      });

      res.json({
        success: true,
        data: data,
        total: data.length,
        reportType: "4ps-members",
        generatedAt: new Date().toISOString(),
        filters: { dateFrom, dateTo, purok },
      });
    } catch (err) {
      console.error("4Ps members report error:", err?.message || err);
      res.status(500).json({
        success: false,
        message: "Failed to generate 4Ps members report",
      });
    }
  });

  // Generate Household Summary Report
  router.post("/household-summary", authenticateToken, async (req, res) => {
    try {
      const { dateFrom, dateTo, purok, preview = false } = req.body;

      let whereClause = "WHERE 1=1";
      const params = [];

      if (dateFrom && dateTo) {
        whereClause += " AND h.created_at BETWEEN ? AND ?";
        params.push(dateFrom, dateTo);
      }

      if (purok) {
        whereClause += " AND h.purok = ?";
        params.push(purok);
      }

      const sql = `
        SELECT 
          h.household_id,
          h.household_number,
          h.household_head_name,
          h.spouse_name,
          h.address,
          h.purok,
          h.contact_number,
          COUNT(r.resident_id) as member_count,
          SUM(CASE WHEN r.gender = 'Male' THEN 1 ELSE 0 END) as male_count,
          SUM(CASE WHEN r.gender = 'Female' THEN 1 ELSE 0 END) as female_count,
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) < 18 THEN 1 ELSE 0 END) as minor_count,
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) >= 60 THEN 1 ELSE 0 END) as senior_count,
          GROUP_CONCAT(
            CONCAT(r.first_name, ' ', IFNULL(r.middle_name, ''), ' ', r.last_name, IFNULL(CONCAT(' ', r.suffix), ''))
            ORDER BY r.first_name
            SEPARATOR ', '
          ) as member_names,
          h.created_at as registered_date
        FROM households h
        LEFT JOIN residents r ON h.household_id = r.household_id AND r.is_active = 1
        ${whereClause}
        GROUP BY h.household_id, h.household_number, h.household_head_name, h.spouse_name, h.address, h.purok, h.contact_number, h.created_at
        ORDER BY h.purok, h.household_number
      `;

      const data = await safeRows(sql, params);

      res.json({
        success: true,
        data: data,
        reportType: "household-summary",
        generatedAt: new Date().toISOString(),
        filters: { dateFrom, dateTo, purok },
      });
    } catch (err) {
      console.error("Household summary report error:", err?.message || err);
      res.status(500).json({
        success: false,
        message: "Failed to generate household summary report",
      });
    }
  });

  // Generate Health Records Report
  router.post("/health-records", authenticateToken, async (req, res) => {
    try {
      const {
        dateFrom,
        dateTo,
        purok,
        bloodType,
        isPhilhealth,
        preview = false,
      } = req.body;

      let whereClause = "WHERE r.is_active = 1";
      const params = [];

      if (dateFrom && dateTo) {
        whereClause += " AND hr.created_at BETWEEN ? AND ?";
        params.push(dateFrom, dateTo);
      }

      if (purok) {
        whereClause += " AND r.purok = ?";
        params.push(purok);
      }

      if (bloodType) {
        whereClause += " AND hr.blood_type = ?";
        params.push(bloodType);
      }

      if (isPhilhealth !== undefined && isPhilhealth !== "") {
        whereClause += " AND hr.is_philhealth = ?";
        params.push(isPhilhealth);
      }

      const sql = `
        SELECT 
          hr.health_record_id,
          CONCAT(r.first_name, ' ', COALESCE(r.middle_name, ''), ' ', r.last_name, ' ', COALESCE(r.suffix, '')) as full_name,
          r.date_of_birth,
          TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) as age,
          r.gender,
          r.purok,
          hr.blood_type,
          CASE WHEN hr.is_philhealth = 1 THEN 'Yes' ELSE 'No' END as philhealth,
          hr.height,
          hr.weight,
          hr.heart_rate,
          hr.pulse_rate,
          hr.medical_conditions,
          hr.allergies,
          CONCAT(hr.emergency_contact_name, ' - ', COALESCE(hr.emergency_contact_number, 'N/A')) as emergency_contact,
          DATE(hr.created_at) as record_date
        FROM resident_health_records hr
        JOIN residents r ON hr.resident_id = r.resident_id
        ${whereClause}
        ORDER BY r.purok, r.last_name, r.first_name, hr.created_at DESC
      `;

      const data = await safeRows(sql, params);

      res.json({
        success: true,
        data: data,
        reportType: "health-records",
        generatedAt: new Date().toISOString(),
        filters: { dateFrom, dateTo, purok, bloodType, isPhilhealth },
      });
    } catch (err) {
      console.error("Health records report error:", err?.message || err);
      res.status(500).json({
        success: false,
        message: "Failed to generate health records report",
      });
    }
  });

  // Generate Maternal & Child Health Report
  router.post("/maternal-child-health", authenticateToken, async (req, res) => {
    try {
      const { dateFrom, dateTo, purok, recordType, preview = false } = req.body;

      let whereClause = "WHERE r.is_active = 1";
      const params = [];

      if (dateFrom && dateTo) {
        whereClause += " AND created_at BETWEEN ? AND ?";
      }

      if (purok) {
        whereClause += " AND r.purok = ?";
      }

      let queries = [];

      // Include Maternal Health records if recordType is empty or "Maternal"
      if (!recordType || recordType === "Maternal") {
        const maternalParams = [...params];
        if (dateFrom && dateTo) {
          maternalParams.push(dateFrom, dateTo);
        }
        if (purok) {
          maternalParams.push(purok);
        }

        const maternalSql = `
          SELECT 
            'Maternal' as record_type,
            mh.id as record_id,
            CONCAT(r.first_name, ' ', COALESCE(r.middle_name, ''), ' ', r.last_name, ' ', COALESCE(r.suffix, '')) as full_name,
            r.date_of_birth,
            TIMESTAMPDIFF(YEAR, r.date_of_birth, CURDATE()) as age,
            r.gender,
            r.purok,
            DATE(mh.lmp_date) as lmp_date,
            DATE(mh.edd) as expected_delivery_date,
            mh.prenatal_visits as antenatal_visits,
            mh.weight,
            mh.blood_pressure,
            CASE WHEN mh.delivery_date IS NOT NULL THEN 'Delivered' ELSE 'Ongoing' END as delivery_status,
            CONCAT('LMP: ', DATE_FORMAT(mh.lmp_date, '%Y-%m-%d'), ' | EDD: ', DATE_FORMAT(mh.edd, '%Y-%m-%d')) as pregnancy_status,
            DATE(mh.created_at) as record_date
          FROM maternal_health mh
          JOIN residents r ON mh.resident_id = r.resident_id
          ${whereClause.replace("created_at", "mh.created_at")}
        `;
        queries.push({ sql: maternalSql, params: maternalParams });
      }

      // Include Child Immunization records if recordType is empty or "Child Immunization"
      if (!recordType || recordType === "Child Immunization") {
        const childParams = [...params];
        if (dateFrom && dateTo) {
          childParams.push(dateFrom, dateTo);
        }
        if (purok) {
          childParams.push(purok);
        }

        const childSql = `
          SELECT 
            'Child Immunization' as record_type,
            ci.id as record_id,
            CONCAT(child.first_name, ' ', COALESCE(child.middle_name, ''), ' ', child.last_name, ' ', COALESCE(child.suffix, '')) as full_name,
            CONCAT(mother.first_name, ' ', COALESCE(mother.middle_name, ''), ' ', mother.last_name, ' ', COALESCE(mother.suffix, '')) as mother_name,
            child.date_of_birth,
            TIMESTAMPDIFF(YEAR, child.date_of_birth, CURDATE()) as age,
            child.gender,
            child.purok,
            ci.vaccine_name,
            ci.vaccine_name as pregnancy_status,
            DATE(ci.date_given) as date_given,
            DATE(ci.date_given) as expected_delivery_date,
            ci.batch_no,
            DATE(ci.next_dose_date) as next_dose_date,
            ci.given_by,
            ci.adverse_reactions,
            ci.notes,
            DATE(ci.created_at) as record_date
          FROM child_immunizations ci
          JOIN residents child ON ci.child_resident_id = child.resident_id
          LEFT JOIN residents mother ON ci.mother_resident_id = mother.resident_id
          WHERE child.is_active = 1
          ${dateFrom && dateTo ? "AND ci.created_at BETWEEN ? AND ?" : ""}
          ${purok ? "AND child.purok = ?" : ""}
        `;
        queries.push({ sql: childSql, params: childParams });
      }

      // Combine queries with UNION ALL if both types are included
      let finalSql;
      let finalParams;
      if (queries.length === 2) {
        finalSql = `${queries[0].sql} UNION ALL ${queries[1].sql} ORDER BY purok, full_name, record_date DESC`;
        finalParams = [...queries[0].params, ...queries[1].params];
      } else if (queries.length === 1) {
        finalSql = `${queries[0].sql} ORDER BY purok, full_name, record_date DESC`;
        finalParams = queries[0].params;
      } else {
        // No valid record type selected
        return res.json({
          success: true,
          data: [],
          reportType: "maternal-child-health",
          generatedAt: new Date().toISOString(),
          filters: { dateFrom, dateTo, purok, recordType },
        });
      }

      const data = await safeRows(finalSql, finalParams);

      res.json({
        success: true,
        data: data,
        reportType: "maternal-child-health",
        generatedAt: new Date().toISOString(),
        filters: { dateFrom, dateTo, purok, recordType },
      });
    } catch (err) {
      console.error(
        "Maternal & child health report error:",
        err?.message || err
      );
      res.status(500).json({
        success: false,
        message: "Failed to generate maternal & child health report",
      });
    }
  });

  // Get available puroks for filter dropdowns
  router.get("/puroks", authenticateToken, async (req, res) => {
    try {
      const data = await safeRows(`
        SELECT DISTINCT purok 
        FROM residents 
        WHERE purok IS NOT NULL AND purok != '' 
        ORDER BY purok
      `);

      res.json({
        success: true,
        data: data.map((row) => ({ value: row.purok, label: row.purok })),
      });
    } catch (err) {
      console.error("Get puroks error:", err?.message || err);
      res.status(500).json({ success: false, message: "Failed to get puroks" });
    }
  });

  // Get available health conditions for filter dropdowns
  router.get("/health-conditions", authenticateToken, async (req, res) => {
    try {
      const data = await safeRows(`
        SELECT DISTINCT health_condition 
        FROM health_records 
        WHERE health_condition IS NOT NULL AND health_condition != '' 
        ORDER BY health_condition
      `);

      res.json({
        success: true,
        data: data.map((row) => ({
          value: row.health_condition,
          label: row.health_condition,
        })),
      });
    } catch (err) {
      console.error("Get health conditions error:", err?.message || err);
      res
        .status(500)
        .json({ success: false, message: "Failed to get health conditions" });
    }
  });

  // Total Residents Report
  router.post("/total-residents", authenticateToken, async (req, res) => {
    try {
      const { purok, dateFrom, dateTo } = req.body;
      console.log("Total Residents Report - Received filters:", {
        purok,
        dateFrom,
        dateTo,
      });

      let query = `
        SELECT 
          CONCAT(first_name, ' ', last_name) as full_name,
          TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) as age,
          gender,
          purok,
          civil_status,
          contact_number,
          DATE(created_at) as registered_date
        FROM residents 
        WHERE is_active = 1
      `;

      const params = [];

      if (dateFrom && dateTo) {
        query += " AND created_at BETWEEN ? AND ?";
        params.push(dateFrom, dateTo);
      }

      if (purok) {
        query += " AND purok = ?";
        params.push(purok);
      }

      query += " ORDER BY last_name, first_name";

      console.log("Total Residents Query:", query);
      console.log("Total Residents Params:", params);

      const [rows] = await pool.query(query, params);
      console.log("Total Residents Result Count:", rows.length);

      res.json({ success: true, data: rows, total: rows.length });
    } catch (err) {
      console.error("Error generating total residents report:", err);
      res.status(500).json({
        success: false,
        message: "Failed to generate total residents report",
      });
    }
  });

  // Registered Voters Report
  router.post("/registered-voters", authenticateToken, async (req, res) => {
    try {
      const { purok, dateFrom, dateTo } = req.body;
      console.log("Registered Voters Report - Received filters:", {
        purok,
        dateFrom,
        dateTo,
      });

      let query = `
        SELECT 
          CONCAT(first_name, ' ', last_name) as full_name,
          TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) as age,
          gender,
          purok,
          civil_status,
          contact_number
        FROM residents 
        WHERE is_registered_voter = 1 AND is_active = 1
      `;

      const params = [];

      if (dateFrom && dateTo) {
        query += " AND created_at BETWEEN ? AND ?";
        params.push(dateFrom, dateTo);
      }

      if (purok) {
        query += " AND purok = ?";
        params.push(purok);
      }

      query += " ORDER BY last_name, first_name";

      const [rows] = await pool.query(query, params);
      res.json({ success: true, data: rows, total: rows.length });
    } catch (err) {
      console.error("Error generating registered voters report:", err);
      res.status(500).json({
        success: false,
        message: "Failed to generate registered voters report",
      });
    }
  });

  // Senior Citizens Report (without PWD column)
  router.post("/senior-citizens", authenticateToken, async (req, res) => {
    try {
      const { purok, dateFrom, dateTo } = req.body;
      console.log("Senior Citizens Report - Received filters:", {
        purok,
        dateFrom,
        dateTo,
      });

      let query = `
        SELECT 
          CONCAT(first_name, ' ', last_name) as full_name,
          TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) as age,
          gender,
          purok,
          civil_status,
          contact_number
        FROM residents 
        WHERE TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) >= 60 AND is_active = 1
      `;

      const params = [];

      if (dateFrom && dateTo) {
        query += " AND created_at BETWEEN ? AND ?";
        params.push(dateFrom, dateTo);
      }

      if (purok) {
        query += " AND purok = ?";
        params.push(purok);
      }

      query += " ORDER BY last_name, first_name";

      const [rows] = await pool.query(query, params);
      res.json({ success: true, data: rows, total: rows.length });
    } catch (err) {
      console.error("Error generating senior citizens report:", err);
      res.status(500).json({
        success: false,
        message: "Failed to generate senior citizens report",
      });
    }
  });

  // PWD Members Report
  router.post("/pwd-members", authenticateToken, async (req, res) => {
    try {
      const { purok, dateFrom, dateTo } = req.body;
      console.log("PWD Members Report - Received filters:", {
        purok,
        dateFrom,
        dateTo,
      });

      let query = `
        SELECT 
          CONCAT(first_name, ' ', last_name) as full_name,
          TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) as age,
          gender,
          purok,
          civil_status,
          contact_number,
          CASE 
            WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) >= 60 THEN 'PWD - Senior Citizen'
            ELSE 'PWD'
          END as pwd_type
        FROM residents 
        WHERE is_pwd = 1 AND is_active = 1
      `;

      const params = [];

      if (dateFrom && dateTo) {
        query += " AND created_at BETWEEN ? AND ?";
        params.push(dateFrom, dateTo);
      }

      if (purok) {
        query += " AND purok = ?";
        params.push(purok);
      }

      query += " ORDER BY last_name, first_name";

      const [rows] = await pool.query(query, params);
      res.json({ success: true, data: rows, total: rows.length });
    } catch (err) {
      console.error("Error generating PWD members report:", err);
      res.status(500).json({
        success: false,
        message: "Failed to generate PWD members report",
      });
    }
  });

  return router;
};
