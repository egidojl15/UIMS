const express = require("express");
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // GET all logbook entries
  router.get("/", authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT l.*, u.full_name AS officer_in_charge, ur.role_name
          FROM logbook l
          LEFT JOIN users u ON l.user_id = u.user_id
          LEFT JOIN user_roles ur ON u.role_id = ur.role_id
          ORDER BY date_logged DESC`
      );
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("Error fetching logbook:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch logbook" });
    }
  });

  // POST create new logbook entry
  router.post("/", authenticateToken, async (req, res) => {
    try {
      const { visitor_name, address, purpose, contact_number } = req.body;

      // Validate required fields
      if (!visitor_name || !purpose) {
        return res.status(400).json({
          success: false,
          message: "Visitor name and purpose are required",
        });
      }

      // Validate contact number if provided
      if (contact_number) {
        const cleanNumber = contact_number.replace(/\D/g, "");
        if (cleanNumber.length !== 11 || !cleanNumber.startsWith("09")) {
          return res.status(400).json({
            success: false,
            message: "Contact number must be 11 digits starting with 09",
          });
        }
      }

      // Use authenticated user
      const user_id = req.user?.user_id || 1;

      const [result] = await pool.execute(
        `INSERT INTO logbook (visitor_name, address, purpose, contact_number, user_id, date_logged)
          VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          visitor_name,
          address || null,
          purpose,
          contact_number || null,
          user_id,
        ]
      );

      // Log the activity
      await pool.execute(
        `INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          user_id,
          "created",
          "logbook",
          result.insertId,
          visitor_name,
          "active",
          `Created logbook entry for visitor: ${visitor_name} - Purpose: ${purpose}`,
        ]
      );

      // Return the created entry data
      const [newEntry] = await pool.execute(
        `SELECT l.*, u.full_name AS officer_in_charge, ur.role_name
          FROM logbook l
          LEFT JOIN users u ON l.user_id = u.user_id
          LEFT JOIN user_roles ur ON u.role_id = ur.role_id
          WHERE l.logbook_id = ?`,
        [result.insertId]
      );

      res.json({
        success: true,
        logbook_id: result.insertId,
        data: newEntry[0],
        message: "Logbook entry created successfully",
      });
    } catch (err) {
      console.error("Error inserting logbook:", err);
      res.status(500).json({
        success: false,
        message: "Failed to save logbook entry",
        error: err.message,
      });
    }
  });

  // GET specific logbook entry
  router.get("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute(
        `SELECT l.*, u.full_name AS officer_in_charge, ur.role_name
          FROM logbook l
          LEFT JOIN users u ON l.user_id = u.user_id
          LEFT JOIN user_roles ur ON u.role_id = ur.role_id
          WHERE l.logbook_id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Logbook entry not found" });
      }

      res.json({ success: true, data: rows[0] });
    } catch (err) {
      console.error("Error fetching logbook entry:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch logbook entry" });
    }
  });

  // PUT update logbook entry
  router.put("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { visitor_name, address, purpose, contact_number } = req.body;

      // Validate required fields
      if (!visitor_name || !purpose) {
        return res.status(400).json({
          success: false,
          message: "Visitor name and purpose are required",
        });
      }

      // Validate contact number if provided
      if (contact_number) {
        const cleanNumber = contact_number.replace(/\D/g, "");
        if (cleanNumber.length !== 11 || !cleanNumber.startsWith("09")) {
          return res.status(400).json({
            success: false,
            message: "Contact number must be 11 digits starting with 09",
          });
        }
      }

      const [result] = await pool.execute(
        `UPDATE logbook 
          SET visitor_name = ?, address = ?, purpose = ?, contact_number = ?
          WHERE logbook_id = ?`,
        [visitor_name, address || null, purpose, contact_number || null, id]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Logbook entry not found" });
      }

      // Log the activity
      await pool.execute(
        `INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.user_id,
          "updated",
          "logbook",
          id,
          visitor_name,
          "active",
          `Updated logbook entry for visitor: ${visitor_name} - Purpose: ${purpose}`,
        ]
      );

      res.json({
        success: true,
        message: "Logbook entry updated successfully",
      });
    } catch (err) {
      console.error("Error updating logbook:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to update logbook entry" });
    }
  });

  // DELETE logbook entry
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      // Get logbook details before deletion for activity log
      const [logbookData] = await pool.execute(
        `SELECT visitor_name, purpose FROM logbook WHERE logbook_id = ?`,
        [id]
      );

      const [result] = await pool.execute(
        `DELETE FROM logbook WHERE logbook_id = ?`,
        [id]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Logbook entry not found" });
      }

      // Log the activity
      if (logbookData.length > 0) {
        const { visitor_name, purpose } = logbookData[0];
        await pool.execute(
          `INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            req.user.user_id,
            "deleted",
            "logbook",
            id,
            visitor_name,
            "deleted",
            `Deleted logbook entry for visitor: ${visitor_name} - Purpose: ${purpose}`,
          ]
        );
      }

      res.json({
        success: true,
        message: "Logbook entry deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting logbook:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete logbook entry" });
    }
  });

  return router;
};
