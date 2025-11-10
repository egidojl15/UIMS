const express = require("express");
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // GET all death records
  router.get("/", authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT d.*, 
               d.resident_id,
               CONCAT(r.first_name, ' ', r.last_name) AS resident_name,
               r.date_of_birth AS dob
        FROM deaths d
        JOIN residents r ON d.resident_id = r.resident_id
        ORDER BY d.date_of_death DESC
      `);
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("Get death records error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch death records",
      });
    }
  });

  // POST create death record
  router.post("/", authenticateToken, async (req, res) => {
    try {
      const {
        resident_id,
        date_of_death,
        cause_of_death,
        place_of_death,
        notes,
      } = req.body;

      // Validate required fields
      if (!resident_id || !date_of_death) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: resident_id and date_of_death are required",
        });
      }

      // Validate resident_id
      const [residentExists] = await pool.execute(
        "SELECT resident_id FROM residents WHERE resident_id = ? AND is_active = 1",
        [resident_id]
      );
      if (residentExists.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid resident_id: Resident not found or inactive",
        });
      }

      const [result] = await pool.execute(
        `INSERT INTO deaths (
          resident_id, date_of_death, cause_of_death, place_of_death, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          resident_id,
          date_of_death,
          cause_of_death || null,
          place_of_death || null,
          notes || null,
        ]
      );

      // Optionally deactivate the resident
      await pool.execute(
        "UPDATE residents SET is_active = 0 WHERE resident_id = ?",
        [resident_id]
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
          "death_record",
          result.insertId,
          residentName,
          "completed",
          `Created death record for ${residentName} (Death ID: ${result.insertId}, Resident ID: ${resident_id})`,
        ]
      );

      res.json({
        success: true,
        data: { id: result.insertId },
        message: "Death record created successfully",
      });
    } catch (err) {
      console.error("Create death record error:", err);
      res.status(500).json({
        success: false,
        message: `Failed to create death record: ${err.message}`,
      });
    }
  });

  // PUT update death record
  router.put("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const {
        resident_id,
        date_of_death,
        cause_of_death,
        place_of_death,
        notes,
      } = req.body;

      // Validate required fields
      if (!resident_id || !date_of_death) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: resident_id and date_of_death are required",
        });
      }

      await pool.execute(
        `UPDATE deaths SET
          resident_id = ?, date_of_death = ?, cause_of_death = ?, place_of_death = ?,
          notes = ?, updated_at = NOW()
        WHERE id = ?`,
        [
          resident_id,
          date_of_death,
          cause_of_death || null,
          place_of_death || null,
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
          "death_record",
          id,
          residentName,
          "completed",
          `Updated death record for ${residentName} (Death ID: ${id}, Resident ID: ${resident_id})`,
        ]
      );

      res.json({ success: true, message: "Death record updated successfully" });
    } catch (err) {
      console.error("Update death record error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to update death record",
      });
    }
  });

  // DELETE death record
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      // Get death record details before deletion for activity log
      const [deathData] = await pool.execute(
        "SELECT d.resident_id, CONCAT(r.first_name, ' ', IFNULL(CONCAT(r.middle_name, ' '), ''), r.last_name, IFNULL(CONCAT(' ', r.suffix), '')) AS resident_name FROM deaths d JOIN residents r ON d.resident_id = r.resident_id WHERE d.id = ?",
        [id]
      );

      await pool.execute("DELETE FROM deaths WHERE id = ?", [id]);

      // Log the activity
      if (deathData.length > 0) {
        const residentName = deathData[0].resident_name;
        const residentId = deathData[0].resident_id;
        await pool.execute(
          "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
          [
            req.user.user_id,
            "deleted",
            "death_record",
            id,
            residentName,
            "deleted",
            `Deleted death record for ${residentName} (Death ID: ${id}, Resident ID: ${residentId})`,
          ]
        );
      }

      res.json({ success: true, message: "Death record deleted successfully" });
    } catch (err) {
      console.error("Delete death record error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to delete death record",
      });
    }
  });

  return router;
};
