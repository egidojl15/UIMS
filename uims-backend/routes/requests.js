const express = require("express");
const router = express.Router();
const brevo = require("@getbrevo/brevo"); // ADD THIS LINE
require("dotenv").config();

// ✅ FIXED: Export a function that receives pool and verifyToken
module.exports = (pool, verifyToken) => {
  /**
   * POST /api/requests/verify-resident
   */
  router.post("/verify-resident", async (req, res) => {
    try {
      const { firstName, lastName, birthDate } = req.body;

      if (!firstName || !lastName || !birthDate) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const [residents] = await pool.execute(
        `SELECT resident_id, first_name, last_name, middle_name, date_of_birth, 
                contact_number, email, purok 
         FROM residents 
         WHERE first_name = ? 
         AND last_name = ? 
         AND date_of_birth = ?
         AND is_active = 1`,
        [firstName, lastName, birthDate]
      );

      if (residents.length > 0) {
        const resident = residents[0];
        return res.json({
          success: true,
          verified: true,
          resident: {
            resident_id: resident.resident_id,
            full_name: `${resident.first_name} ${resident.middle_name || ""} ${
              resident.last_name
            }`.trim(),
            contact: resident.contact_number,
            email: resident.email,
            address: resident.purok,
          },
        });
      } else {
        return res.json({
          success: false,
          verified: false,
          message: "No matching resident found",
        });
      }
    } catch (err) {
      console.error("[verify-resident] Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to verify resident",
      });
    }
  });

  // Email notification helper using Brevo
  async function sendEmailNotification(to, subject, htmlContent) {
    try {
      const apiInstance = new brevo.TransactionalEmailsApi();
      apiInstance.setApiKey(
        brevo.TransactionalEmailsApiApiKeys.apiKey,
        process.env.BREVO_API_KEY ||
          "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"
      );

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.sender = {
        name: process.env.BREVO_SENDER_NAME || "Barangay Upper Ichon",
        email:
          process.env.BREVO_SENDER_EMAIL || "suburbandaredevil666@gmail.com",
      };
      sendSmtpEmail.to = [{ email: to }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log("✅ Email sent successfully to:", to);
      return true;
    } catch (error) {
      console.error("❌ Email sending failed:", error);
      return false;
    }
  }

  /**
   * GET /api/requests/certificate-types
   */
  router.get("/certificate-types", async (req, res) => {
    try {
      const { requesterType } = req.query;

      let query = "SELECT * FROM certificate_types WHERE is_active = 1";

      if (requesterType === "non-resident") {
        query += " AND available_to_non_residents = 1";
      }

      const [types] = await pool.query(query);
      return res.json({ success: true, data: types });
    } catch (err) {
      console.error("[certificate-types] Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch certificate types",
      });
    }
  });

  /**
   * POST /api/requests
   * Creates request in certificate_requests (always)
   * AND in public_requests (only for non-residents)
   */
  router.post("/", async (req, res) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const {
        cert_type_id,
        purpose,
        requester_type,
        resident_id,
        fullName,
        contactNumber,
        email,
        address,
      } = req.body;

      console.log("[POST /requests] Received:", req.body);

      // Validate
      if (!cert_type_id || !purpose) {
        return res.status(400).json({
          success: false,
          message: "Certificate type and purpose are required",
        });
      }

      if (requester_type === "non-resident") {
        if (!fullName || !contactNumber || !email || !address) {
          return res.status(400).json({
            success: false,
            message: "Non-residents must provide complete information",
          });
        }
      }

      // STEP 1: Insert into certificate_requests (ALWAYS)
      const [certResult] = await connection.query(
        `INSERT INTO certificate_requests
         (resident_id, requester_type, cert_type_id, purpose, 
          status, request_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'pending', CURDATE(), NOW(), NOW())`,
        [
          resident_id || null,
          requester_type || "non-resident",
          cert_type_id,
          purpose,
        ]
      );

      const certificateRequestId = certResult.insertId;
      console.log(
        "[POST /requests] Created certificate_request_id:",
        certificateRequestId
      );

      // STEP 2: If non-resident, also insert into public_requests
      if (requester_type === "non-resident") {
        await connection.query(
          `INSERT INTO public_requests
           (certificate_request_id, resident_id, requester_name, requester_contact, 
            requester_email, requester_address, requester_type, created_at, updated_at)
           VALUES (?, NULL, ?, ?, ?, ?, 'non-resident', NOW(), NOW())`,
          [certificateRequestId, fullName, contactNumber, email, address]
        );
        console.log(
          "[POST /requests] Created public_requests entry for non-resident"
        );
      }

      await connection.commit();

      return res.json({
        success: true,
        request_id: certificateRequestId,
      });
    } catch (err) {
      await connection.rollback();
      console.error("[POST /requests] Error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: err?.message,
      });
    } finally {
      connection.release();
    }
  });

  /**
   * GET /api/requests
   * Fetches all requests with JOIN to get non-resident details
   */
  router.get("/", verifyToken, async (req, res) => {
    // ✅ CHANGED: authenticateToken → verifyToken
    try {
      console.log("[GET /requests] Fetching all requests");

      const [requests] = await pool.query(
        `SELECT 
          cr.request_id,
          cr.resident_id,
          cr.requester_type,
          cr.cert_type_id,
          cr.purpose,
          cr.status,
          cr.request_date,
          cr.processed_by,
          cr.processed_date,
          cr.released_by,
          cr.released_date,
          cr.remarks,
          cr.created_at,
          cr.updated_at,
          ct.name as certificate_type,
          -- For residents: get from residents table
          -- For non-residents: get from public_requests table
          CASE 
            WHEN cr.requester_type = 'resident' THEN CONCAT(r.first_name, ' ', IFNULL(r.middle_name, ''), ' ', r.last_name)
            ELSE pr.requester_name
          END as requester_name,
          CASE 
            WHEN cr.requester_type = 'resident' THEN r.contact_number
            ELSE pr.requester_contact
          END as requester_contact,
          CASE 
            WHEN cr.requester_type = 'resident' THEN r.email
            ELSE pr.requester_email
          END as requester_email,
          CASE 
            WHEN cr.requester_type = 'resident' THEN r.purok
            ELSE pr.requester_address
          END as requester_address
        FROM certificate_requests cr
        LEFT JOIN residents r ON cr.resident_id = r.resident_id AND cr.requester_type = 'resident'
        LEFT JOIN public_requests pr ON cr.request_id = pr.certificate_request_id AND cr.requester_type = 'non-resident'
        LEFT JOIN certificate_types ct ON cr.cert_type_id = ct.id
        ORDER BY cr.created_at DESC`
      );

      console.log("[GET /requests] Found requests:", requests.length);

      const formattedRequests = requests.map((r) => ({
        id: r.request_id,
        request_id: r.request_id,
        resident_id: r.resident_id,
        requester_type: r.requester_type,
        cert_type_id: r.cert_type_id,
        certificate_type: r.certificate_type,
        purpose: r.purpose,
        requester_name: r.requester_name,
        requester_contact: r.requester_contact,
        requester_email: r.requester_email,
        requester_address: r.requester_address,
        status: r.status,
        request_date: r.request_date,
        processed_by: r.processed_by,
        processed_date: r.processed_date,
        released_by: r.released_by,
        released_date: r.released_date,
        remarks: r.remarks,
        created_at: r.created_at,
        updated_at: r.updated_at,
      }));

      return res.json({ success: true, requests: formattedRequests });
    } catch (err) {
      console.error("[GET /requests] Error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: err?.message,
      });
    }
  });

  // Get requirements by certificate type
  function getRequirementsByCertType(certTypeName) {
    const requirements = {
      "Barangay Clearance": [
        "Valid ID (school ID, company/office ID, voter's ID, etc.)",
        "Community Tax Certificate (CTC)",
        "For new residents: Endorsement from Purok Leader, Homeowners' Association President, Barangay Officials, or known barangay residents",
      ],
      "Certificate of Residency": [
        "Valid ID",
        "Community Tax Certificate (CTC)",
        "Proof of residency (utility bill, lease contract, etc.)",
      ],
      "Business Permit": [
        "Valid ID (company/office ID, voter's ID, etc.)",
        "Community Tax Certificate (CTC)",
        "Mayor's Permit application (if applicable)",
      ],
      "Indigency Certificate": [
        "Valid ID",
        "Community Tax Certificate (CTC)",
        "Proof of low-income status (if available)",
      ],
      "Certificate of Good Moral Character": [
        "Valid ID",
        "Community Tax Certificate (CTC)",
        "Purpose statement",
      ],
      "First Time Job Seeker Certificate": [
        "Valid ID",
        "Barangay Certification that applicant is a resident",
        "Community Tax Certificate (CTC)",
        "Two (2) pcs. 2x2 ID picture",
      ],
    };

    return (
      requirements[certTypeName] || [
        "Valid ID",
        "Community Tax Certificate (CTC)",
      ]
    );
  }

  /**
   * GET /api/requests/:id
   */
  router.get("/:id", verifyToken, async (req, res) => {
    // ✅ CHANGED: authenticateToken → verifyToken
    try {
      const [requests] = await pool.query(
        `SELECT 
          cr.*,
          ct.name as certificate_type,
          r.first_name, r.last_name, r.middle_name, r.contact_number, r.email as resident_email,
          pr.requester_name, pr.requester_contact, pr.requester_email, pr.requester_address
        FROM certificate_requests cr
        LEFT JOIN residents r ON cr.resident_id = r.resident_id
        LEFT JOIN public_requests pr ON cr.request_id = pr.certificate_request_id
        LEFT JOIN certificate_types ct ON cr.cert_type_id = ct.id
        WHERE cr.request_id = ?`,
        [req.params.id]
      );

      if (requests.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Request not found" });
      }

      return res.json({ success: true, request: requests[0] });
    } catch (err) {
      console.error("[GET /requests/:id] Error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  });

  /**
   * PUT /api/requests/:id/status
   * Update request status and send email notification
   */
  router.put("/:id/status", verifyToken, async (req, res) => {
    try {
      const { status, rejection_reason, reschedule_date } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      // Get request details first
      const [requests] = await pool.query(
        `SELECT 
          cr.*,
          ct.name as certificate_type,
          r.first_name, r.last_name, r.email as resident_email,
          pr.requester_name, pr.requester_email
        FROM certificate_requests cr
        LEFT JOIN residents r ON cr.resident_id = r.resident_id
        LEFT JOIN public_requests pr ON cr.request_id = pr.certificate_request_id
        LEFT JOIN certificate_types ct ON cr.cert_type_id = ct.id
        WHERE cr.request_id = ?`,
        [req.params.id]
      );

      if (requests.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      const request = requests[0];
      const requesterEmail = request.requester_email || request.resident_email;
      const requesterName =
        request.requester_name || `${request.first_name} ${request.last_name}`;

      // Update status in database
      let updateQuery = `UPDATE certificate_requests 
         SET status = ?, updated_at = NOW()`;
      let params = [status];

      if (rejection_reason) {
        updateQuery += `, remarks = ?`;
        params.push(rejection_reason);
      }

      if (reschedule_date) {
        updateQuery += `, processed_date = ?`;
        params.push(reschedule_date);
      }

      updateQuery += ` WHERE request_id = ?`;
      params.push(req.params.id);

      await pool.query(updateQuery, params);

      // Send email notification
      if (requesterEmail) {
        let emailSubject = "";
        let emailContent = "";

        if (status === "approved") {
          const requirements = getRequirementsByCertType(
            request.certificate_type
          );
          const requirementsList = requirements
            .map((req) => `<li>${req}</li>`)
            .join("");

          emailSubject = `Certificate Request Approved - Request #${request.request_id}`;
          emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0F4C81 0%, #58A1D3 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Certificate Request Approved</h1>
              </div>
              
              <div style="padding: 30px; background-color: #f9f9f9;">
                <p>Dear <strong>${requesterName}</strong>,</p>
                
                <p>Good news! Your certificate request has been approved.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #0F4C81; margin-top: 0;">Request Details:</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0;"><strong>Request ID:</strong></td>
                      <td style="padding: 8px 0;">#${request.request_id}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;"><strong>Certificate Type:</strong></td>
                      <td style="padding: 8px 0;">${
                        request.certificate_type
                      }</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;"><strong>Status:</strong></td>
                      <td style="padding: 8px 0;"><span style="background: #22c55e; color: white; padding: 4px 12px; border-radius: 12px;">Approved</span></td>
                    </tr>
                    ${
                      reschedule_date
                        ? `
                    <tr>
                      <td style="padding: 8px 0;"><strong>Pickup Date:</strong></td>
                      <td style="padding: 8px 0;">${new Date(
                        reschedule_date
                      ).toLocaleDateString()}</td>
                    </tr>
                    `
                        : ""
                    }
                  </table>
                </div>

                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                  <h3 style="color: #92400e; margin-top: 0;">📋 Requirements for Pickup:</h3>
                  <ul style="color: #92400e; margin: 10px 0;">
                    ${requirementsList}
                  </ul>
                </div>

                <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1e40af; margin-top: 0;">Next Steps:</h3>
                  <ol style="color: #1e3a8a; margin: 10px 0;">
                    <li style="margin-bottom: 8px;">Visit <strong>Barangay Upper Ichon Hall</strong> during office hours (8:00 AM - 5:00 PM)</li>
                    <li style="margin-bottom: 8px;">Bring all required documents listed above</li>
                    <li style="margin-bottom: 8px;">Present this email or your Request ID</li>
                    <li style="margin-bottom: 8px;">Pay the processing fee at the Barangay Treasurer's Office</li>
                    <li>Claim your certificate from the Barangay Secretary</li>
                  </ol>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  If you have any questions, please contact the Barangay Hall at:<br>
                  <strong>Province of Southern Leyte, Municipality of Macrohon, Barangay Upper Ichon</strong>
                </p>
              </div>

              <div style="background: #0F4C81; padding: 20px; text-align: center; color: white; font-size: 12px;">
                <p style="margin: 0;">© 2025 Barangay Upper Ichon. All rights reserved.</p>
              </div>
            </div>
          `;
        } else if (status === "rejected") {
          emailSubject = `Certificate Request Rejected - Request #${request.request_id}`;
          emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Certificate Request Rejected</h1>
              </div>
              
              <div style="padding: 30px; background-color: #f9f9f9;">
                <p>Dear <strong>${requesterName}</strong>,</p>
                
                <p>We regret to inform you that your certificate request has been rejected.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #dc2626; margin-top: 0;">Request Details:</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0;"><strong>Request ID:</strong></td>
                      <td style="padding: 8px 0;">#${request.request_id}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;"><strong>Certificate Type:</strong></td>
                      <td style="padding: 8px 0;">${
                        request.certificate_type
                      }</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;"><strong>Status:</strong></td>
                      <td style="padding: 8px 0;"><span style="background: #ef4444; color: white; padding: 4px 12px; border-radius: 12px;">Rejected</span></td>
                    </tr>
                  </table>
                </div>

                ${
                  rejection_reason
                    ? `
                <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
                  <h3 style="color: #991b1b; margin-top: 0;">Reason for Rejection:</h3>
                  <p style="color: #7f1d1d; margin: 0;">${rejection_reason}</p>
                </div>
                `
                    : ""
                }

                <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1e40af; margin-top: 0;">What to do next:</h3>
                  <ul style="color: #1e3a8a; margin: 10px 0;">
                    <li style="margin-bottom: 8px;">Review the rejection reason above</li>
                    <li style="margin-bottom: 8px;">Address the issues mentioned</li>
                    <li style="margin-bottom: 8px;">You may submit a new request once requirements are met</li>
                    <li>Visit the Barangay Hall for clarification if needed</li>
                  </ul>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  For concerns or clarifications, please visit:<br>
                  <strong>Barangay Upper Ichon Hall</strong><br>
                  Province of Southern Leyte, Municipality of Macrohon
                </p>
              </div>

              <div style="background: #0F4C81; padding: 20px; text-align: center; color: white; font-size: 12px;">
                <p style="margin: 0;">© 2025 Barangay Upper Ichon. All rights reserved.</p>
              </div>
            </div>
          `;
        }

        if (emailSubject && emailContent) {
          await sendEmailNotification(
            requesterEmail,
            emailSubject,
            emailContent
          );
        }
      }

      return res.json({
        success: true,
        message: `Request ${status} successfully${
          requesterEmail ? " and email sent" : ""
        }`,
      });
    } catch (err) {
      console.error("[PUT /requests/:id/status] Error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  });
  return router;
};
