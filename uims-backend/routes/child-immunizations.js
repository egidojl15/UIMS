const express = require("express");
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // GET all child immunizations
  router.get("/", authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT ci.*, 
               CONCAT(c.first_name, ' ', c.last_name) AS child_name,
               CONCAT(m.first_name, ' ', m.last_name) AS mother_name_from_resident,
               c.date_of_birth AS dob
        FROM child_immunizations ci
        JOIN residents c ON ci.child_resident_id = c.resident_id
        LEFT JOIN residents m ON ci.mother_resident_id = m.resident_id
        WHERE c.is_active = 1
        ORDER BY ci.date_given DESC
      `);
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("Get child immunizations error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch child immunization records",
      });
    }
  });

  // POST create child immunization record
  router.post("/", authenticateToken, async (req, res) => {
    try {
      const {
        child_resident_id,
        mother_resident_id,
        parent_name,
        father_name,
        mother_name,
        vaccine_name,
        date_given,
        batch_no,
        next_dose_date,
        given_by,
        adverse_reactions,
        notes,
      } = req.body;

      // Validate required fields
      if (!child_resident_id || !vaccine_name) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: child_resident_id and vaccine_name are required",
        });
      }

      // Validate child_resident_id
      const [childExists] = await pool.execute(
        "SELECT resident_id FROM residents WHERE resident_id = ? AND is_active = 1",
        [child_resident_id]
      );
      if (childExists.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid child_resident_id: Resident not found or inactive",
        });
      }

      // Validate mother_resident_id if provided
      if (mother_resident_id) {
        const [motherExists] = await pool.execute(
          "SELECT resident_id FROM residents WHERE resident_id = ? AND is_active = 1",
          [mother_resident_id]
        );
        if (motherExists.length === 0) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid mother_resident_id: Resident not found or inactive",
          });
        }
      }

      const [result] = await pool.execute(
        `INSERT INTO child_immunizations (
          child_resident_id, mother_resident_id, parent_name, father_name, mother_name,
          vaccine_name, date_given, batch_no, next_dose_date, given_by, adverse_reactions, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          parseInt(child_resident_id),
          mother_resident_id ? parseInt(mother_resident_id) : null,
          parent_name || null,
          father_name || null,
          mother_name || null,
          vaccine_name,
          date_given || null,
          batch_no || null,
          next_dose_date || null,
          given_by || null,
          adverse_reactions || null,
          notes || null,
        ]
      );

      // Get child name for activity log
      const [childData] = await pool.execute(
        "SELECT first_name, middle_name, last_name, suffix FROM residents WHERE resident_id = ?",
        [child_resident_id]
      );
      const c = childData[0];
      const childName = `${c.first_name} ${
        c.middle_name ? c.middle_name + " " : ""
      }${c.last_name}${c.suffix ? " " + c.suffix : ""}`;

      // Log the activity
      await pool.execute(
        "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [
          req.user.user_id,
          "created",
          "child_immunization",
          result.insertId,
          childName,
          "completed",
          `Created immunization record for ${childName} - Vaccine: ${vaccine_name} (Record ID: ${result.insertId})`,
        ]
      );

      res.json({
        success: true,
        data: { id: result.insertId },
        message: "Child immunization record created successfully",
      });
    } catch (err) {
      console.error("Create child immunization error:", err);
      res.status(500).json({
        success: false,
        message: `Failed to create child immunization record: ${err.message}`,
      });
    }
  });

  // PUT update child immunization record
  router.put("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const {
        child_resident_id,
        mother_resident_id,
        parent_name,
        father_name,
        mother_name,
        vaccine_name,
        date_given,
        batch_no,
        next_dose_date,
        given_by,
        adverse_reactions,
        notes,
      } = req.body;

      await pool.execute(
        `UPDATE child_immunizations SET
          child_resident_id = ?, mother_resident_id = ?, parent_name = ?, father_name = ?, mother_name = ?,
          vaccine_name = ?, date_given = ?, batch_no = ?, next_dose_date = ?, given_by = ?, adverse_reactions = ?,
          notes = ?, updated_at = NOW()
        WHERE id = ?`,
        [
          child_resident_id,
          mother_resident_id || null,
          parent_name || null,
          father_name || null,
          mother_name || null,
          vaccine_name,
          date_given || null,
          batch_no || null,
          next_dose_date || null,
          given_by || null,
          adverse_reactions || null,
          notes || null,
          id,
        ]
      );

      // Get child name for activity log
      const [childData] = await pool.execute(
        "SELECT first_name, middle_name, last_name, suffix FROM residents WHERE resident_id = ?",
        [child_resident_id]
      );
      const c = childData[0];
      const childName = `${c.first_name} ${
        c.middle_name ? c.middle_name + " " : ""
      }${c.last_name}${c.suffix ? " " + c.suffix : ""}`;

      // Log the activity
      await pool.execute(
        "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [
          req.user.user_id,
          "updated",
          "child_immunization",
          id,
          childName,
          "completed",
          `Updated immunization record for ${childName} - Vaccine: ${vaccine_name} (Record ID: ${id})`,
        ]
      );

      res.json({
        success: true,
        message: "Child immunization record updated successfully",
      });
    } catch (err) {
      console.error("Update child immunization error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to update child immunization record",
      });
    }
  });

  // DELETE child immunization record
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      // Get immunization record details before deletion for activity log
      const [immunizationData] = await pool.execute(
        "SELECT ci.child_resident_id, ci.vaccine_name, CONCAT(c.first_name, ' ', IFNULL(CONCAT(c.middle_name, ' '), ''), c.last_name, IFNULL(CONCAT(' ', c.suffix), '')) AS child_name FROM child_immunizations ci JOIN residents c ON ci.child_resident_id = c.resident_id WHERE ci.id = ?",
        [id]
      );

      await pool.execute("DELETE FROM child_immunizations WHERE id = ?", [id]);

      // Log the activity
      if (immunizationData.length > 0) {
        const childName = immunizationData[0].child_name;
        const vaccineName = immunizationData[0].vaccine_name;
        await pool.execute(
          "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
          [
            req.user.user_id,
            "deleted",
            "child_immunization",
            id,
            childName,
            "deleted",
            `Deleted immunization record for ${childName} - Vaccine: ${vaccineName} (Record ID: ${id})`,
          ]
        );
      }

      res.json({
        success: true,
        message: "Child immunization record deleted successfully",
      });
    } catch (err) {
      console.error("Delete child immunization error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to delete child immunization record",
      });
    }
  });

  return router;
};
