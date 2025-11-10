const express = require("express");
const router = express.Router();

module.exports = (pool, authenticateToken) => {
  // Get all projects - PUBLIC ACCESS (no auth required for viewing)
  router.get("/", async (req, res) => {
    try {
      const { status, search } = req.query;

      let query = `
        SELECT 
          project_id,
          title,
          status,
          budget,
          expected_completion,
          start_date,
          contractor,
          category,
          location,
          implementing_office,
          source_of_fund,
          description,
          created_at,
          updated_at
        FROM projects
        WHERE 1=1
      `;

      const params = [];

      if (status && status !== "all") {
        query += ` AND status = ?`;
        params.push(status);
      }

      if (search) {
        query += ` AND (title LIKE ? OR description LIKE ? OR location LIKE ?)`;
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
      }

      query += ` ORDER BY created_at DESC`;

      const [projects] = await pool.execute(query, params);

      // Get updates for each project
      for (let project of projects) {
        const [updates] = await pool.execute(
          `SELECT update_id, project_id, date, description, created_at 
           FROM project_updates 
           WHERE project_id = ? 
           ORDER BY date DESC`,
          [project.project_id]
        );
        project.updates = updates;
      }

      res.json({ success: true, data: projects });
    } catch (error) {
      console.error("Fetch projects error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch projects",
      });
    }
  });

  // Get single project by ID - PUBLIC ACCESS (no auth required for viewing)
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const [projects] = await pool.execute(
        `SELECT * FROM projects WHERE project_id = ?`,
        [id]
      );

      if (projects.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      const project = projects[0];

      // Get updates for this project
      const [updates] = await pool.execute(
        `SELECT * FROM project_updates WHERE project_id = ? ORDER BY date DESC`,
        [id]
      );
      project.updates = updates;

      res.json({ success: true, data: project });
    } catch (error) {
      console.error("Fetch project error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch project",
      });
    }
  });

  // Create new project
  router.post("/", authenticateToken, async (req, res) => {
    try {
      const {
        title,
        status,
        budget,
        expected_completion,
        start_date,
        contractor,
        category,
        location,
        implementing_office,
        source_of_fund,
        description,
      } = req.body;

      // Validate required fields
      if (!title || !status) {
        return res.status(400).json({
          success: false,
          message: "Title and status are required",
        });
      }

      const [result] = await pool.execute(
        `INSERT INTO projects 
          (title, status, budget, expected_completion, start_date, contractor, 
           category, location, implementing_office, source_of_fund, description, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          title,
          status,
          budget || null,
          expected_completion || null,
          start_date || null,
          contractor || null,
          category || null,
          location || null,
          implementing_office || null,
          source_of_fund || null,
          description || null,
        ]
      );

      // Log activity
      await pool.execute(
        `INSERT INTO activity_log 
          (user_id, action, entity_type, entity_id, entity_identifier, status, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.user_id,
          "CREATE",
          "project",
          result.insertId,
          title,
          "success",
          `Created new project: ${title}`,
        ]
      );

      res.json({
        success: true,
        message: "Project created successfully",
        data: { project_id: result.insertId },
      });
    } catch (error) {
      console.error("Create project error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create project",
      });
    }
  });

  // Update project
  router.put("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        status,
        budget,
        expected_completion,
        start_date,
        contractor,
        category,
        location,
        implementing_office,
        source_of_fund,
        description,
      } = req.body;

      const [result] = await pool.execute(
        `UPDATE projects SET
          title = ?,
          status = ?,
          budget = ?,
          expected_completion = ?,
          start_date = ?,
          contractor = ?,
          category = ?,
          location = ?,
          implementing_office = ?,
          source_of_fund = ?,
          description = ?,
          updated_at = NOW()
         WHERE project_id = ?`,
        [
          title,
          status,
          budget,
          expected_completion,
          start_date,
          contractor,
          category,
          location,
          implementing_office,
          source_of_fund,
          description,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      // Log activity
      await pool.execute(
        `INSERT INTO activity_log 
          (user_id, action, entity_type, entity_id, entity_identifier, status, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.user_id,
          "UPDATE",
          "project",
          id,
          title,
          "success",
          `Updated project: ${title}`,
        ]
      );

      res.json({
        success: true,
        message: "Project updated successfully",
      });
    } catch (error) {
      console.error("Update project error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update project",
      });
    }
  });

  // Delete project
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      // Get project title for logging
      const [projects] = await pool.execute(
        `SELECT title FROM projects WHERE project_id = ?`,
        [id]
      );

      if (projects.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      const projectTitle = projects[0].title;

      // Delete project updates first (foreign key constraint)
      await pool.execute(`DELETE FROM project_updates WHERE project_id = ?`, [
        id,
      ]);

      // Delete project
      await pool.execute(`DELETE FROM projects WHERE project_id = ?`, [id]);

      // Log activity
      await pool.execute(
        `INSERT INTO activity_log 
          (user_id, action, entity_type, entity_id, entity_identifier, status, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.user_id,
          "DELETE",
          "project",
          id,
          projectTitle,
          "success",
          `Deleted project: ${projectTitle}`,
        ]
      );

      res.json({
        success: true,
        message: "Project deleted successfully",
      });
    } catch (error) {
      console.error("Delete project error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete project",
      });
    }
  });

  // Add project update
  router.post("/:id/updates", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { date, description } = req.body;

      if (!date || !description) {
        return res.status(400).json({
          success: false,
          message: "Date and description are required",
        });
      }

      const [result] = await pool.execute(
        `INSERT INTO project_updates (project_id, date, description, created_at)
         VALUES (?, ?, ?, NOW())`,
        [id, date, description]
      );

      // Get project title for logging
      const [projects] = await pool.execute(
        `SELECT title FROM projects WHERE project_id = ?`,
        [id]
      );

      if (projects.length > 0) {
        // Log activity
        await pool.execute(
          `INSERT INTO activity_log 
            (user_id, action, entity_type, entity_id, entity_identifier, status, remarks)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.user_id,
            "UPDATE",
            "project",
            id,
            projects[0].title,
            "success",
            `Added update to project: ${projects[0].title}`,
          ]
        );
      }

      res.json({
        success: true,
        message: "Project update added successfully",
        data: { update_id: result.insertId },
      });
    } catch (error) {
      console.error("Add project update error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add project update",
      });
    }
  });

  // Get project statistics
  router.get("/stats/summary", authenticateToken, async (req, res) => {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END) as ongoing,
          SUM(CASE WHEN status = 'planning' THEN 1 ELSE 0 END) as planning
        FROM projects
      `);

      res.json({ success: true, data: stats[0] });
    } catch (error) {
      console.error("Fetch project stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch project statistics",
      });
    }
  });

  return router;
};
