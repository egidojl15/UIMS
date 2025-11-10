const express = require("express");
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // Get login history
  router.get("/", authenticateToken, async (req, res) => {
    try {
      // ✅ CORRECT - no JavaScript comments in SQL
      const [rows] = await pool.execute(`
            SELECT 
              lh.login_id,
              u.full_name AS user,
              r.role_name AS role,
              DATE_FORMAT(lh.login_time, '%Y-%m-%d %H:%i:%s') AS login_time,
              lh.login_status,  -- REMOVED CASE STATEMENT - return original value
              lh.ip_address,
              lh.user_agent
            FROM login_history lh
            LEFT JOIN users u ON lh.user_id = u.user_id
            LEFT JOIN user_roles r ON u.role_id = r.role_id
            ORDER BY lh.login_time DESC
          `);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error("Fetch login history error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch login history",
      });
    }
  });

  // Get recent logins with limit
  router.get("/recent", authenticateToken, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      // ✅ CORRECT
      const [rows] = await pool.execute(
        `
        SELECT 
          lh.login_id,
          u.full_name AS user,
          r.role_name AS role,
          DATE_FORMAT(lh.login_time, '%Y-%m-%d %H:%i:%s') AS login_time,
          lh.login_status,  -- REMOVED CASE STATEMENT - return original value
          lh.ip_address
        FROM login_history lh
        LEFT JOIN users u ON lh.user_id = u.user_id
        LEFT JOIN user_roles r ON u.role_id = r.role_id
        ORDER BY lh.login_time DESC
        LIMIT ?
      `,
        [limit]
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error("Fetch recent logins error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recent logins",
      });
    }
  });

  // Logout endpoint
  router.post("/logout", authenticateToken, async (req, res) => {
    try {
      const { user_id } = req.body;
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: "User ID required",
        });
      }

      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers["user-agent"];

      await pool.execute(
        `INSERT INTO login_history (user_id, ip_address, user_agent, login_status)
         VALUES (?, ?, ?, 'logout')`,
        [user_id, ipAddress, userAgent]
      );

      res.json({ success: true, message: "Logout recorded" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  return router;
};
