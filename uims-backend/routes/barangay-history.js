const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mammoth = require("mammoth");

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/history-docs");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only .doc and .docx files are allowed."),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = (pool, verifyToken) => {
  async function safeQuery(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (e) {
      console.error("barangay-history query error:", e?.message || e);
      throw e;
    }
  }

  // Get history document content as HTML
  router.get("/content", async (req, res) => {
    try {
      const history = await safeQuery(
        "SELECT * FROM barangay_history ORDER BY created_at DESC LIMIT 1"
      );

      if (history.length === 0 || !history[0].file_url) {
        return res.json({ success: true, content: null, history: null });
      }

      const historyData = history[0];
      const filePath = path.join(__dirname, "..", historyData.file_url);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "Document file not found",
        });
      }

      // Convert Word document to HTML
      const result = await mammoth.convertToHtml({ path: filePath });

      // Modify the first paragraph to display logo and text side by side
      let htmlContent = result.value;

      // Find the image paragraph and the next 4 text paragraphs
      const imgParaMatch = htmlContent.match(/<p[^>]*>\s*<img[^>]*>\s*<\/p>/i);

      if (imgParaMatch) {
        const imgPara = imgParaMatch[0];
        const afterImg = htmlContent.substring(
          htmlContent.indexOf(imgPara) + imgPara.length
        );

        // Match the next 4 paragraphs (Republic, Province, Municipality, Barangay)
        const textParasMatch = afterImg.match(/((?:<p[^>]*>.*?<\/p>\s*){4})/is);

        if (textParasMatch) {
          const textParas = textParasMatch[0];

          // Extract the img tag
          const imgTag = imgPara.match(/<img[^>]*>/i)[0];

          // Style the image
          const styledImg = imgTag.replace(
            /<img /,
            '<img style="flex-shrink: 0; width: 140px; height: 140px; object-fit: contain; margin: 0;" '
          );

          // Style the text paragraphs
          let styledTextParas = textParas;
          // Make first 3 lines normal size and last line (Barangay) larger and bold
          styledTextParas = styledTextParas.replace(
            /(<p[^>]*>)(Republic of the Philippines)(<\/p>)/gi,
            '<p style="margin: 0; padding: 0; font-size: 0.9rem; line-height: 1.4;">$2</p>'
          );
          styledTextParas = styledTextParas.replace(
            /(<p[^>]*>)(Province of Southern Leyte)(<\/p>)/gi,
            '<p style="margin: 0; padding: 0; font-size: 0.9rem; line-height: 1.4;">$2</p>'
          );
          styledTextParas = styledTextParas.replace(
            /(<p[^>]*>)(Municipality of Macrohon)(<\/p>)/gi,
            '<p style="margin: 0; padding: 0; font-size: 0.9rem; line-height: 1.4;">$2</p>'
          );
          styledTextParas = styledTextParas.replace(
            /(<p[^>]*>)(.*?Barangay Upper Ichon.*?)(<\/p>)/gi,
            '<p style="margin: 0.5rem 0 0 0; padding: 0; font-size: 1.1rem; font-weight: 700; line-height: 1.4;">$2</p>'
          );

          // Wrap text paragraphs in a div
          const wrappedText = `<div style="text-align: left;">${styledTextParas}</div>`;

          // Create flex container
          const flexContainer = `<div style="display: flex; align-items: center; justify-content: center; gap: 3rem; margin-bottom: 2rem;">${styledImg}${wrappedText}</div>`;

          // Replace the original image paragraph and text paragraphs with the flex container
          htmlContent = htmlContent.replace(imgPara + textParas, flexContainer);
        }
      }

      // Make "Barangay Upper Ichon" bold and underlined (in the header only, not in body text)
      // This was already handled in the header section above

      // Center and style "OFFICE OF THE SANGGUNIANG BARANGAY"
      htmlContent = htmlContent.replace(
        /(<p[^>]*>)(\s*OFFICE OF THE SANGGUNIANG BARANGAY\s*)(<\/p>)/gi,
        '<p style="text-align: center; font-weight: bold; margin-top: 3rem; margin-bottom: 0.75rem; text-transform: uppercase; font-size: 1.2rem; letter-spacing: 0.05em;">$2</p>'
      );

      // Center and style "ORDINANCE NO. 01" or similar
      htmlContent = htmlContent.replace(
        /(<p[^>]*>)(\s*ORDINANCE NO\.?\s*\d+\s*)(<\/p>)/gi,
        '<p style="text-align: center; font-weight: bold; margin-bottom: 0.25rem; text-transform: uppercase; font-size: 1.1rem;">$2</p>'
      );

      // Center and style "Series of YYYY"
      htmlContent = htmlContent.replace(
        /(<p[^>]*>)(\s*Series of \d{4}\s*)(<\/p>)/gi,
        '<p style="text-align: center; margin-bottom: 2.5rem; color: #374151; font-size: 1rem;">$2</p>'
      );

      // Center and style ordinance titles (text in quotes)
      htmlContent = htmlContent.replace(
        /(<p[^>]*>)(\s*"[^"]+"\s*)(<\/p>)/gi,
        '<p style="text-align: center; font-weight: bold; margin-bottom: 2.5rem; font-size: 1rem; line-height: 1.6; padding: 0 2rem;">$2</p>'
      );

      res.json({
        success: true,
        content: htmlContent,
        history: {
          history_id: historyData.history_id,
          title: historyData.title,
          file_url: historyData.file_url,
          created_at: historyData.created_at,
        },
      });
    } catch (err) {
      console.error("Get history content error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // GET /api/barangay-history
  router.get("/", async (req, res) => {
    try {
      const rows = await safeQuery(
        "SELECT * FROM barangay_history ORDER BY created_at DESC"
      );
      res.json({ success: true, history: rows });
    } catch (err) {
      console.error("Get barangay history error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // POST /api/barangay-history
  router.post("/", verifyToken, upload.single("file"), async (req, res) => {
    try {
      const { title } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Title is required",
        });
      }

      // File is required for history entries
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Document file is required",
        });
      }

      const file_url = `/uploads/history-docs/${req.file.filename}`;

      const result = await safeQuery(
        "INSERT INTO barangay_history (title, file_url, created_at) VALUES (?, ?, NOW())",
        [title, file_url]
      );

      const historyId = result.insertId;

      // Log activity
      const creatorUserId = req.user?.user_id || req.user?.id;
      if (creatorUserId) {
        try {
          await pool.execute(
            `INSERT INTO activity_log 
             (user_id, action, entity_type, entity_id, entity_identifier, status, remarks) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              creatorUserId,
              "Create History Entry",
              "barangay_history",
              historyId,
              title,
              "completed",
              `Created barangay history entry: ${title}`,
            ]
          );
        } catch (logErr) {
          console.error("Failed to log activity:", logErr);
        }
      }

      res.json({ success: true, history_id: historyId, file_url });
    } catch (err) {
      console.error("Create barangay history error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // PUT /api/barangay-history/:id
  router.put("/:id", verifyToken, upload.single("file"), async (req, res) => {
    try {
      const id = req.params.id;
      const { title } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Title is required",
        });
      }

      // Get existing record to check for old file
      const existing = await safeQuery(
        "SELECT file_url FROM barangay_history WHERE history_id = ?",
        [id]
      );

      let file_url = existing[0]?.file_url;

      // If new file uploaded, delete old file and use new one
      if (req.file) {
        // Delete old file if exists
        if (file_url) {
          const oldFilePath = path.join(__dirname, "..", file_url);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        file_url = `/uploads/history-docs/${req.file.filename}`;
      }

      await safeQuery(
        "UPDATE barangay_history SET title = ?, file_url = ? WHERE history_id = ?",
        [title, file_url, id]
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
              "Update History Entry",
              "barangay_history",
              id,
              title,
              "completed",
              `Updated barangay history entry: ${title}`,
            ]
          );
        } catch (logErr) {
          console.error("Failed to log activity:", logErr);
        }
      }

      res.json({ success: true, file_url });
    } catch (err) {
      console.error("Update barangay history error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // DELETE /api/barangay-history/:id
  router.delete("/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;

      // Get history details before deleting
      const history = await safeQuery(
        "SELECT title, file_url FROM barangay_history WHERE history_id = ?",
        [id]
      );

      // Delete associated file if exists
      if (history.length > 0 && history[0].file_url) {
        const filePath = path.join(__dirname, "..", history[0].file_url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await safeQuery("DELETE FROM barangay_history WHERE history_id = ?", [
        id,
      ]);

      // Log activity
      const userId = req.user?.user_id || req.user?.id;
      if (userId && history.length > 0) {
        try {
          await pool.execute(
            `INSERT INTO activity_log 
             (user_id, action, entity_type, entity_id, entity_identifier, status, remarks) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              userId,
              "Delete History Entry",
              "barangay_history",
              id,
              history[0].title,
              "completed",
              `Deleted barangay history entry: ${history[0].title}`,
            ]
          );
        } catch (logErr) {
          console.error("Failed to log activity:", logErr);
        }
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Delete barangay history error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  return router;
};
