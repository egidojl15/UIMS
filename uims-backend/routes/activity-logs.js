const express = require("express");
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // Get all activity logs
  // In activity-logs.js - fix the SQL query
  router.get("/", authenticateToken, async (req, res) => {
    try {
      const { search, status, entity_type, date_from, date_to, user_id } =
        req.query;

      // Get the current user's role from the token
      const currentUserId = req.user.user_id;
      const currentUserRole = req.user.role_name;

      // In activity-logs.js - replace the CASE statement with a simpler version
      let query = `
  SELECT
    al.log_id,
    al.user_id,
    al.action,
    al.entity_type,
    al.entity_id,
    al.entity_identifier,
    al.status,
    al.remarks,
    al.action_taken,
    al.log_time,
    u.full_name as user_name,
    ur.role_name as user_role,
    al.entity_identifier as entity_details  -- SIMPLIFIED: Just use the identifier
  FROM activity_log al
  JOIN users u ON al.user_id = u.user_id
  JOIN user_roles ur ON u.role_id = ur.role_id
  WHERE 1=1
`;

      const params = [];

      // Filter out login/logout and navigation activities - only show CRUD operations
      query += ` AND al.action IN ('created', 'updated', 'deleted')`;

      // Role-based filtering:
      // - Captain and Admin: See all activities
      // - BHW: See only BHW-related activities (residents, households, deaths, referrals, maternal/child health)
      // - Councilor: See only blotter and complaint activities
      // - Other users: See only their own activities
      if (currentUserRole === "barangay_health_worker") {
        query += ` AND al.entity_type IN (?, ?, ?, ?, ?, ?)`;
        params.push(
          "resident",
          "household",
          "death_record",
          "medical_referral",
          "maternal_health",
          "child_immunization"
        );
      } else if (currentUserRole === "barangay_councilor") {
        query += ` AND al.entity_type IN (?, ?, ?)`;
        params.push("blotter", "complaint", "logbook");
      } else if (
        currentUserRole !== "barangay_captain" &&
        currentUserRole !== "admin"
      ) {
        query += ` AND al.user_id = ?`;
        params.push(currentUserId);
      }

      if (search) {
        query += ` AND (
        al.action LIKE ? OR
        al.entity_identifier LIKE ? OR
        u.full_name LIKE ? OR
        al.remarks LIKE ?
      )`;
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam);
      }

      if (status && status !== "All") {
        query += ` AND al.status = ?`;
        params.push(status);
      }

      if (entity_type && entity_type !== "All") {
        query += ` AND al.entity_type = ?`;
        params.push(entity_type);
      }

      if (user_id) {
        query += ` AND al.user_id = ?`;
        params.push(user_id);
      }

      if (date_from) {
        query += ` AND DATE(al.log_time) >= ?`;
        params.push(date_from);
      }

      if (date_to) {
        query += ` AND DATE(al.log_time) <= ?`;
        params.push(date_to);
      }

      query += ` ORDER BY al.log_time DESC LIMIT 1000`;

      const [rows] = await pool.execute(query, params);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error("Fetch activity logs error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch activity logs",
      });
    }
  });

  // Get activity stats
  router.get("/stats", authenticateToken, async (req, res) => {
    try {
      // Get the current user's role from the token
      const currentUserId = req.user.user_id;
      const currentUserRole = req.user.role_name;

      // Build WHERE clause based on role
      let whereClause =
        "WHERE log_time >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) AND action IN ('created', 'updated', 'deleted')";
      let params = [];

      if (currentUserRole === "barangay_health_worker") {
        whereClause +=
          " AND entity_type IN ('resident', 'household', 'death_record', 'medical_referral', 'maternal_health', 'child_immunization')";
      } else if (currentUserRole === "barangay_councilor") {
        whereClause +=
          " AND entity_type IN ('blotter', 'complaint', 'logbook')";
      } else if (
        currentUserRole !== "barangay_captain" &&
        currentUserRole !== "admin"
      ) {
        whereClause += " AND user_id = ?";
        params.push(currentUserId);
      }

      const [stats] = await pool.execute(
        `
        SELECT
          COUNT(*) as total_activities,
          COUNT(DISTINCT user_id) as active_users,
          COUNT(DISTINCT DATE(log_time)) as active_days,
          entity_type,
          COUNT(*) as activities_by_type
        FROM activity_log
        ${whereClause}
        GROUP BY entity_type
        ORDER BY activities_by_type DESC
      `,
        params
      );

      // Build WHERE clause for recent activity
      let recentWhereClause =
        "WHERE log_time >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY) AND action IN ('created', 'updated', 'deleted')";
      let recentParams = [];

      if (currentUserRole === "barangay_health_worker") {
        recentWhereClause +=
          " AND entity_type IN ('resident', 'household', 'death_record', 'medical_referral', 'maternal_health', 'child_immunization')";
      } else if (currentUserRole === "barangay_councilor") {
        recentWhereClause +=
          " AND entity_type IN ('blotter', 'complaint', 'logbook')";
      } else if (
        currentUserRole !== "barangay_captain" &&
        currentUserRole !== "admin"
      ) {
        recentWhereClause += " AND user_id = ?";
        recentParams.push(currentUserId);
      }

      const [recentActivity] = await pool.execute(
        `
        SELECT
          DATE(log_time) as date,
          COUNT(*) as count
        FROM activity_log
        ${recentWhereClause}
        GROUP BY DATE(log_time)
        ORDER BY date DESC
      `,
        recentParams
      );

      res.json({
        success: true,
        data: {
          by_type: stats,
          recent_activity: recentActivity,
        },
      });
    } catch (error) {
      console.error("Fetch activity stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch activity stats",
      });
    }
  });

  // Log new activity
  router.post("/", authenticateToken, async (req, res) => {
    try {
      const {
        action,
        entity_type,
        entity_id,
        entity_identifier,
        status,
        remarks,
        action_taken,
      } = req.body;

      const [result] = await pool.execute(
        `INSERT INTO activity_log
          (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, action_taken)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.user_id,
          action,
          entity_type,
          entity_id || null,
          entity_identifier || null,
          status || null,
          remarks || null,
          action_taken || null,
        ]
      );

      res.json({
        success: true,
        data: { log_id: result.insertId },
        message: "Activity logged successfully",
      });
    } catch (error) {
      console.error("Log activity error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to log activity",
      });
    }
  });

  return router;
};
