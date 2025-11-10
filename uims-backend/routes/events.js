const express = require("express");
const router = express.Router();

// CHANGE: Export a function that accepts pool and verifyToken
module.exports = (pool, verifyToken) => {
  async function safeQuery(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (e) {
      console.error("events query error:", e?.message || e);
      throw e;
    }
  }

  // GET /api/events
  router.get("/", async (req, res) => {
    try {
      const rows = await safeQuery(
        "SELECT * FROM events ORDER BY start_date DESC"
      );
      res.json({ success: true, events: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // POST /api/events - CHANGE: authenticateToken -> verifyToken
  router.post("/", verifyToken, async (req, res) => {
    try {
      const {
        title,
        description,
        location,
        start_date,
        end_date,
        status = "upcoming",
        image = null,
      } = req.body;
      const result = await safeQuery(
        "INSERT INTO events (title, description, location, start_date, end_date, status, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [title, description, location, start_date, end_date, status, image]
      );

      const eventId = result.insertId;

      // Automatically mark this event as viewed for the creator
      const creatorUserId = req.user?.user_id || req.user?.id;
      if (creatorUserId) {
        try {
          await safeQuery(
            `INSERT INTO viewed_notifications (user_id, entity_type, entity_id, viewed_at)
             VALUES (?, 'event', ?, NOW())
             ON DUPLICATE KEY UPDATE viewed_at = NOW()`,
            [creatorUserId, eventId]
          );
        } catch (viewErr) {
          console.warn("Failed to mark event as viewed for creator:", viewErr);
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
            "Create Event",
            "event",
            eventId,
            title,
            "completed",
            `Created event: ${title} at ${location} (${start_date})`,
          ]
        );
      } catch (logErr) {
        console.error("Failed to log activity:", logErr);
      }

      res.json({ success: true, event_id: eventId });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // PUT /api/events/:id - CHANGE: authenticateToken -> verifyToken
  router.put("/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;
      const {
        title,
        description,
        location,
        start_date,
        end_date,
        status,
        image,
      } = req.body;
      await safeQuery(
        "UPDATE events SET title = ?, description = ?, location = ?, start_date = ?, end_date = ?, status = ?, image = ? WHERE event_id = ?",
        [title, description, location, start_date, end_date, status, image, id]
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
              "Update Event",
              "event",
              id,
              title,
              status || "upcoming",
              `Updated event: ${title} at ${location} (${start_date})`,
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

  // DELETE /api/events/:id - CHANGE: authenticateToken -> verifyToken
  router.delete("/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;

      // Get event details before deleting
      const event = await safeQuery(
        "SELECT title, location FROM events WHERE event_id = ?",
        [id]
      );

      await safeQuery("DELETE FROM events WHERE event_id = ?", [id]);

      // Log activity
      const userId = req.user?.user_id || req.user?.id;
      if (userId && event.length > 0) {
        try {
          await pool.execute(
            `INSERT INTO activity_log 
             (user_id, action, entity_type, entity_id, entity_identifier, status, remarks) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              userId,
              "Delete Event",
              "event",
              id,
              event[0].title,
              "completed",
              `Deleted event: ${event[0].title} at ${event[0].location}`,
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

  return router; // ADD THIS RETURN STATEMENT
};
