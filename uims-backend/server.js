// uims-backend/server.js
const multer = require("multer");
const path = require("path");
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs"); // ADD THIS LINE
require("dotenv").config();

// Import your existing middleware
const verifyToken = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));

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

// Ensure uploads directory exists
const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created uploads directory");
}

app.get("/", (req, res) => {
  res.send("✅ Server is live!");
});

// ✅ ADD UPLOAD ROUTE
app.post(
  "/api/upload/image",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("📤 Upload request received");

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
        });
      }

      // Check file size (max 5MB)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 5MB.",
        });
      }

      // Construct the URL for the uploaded file
      const imageUrl = `/uploads/${req.file.filename}`;

      console.log("✅ Image uploaded successfully:", imageUrl);

      res.json({
        success: true,
        message: "Image uploaded successfully",
        url: imageUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      console.error("🔥 Upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload image",
      });
    }
  }
);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "uims",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create database connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully");
    connection.release();
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}
testConnection();

// ✅ FIXED: Define auth routes BEFORE importing other routes
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("🔐 Login attempt for username:", req.body.username);

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Fetch user from database view
    const [rows] = await pool.execute(
      "SELECT user_id, username, password_hash, full_name, role_name, dashboard_url, email FROM user_login_view WHERE username = ?",
      [username]
    );

    // Case 1: User not found
    if (rows.length === 0) {
      console.log("❌ User not found:", username);

      // Log failed login attempt (skip if user_id is null to avoid database error)
      try {
        await pool.execute(
          "INSERT INTO login_history (user_id, login_status, ip_address, user_agent) VALUES (?, ?, ?, ?)",
          [null, "failed", req.ip, req.headers["user-agent"]]
        );
      } catch (dbError) {
        console.log(
          "⚠️ Could not log failed login attempt (user not found):",
          dbError.message
        );
        // Continue without failing the login process
      }

      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const user = rows[0];
    console.log("👤 User found:", user.username);

    const isMatch = await bcrypt.compare(password, user.password_hash);

    // Case 2: Password mismatch
    if (!isMatch) {
      console.log("❌ Password mismatch for user:", user.username);

      // Log failed login
      await pool.execute(
        "INSERT INTO login_history (user_id, login_status, ip_address, user_agent) VALUES (?, ?, ?, ?)",
        [user.user_id, "failed", req.ip, req.headers["user-agent"]]
      );

      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // ✅ Case 3: Successful login
    console.log("✅ Login successful for user:", user.username);

    await pool.execute(
      "INSERT INTO login_history (user_id, login_status, ip_address, user_agent) VALUES (?, ?, ?, ?)",
      [user.user_id, "success", req.ip, req.headers["user-agent"]]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role_name,
        role_name: user.role_name, // Add role_name for consistency
        dashboard_url: user.dashboard_url,
      },
      process.env.JWT_SECRET || "your-secret-key-here", // Fallback secret
      { expiresIn: "12h" }
    );

    // Fetch complete user data including phone
    const [userData] = await pool.execute(
      "SELECT phone FROM users WHERE user_id = ?",
      [user.user_id]
    );

    // Send success response
    const responseData = {
      success: true,
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        role: user.role_name,
        role_name: user.role_name, // Add role_name for consistency
        dashboard_url: user.dashboard_url,
        email: user.email,
        phone: userData[0]?.phone || null, // Get actual phone from users table
      },
    };

    console.log("🎉 Sending successful login response:", {
      success: responseData.success,
      hasToken: !!responseData.token,
      user: responseData.user.username,
      dashboard_url: responseData.user.dashboard_url,
    });

    return res.json(responseData);
  } catch (error) {
    console.error("🔥 Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message, // Include error message for debugging
    });
  }
});

