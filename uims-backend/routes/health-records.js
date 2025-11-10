const express = require("express");
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // GET all resident health records
  router.get("/", authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          h.*,
          CONCAT(r.first_name, ' ', IFNULL(r.middle_name, ''), ' ', r.last_name) as resident_name,
          r.first_name,
          r.middle_name,
          r.last_name,
          r.contact_number as resident_contact_number
        FROM resident_health_records h
        LEFT JOIN residents r ON h.resident_id = r.resident_id
        ORDER BY h.created_at DESC
      `);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error("Fetch resident health records error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch resident health records",
      });
    }
  });

  // GET single health record by ID
  router.get("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute(
        `
        SELECT 
          h.*,
          CONCAT(r.first_name, ' ', IFNULL(r.middle_name, ''), ' ', r.last_name) as resident_name,
          r.first_name,
          r.middle_name,
          r.last_name,
          r.contact_number as resident_contact_number
        FROM resident_health_records h
        LEFT JOIN residents r ON h.resident_id = r.resident_id
        WHERE h.health_record_id = ?
      `,
        [id]
      );
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Health record not found" });
      }
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      console.error("Fetch resident health record error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch resident health record",
      });
    }
  });

  // POST create health record
  router.post("/", authenticateToken, async (req, res) => {
    try {
      const {
        resident_id,
        blood_type,
        height,
        weight,
        heart_rate,
        pulse_rate,
        medical_conditions,
        allergies,
        emergency_contact_name,
        emergency_contact_number,
        is_philhealth,
      } = req.body;

      const [result] = await pool.execute(
        `INSERT INTO resident_health_records (
          resident_id, blood_type, height, weight, heart_rate, pulse_rate,
          medical_conditions, allergies, emergency_contact_name, 
          emergency_contact_number, created_at, updated_at, is_philhealth
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
        [
          resident_id,
          blood_type,
          height,
          weight,
          heart_rate,
          pulse_rate,
          medical_conditions,
          allergies,
          emergency_contact_name,
          emergency_contact_number,
          Number(is_philhealth || 0),
        ]
      );

      const recordId = result.insertId;

      // Get resident name for logging
      const [resident] = await pool.execute(
        "SELECT CONCAT(first_name, ' ', last_name) as name FROM residents WHERE resident_id = ?",
        [resident_id]
      );
      const residentName = resident[0]?.name || `Resident #${resident_id}`;

      // Log activity
      try {
        await pool.execute(
          `INSERT INTO activity_log 
           (user_id, action, entity_type, entity_id, entity_identifier, status, remarks) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.user_id,
            "Create Health Record",
            "health_record",
            recordId,
            residentName,
            "completed",
            `Added health record for ${residentName} (Blood Type: ${
              blood_type || "N/A"
            })`,
          ]
        );
      } catch (logErr) {
        console.error("Failed to log activity:", logErr);
      }

      res.json({
        success: true,
        data: { health_record_id: recordId },
        message: "Health record added successfully",
      });
    } catch (error) {
      console.error("Add resident health record error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add resident health record",
      });
    }
  });

  // PUT update health record
  router.put("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const {
        resident_id,
        blood_type,
        height,
        weight,
        heart_rate,
        pulse_rate,
        medical_conditions,
        allergies,
        emergency_contact_name,
        emergency_contact_number,
        is_philhealth,
      } = req.body;

      const [result] = await pool.execute(
        `UPDATE resident_health_records SET
          resident_id = ?, blood_type = ?, height = ?, weight = ?, 
          heart_rate = ?, pulse_rate = ?,
          medical_conditions = ?, allergies = ?, emergency_contact_name = ?, 
          emergency_contact_number = ?, updated_at = NOW(), is_philhealth = ?
        WHERE health_record_id = ?`,
        [
          resident_id,
          blood_type,
          height,
          weight,
          heart_rate,
          pulse_rate,
          medical_conditions,
          allergies,
          emergency_contact_name,
          emergency_contact_number,
          Number(is_philhealth || 0),
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Health record not found" });
      }

      // Get resident name for logging
      const [resident] = await pool.execute(
        "SELECT CONCAT(first_name, ' ', last_name) as name FROM residents WHERE resident_id = ?",
        [resident_id]
      );
      const residentName = resident[0]?.name || `Resident #${resident_id}`;

      // Log activity
      try {
        await pool.execute(
          `INSERT INTO activity_log 
           (user_id, action, entity_type, entity_id, entity_identifier, status, remarks) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.user_id,
            "Update Health Record",
            "health_record",
            id,
            residentName,
            "completed",
            `Updated health record for ${residentName} (Blood Type: ${
              blood_type || "N/A"
            })`,
          ]
        );
      } catch (logErr) {
        console.error("Failed to log activity:", logErr);
      }

      res.json({
        success: true,
        message: "Health record updated successfully",
      });
    } catch (error) {
      console.error("Update resident health record error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update resident health record",
      });
    }
  });

  // DELETE health record
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      // Get health record details before deleting
      const [record] = await pool.execute(
        `SELECT h.health_record_id, CONCAT(r.first_name, ' ', r.last_name) as resident_name
         FROM resident_health_records h
         LEFT JOIN residents r ON h.resident_id = r.resident_id
         WHERE h.health_record_id = ?`,
        [id]
      );

      const [result] = await pool.execute(
        `DELETE FROM resident_health_records WHERE health_record_id = ?`,
        [id]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Health record not found" });
      }

      // Log activity
      if (record.length > 0) {
        try {
          await pool.execute(
            `INSERT INTO activity_log 
             (user_id, action, entity_type, entity_id, entity_identifier, status, remarks) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              req.user.user_id,
              "Delete Health Record",
              "health_record",
              id,
              record[0].resident_name || `Record #${id}`,
              "completed",
              `Deleted health record for ${
                record[0].resident_name || "Unknown Resident"
              }`,
            ]
          );
        } catch (logErr) {
          console.error("Failed to log activity:", logErr);
        }
      }

      res.json({
        success: true,
        message: "Health record deleted successfully",
      });
    } catch (error) {
      console.error("Delete resident health record error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete resident health record",
      });
    }
  });

  return router;
};
