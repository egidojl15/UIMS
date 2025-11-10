const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

module.exports = (pool, authenticateToken) => {
  // GET All Residents
  router.get("/", authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM residents WHERE is_active = 1 ORDER BY registered_date DESC`
      );
      res.json({
        success: true,
        data: rows,
        message: "Residents fetched successfully",
      });
    } catch (err) {
      console.error("Get all residents error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch residents",
        error: err.message,
      });
    }
  });

  // Get resident category counts
  router.get("/category-counts", authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          COUNT(*) AS total_residents,
          SUM(CASE WHEN is_registered_voter = 1 THEN 1 ELSE 0 END) AS voters_count,
          SUM(CASE WHEN is_4ps = 1 THEN 1 ELSE 0 END) AS four_ps_count,
          SUM(CASE WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) >= 60 THEN 1 ELSE 0 END) AS senior_citizen_count
        FROM residents
        WHERE is_active = 1
      `);

      const counts = rows[0];
      const categoryCounts = {
        total_members: counts.total_residents,
        voters: counts.voters_count,
        four_ps: counts.four_ps_count,
        senior_citizen: counts.senior_citizen_count,
      };

      res.json({ success: true, data: categoryCounts });
    } catch (error) {
      console.error("Fetch resident category counts error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch resident category counts",
      });
    }
  });

  // Get resident list by category
  router.get(
    "/category-list/:category",
    authenticateToken,
    async (req, res) => {
      const { category } = req.params;
      let whereClause = "WHERE is_active = 1";

      switch (category) {
        case "voters":
          whereClause += " AND is_registered_voter = 1";
          break;
        case "four_ps":
          whereClause += " AND is_4ps = 1";
          break;
        case "senior_citizen":
          whereClause +=
            " AND TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) >= 60";
          break;
        case "all_members":
          break;
        default:
          return res
            .status(400)
            .json({ success: false, message: "Invalid category specified" });
      }

      try {
        const [rows] = await pool.query(`
        SELECT 
          resident_id, first_name, middle_name, last_name, suffix, date_of_birth AS birthdate, 
          gender AS sex, purok, contact_number, civil_status, occupation, is_registered_voter AS is_voter, 
          is_4ps AS is_4ps_member
        FROM residents
        ${whereClause}
        ORDER BY last_name, first_name
      `);
        res.json({ success: true, data: rows });
      } catch (error) {
        console.error(`Fetch ${category} list error:`, error);
        res.status(500).json({
          success: false,
          message: `Failed to fetch ${category} list`,
        });
      }
    }
  );

  // GET inactive residents
  router.get("/inactive", authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM residents 
         WHERE is_active = 0 
         ORDER BY updated_at DESC`
      );

      res.json({
        success: true,
        data: rows,
        message: "Inactive residents fetched successfully",
      });
    } catch (err) {
      console.error("Get inactive residents error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch inactive residents",
        error: err.message,
      });
    }
  });

  // GET single resident by ID
  router.get("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute(
        "SELECT * FROM residents WHERE resident_id = ?",
        [id]
      );

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Resident not found" });
      }

      res.json({ success: true, data: rows[0] });
    } catch (err) {
      console.error("Get resident error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch resident",
        error: err.message,
      });
    }
  });

  // POST create new resident
  router.post(
    "/",
    authenticateToken,
    upload.single("photo"),
    async (req, res) => {
      try {
        console.log("=== ADD RESIDENT REQUEST ===");
        console.log("Body:", req.body);
        console.log("File:", req.file);

        const {
          first_name,
          middle_name,
          last_name,
          suffix,
          date_of_birth,
          gender,
          civil_status,
          spouse_name,
          contact_number,
          email,
          religion,
          occupation,
          educational_attainment,
          purok,
          is_4ps,
          is_registered_voter,
          is_pwd,
          is_senior_citizen,
        } = req.body;

        // Validate required fields
        if (
          !first_name ||
          !last_name ||
          !date_of_birth ||
          !gender ||
          !civil_status ||
          !purok
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Missing required fields: first_name, last_name, date_of_birth, gender, civil_status, purok",
          });
        }

        // Handle photo upload
        let photo_url = null;
        if (req.file) {
          photo_url = `/uploads/${req.file.filename}`;
        }

        const [result] = await pool.execute(
          `INSERT INTO residents (
          first_name, middle_name, last_name, suffix, date_of_birth,
          gender, civil_status, spouse_name, contact_number, email, religion, occupation, educational_attainment, purok, is_4ps,
          is_registered_voter, is_pwd, is_senior_citizen, photo_url,
          registered_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), NOW(), NOW())`,
          [
            first_name,
            middle_name || null,
            last_name,
            suffix || null,
            date_of_birth,
            gender,
            civil_status,
            spouse_name || null,
            contact_number || null,
            email || null,
            religion || null,
            occupation || null,
            educational_attainment || null,
            purok,
            Number(is_4ps || 0),
            Number(is_registered_voter || 0),
            Number(is_pwd || 0),
            Number(is_senior_citizen || 0),
            photo_url,
          ]
        );

        console.log("Resident added successfully with ID:", result.insertId);

        // Log the activity
        const residentName = `${first_name} ${
          middle_name ? middle_name + " " : ""
        }${last_name}${suffix ? " " + suffix : ""}`;
        await pool.execute(
          "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
          [
            req.user.user_id,
            "created",
            "resident",
            result.insertId,
            residentName,
            "active",
            `Created new resident: ${residentName} (ID: ${result.insertId})`,
          ]
        );

        res.json({
          success: true,
          data: { resident_id: result.insertId },
          message: "Resident added successfully",
        });
      } catch (error) {
        console.error("Add resident error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to add resident",
          error: error.message,
        });
      }
    }
  );

  // PUT update resident
  router.put(
    "/:id",
    authenticateToken,
    upload.single("photo"),
    async (req, res) => {
      try {
        console.log("=== UPDATE RESIDENT REQUEST ===");
        console.log("Request body:", req.body);
        console.log("Request params:", req.params);
        const { id } = req.params;
        const {
          first_name,
          middle_name,
          last_name,
          suffix,
          date_of_birth,
          gender,
          civil_status,
          spouse_name,
          contact_number,
          email,
          religion,
          occupation,
          educational_attainment,
          purok,
          is_4ps,
          is_registered_voter,
          is_pwd,
          is_senior_citizen,
          household_id,
        } = req.body;

        console.log(
          "Extracted household_id:",
          household_id,
          "Type:",
          typeof household_id
        );
        console.log("Request body keys:", Object.keys(req.body));
        console.log("household_id in req.body:", "household_id" in req.body);

        // Check if this is a partial update (only household_id)
        const isPartialUpdate =
          Object.keys(req.body).length === 1 && "household_id" in req.body;
        console.log("Is partial update:", isPartialUpdate);

        if (isPartialUpdate) {
          // For partial updates, only update the household_id field
          const [result] = await pool.execute(
            `UPDATE residents SET household_id = ?, updated_at = NOW() WHERE resident_id = ?`,
            [
              household_id === "" ||
              household_id === "null" ||
              household_id === undefined
                ? null
                : household_id,
              id,
            ]
          );

          if (result.affectedRows === 0) {
            return res
              .status(404)
              .json({ success: false, message: "Resident not found" });
          }

          console.log("Resident household_id updated successfully");

          // Log the activity for partial update
          const [residentData] = await pool.execute(
            "SELECT first_name, middle_name, last_name, suffix FROM residents WHERE resident_id = ?",
            [id]
          );
          if (residentData.length > 0) {
            const r = residentData[0];
            const residentName = `${r.first_name} ${
              r.middle_name ? r.middle_name + " " : ""
            }${r.last_name}${r.suffix ? " " + r.suffix : ""}`;
            await pool.execute(
              "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
              [
                req.user.user_id,
                "updated",
                "resident",
                id,
                residentName,
                "active",
                `Updated household assignment for resident: ${residentName} (ID: ${id})`,
              ]
            );
          }

          res.json({ success: true, message: "Resident updated successfully" });
          return;
        }

        // Check if resident exists first
        const [exists] = await pool.execute(
          "SELECT resident_id FROM residents WHERE resident_id = ?",
          [id]
        );
        if (exists.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Resident not found" });
        }

        // Handle photo upload
        let photoUpdateSql = "";
        let photoParam = [];
        if (req.file) {
          photoUpdateSql = ", photo_url = ?";
          photoParam = [`/uploads/${req.file.filename}`];
        }

        const [result] = await pool.execute(
          `UPDATE residents SET 
          first_name = ?, middle_name = ?, last_name = ?, suffix = ?, 
          date_of_birth = ?, gender = ?, civil_status = ?, spouse_name = ?, contact_number = ?, 
          email = ?, religion = ?, occupation = ?, 
          educational_attainment = ?, purok = ?, is_4ps = ?, is_registered_voter = ?, 
          is_pwd = ?, is_senior_citizen = ?, household_id = ?, updated_at = NOW()${photoUpdateSql}
        WHERE resident_id = ?`,
          [
            first_name,
            middle_name || null,
            last_name,
            suffix || null,
            date_of_birth,
            gender,
            civil_status,
            spouse_name || null,
            contact_number || null,
            email || null,
            religion || null,
            occupation || null,
            educational_attainment || null,
            purok,
            Number(is_4ps || 0),
            Number(is_registered_voter || 0),
            Number(is_pwd || 0),
            Number(is_senior_citizen || 0),
            household_id === "" ||
            household_id === "null" ||
            household_id === undefined
              ? null
              : household_id,
            ...photoParam,
            id,
          ]
        );

        if (result.affectedRows === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Resident not found" });
        }

        console.log("Resident updated successfully");

        // Log the activity for full update
        const residentName = `${first_name} ${
          middle_name ? middle_name + " " : ""
        }${last_name}${suffix ? " " + suffix : ""}`;
        await pool.execute(
          "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
          [
            req.user.user_id,
            "updated",
            "resident",
            id,
            residentName,
            "active",
            `Updated resident information: ${residentName} (ID: ${id})`,
          ]
        );

        res.json({ success: true, message: "Resident updated successfully" });
      } catch (error) {
        console.error("Update resident error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update resident",
          error: error.message,
        });
      }
    }
  );

  // DELETE soft delete resident
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      console.log("=== SOFT DELETING RESIDENT ===");
      const { id } = req.params;
      const { new_address } = req.query || {};

      console.log("Request params:", req.params);
      console.log("Request query:", req.query);
      console.log("New address received:", new_address);

      if (!id || isNaN(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid resident ID" });
      }

      // Check if resident exists and is active
      const [existingResident] = await pool.execute(
        "SELECT resident_id, is_active, first_name, last_name FROM residents WHERE resident_id = ?",
        [id]
      );

      if (existingResident.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Resident not found" });
      }

      if (existingResident[0].is_active === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Resident already inactive" });
      }

      // Perform the soft delete with new address tracking
      const [result] = await pool.execute(
        "UPDATE residents SET is_active = 0, new_address = ?, updated_at = NOW() WHERE resident_id = ?",
        [new_address || null, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Resident not found or already inactive",
        });
      }

      // Create remarks with new address if provided
      const residentName = `${existingResident[0].first_name} ${existingResident[0].last_name}`;
      let remarks = `Resident ${residentName} (ID: ${id}) marked as inactive via soft delete`;
      if (new_address && new_address.trim()) {
        remarks += `. New address: ${new_address.trim()}`;
      }

      // Log the activity
      await pool.execute(
        "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [
          req.user.user_id,
          "soft_deleted",
          "resident",
          id,
          `Resident ID ${id}`,
          "inactive",
          remarks,
        ]
      );

      res.json({
        success: true,
        message: "Resident soft-deleted successfully",
        new_address: new_address || null,
      });
    } catch (err) {
      console.error("Soft delete resident error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to soft delete resident",
        error: err.message,
      });
    }
  });

  // POST restore specific residents
  router.post("/restore", authenticateToken, async (req, res) => {
    try {
      const { resident_ids } = req.body;

      if (
        !resident_ids ||
        !Array.isArray(resident_ids) ||
        resident_ids.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid or empty resident_ids array",
        });
      }

      const placeholders = resident_ids.map(() => "?").join(",");
      const [result] = await pool.execute(
        `UPDATE residents SET is_active = 1, updated_at = NOW() WHERE resident_id IN (${placeholders})`,
        resident_ids
      );

      // Log the activity
      for (const id of resident_ids) {
        await pool.execute(
          "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
          [
            req.user.user_id,
            "restored",
            "resident",
            id,
            `Resident ID ${id}`,
            "active",
            "Resident restored from inactive status",
          ]
        );
      }

      res.json({
        success: true,
        message: `${result.affectedRows} resident(s) restored successfully`,
        count: result.affectedRows,
      });
    } catch (err) {
      console.error("Restore residents error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to restore residents",
        error: err.message,
      });
    }
  });

  // POST restore all inactive residents
  router.post("/restore-all", authenticateToken, async (req, res) => {
    try {
      const [result] = await pool.execute(
        "UPDATE residents SET is_active = 1, updated_at = NOW() WHERE is_active = 0"
      );

      // Log the activity
      await pool.execute(
        "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [
          req.user.user_id,
          "restored_all",
          "resident",
          null,
          "All inactive residents",
          "active",
          `Restored all ${result.affectedRows} inactive residents`,
        ]
      );

      res.json({
        success: true,
        message: `${result.affectedRows} resident(s) restored successfully`,
        count: result.affectedRows,
      });
    } catch (err) {
      console.error("Restore all residents error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to restore all residents",
        error: err.message,
      });
    }
  });

  // PUT update resident photo
  router.put(
    "/photo/:id",
    authenticateToken,
    upload.single("photo"),
    async (req, res) => {
      try {
        const { id } = req.params;
        if (!req.file) {
          return res
            .status(400)
            .json({ success: false, message: "No file uploaded." });
        }
        const photoUrl = `/uploads/${req.file.filename}`;
        const [result] = await pool.execute(
          `UPDATE residents SET photo_url = ?, updated_at = NOW() WHERE resident_id = ?`,
          [photoUrl, id]
        );

        if (result.affectedRows === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Resident not found" });
        }

        res.json({
          success: true,
          message: "Photo updated successfully",
          photoUrl: photoUrl,
        });
      } catch (error) {
        console.error("Update photo error:", error);
        res
          .status(500)
          .json({ success: false, message: "Failed to update photo" });
      }
    }
  );

  // POST verify resident (public)
  router.post("/verify", async (req, res) => {
    try {
      const { firstName, lastName, birthDate } = req.body;

      if (!firstName || !lastName || !birthDate) {
        return res
          .status(400)
          .json({ verified: false, message: "Missing required fields" });
      }

      // Normalize incoming date to YYYY-MM-DD
      let dob = null;
      try {
        const d = new Date(birthDate);
        if (!isNaN(d)) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          dob = `${yyyy}-${mm}-${dd}`;
        } else {
          dob = birthDate;
        }
      } catch {
        dob = birthDate;
      }

      const [rows] = await pool.execute(
        `SELECT resident_id, first_name, middle_name, last_name, date_of_birth, contact_number, purok
         FROM residents
         WHERE LOWER(TRIM(first_name)) = LOWER(TRIM(?))
           AND LOWER(TRIM(last_name)) = LOWER(TRIM(?))
           AND date_of_birth = ?
         LIMIT 1`,
        [firstName, lastName, dob]
      );

      if (rows && rows.length > 0) {
        const resident = rows[0];
        const display_name = `${resident.first_name}${
          resident.middle_name ? " " + resident.middle_name : ""
        } ${resident.last_name}`
          .replace(/\s+/g, " ")
          .trim();

        return res.json({
          verified: true,
          resident: { ...resident, display_name },
        });
      } else {
        return res.json({ verified: false, message: "Resident not found" });
      }
    } catch (err) {
      console.error("Error in verify resident:", err);
      return res.status(500).json({ verified: false, message: "Server error" });
    }
  });

  return router;
};