// ✅ Add logout endpoint as well
app.post("/api/auth/logout", verifyToken, async (req, res) => {
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

    // Insert a logout record
    await pool.execute(
      `INSERT INTO login_history (user_id, ip_address, user_agent, login_status)
       VALUES (?, ?, ?, 'logout')`,
      [user_id, ipAddress, userAgent]
    );

    res.json({ success: true, message: "Logout recorded" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ✅ Import and use other routes AFTER auth routes
console.log("📁 Loading routes...");
const routes = require("./routes");
app.use("/api", routes(pool, verifyToken));
console.log("✅ Routes loaded successfully");

// Certificate requests routes - now protected
app.get("/api/certificate-requests", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM certificate_requests_view ORDER BY request_date DESC"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Fetch certificate requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificate requests",
    });
  }
});

// Updated certificate types route - now public
app.get("/api/certificate-types", async (req, res) => {
  try {
    const { requesterType, verified } = req.query;

    let query = "SELECT * FROM certificate_types WHERE is_active = 1";

    // Non-residents only see items available to them
    if (requesterType === "non-resident") {
      query += " AND available_to_non_residents = 1";
    }

    // Residents must be verified to see all certificates
    if (requesterType === "resident" && verified !== "true") {
      return res.status(403).json({
        success: false,
        message: "Resident verification required",
      });
    }

    const [rows] = await pool.execute(query);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Fetch certificate types error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificate types",
    });
  }
});

// Health check endpoint (public)
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint to verify routing is working
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Test endpoint is working!",
    timestamp: new Date().toISOString(),
  });
});

// TEMPORARY: Add users endpoints directly to server.js
app.get("/api/users", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        u.user_id, u.username, u.full_name, u.email, u.phone, u.position,
        u.photo_url, u.is_active, u.last_login, u.role_id, r.role_name
      FROM users u 
      LEFT JOIN user_roles r ON u.role_id = r.role_id
      ORDER BY u.user_id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

// Add this to server.js before the 404 handler

// Fixed user-roles endpoint
app.get("/api/user-roles", verifyToken, async (req, res) => {
  try {
    console.log("📋 Fetching user roles via direct endpoint");

    const [rows] = await pool.execute(`
      SELECT 
        role_id, 
        role_name,
        dashboard_url,
        role_description
      FROM user_roles 
      ORDER BY role_id
    `);

    console.log(`✅ Found ${rows.length} roles via direct endpoint`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("❌ Direct user-roles endpoint error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
      error: error.message,
    });
  }
});

// TEMPORARY: Add single user endpoint
app.get("/api/users/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
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
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
});

// TEMPORARY: Add user creation endpoint
app.post(
  "/api/users",
  verifyToken,
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
        position,
      } = req.body;

      // Validate required fields
      if (!username || !password || !full_name) {
        return res.status(400).json({
          success: false,
          message: "Username, password, and full name are required",
        });
      }

      // Check duplicate username
      const [existing] = await pool.execute(
        "SELECT user_id FROM users WHERE username = ?",
        [username]
      );
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }

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
          position || "",
          "", // Default empty phone
          photo_url,
        ]
      );

      res.json({
        success: true,
        message: "User created successfully",
        data: { user_id: result.insertId },
      });
    } catch (err) {
      console.error("Create user error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to create user" });
    }
  }
);

// Test login endpoint (for debugging)
app.post("/api/test-login", (req, res) => {
  console.log("🧪 Test login endpoint called");
  res.json({
    success: true,
    message: "Test login endpoint working",
    receivedData: {
      username: req.body.username,
      hasPassword: !!req.body.password,
    },
  });
});

// 404 handler for undefined routes
app.use("*", (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Global error handler:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ✅ ADD FILE UPLOAD ENDPOINT FOR Bangaray History AND OTHER USES
app.post(
  "/api/upload/file",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file provided" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ success: true, url: fileUrl, filename: req.file.filename });
    } catch (error) {
      console.error("File upload error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to upload file" });
    }
  }
);

console.log("✅ Reached end of server.js, about to start server...");

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📤 Upload endpoint: http://localhost:${PORT}/api/upload/image`);
});
