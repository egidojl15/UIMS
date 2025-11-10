const express = require('express');
const router = express.Router();

module.exports = (pool, authenticateToken) => {

  // GET all complaint categories
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM complaint_categories ORDER BY category_name ASC"
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error("Fetch complaint categories error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch complaint categories",
      });
    }
  });

  // POST create complaint category
  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { category_name, description } = req.body;

      const [result] = await pool.execute(
        "INSERT INTO complaint_categories (category_name, description) VALUES (?, ?)",
        [category_name, description || null]
      );

      res.json({
        success: true,
        data: { category_id: result.insertId },
        message: "Complaint category created successfully",
      });
    } catch (error) {
      console.error("Create complaint category error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create complaint category",
      });
    }
  });

  // PUT update complaint category
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { category_name, description } = req.body;

      await pool.execute(
        "UPDATE complaint_categories SET category_name = ?, description = ? WHERE category_id = ?",
        [category_name, description, id]
      );

      res.json({
        success: true,
        message: "Complaint category updated successfully",
      });
    } catch (error) {
      console.error("Update complaint category error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update complaint category",
      });
    }
  });

  // DELETE complaint category
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.execute(
        "DELETE FROM complaint_categories WHERE category_id = ?",
        [id]
      );
      res.json({
        success: true,
        message: "Complaint category deleted successfully",
      });
    } catch (error) {
      console.error("Delete complaint category error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete complaint category",
      });
    }
  });

  return router;
};