const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {

  // Get dashboard stats by role
  router.get('/stats/:role', authenticateToken, async (req, res) => {
    try {
      const { role } = req.params;

      const [activeResidents] = await pool.execute(
        "SELECT COUNT(*) as count FROM residents WHERE is_active = 1"
      );

      const [openComplaints] = await pool.execute(
        "SELECT COUNT(*) as count FROM complaints WHERE status IN ('filed', 'under_investigation')"
      );

      const [blotterRecords] = await pool.execute(
        "SELECT COUNT(*) as count FROM blotter_records WHERE status = 'active'"
      );

      const [usersOnline] = await pool.execute(
        "SELECT COUNT(DISTINCT user_id) as count FROM login_history WHERE login_status = 'success' AND DATE(login_time) = CURDATE()"
      );

      const stats = {
        active_residents: activeResidents[0].count,
        open_complaints: openComplaints[0].count,
        blotter_records: blotterRecords[0].count,
        users_online: usersOnline[0].count,
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard stats",
        error: error.message,
      });
    }
  });

  // Secretary dashboard overview
  router.get('/secretary', authenticateToken, async (req, res) => {
    try {
      const resp = await pool.execute(`
        SELECT 
          (SELECT COUNT(*) FROM residents WHERE is_active = 1) as total_residents,
          (SELECT COUNT(*) FROM complaints WHERE status = 'filed') as new_complaints,
          (SELECT COUNT(*) FROM certificate_requests WHERE status = 'pending') as pending_certificates,
          (SELECT COUNT(*) FROM blotter_records WHERE status = 'active') as active_blotters
      `);
      
      res.json({ 
        success: true, 
        data: resp[0][0] 
      });
    } catch (error) {
      console.error("Secretary dashboard error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch dashboard data" 
      });
    }
  });

  return router;
};