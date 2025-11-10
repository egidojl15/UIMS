const express = require("express");
const router = express.Router();

// Change to export a function that accepts pool and verifyToken
module.exports = (pool, verifyToken) => {
  async function safeQuery(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (e) {
      console.error("announcements query error:", e?.message || e);
      throw e;
    }
  }

  // GET /api/announcements
  router.get("/", async (req, res) => {
    try {
      const rows = await safeQuery(
        "SELECT * FROM announcements ORDER BY posted_date DESC"
      );
      res.json({ success: true, announcements: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // POST /api/announcements - Change authenticateToken to verifyToken
  router.post("/", verifyToken, async (req, res) => {
    try {
      const {
        title,
        content,
        priority = "normal",
        status = "active",
        expiry_date = null,
      } = req.body;
      const result = await safeQuery(
        "INSERT INTO announcements (title, content, priority, status, expiry_date, posted_date) VALUES (?, ?, ?, ?, ?, NOW())",
        [title, content, priority, status, expiry_date]
      );

      const announcementId = result.insertId;

      // Automatically mark this announcement as viewed for the creator
      const creatorUserId = req.user?.user_id || req.user?.id;
      if (creatorUserId) {
        try {
          await safeQuery(
            `INSERT INTO viewed_notifications (user_id, entity_type, entity_id, viewed_at)
             VALUES (?, 'announcement', ?, NOW())
             ON DUPLICATE KEY UPDATE viewed_at = NOW()`,
            [creatorUserId, announcementId]
          );
        } catch (viewErr) {
          console.warn(
            "Failed to mark announcement as viewed for creator:",
            viewErr
          );
        }
      }

      // Log activity
      try {
        await pool.execute(
          `INSERT INTO activity_log 
           (user_id, action, entity_type, entity_id, entity_identifier, status, remarks) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            creatorUserId,
            "Create Announcement",
            "announcement",
            announcementId,
            title,
            "completed",
            `Created announcement: ${title} (Priority: ${priority})`,
          ]
        );
      } catch (logErr) {
        console.error("Failed to log activity:", logErr);
      }

      res.json({ success: true, announcement_id: announcementId });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // PUT /api/announcements/:id - Change authenticateToken to verifyToken
  router.put("/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;
      const { title, content, priority, status, expiry_date } = req.body;
      await safeQuery(
        "UPDATE announcements SET title = ?, content = ?, priority = ?, status = ?, expiry_date = ? WHERE announcement_id = ?",
        [title, content, priority, status, expiry_date, id]
      );

      // Log activity
      const userId = req.user?.user_id || req.user?.id;
      if (userId) {
        try {
          await pool.execute(
            `INSERT INTO activity_log 
             (user_id, action, entity_type, entity_id, entity_identifier, status, remarks) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              userId,
              "Update Announcement",
              "announcement",
              id,
              title,
              status || "active",
              `Updated announcement: ${title} (Priority: ${priority})`,
            ]
          );
        } catch (logErr) {
          console.error("Failed to log activity:", logErr);
        }
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // DELETE /api/announcements/:id - Change authenticateToken to verifyToken
  router.delete("/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;

      // Get announcement details before deleting
      const announcement = await safeQuery(
        "SELECT title FROM announcements WHERE announcement_id = ?",
        [id]
      );

      await safeQuery("DELETE FROM announcements WHERE announcement_id = ?", [
        id,
      ]);

      // Log activity
      const userId = req.user?.user_id || req.user?.id;
      if (userId && announcement.length > 0) {
        try {
          await pool.execute(
            `INSERT INTO activity_log 
             (user_id, action, entity_type, entity_id, entity_identifier, status, remarks) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              userId,
              "Delete Announcement",
              "announcement",
              id,
              announcement[0].title,
              "completed",
              `Deleted announcement: ${announcement[0].title}`,
            ]
          );
        } catch (logErr) {
          console.error("Failed to log activity:", logErr);
        }
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  return router; // Add this return statement
};
