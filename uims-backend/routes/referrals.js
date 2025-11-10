const express = require("express");
const router = express.Router();

module.exports = (pool, verifyToken) => {
  // GET all referrals
  router.get("/", verifyToken, async (req, res) => {
    try {
      const [referrals] = await pool.query(
        `SELECT * FROM medical_referrals ORDER BY referral_date DESC`
      );

      res.json({
        success: true,
        data: referrals,
      });
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch referrals",
        error: error.message,
      });
    }
  });

  // GET referral by ID
  router.get("/:id", verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const [referrals] = await pool.query(
        `SELECT * FROM medical_referrals WHERE referral_id = ?`,
        [id]
      );

      if (referrals.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Referral not found",
        });
      }

      res.json({
        success: true,
        data: referrals[0],
      });
    } catch (error) {
      console.error("Error fetching referral:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch referral",
        error: error.message,
      });
    }
  });

  // CREATE new referral
  router.post("/", verifyToken, async (req, res) => {
    try {
      const {
        resident_id,
        bhw_id,
        referred_to,
        referral_reason,
        referral_date,
        status,
        notes,
      } = req.body;

      // Validation
      if (
        !resident_id ||
        !bhw_id ||
        !referred_to ||
        !referral_reason ||
        !referral_date
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const [result] = await pool.query(
        `INSERT INTO medical_referrals 
        (resident_id, bhw_id, referred_to, referral_reason, referral_date, status, notes, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          resident_id,
          bhw_id,
          referred_to,
          referral_reason,
          referral_date,
          status || "Pending",
          notes || null,
        ]
      );

      // Get resident name for activity log
      const [residentData] = await pool.query(
        "SELECT first_name, middle_name, last_name, suffix FROM residents WHERE resident_id = ?",
        [resident_id]
      );
      const r = residentData[0];
      const residentName = `${r.first_name} ${
        r.middle_name ? r.middle_name + " " : ""
      }${r.last_name}${r.suffix ? " " + r.suffix : ""}`;

      // Log the activity
      await pool.query(
        "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [
          verifyToken.user_id || bhw_id,
          "created",
          "medical_referral",
          result.insertId,
          residentName,
          status || "Pending",
          `Created medical referral for ${residentName} to ${referred_to} (Referral ID: ${result.insertId})`,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Referral created successfully",
        data: {
          referral_id: result.insertId,
        },
      });
    } catch (error) {
      console.error("Error creating referral:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create referral",
        error: error.message,
      });
    }
  });

  // UPDATE referral
  router.put("/:id", verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const {
        resident_id,
        bhw_id,
        referred_to,
        referral_reason,
        referral_date,
        status,
        notes,
      } = req.body;

      // Check if referral exists
      const [existing] = await pool.query(
        `SELECT * FROM medical_referrals WHERE referral_id = ?`,
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Referral not found",
        });
      }

      await pool.query(
        `UPDATE medical_referrals 
        SET resident_id = ?, bhw_id = ?, referred_to = ?, 
            referral_reason = ?, referral_date = ?, status = ?, notes = ?,
            updated_at = NOW()
        WHERE referral_id = ?`,
        [
          resident_id,
          bhw_id,
          referred_to,
          referral_reason,
          referral_date,
          status,
          notes,
          id,
        ]
      );

      // Get resident name for activity log
      const [residentData] = await pool.query(
        "SELECT first_name, middle_name, last_name, suffix FROM residents WHERE resident_id = ?",
        [resident_id]
      );
      const r = residentData[0];
      const residentName = `${r.first_name} ${
        r.middle_name ? r.middle_name + " " : ""
      }${r.last_name}${r.suffix ? " " + r.suffix : ""}`;

      // Log the activity
      await pool.query(
        "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [
          verifyToken.user_id || bhw_id,
          "updated",
          "medical_referral",
          id,
          residentName,
          status,
          `Updated medical referral for ${residentName} to ${referred_to} (Referral ID: ${id})`,
        ]
      );

      res.json({
        success: true,
        message: "Referral updated successfully",
      });
    } catch (error) {
      console.error("Error updating referral:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update referral",
        error: error.message,
      });
    }
  });

  // DELETE referral
  router.delete("/:id", verifyToken, async (req, res) => {
    try {
      const { id } = req.params;

      // Check if referral exists
      const [existing] = await pool.query(
        `SELECT * FROM medical_referrals WHERE referral_id = ?`,
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Referral not found",
        });
      }

      // Get referral details before deletion for activity log
      const referralData = existing[0];
      const [residentData] = await pool.query(
        "SELECT first_name, middle_name, last_name, suffix FROM residents WHERE resident_id = ?",
        [referralData.resident_id]
      );
      const r = residentData[0];
      const residentName = `${r.first_name} ${
        r.middle_name ? r.middle_name + " " : ""
      }${r.last_name}${r.suffix ? " " + r.suffix : ""}`;

      await pool.query(`DELETE FROM medical_referrals WHERE referral_id = ?`, [
        id,
      ]);

      // Log the activity
      await pool.query(
        "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [
          verifyToken.user_id || referralData.bhw_id,
          "deleted",
          "medical_referral",
          id,
          residentName,
          "deleted",
          `Deleted medical referral for ${residentName} to ${referralData.referred_to} (Referral ID: ${id})`,
        ]
      );

      res.json({
        success: true,
        message: "Referral deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting referral:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete referral",
        error: error.message,
      });
    }
  });

  return router;
};
