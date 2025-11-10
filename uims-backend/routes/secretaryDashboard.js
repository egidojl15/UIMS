const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Helper: run query and return rows or empty array
async function safeRows(sql, params = []) {
  try {
    const [rows] = await pool.query(sql, params);
    return rows || [];
  } catch (e) {
    console.warn('safeRows error:', e?.message || e);
    return [];
  }
}

// Helper: safe count using an explicit SQL
async function safeCountSql(sql, params = []) {
  try {
    const [[row]] = await pool.query(sql, params);
    return row?.cnt ?? 0;
  } catch (e) {
    console.warn('safeCount error:', e?.message || e);
    return 0;
  }
}

// GET /api/dashboard/secretary
router.get('/', authenticateToken, async (req, res) => {
  const role = req.user?.role || req.user?.role_name || '';
  if (!['barangay_secretary', 'admin', 'superadmin', 'barangay_captain'].includes(role)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    // residents count
    const residents = await safeCountSql('SELECT COUNT(*) AS cnt FROM `residents`');

    // households: use barangay_information.total_households if present
    let households = 0;
    try {
      const [[bi]] = await pool.query('SELECT total_households AS cnt FROM `barangay_information` LIMIT 1');
      households = Number(bi?.cnt ?? 0);
    } catch (e) {
      households = 0;
    }

    // users count
    const users = await safeCountSql('SELECT COUNT(*) AS cnt FROM `users`');

    // complaints: total and "open" count (map open -> filed/under_investigation/for_hearing)
    const complaintsTotal = await safeCountSql('SELECT COUNT(*) AS cnt FROM `complaints`');
    const complaintsOpen = await safeCountSql(
      "SELECT COUNT(*) AS cnt FROM `complaints` WHERE status IN ('filed','under_investigation','for_hearing')"
    );

    // blotter: total and active/open
    const blotterTotal = await safeCountSql('SELECT COUNT(*) AS cnt FROM `blotter_records`');
    const blotterOpen = await safeCountSql("SELECT COUNT(*) AS cnt FROM `blotter_records` WHERE status = 'active'");

    // recent certificate requests (use the request table or view)
    const certTable = 'certificate_requests_view'; // view exists in your dump
    const recentRequests = await safeRows(
      `SELECT * FROM \`${certTable}\` ORDER BY created_at DESC LIMIT 10`
    );

    // login activity from login_history joined to users/roles
    let loginActivity = [];
    try {
      loginActivity = await safeRows(
        `SELECT lh.login_id, lh.user_id, u.username AS user, ur.role_name AS role,
                lh.login_time, lh.ip_address, lh.user_agent, lh.login_status
         FROM login_history lh
         LEFT JOIN users u ON u.user_id = lh.user_id
         LEFT JOIN user_roles ur ON ur.role_id = u.role_id
         ORDER BY lh.login_time DESC
         LIMIT 10`
      );
    } catch (e) {
      loginActivity = await safeRows('SELECT * FROM `login_history` ORDER BY login_time DESC LIMIT 10');
    }

    // recent complaints list
    const recentComplaints = await safeRows('SELECT * FROM `complaints` ORDER BY created_at DESC LIMIT 10');

    // concerns/table not present in dump -> return empty
    const concerns = [];

    res.json({
      success: true,
      overview: {
        residents,
        households,
        users,
        complaints: { total: complaintsTotal, open: complaintsOpen },
        blotter: { total: blotterTotal, open: blotterOpen },
        recentRequests,
        loginActivity,
        recentComplaints,
        concerns,
      },
    });
  } catch (error) {
    console.error('secretary dashboard error:', error?.message || error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;