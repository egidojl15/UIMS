// routes/spotmaps.js - Fixed version
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

module.exports = (pool, verifyToken) => {
  const router = express.Router();

  // Configure multer for spot map images
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = "uploads/spotmaps";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const mapType = req.body.mapType || "unknown";
      cb(null, mapType + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });

  // ✅ Upload spot map image - FIXED DUPLICATE ISSUE
  router.post(
    "/upload",
    verifyToken,
    upload.single("spotmap"),
    async (req, res) => {
      try {
        console.log("📤 Spot map upload request received");

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "No spot map file provided",
          });
        }

        const mapType = req.body.mapType;
        const fileUrl = `/uploads/spotmaps/${req.file.filename}`;
        const userId = req.user.user_id;

        console.log("✅ Spot map uploaded successfully:", fileUrl);

        // FIXED: Check if map type already exists and update instead of insert
        const [existing] = await pool.execute(
          "SELECT id FROM spot_maps WHERE map_type = ? AND is_active = TRUE",
          [mapType]
        );

        if (existing.length > 0) {
          // Update existing record
          await pool.execute(
            `UPDATE spot_maps SET 
            file_name = ?, file_url = ?, uploaded_by = ?, uploaded_at = NOW(),
            file_size = ?, mime_type = ?
           WHERE map_type = ? AND is_active = TRUE`,
            [
              req.file.filename,
              fileUrl,
              userId,
              req.file.size,
              req.file.mimetype,
              mapType,
            ]
          );
        } else {
          // Insert new record - REMOVE ID from insert
          await pool.execute(
            `INSERT INTO spot_maps (map_type, file_name, file_url, uploaded_by, uploaded_at, file_size, mime_type) 
           VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
            [
              mapType,
              req.file.filename,
              fileUrl,
              userId,
              req.file.size,
              req.file.mimetype,
            ]
          );
        }

        res.json({
          success: true,
          message: "Spot map uploaded successfully",
          url: fileUrl,
          filename: req.file.filename,
          type: mapType,
        });
      } catch (error) {
        console.error("🔥 Spot map upload error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to upload spot map",
          error: error.message,
        });
      }
    }
  );

  // ✅ Get current spot maps
  router.get("/", async (req, res) => {
    try {
      const [rows] = await pool.execute(
        "SELECT map_type, file_url FROM spot_maps WHERE is_active = TRUE ORDER BY map_type"
      );

      const spotMaps = {
        spotMap: "",
        detailedSpotMap: "",
        evacuationMap: "",
      };

      rows.forEach((row) => {
        if (spotMaps.hasOwnProperty(row.map_type)) {
          spotMaps[row.map_type] = row.file_url;
        }
      });

      res.json({
        success: true,
        data: spotMaps,
      });
    } catch (error) {
      console.error("Get spot maps error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch spot maps",
      });
    }
  });

  // ✅ Delete spot map
  router.delete("/:type", verifyToken, async (req, res) => {
    try {
      const { type } = req.params;
      const validTypes = ["spotMap", "detailedSpotMap", "evacuationMap"];

      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid map type",
        });
      }

      // Soft delete from database
      await pool.execute(
        "UPDATE spot_maps SET is_active = FALSE WHERE map_type = ?",
        [type]
      );

      res.json({
        success: true,
        message: "Map deleted successfully",
      });
    } catch (error) {
      console.error("Delete spot map error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete spot map",
      });
    }
  });

  return router;
};
