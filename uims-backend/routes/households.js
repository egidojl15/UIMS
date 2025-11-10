const express = require("express");

module.exports = (pool, authenticateToken) => {
  const router = express.Router();
  console.log("[routes] households.js loaded");

  async function tableExists(name) {
    try {
      const [[r]] = await pool.query(
        "SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
        [name]
      );
      return !!r?.cnt;
    } catch (e) {
      console.warn("tableExists error:", e?.message || e);
      return false;
    }
  }

  async function safeRows(sql, params = []) {
    try {
      const [rows] = await pool.query(sql, params);
      return Array.isArray(rows) ? rows : [];
    } catch (e) {
      console.warn("safeRows error:", e?.message || e);
      return [];
    }
  }

  router.get("/", authenticateToken, async (req, res) => {
    console.log(
      "[routes] GET /api/households requested by",
      req.user?.username || req.ip
    );
    try {
      if (await tableExists("households")) {
        const rows = await safeRows(
          "SELECT * FROM `households` ORDER BY household_id LIMIT 500"
        );
        return res.json({ success: true, households: rows });
      }

      // derive households from residents
      const residents = await safeRows("SELECT * FROM `residents`");
      const map = new Map();
      residents.forEach((r) => {
        const hid =
          r.household_id ??
          r.householdId ??
          r.household_number ??
          r.household_no ??
          r.household;
        if (!hid) return;
        if (!map.has(hid)) {
          map.set(hid, {
            household_id: hid,
            household_head:
              r.household_head ??
              r.head_of_household ??
              r.full_name ??
              r.name ??
              null,
            members_count: 1,
            members: [r],
          });
        } else {
          const item = map.get(hid);
          item.members_count += 1;
          item.members.push(r);
        }
      });
      const households = Array.from(map.values());
      return res.json({ success: true, households });
    } catch (err) {
      console.error("households route error:", err?.message || err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // GET /api/households/:id
  router.get("/:id", authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;
      if (await tableExists("households")) {
        const rows = await safeRows(
          "SELECT * FROM `households` WHERE household_id = ? LIMIT 1",
          [id]
        );
        if (rows.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Household not found" });
        }

        // Get household members
        const members = await safeRows(
          `
        SELECT r.*, 
               CASE WHEN r.resident_id = h.household_head_id THEN 1 ELSE 0 END as is_head
        FROM residents r 
        LEFT JOIN households h ON r.household_id = h.household_id 
        WHERE r.household_id = ? AND r.is_active = 1
        ORDER BY is_head DESC, r.last_name, r.first_name
      `,
          [id]
        );

        return res.json({
          success: true,
          household: {
            ...rows[0],
            members: members,
            members_count: members.length,
          },
        });
      }

      // derive from residents
      const residents = await safeRows(
        "SELECT * FROM `residents` WHERE COALESCE(household_id, householdId, household_number, household_no, household) = ?",
        [id]
      );
      return res.json({
        success: true,
        household: { household_id: id, members: residents },
      });
    } catch (err) {
      console.error("households/:id error:", err?.message || err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // POST /api/households - Create new household
  router.post("/", authenticateToken, async (req, res) => {
    try {
      const {
        household_head_name,
        spouse_name,
        address,
        purok,
        contact_number,
        household_head_id,
      } = req.body;

      // Check if households table exists
      if (!(await tableExists("households"))) {
        return res.status(500).json({
          success: false,
          message:
            "Households table does not exist. Please run the household_setup.sql script first.",
        });
      }

      if (!household_head_name) {
        return res.status(400).json({
          success: false,
          message: "Head of household name is required",
        });
      }

      // Use purok as address if address is not provided
      const finalAddress = address || purok || "Not specified";

      // Generate next household number by finding the highest existing number
      const [allHouseholds] = await pool.query(
        'SELECT household_number FROM households WHERE household_number LIKE "HH%" ORDER BY CAST(SUBSTRING(household_number, 3) AS UNSIGNED) DESC'
      );
      let nextNumber = 1;

      console.log("All households found:", allHouseholds);

      if (allHouseholds && allHouseholds.length > 0) {
        // Find the highest number among all household numbers
        let maxNumber = 0;
        for (const household of allHouseholds) {
          const householdNumber = household.household_number;
          console.log("Processing household number:", householdNumber);

          if (householdNumber && householdNumber.startsWith("HH")) {
            const number = parseInt(householdNumber.replace("HH", ""));
            console.log("Extracted number:", number);

            if (!isNaN(number) && number > maxNumber) {
              maxNumber = number;
            }
          }
        }

        console.log("Highest household number found:", maxNumber);
        nextNumber = maxNumber + 1;
      }

      console.log("Starting with next number:", nextNumber);

      // Generate the next household number
      let household_number = `HH${nextNumber.toString().padStart(3, "0")}`;
      console.log("Generated household number:", household_number);

      // Double-check that this number doesn't exist (safety check)
      try {
        const [existing] = await pool.query(
          "SELECT household_id FROM households WHERE household_number = ?",
          [household_number]
        );
        if (existing && existing.length > 0) {
          console.log(
            `WARNING: Generated number ${household_number} already exists! This shouldn't happen.`
          );
          // If somehow it exists, find the next available number
          let testNumber = nextNumber + 1;
          for (let i = 0; i < 100; i++) {
            const testHouseholdNumber = `HH${testNumber
              .toString()
              .padStart(3, "0")}`;
            const [testExisting] = await pool.query(
              "SELECT household_id FROM households WHERE household_number = ?",
              [testHouseholdNumber]
            );
            if (!testExisting || testExisting.length === 0) {
              household_number = testHouseholdNumber;
              console.log(
                `Found alternative household number: ${household_number}`
              );
              break;
            }
            testNumber++;
          }
        }
      } catch (error) {
        console.log("Safety check error:", error.message);
      }

      console.log("Final household number to insert:", household_number);

      console.log("Inserting household with data:", {
        household_number,
        household_head_name,
        address: finalAddress,
        purok: purok || null,
        contact_number: contact_number || null,
        household_head_id: household_head_id || null,
      });

      const [result] = await pool.execute(
        "INSERT INTO households (household_number, household_head_name, spouse_name, address, purok, contact_number, household_head_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          household_number,
          household_head_name,
          spouse_name || null,
          finalAddress,
          purok || null,
          contact_number || null,
          household_head_id || null,
        ]
      );

      // Log the activity
      await pool.execute(
        "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [
          req.user.user_id,
          "created",
          "household",
          result.insertId,
          `${household_number} - ${household_head_name}`,
          "active",
          `Created new household: ${household_number} with head ${household_head_name} (ID: ${result.insertId})`,
        ]
      );

      res.json({
        success: true,
        message: "Household created successfully",
        household: {
          household_id: result.insertId,
          household_number: household_number,
          household_head_name: household_head_name,
          spouse_name: spouse_name,
          address: finalAddress,
          purok: purok,
          contact_number: contact_number,
          household_head_id: household_head_id,
        },
      });
    } catch (err) {
      console.error("Create household error:", err?.message || err);
      console.error("Error details:", err);
      res.status(500).json({
        success: false,
        message: "Failed to create household",
        error: err?.message || "Unknown error",
      });
    }
  });

  // PUT /api/households/:id - Update household
  router.put("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const {
        household_head_name,
        spouse_name,
        address,
        purok,
        contact_number,
        household_head_id,
      } = req.body;

      // Check if household exists
      const existing = await safeRows(
        "SELECT household_id FROM households WHERE household_id = ?",
        [id]
      );
      if (existing.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Household not found" });
      }

      // Use purok as address if address is not provided
      const finalAddress = address || purok || "Not specified";

      // Update household (excluding household_number as it's auto-generated and shouldn't be changed)
      await pool.execute(
        "UPDATE households SET household_head_name = ?, spouse_name = ?, address = ?, purok = ?, contact_number = ?, household_head_id = ?, updated_at = NOW() WHERE household_id = ?",
        [
          household_head_name,
          spouse_name || null,
          finalAddress,
          purok || null,
          contact_number || null,
          household_head_id || null,
          id,
        ]
      );

      // Get household number for activity log
      const [householdData] = await pool.execute(
        "SELECT household_number FROM households WHERE household_id = ?",
        [id]
      );
      const householdNumber = householdData[0]?.household_number || `ID ${id}`;

      // Log the activity
      await pool.execute(
        "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [
          req.user.user_id,
          "updated",
          "household",
          id,
          `${householdNumber} - ${household_head_name}`,
          "active",
          `Updated household: ${householdNumber} with head ${household_head_name} (ID: ${id})`,
        ]
      );

      res.json({ success: true, message: "Household updated successfully" });
    } catch (err) {
      console.error("Update household error:", err?.message || err);
      res
        .status(500)
        .json({ success: false, message: "Failed to update household" });
    }
  });

  // DELETE /api/households/:id - Delete household
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      // Check if household exists
      const existing = await safeRows(
        "SELECT household_id FROM households WHERE household_id = ?",
        [id]
      );
      if (existing.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Household not found" });
      }

      // Check if household has members
      const members = await safeRows(
        "SELECT COUNT(*) as count FROM residents WHERE household_id = ? AND is_active = 1",
        [id]
      );
      if (members[0].count > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete household with active members. Please reassign members first.",
        });
      }

      // Get household details before deletion for activity log
      const [householdData] = await pool.execute(
        "SELECT household_number, household_head_name FROM households WHERE household_id = ?",
        [id]
      );
      const householdNumber = householdData[0]?.household_number || `ID ${id}`;
      const householdHeadName =
        householdData[0]?.household_head_name || "Unknown";

      await pool.execute("DELETE FROM households WHERE household_id = ?", [id]);

      // Log the activity
      await pool.execute(
        "INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_identifier, status, remarks, log_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [
          req.user.user_id,
          "deleted",
          "household",
          id,
          `${householdNumber} - ${householdHeadName}`,
          "deleted",
          `Deleted household: ${householdNumber} with head ${householdHeadName} (ID: ${id})`,
        ]
      );

      res.json({ success: true, message: "Household deleted successfully" });
    } catch (err) {
      console.error("Delete household error:", err?.message || err);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete household" });
    }
  });

  // PUT /api/households/:id/assign-head - Assign household head
  router.put("/:id/assign-head", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { resident_id } = req.body;

      if (!resident_id) {
        return res.status(400).json({
          success: false,
          message: "Resident ID is required",
        });
      }

      // Check if household exists
      const household = await safeRows(
        "SELECT household_id FROM households WHERE household_id = ?",
        [id]
      );
      if (household.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Household not found" });
      }

      // Check if resident exists and belongs to this household
      const resident = await safeRows(
        "SELECT resident_id, first_name, last_name FROM residents WHERE resident_id = ? AND household_id = ? AND is_active = 1",
        [resident_id, id]
      );
      if (resident.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Resident not found or does not belong to this household",
        });
      }

      // Update household head
      const fullName = `${resident[0].first_name} ${resident[0].last_name}`;
      await pool.execute(
        "UPDATE households SET household_head_id = ?, household_head_name = ?, updated_at = NOW() WHERE household_id = ?",
        [resident_id, fullName, id]
      );

      res.json({
        success: true,
        message: "Household head assigned successfully",
      });
    } catch (err) {
      console.error("Assign household head error:", err?.message || err);
      res
        .status(500)
        .json({ success: false, message: "Failed to assign household head" });
    }
  });

  return router;
};
