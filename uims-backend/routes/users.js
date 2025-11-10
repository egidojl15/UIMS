const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

module.exports = (pool, authenticateToken) => {
  // GET single user by ID
  router.get("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`👤 Fetching user with ID: ${id}`);

      const [rows] = await pool.execute(
        `SELECT 
          u.user_id, u.username, u.full_name, u.email, u.phone, u.position,
          u.photo_url, u.is_active, u.last_login, u.role_id, r.role_name
        FROM users u
        LEFT JOIN user_roles r ON u.role_id = r.role_id
        WHERE u.user_id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      console.log(`✅ Found user: ${rows[0].username}`);
      res.json({ success: true, data: rows[0] });
    } catch (err) {
      console.error("❌ Get user error:", err);
      res.status(500).json({ success: false, message: "Failed to fetch user" });
    }
  });

  // GET all user roles
  router.get("/user-roles/list", authenticateToken, async (req, res) => {
    try {
      console.log("📋 Fetching user roles");
      const [rows] = await pool.execute(`
        SELECT 
          role_id, 
          role_name,
          dashboard_url,
          role_description,
          is_active
        FROM user_roles 
        WHERE is_active = 1
        ORDER BY role_id
      `);
      console.log(`✅ Found ${rows.length} roles`);
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("❌ Get roles error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch roles" });
    }
  });

  // Alternative roles endpoint - FIXED: removed is_active
  router.get("/roles/list", authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.execute(`
      SELECT role_id, role_name, dashboard_url, role_description
      FROM user_roles ORDER BY role_id
    `);
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error("Get roles error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch roles" });
    }
  });
  // POST create user
  router.post(
    "/",
    authenticateToken,
    upload.single("photo"),
    async (req, res) => {
      try {
        const {
          username,
          password,
          email,
          full_name,
          role_id,
          is_active,
          phone,
          dashboard_url,
        } = req.body;

        console.log(`➕ Creating new user: ${username}`);

        // Validate required fields
        if (!username || !password || !full_name || !dashboard_url) {
          return res
            .status(400)
            .json({ success: false, message: "Missing required fields" });
        }

        // Check duplicate username
        const [existing] = await pool.execute(
          "SELECT user_id FROM users WHERE username = ?",
          [username]
        );
        if (existing.length > 0) {
          return res
            .status(400)
            .json({ success: false, message: "Username already exists" });
        }

        // Derive position from dashboard_url
        const dashboardToPositionMap = {
          "/dashboard/captain": "Barangay Captain",
          "/dashboard/secretary": "Barangay Secretary",
          "/dashboard/councilor": "Councilor",
          "/dashboard/bhw": "Barangay Health Worker",
          "/dashboard/admin": "System Administrator",
        };
        const position = dashboardToPositionMap[dashboard_url] || "N/A";

        const password_hash = await bcrypt.hash(password, 10);
        const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

        const [result] = await pool.execute(
          `INSERT INTO users (username, password_hash, email, full_name, role_id, is_active, position, phone, photo_url, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            username,
            password_hash,
            email || null,
            full_name,
            role_id || 2,
            is_active ?? 1,
            position,
            phone || 0, // Default to 0 since phone is NOT NULL
            photo_url,
          ]
        );

        console.log(`✅ User created successfully with ID: ${result.insertId}`);

        // Automatically mark this user as viewed for the creator
        // so the creator doesn't see a notification badge for their own action
        const creatorUserId = req.user?.user_id || req.user?.id;
        if (creatorUserId) {
          try {
            await pool.execute(
              `INSERT INTO viewed_notifications (user_id, entity_type, entity_id, viewed_at)
               VALUES (?, 'user', ?, NOW())
               ON DUPLICATE KEY UPDATE viewed_at = NOW()`,
              [creatorUserId, result.insertId]
            );
          } catch (viewErr) {
            console.warn("Failed to mark user as viewed for creator:", viewErr);
            // Don't fail the user creation if this fails
          }
        }

        res.json({
          success: true,
          message: "User created successfully",
          data: { user_id: result.insertId },
        });
      } catch (err) {
        console.error("❌ Create user error:", err);
        if (err.code === "ER_BAD_NULL_ERROR") {
          return res.status(400).json({
            success: false,
            message: `Database error: ${err.sqlMessage}`,
          });
        }
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            success: false,
            message: "Username or email already exists",
          });
        }
        res
          .status(500)
          .json({ success: false, message: "Failed to create user" });
      }
    }
  );
  // PUT update user (admin function) - FIXED VERSION
  router.put(
    "/admin/:id",
    authenticateToken,
    upload.single("photo"),
    async (req, res) => {
      try {
        const { id } = req.params;
        const {
          username,
          email,
          full_name,
          role_id,
          is_active,
          position,
          phone,
          new_password,
        } = req.body;

        console.log(`✏️ Admin updating user ID: ${id}`, req.body);

        // Validate required fields
        if (!username || !full_name || !email) {
          return res.status(400).json({
            success: false,
            message: "Username, full name, and email are required",
          });
        }

        // Check if user exists
        const [existingUser] = await pool.execute(
          "SELECT user_id FROM users WHERE user_id = ?",
          [id]
        );

        if (existingUser.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }

        // Check for duplicate username (excluding current user)
        const [duplicateUser] = await pool.execute(
          "SELECT user_id FROM users WHERE username = ? AND user_id != ?",
          [username, id]
        );

        if (duplicateUser.length > 0) {
          return res
            .status(400)
            .json({ success: false, message: "Username already exists" });
        }

        // Handle phone conversion - convert to integer or use 0 if empty
        const phoneValue = phone ? parseInt(phone) || 0 : 0;

        // Build dynamic SQL based on provided fields
        let sql =
          "UPDATE users SET username = ?, email = ?, full_name = ?, role_id = ?, is_active = ?, position = ?, phone = ?";
        let params = [
          username,
          email,
          full_name,
          role_id,
          is_active,
          position,
          phoneValue,
        ];

        // Handle optional photo
        if (req.file) {
          sql += ", photo_url = ?";
          params.push(`/uploads/${req.file.filename}`);
        }

        // Handle optional password update
        if (new_password && new_password.trim() !== "") {
          const passwordHash = await bcrypt.hash(new_password, 10);
          sql += ", password_hash = ?";
          params.push(passwordHash);
        }

        sql += ", updated_at = NOW() WHERE user_id = ?";
        params.push(id);

        console.log("🔄 Executing SQL:", sql);
        console.log("📋 With params:", params);

        const [result] = await pool.execute(sql, params);

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "User not found or no changes made",
          });
        }

        console.log(`✅ User updated successfully: ${id}`);
        res.json({ success: true, message: "User updated successfully" });
      } catch (err) {
        console.error("❌ Admin update user error:", err);

        // Handle specific database errors
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            success: false,
            message: "Username or email already exists",
          });
        }

        if (
          err.code === "ER_BAD_FIELD_ERROR" ||
          err.code === "ER_PARSE_ERROR"
        ) {
          return res.status(400).json({
            success: false,
            message: `Database error: ${err.sqlMessage}`,
          });
        }

        res.status(500).json({
          success: false,
          message: "Failed to update user",
          error:
            process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      }
    }
  );

  // DELETE user (hard delete - permanently remove)
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`🗑️ Deleting user ID: ${id}`);

      // First, check if the user exists
      const [user] = await pool.execute(
        "SELECT user_id FROM users WHERE user_id = ?",
        [id]
      );

      if (user.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Prevent users from deleting themselves
      if (req.user.user_id == id) {
        return res.status(400).json({
          success: false,
          message: "You cannot delete your own account",
        });
      }

      // Perform the actual delete
      const [result] = await pool.execute(
        "DELETE FROM users WHERE user_id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      console.log(`✅ User permanently deleted: ${id}`);
      res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
      console.error("❌ Delete user error:", err);

      // Handle foreign key constraint errors
      if (
        err.code === "ER_ROW_IS_REFERENCED_2" ||
        err.code === "ER_ROW_IS_REFERENCED"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete user because they have related records in the system. Please deactivate instead.",
        });
      }

      res
        .status(500)
        .json({ success: false, message: "Failed to delete user" });
    }
  });

  // PUT update user profile
  router.put(
    "/:id",
    authenticateToken,
    upload.single("photo_url"),
    async (req, res) => {
      try {
        const { id } = req.params;
        const {
          username,
          full_name,
          email,
          phone,
          current_password,
          new_password,
        } = req.body;

        console.log(`👤 Updating profile for user ID: ${id}`);

        // Only allow user to update their own profile
        if (req.user.user_id != id) {
          return res.status(403).json({
            success: false,
            message: "You can only update your own profile",
          });
        }

        let photo_url = null;
        if (req.file) {
          photo_url = `/uploads/${req.file.filename}`;
        }

        // Handle password change
        if (new_password && current_password) {
          const [userRows] = await pool.execute(
            "SELECT password_hash FROM users WHERE user_id = ?",
            [id]
          );

          if (userRows.length === 0) {
            return res
              .status(404)
              .json({ success: false, message: "User not found" });
          }

          const isMatch = await bcrypt.compare(
            current_password,
            userRows[0].password_hash
          );
          if (!isMatch) {
            return res
              .status(400)
              .json({ success: false, message: "Invalid current password" });
          }

          const newPasswordHash = await bcrypt.hash(new_password, 10);
          await pool.execute(
            "UPDATE users SET password_hash = ? WHERE user_id = ?",
            [newPasswordHash, id]
          );
        }

        // Update profile fields
        let sql =
          "UPDATE users SET username = ?, full_name = ?, email = ?, phone = ?";
        const params = [username, full_name, email, phone];

        if (photo_url) {
          sql += ", photo_url = ?";
          params.push(photo_url);
        }

        sql += ", updated_at = NOW() WHERE user_id = ?";
        params.push(id);

        const [result] = await pool.execute(sql, params);

        if (result.affectedRows === 0) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }

        // Return updated user
        const [updatedUser] = await pool.execute(
          "SELECT user_id, username, full_name, email, phone, photo_url FROM users WHERE user_id = ?",
          [id]
        );

        console.log(
          `✅ Profile updated successfully for user: ${updatedUser[0].username}`
        );

        res.json({
          success: true,
          message: "Profile updated successfully",
          user: updatedUser[0],
        });
      } catch (error) {
        console.error("❌ Update profile error:", error);

        if (error.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            success: false,
            message: "Username or email already exists",
          });
        }

        res.status(500).json({
          success: false,
          message: "Failed to update profile",
        });
      }
    }
  );

  return router;
};
