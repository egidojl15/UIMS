const express = require("express");

module.exports = (pool, verifyToken) => {
  const router = express.Router();
  const authenticateToken = verifyToken;

  // Middleware to check if user has secretary or captain role
  const checkSecretaryOrCaptain = (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase();
    if (
      userRole === "secretary" ||
      userRole === "barangay captain" ||
      userRole === "captain"
    ) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. Only Secretary and Captain can manage officials.",
      });
    }
  };

  async function safeQuery(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (e) {
      console.error("officials query error:", e?.message || e);
      throw e;
    }
  }

  // IMPORTANT: Specific routes like /positions must come BEFORE /:id routes

  // In officials.js - Fix the positions route
  router.get("/positions", authenticateToken, async (req, res) => {
    try {
      const positions = await safeQuery(`
        SELECT 
          op.position_id,
          op.position_name,
          op.position_type,
          op.max_slots,
          op.display_order,
          op.description,
          COALESCE(COUNT(o.official_id), 0) as current_count,
          (op.max_slots - COALESCE(COUNT(o.official_id), 0)) as available_slots
        FROM official_positions op
        LEFT JOIN officials o ON op.position_id = o.position_id 
          AND o.term_end >= YEAR(CURDATE())
        WHERE op.is_active = 1
        GROUP BY op.position_id
        ORDER BY op.display_order
      `);
      res.json({ success: true, positions });
    } catch (err) {
      console.error("Get positions error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // GET /api/officials - Get all officials with position details (PUBLIC - no auth required)
  router.get("/", async (req, res) => {
    try {
      const rows = await safeQuery(`
        SELECT 
          o.*,
          op.position_name,
          op.position_type,
          op.max_slots
        FROM officials o
        LEFT JOIN official_positions op ON o.position_id = op.position_id
        ORDER BY op.display_order ASC, o.name ASC
      `);
      res.json({ success: true, officials: rows });
    } catch (err) {
      console.error("Get all officials error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // POST /api/officials - Create new official with validation (Secretary & Captain only)
  router.post(
    "/",
    authenticateToken,
    // checkSecretaryOrCaptain, // TEMPORARILY DISABLED FOR TESTING
    async (req, res) => {
      try {
        const {
          name,
          position_id,
          term_start,
          term_end,
          phone = null,
          email = null,
          address = null,
          bio = null,
          image = null,
        } = req.body;

        // Validate required fields
        if (!name || !position_id || !term_start || !term_end) {
          return res.status(400).json({
            success: false,
            message: "Name, position, term start, and term end are required",
          });
        }

        // Validate term dates
        if (parseInt(term_end) < parseInt(term_start)) {
          return res.status(400).json({
            success: false,
            message:
              "Term end year must be greater than or equal to term start year",
          });
        }

        // Check if position exists and get max slots
        const positionInfo = await safeQuery(
          "SELECT position_id, position_name, max_slots FROM official_positions WHERE position_id = ? AND is_active = 1",
          [position_id]
        );

        if (positionInfo.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid position selected",
          });
        }

        const { max_slots, position_name } = positionInfo[0];

        // Count current active officials in this position (overlapping terms)
        const currentCount = await safeQuery(
          `
        SELECT COUNT(*) as count 
        FROM officials 
        WHERE position_id = ? 
          AND (
            (term_start <= ? AND term_end >= ?)
            OR (term_start <= ? AND term_end >= ?)
            OR (term_start >= ? AND term_end <= ?)
          )
      `,
          [
            position_id,
            term_end,
            term_start,
            term_start,
            term_end,
            term_start,
            term_end,
          ]
        );

        console.log(
          `[Officials] Position: ${position_name}, Current Count: ${currentCount[0].count}, Max Slots: ${max_slots}`
        );

        if (currentCount[0].count >= max_slots) {
          return res.status(400).json({
            success: false,
            message: `Maximum slots for ${position_name} already filled (${currentCount[0].count}/${max_slots}). Cannot add more officials with overlapping terms (${term_start}-${term_end}).`,
          });
        }

        // Insert new official
        const result = await safeQuery(
          "INSERT INTO officials (name, position_id, term_start, term_end, phone, email, address, bio, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
          [
            name,
            position_id,
            term_start,
            term_end,
            phone,
            email,
            address,
            bio,
            image,
          ]
        );

        const officialId = result.insertId;

        // Log activity
        try {
          await pool.execute(
            `INSERT INTO activity_log 
           (user_id, action, entity_type, entity_id, entity_identifier, status, remarks) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              req.user.user_id,
              "Create Official",
              "official",
              officialId,
              name,
              "completed",
              `Added official: ${name} as ${position_name} (${term_start}-${term_end})`,
            ]
          );
        } catch (logErr) {
          console.error("Failed to log activity:", logErr);
        }

        res.json({
          success: true,
          official_id: officialId,
          message: "Official added successfully",
        });
      } catch (err) {
        console.error("Create official error:", err);
        res
          .status(500)
          .json({ success: false, message: "Server error: " + err.message });
      }
    }
  );

  // GET /api/officials/:id - Get single official details (MUST come after /positions)
  router.get("/:id", authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;
      const official = await safeQuery(
        `
        SELECT 
          o.*,
          op.position_name,
          op.position_type,
          op.max_slots
        FROM officials o
        LEFT JOIN official_positions op ON o.position_id = op.position_id
        WHERE o.official_id = ?
      `,
        [id]
      );

      if (official.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Official not found",
        });
      }

      res.json({ success: true, official: official[0] });
    } catch (err) {
      console.error("Get official by id error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // PUT /api/officials/:id - Update official with validation (Secretary & Captain only)
  router.put(
    "/:id",
    authenticateToken,
    // checkSecretaryOrCaptain, // TEMPORARILY DISABLED FOR TESTING
    async (req, res) => {
      try {
        const id = req.params.id;
        const {
          name,
          position_id,
          term_start,
          term_end,
          phone,
          email,
          address,
          bio,
          image,
        } = req.body;

        // Validate required fields
        if (!name || !position_id || !term_start || !term_end) {
          return res.status(400).json({
            success: false,
            message: "Name, position, term start, and term end are required",
          });
        }

        // Validate term dates
        if (parseInt(term_end) < parseInt(term_start)) {
          return res.status(400).json({
            success: false,
            message:
              "Term end year must be greater than or equal to term start year",
          });
        }

        // Check if official exists
        const existingOfficial = await safeQuery(
          "SELECT position_id FROM officials WHERE official_id = ?",
          [id]
        );

        if (existingOfficial.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Official not found",
          });
        }

        // If position is being changed, validate slot availability
        if (existingOfficial[0].position_id !== position_id) {
          const positionInfo = await safeQuery(
            "SELECT position_id, position_name, max_slots FROM official_positions WHERE position_id = ? AND is_active = 1",
            [position_id]
          );

          if (positionInfo.length === 0) {
            return res.status(400).json({
              success: false,
              message: "Invalid position selected",
            });
          }

          const { max_slots, position_name } = positionInfo[0];

          // Count current officials (excluding this one being updated)
          const currentCount = await safeQuery(
            `
          SELECT COUNT(*) as count 
          FROM officials 
          WHERE position_id = ? 
            AND official_id != ?
            AND term_end >= ?
            AND term_start <= ?
        `,
            [position_id, id, term_start, term_end]
          );

          if (currentCount[0].count >= max_slots) {
            return res.status(400).json({
              success: false,
              message: `Maximum slots for ${position_name} already filled (${max_slots} max)`,
            });
          }
        }

        // Update official
        await safeQuery(
          "UPDATE officials SET name=?, position_id=?, term_start=?, term_end=?, phone=?, email=?, address=?, bio=?, image=?, updated_at=NOW() WHERE official_id = ?",
          [
            name,
            position_id,
            term_start,
            term_end,
            phone,
            email,
            address,
            bio,
            image,
            id,
          ]
        );

        // Get position name for logging
        const positionInfo = await safeQuery(
          "SELECT position_name FROM official_positions WHERE position_id = ?",
          [position_id]
        );
        const position_name =
          positionInfo[0]?.position_name || "Unknown Position";

        // Log activity
        try {
          await pool.execute(
            `INSERT INTO activity_log 
           (user_id, action, entity_type, entity_id, entity_identifier, status, remarks) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              req.user.user_id,
              "Update Official",
              "official",
              id,
              name,
              "completed",
              `Updated official: ${name} as ${position_name} (${term_start}-${term_end})`,
            ]
          );
        } catch (logErr) {
          console.error("Failed to log activity:", logErr);
        }

        res.json({
          success: true,
          message: "Official updated successfully",
        });
      } catch (err) {
        console.error("Update official error:", err);
        res
          .status(500)
          .json({ success: false, message: "Server error: " + err.message });
      }
    }
  );

  // DELETE /api/officials/:id (Secretary & Captain only)
  router.delete(
    "/:id",
    authenticateToken,
    // checkSecretaryOrCaptain, // TEMPORARILY DISABLED FOR TESTING
    async (req, res) => {
      try {
        const id = req.params.id;

        // Check if official exists and get details
        const official = await safeQuery(
          `SELECT o.official_id, o.name, op.position_name 
         FROM officials o 
         LEFT JOIN official_positions op ON o.position_id = op.position_id 
         WHERE o.official_id = ?`,
          [id]
        );

        if (official.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Official not found",
          });
        }

        const officialData = official[0];

        await safeQuery("DELETE FROM officials WHERE official_id = ?", [id]);

        // Log activity
        try {
          await pool.execute(
            `INSERT INTO activity_log 
           (user_id, action, entity_type, entity_id, entity_identifier, status, remarks) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              req.user.user_id,
              "Delete Official",
              "official",
              id,
              officialData.name,
              "completed",
              `Deleted official: ${officialData.name} (${
                officialData.position_name || "Unknown Position"
              })`,
            ]
          );
        } catch (logErr) {
          console.error("Failed to log activity:", logErr);
        }

        res.json({
          success: true,
          message: "Official deleted successfully",
        });
      } catch (err) {
        console.error("Delete official error:", err);
        res
          .status(500)
          .json({ success: false, message: "Server error: " + err.message });
      }
    }
  );

  return router;
};
