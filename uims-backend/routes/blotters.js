const express = require("express");
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // GET all blotters
  router.get("/", authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM blotter_records ORDER BY created_at DESC"
      );
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("Fetch blotters error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch blotters" });
    }
  });

  // GET single blotter by ID
  router.get("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute(
        "SELECT * FROM blotter_records WHERE blotter_id = ?",
        [id]
      );

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Blotter not found" });
      }

      res.json({ success: true, data: rows[0] });
    } catch (err) {
      console.error("Fetch blotter error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch blotter" });
    }
  });

  // POST create blotter
  router.post("/", authenticateToken, async (req, res) => {
    try {
      const {
        complaint_id,
        incident_type,
        incident_date,
        incident_time,
        location,
        persons_involved,
        incident_details,
        action_taken,
        reported_by,
        reporter_type,
        recorded_by,
        status,
      } = req.body;

      const [result] = await pool.execute(
        `INSERT INTO blotter_records 
         (complaint_id, incident_type, incident_date, incident_time, location, persons_involved, 
          incident_details, action_taken, reported_by, reporter_type, recorded_by, status, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          complaint_id || null,
          incident_type,
          incident_date,
          incident_time || null,
          location,
          persons_involved || null,
          incident_details || null,
          action_taken || null,
          reported_by || null,
          reporter_type || null,
          recorded_by || null,
          status || "active",
        ]
      );

      const blotterId = result.insertId;

      // Log activity
      try {
        await pool.execute(
          `INSERT INTO activity_log 
           (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) 
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            req.user.user_id,
            "created",
            "blotter",
            blotterId,
            `Blotter #${blotterId} - ${incident_type}`,
            "active",
            `Created blotter record for incident: ${incident_type} at ${location}`,
          ]
        );
      } catch (logErr) {
        console.error("Failed to log activity:", logErr);
        // Don't fail the request if logging fails
      }

      res.json({
        success: true,
        data: { blotter_id: blotterId },
        message: "Blotter created successfully",
      });
    } catch (err) {
      console.error("Create blotter error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to create blotter" });
    }
  });

  // PUT update blotter
  router.put("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const {
        complaint_id,
        incident_type,
        incident_date,
        incident_time,
        location,
        persons_involved,
        incident_details,
        action_taken,
        reported_by,
        reporter_type,
        recorded_by,
        status,
      } = req.body;

      const [result] = await pool.execute(
        `UPDATE blotter_records SET 
          complaint_id = ?, incident_type = ?, incident_date = ?, incident_time = ?, 
          location = ?, persons_involved = ?, incident_details = ?, action_taken = ?, 
          reported_by = ?, reporter_type = ?, recorded_by = ?, status = ?, updated_at = NOW() 
        WHERE blotter_id = ?`,
        [
          complaint_id || null,
          incident_type,
          incident_date,
          incident_time || null,
          location,
          persons_involved || null,
          incident_details || null,
          action_taken || null,
          reported_by || null,
          reporter_type || null,
          recorded_by || null,
          status || "active",
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Blotter not found" });
      }

      // Log activity
      try {
        await pool.execute(
          `INSERT INTO activity_log 
           (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) 
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            req.user.user_id,
            "updated",
            "blotter",
            id,
            `Blotter #${id} - ${incident_type}`,
            status || "active",
            `Updated blotter record: ${incident_type} at ${location}`,
          ]
        );
      } catch (logErr) {
        console.error("Failed to log activity:", logErr);
        // Don't fail the request if logging fails
      }

      res.json({ success: true, message: "Blotter updated successfully" });
    } catch (err) {
      console.error("Update blotter error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to update blotter" });
    }
  });

  // DELETE blotter
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      // Get blotter details before deleting for logging
      const [blotterRows] = await pool.execute(
        "SELECT incident_type, location FROM blotter_records WHERE blotter_id = ?",
        [id]
      );

      const [result] = await pool.execute(
        "DELETE FROM blotter_records WHERE blotter_id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Blotter not found" });
      }

      // Log activity
      if (blotterRows.length > 0) {
        try {
          const blotter = blotterRows[0];
          await pool.execute(
            `INSERT INTO activity_log 
             (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) 
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              req.user.user_id,
              "deleted",
              "blotter",
              id,
              `Blotter #${id} - ${blotter.incident_type}`,
              "deleted",
              `Deleted blotter record: ${blotter.incident_type} at ${blotter.location}`,
            ]
          );
        } catch (logErr) {
          console.error("Failed to log activity:", logErr);
          // Don't fail the request if logging fails
        }
      }

      res.json({ success: true, message: "Blotter deleted successfully" });
    } catch (err) {
      console.error("Delete blotter error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete blotter" });
    }
  });

  return router;
};
