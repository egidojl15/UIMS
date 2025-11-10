const express = require("express");
const router = express.Router();

// Generate complaint number
function generateComplaintNumber() {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `COMP-${timestamp}-${random}`;
}

module.exports = (pool, authenticateToken) => {
  // GET all complaints
  router.get("/", authenticateToken, async (req, res) => {
    try {
      const { status, search, page = 1, limit = 10 } = req.query;

      let query = `
        SELECT 
          c.*,
          CASE 
            WHEN c.complainant_type = 'resident' THEN CONCAT(r.first_name, ' ', COALESCE(r.middle_name, ''), ' ', r.last_name)
            ELSE c.non_resident_name
          END AS complainant_name,
          cc.category_name,
          u.full_name as assigned_officer,
          creator.full_name as created_by_name
        FROM complaints c
        LEFT JOIN residents r ON c.resident_id = r.resident_id AND c.complainant_type = 'resident'
        LEFT JOIN complaint_categories cc ON c.category_id = cc.category_id
        LEFT JOIN users u ON c.assigned_to = u.user_id
        LEFT JOIN users creator ON c.created_by = creator.user_id
        WHERE 1=1
      `;

      const params = [];

      if (status && status !== "all") {
        query += " AND c.status = ?";
        params.push(status);
      }

      if (search) {
        query += ` AND (
          c.complaint_number LIKE ? OR 
          c.respondent_name LIKE ? OR
          c.non_resident_name LIKE ? OR
          CONCAT(r.first_name, ' ', r.last_name) LIKE ?
        )`;
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam);
      }

      query += " ORDER BY c.created_at DESC";

      // Add pagination
      if (page && limit) {
        const offset = (page - 1) * limit;
        query += " LIMIT ? OFFSET ?";
        params.push(parseInt(limit), offset);
      }

      const [rows] = await pool.execute(query, params);

      // Get total count for pagination
      let countQuery = "SELECT COUNT(*) as total FROM complaints c WHERE 1=1";
      const countParams = [];

      if (status && status !== "all") {
        countQuery += " AND c.status = ?";
        countParams.push(status);
      }

      if (search) {
        countQuery += ` AND (
          c.complaint_number LIKE ? OR 
          c.respondent_name LIKE ? OR
          c.non_resident_name LIKE ? OR
          CONCAT(r.first_name, ' ', r.last_name) LIKE ?
        )`;
        const searchParam = `%${search}%`;
        countParams.push(searchParam, searchParam, searchParam, searchParam);
      }

      const [countResult] = await pool.execute(countQuery, countParams);
      const total = countResult[0].total;

      res.json({
        success: true,
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Fetch complaints error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch complaints" });
    }
  });

  // GET single complaint by ID
  router.get("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      const [rows] = await pool.execute(
        `SELECT 
          c.*,
          CASE 
            WHEN c.complainant_type = 'resident' THEN CONCAT(r.first_name, ' ', COALESCE(r.middle_name, ''), ' ', r.last_name)
            ELSE c.non_resident_name
          END AS complainant_name,
          CASE 
            WHEN c.complainant_type = 'resident' THEN r.contact_number
            ELSE c.non_resident_contact
          END AS complainant_contact,
          CASE 
            WHEN c.complainant_type = 'resident' THEN r.purok
            ELSE c.non_resident_address
          END AS complainant_address,
          cc.category_name,
          u.full_name as assigned_officer,
          creator.full_name as created_by_name
        FROM complaints c
        LEFT JOIN residents r ON c.resident_id = r.resident_id AND c.complainant_type = 'resident'
        LEFT JOIN complaint_categories cc ON c.category_id = cc.category_id
        LEFT JOIN users u ON c.assigned_to = u.user_id
        LEFT JOIN users creator ON c.created_by = creator.user_id
        WHERE c.complaint_id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }

      res.json({ success: true, data: rows[0] });
    } catch (error) {
      console.error("Fetch complaint error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch complaint" });
    }
  });

  // POST create new complaint
  router.post("/", authenticateToken, async (req, res) => {
    try {
      const {
        complainant_type,
        resident_id,
        non_resident_name,
        non_resident_address,
        non_resident_contact,
        respondent_name,
        respondent_address,
        respondent_contact,
        category_id,
        incident_date,
        incident_time,
        incident_location,
        description,
        status = "filed",
      } = req.body;

      // Validate required fields
      if (
        !complainant_type ||
        !respondent_name ||
        !category_id ||
        !incident_date ||
        !incident_location ||
        !description
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      // Validate resident selection
      if (complainant_type === "resident" && !resident_id) {
        return res.status(400).json({
          success: false,
          message: "Please select a resident",
        });
      }

      // Validate non-resident information
      if (complainant_type === "non_resident" && !non_resident_name) {
        return res.status(400).json({
          success: false,
          message: "Non-resident name is required",
        });
      }

      const complaint_number = generateComplaintNumber();
      const created_by = req.user.user_id;

      const [result] = await pool.execute(
        `INSERT INTO complaints (
          complaint_number, complainant_type, resident_id, non_resident_name, 
          non_resident_address, non_resident_contact, respondent_name, 
          respondent_address, respondent_contact, category_id, incident_date, 
          incident_time, incident_location, description, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          complaint_number,
          complainant_type,
          complainant_type === "resident" ? resident_id : null,
          complainant_type === "non_resident" ? non_resident_name : null,
          complainant_type === "non_resident" ? non_resident_address : null,
          complainant_type === "non_resident" ? non_resident_contact : null,
          respondent_name,
          respondent_address || null,
          respondent_contact || null,
          category_id,
          incident_date,
          incident_time || null,
          incident_location,
          description,
          status,
          created_by,
        ]
      );

      // Log the activity
      await pool.execute(
        `INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time)
         VALUES (?, ?, 'complaint', ?, ?, ?, ?, NOW())`,
        [
          created_by,
          "created",
          result.insertId,
          complaint_number,
          status,
          `New complaint filed: ${complaint_number}`,
        ]
      );

      res.json({
        success: true,
        data: { complaint_id: result.insertId, complaint_number },
        message: "Complaint recorded successfully",
      });
    } catch (error) {
      console.error("Create complaint error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to record complaint",
      });
    }
  });

  // PUT update complaint
  router.put("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const {
        complainant_type,
        resident_id,
        non_resident_name,
        non_resident_address,
        non_resident_contact,
        respondent_name,
        respondent_address,
        respondent_contact,
        category_id,
        incident_date,
        incident_time,
        incident_location,
        description,
        status,
        assigned_to,
        resolution,
        resolution_date,
      } = req.body;

      const [result] = await pool.execute(
        `UPDATE complaints SET 
          complainant_type = ?, resident_id = ?, non_resident_name = ?, 
          non_resident_address = ?, non_resident_contact = ?, respondent_name = ?, 
          respondent_address = ?, respondent_contact = ?, category_id = ?, 
          incident_date = ?, incident_time = ?, incident_location = ?, 
          description = ?, status = ?, assigned_to = ?, resolution = ?, 
          resolution_date = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE complaint_id = ?`,
        [
          complainant_type,
          complainant_type === "resident" ? resident_id : null,
          complainant_type === "non_resident" ? non_resident_name : null,
          complainant_type === "non_resident" ? non_resident_address : null,
          complainant_type === "non_resident" ? non_resident_contact : null,
          respondent_name,
          respondent_address || null,
          respondent_contact || null,
          category_id,
          incident_date,
          incident_time || null,
          incident_location,
          description,
          status,
          assigned_to || null,
          resolution || null,
          resolution_date || null,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }

      // Get complaint number for activity log
      const [complaintData] = await pool.execute(
        "SELECT complaint_number FROM complaints WHERE complaint_id = ?",
        [id]
      );
      const complaintNumber = complaintData[0]?.complaint_number || `ID ${id}`;

      // Log the activity
      await pool.execute(
        `INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time)
         VALUES (?, ?, 'complaint', ?, ?, ?, ?, NOW())`,
        [
          req.user.user_id,
          "updated",
          id,
          complaintNumber,
          status,
          `Updated complaint: ${complaintNumber}`,
        ]
      );

      res.json({ success: true, message: "Complaint updated successfully" });
    } catch (error) {
      console.error("Update complaint error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update complaint" });
    }
  });

  // PATCH update complaint status
  router.patch("/:id/status", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const [result] = await pool.execute(
        "UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE complaint_id = ?",
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }

      res.json({
        success: true,
        message: "Complaint status updated successfully",
      });
    } catch (error) {
      console.error("Update complaint status error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update complaint status" });
    }
  });

  // DELETE complaint
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      // Get complaint details before deletion for activity log
      const [complaintData] = await pool.execute(
        "SELECT complaint_number FROM complaints WHERE complaint_id = ?",
        [id]
      );

      const [result] = await pool.execute(
        "DELETE FROM complaints WHERE complaint_id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }

      // Log the activity
      if (complaintData.length > 0) {
        const complaintNumber = complaintData[0].complaint_number;
        await pool.execute(
          `INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time)
           VALUES (?, ?, 'complaint', ?, ?, ?, ?, NOW())`,
          [
            req.user.user_id,
            "deleted",
            id,
            complaintNumber,
            "deleted",
            `Deleted complaint: ${complaintNumber}`,
          ]
        );
      }

      res.json({ success: true, message: "Complaint deleted successfully" });
    } catch (error) {
      console.error("Delete complaint error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete complaint" });
    }
  });

  return router;
};
