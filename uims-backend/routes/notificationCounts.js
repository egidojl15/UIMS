// notificationCounts.js
const express = require("express");
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // Get notification counts for all entities
  router.get("/counts", authenticateToken, async (req, res) => {
    try {
      // Get pending certificate requests count
      const [certificateRequests] = await pool.execute(
        "SELECT COUNT(*) as count FROM certificate_requests WHERE status = 'pending'"
      );

      // Get new/open complaints count
      const [complaints] = await pool.execute(
        "SELECT COUNT(*) as count FROM complaints WHERE status IN ('filed', 'under_investigation')"
      );

      // Get active blotter records count
      const [blotterRecords] = await pool.execute(
        "SELECT COUNT(*) as count FROM blotter_records WHERE status = 'active'"
      );

      const userId = req.user?.user_id || req.user?.id;

      // Get recent announcements (posted in last 7 days) - exclude viewed ones
      const [announcements] = await pool.execute(
        `SELECT COUNT(*) as count FROM announcements a
         WHERE a.posted_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         AND NOT EXISTS (
           SELECT 1 FROM viewed_notifications vn
           WHERE vn.user_id = ? AND vn.entity_type = 'announcement' AND vn.entity_id = a.announcement_id
         )`,
        [userId]
      );

      // Get recent events (created in last 7 days) - exclude viewed ones
      const [events] = await pool.execute(
        `SELECT COUNT(*) as count FROM events e
         WHERE e.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         AND NOT EXISTS (
           SELECT 1 FROM viewed_notifications vn
           WHERE vn.user_id = ? AND vn.entity_type = 'event' AND vn.entity_id = e.event_id
         )`,
        [userId]
      );

      // Get unviewed users - exclude users viewed by current user and exclude current user
      const [users] = await pool.execute(
        `SELECT COUNT(*) as count FROM users u
         WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         AND u.user_id != ?
         AND NOT EXISTS (
           SELECT 1 FROM viewed_notifications vn
           WHERE vn.user_id = ? AND vn.entity_type = 'user' AND vn.entity_id = u.user_id
         )`,
        [userId, userId]
      );

      const counts = {
        certificate_requests: certificateRequests[0].count,
        complaints: complaints[0].count,
        blotter_records: blotterRecords[0].count,
        announcements: announcements[0].count,
        events: events[0].count,
        users: users[0].count,
      };

      res.json({
        success: true,
        data: counts,
      });
    } catch (error) {
      console.error("Notification counts error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch notification counts",
        error: error.message,
      });
    }
  });

  return router;
};
