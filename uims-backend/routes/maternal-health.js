const express = require("express");
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // GET all maternal health records
  router.get("/", authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT mh.*, 
               CONCAT(r.first_name, ' ', r.last_name) AS resident_name,
               r.date_of_birth AS dob
        FROM maternal_health mh
        JOIN residents r ON mh.resident_id = r.resident_id
        WHERE r.is_active = 1
        ORDER BY mh.created_at DESC
      `);
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("Get maternal health error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch maternal health records",
      });
    }
  });

  // POST create maternal health record
  router.post("/", authenticateToken, async (req, res) => {
    try {
      const {
        resident_id,
        lmp_date,
        edd,
        prenatal_visits,
        blood_pressure,
        weight,
        hemoglobin,
        tetanus_vaccination,
        iron_supplement,
        complications,
        delivery_date,
        delivery_type,
        baby_weight,
        notes,
      } = req.body;

      const [result] = await pool.execute(
        `INSERT INTO maternal_health (
          resident_id, lmp_date, edd, prenatal_visits, blood_pressure, weight,
          hemoglobin, tetanus_vaccination, iron_supplement, complications,
          delivery_date, delivery_type, baby_weight, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          resident_id,
          lmp_date || null,
          edd || null,
          prenatal_visits || null,
          blood_pressure || null,
          weight || null,
          hemoglobin || null,
          tetanus_vaccination ? 1 : 0,
          iron_supplement ? 1 : 0,
          complications || null,
          delivery_date || null,
          delivery_type || null,
          baby_weight || null,
          notes || null,
        ]
      );

      // Get resident name for activity log
      const [residentData] = await pool.execute(
        "SELECT first_name, middle_name, last_name, suffix FROM residents WHERE resident_id = ?",
        [resident_id]
      );
      const r = residentData[0];
      const residentName = `${r.first_name} ${
        r.middle_name ? r.middle_name + " " : ""
      }${r.last_name}${r.suffix ? " " + r.suffix : ""}`;

      // Log the activity
      await pool.execute(
        "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [
          req.user.user_id,
          "created",
          "maternal_health",
          result.insertId,
          residentName,
          "active",
          `Created maternal health record for ${residentName} (Record ID: ${result.insertId})`,
        ]
      );

      res.json({
        success: true,
        data: { id: result.insertId },
        message: "Maternal health record created successfully",
      });
    } catch (err) {
      console.error("Create maternal health error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to create maternal health record",
      });
    }
  });

  // PUT update maternal health record
  router.put("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const {
        resident_id,
        lmp_date,
        edd,
        prenatal_visits,
        blood_pressure,
        weight,
        hemoglobin,
        tetanus_vaccination,
        iron_supplement,
        complications,
        delivery_date,
        delivery_type,
        baby_weight,
        notes,
      } = req.body;

      await pool.execute(
        `UPDATE maternal_health SET
          resident_id = ?, lmp_date = ?, edd = ?, prenatal_visits = ?, blood_pressure = ?,
          weight = ?, hemoglobin = ?, tetanus_vaccination = ?, iron_supplement = ?,
          complications = ?, delivery_date = ?, delivery_type = ?, baby_weight = ?,
          notes = ?, updated_at = NOW()
        WHERE id = ?`,
        [
          resident_id,
          lmp_date || null,
          edd || null,
          prenatal_visits || null,
          blood_pressure || null,
          weight || null,
          hemoglobin || null,
          tetanus_vaccination ? 1 : 0,
          iron_supplement ? 1 : 0,
          complications || null,
          delivery_date || null,
          delivery_type || null,
          baby_weight || null,
          notes || null,
          id,
        ]
      );

      // Get resident name for activity log
      const [residentData] = await pool.execute(
        "SELECT first_name, middle_name, last_name, suffix FROM residents WHERE resident_id = ?",
        [resident_id]
      );
      const r = residentData[0];
      const residentName = `${r.first_name} ${
        r.middle_name ? r.middle_name + " " : ""
      }${r.last_name}${r.suffix ? " " + r.suffix : ""}`;

      // Log the activity
      await pool.execute(
        "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [
          req.user.user_id,
          "updated",
          "maternal_health",
          id,
          residentName,
          "active",
          `Updated maternal health record for ${residentName} (Record ID: ${id})`,
        ]
      );

      res.json({
        success: true,
        message: "Maternal health record updated successfully",
      });
    } catch (err) {
      console.error("Update maternal health error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to update maternal health record",
      });
    }
  });

  // DELETE maternal health record
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      // Get maternal health record details before deletion for activity log
      const [maternalData] = await pool.execute(
        "SELECT mh.resident_id, CONCAT(r.first_name, ' ', IFNULL(CONCAT(r.middle_name, ' '), ''), r.last_name, IFNULL(CONCAT(' ', r.suffix), '')) AS resident_name FROM maternal_health mh JOIN residents r ON mh.resident_id = r.resident_id WHERE mh.id = ?",
        [id]
      );

      await pool.execute("DELETE FROM maternal_health WHERE id = ?", [id]);

      // Log the activity
      if (maternalData.length > 0) {
        const residentName = maternalData[0].resident_name;
        await pool.execute(
          "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
          [
            req.user.user_id,
            "deleted",
            "maternal_health",
            id,
            residentName,
            "deleted",
            `Deleted maternal health record for ${residentName} (Record ID: ${id})`,
          ]
        );
      }

      res.json({
        success: true,
        message: "Maternal health record deleted successfully",
      });
    } catch (err) {
      console.error("Delete maternal health error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to delete maternal health record",
      });
    }
  });

  return router;
};
