// CertificateRequests.jsx
// viewing ni sa secretary ug sa barangay captain

import React, { useEffect, useState, useCallback } from "react";
import {
  Eye,
  Check,
  X,
  FileText,
  Search,
  Clock,
  Plus,
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Database,
} from "lucide-react";
import { requestsAPI } from "../services/api";
import CertificateRequestFlow from "../components/CertificateRequestFlow";
import NotificationSystem from "../components/NotificationSystem";

const CertificateRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isVisible, setIsVisible] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [showRequestFlow, setShowRequestFlow] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // ─── Notification helpers ────────────────────────────────────────
  const handleRemoveNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addSuccessNotification = (title, message = null) => {
    const notifId = Date.now();
    setNotifications((prev) => [
      ...prev,
      { id: notifId, type: "success", title, message, autoDismiss: true },
    ]);
  };

  const addErrorNotification = (title, message = null) => {
    const notifId = Date.now();
    setNotifications((prev) => [
      ...prev,
      { id: notifId, type: "error", title, message, autoDismiss: false },
    ]);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestsAPI.list();
      const list = res.requests || res.data || res || [];

      const normalized = (Array.isArray(list) ? list : []).map((r) => ({
        ...r,
        status: r.status ? String(r.status).trim().toLowerCase() : "pending",
      }));

      setRequests(normalized);
    } catch (err) {
      console.error("Load error:", err);
      setError("Failed to load requests");
      addErrorNotification("Failed to Load", "Could not fetch certificate requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    const onCreated = () => loadRequests();
    window.addEventListener("requests:created", onCreated);
    return () => window.removeEventListener("requests:created", onCreated);
  }, []);

  const handleApprove = (r) => {
    setSelectedRequest(r);
    setShowApproveModal(true);
  };

  const handleReject = (r) => {
    setSelectedRequest(r);
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;
    try {
      const updated = await requestsAPI.updateStatus(selectedRequest.id, {
        status: "processing",
        reschedule_date: rescheduleDate || null,
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id ? { ...r, ...updated, status: "processing" } : r
        )
      );

      setShowApproveModal(false);
      setRescheduleDate("");
      addSuccessNotification(
        "Request Approved Successfully! ✅",
        `Certificate request for ${selectedRequest.requester_name} is now in processing${
          rescheduleDate ? `, scheduled for ${rescheduleDate}` : ""
        }`
      );
    } catch (err) {
      addErrorNotification("Approval Failed ❌", err.message || "Failed to approve the request");
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      addErrorNotification("Validation Error ❌", "Please enter a rejection reason");
      return;
    }
    try {
      const updated = await requestsAPI.updateStatus(selectedRequest.id, {
        status: "rejected",
        rejection_reason: rejectionReason,
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id ? { ...r, ...updated, status: "rejected" } : r
        )
      );

      setShowRejectModal(false);
      setRejectionReason("");
      addSuccessNotification(
        "Request Rejected Successfully! ❌",
        `Certificate request for ${selectedRequest.requester_name} has been rejected`
      );
    } catch (err) {
      addErrorNotification("Rejection Failed ❌", err.message || "Failed to reject the request");
    }
  };

  const viewDetails = (r) => {
    setSelectedRequest(r);
    setShowViewModal(true);
  };

  const handleRefresh = () => {
    loadRequests();
    addSuccessNotification("Refreshed Successfully! 🔄", "Certificate requests list updated");
  };

  const handleNewRequest = () => {
    setShowRequestFlow(true);
    addSuccessNotification("New Request Started! ➕", "Complete the form to submit a new request");
  };

  // ─── Simple print preview ────────────────────────────────────────
  const handlePrint = useCallback((request) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked. Please allow popups for this site.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate Request - ${request.id}</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; }
            .info-row { margin: 12px 0; }
            .label { font-weight: bold; display: inline-block; width: 160px; }
            hr { margin: 30px 0; border: 0; border-top: 1px solid #ccc; }
            .footer { text-align: center; margin-top: 80px; font-style: italic; color: #555; }
            .no-print { margin-top: 40px; text-align: center; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Barangay Certificate Request</h1>
            <p>Request #${request.id} • ${request.certificate_type || "Certificate"}</p>
          </div>
          <div class="info">
            <div class="info-row"><span class="label">Requester:</span> ${request.requester_name || "—"}</div>
            <div class="info-row"><span class="label">Type:</span> ${request.certificate_type || "—"}</div>
            <div class="info-row"><span class="label">Purpose:</span> ${request.purpose || "—"}</div>
            ${
              request.reschedule_date
                ? `<div class="info-row"><span class="label">Scheduled:</span> ${new Date(
                    request.reschedule_date
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</div>`
                : ""
            }
            <div class="info-row"><span class="label">Status:</span> ${request.status.toUpperCase()}</div>
            ${request.address ? `<div class="info-row"><span class="label">Address:</span> ${request.address}</div>` : ""}
          </div>
          <hr />
          <div class="footer">
            This document is a system-generated preview.<br />
            Official printed certificate will be issued upon pickup.
          </div>
          <div class="no-print">
            <button onclick="window.print()" style="padding:10px 24px; font-size:16px; margin-right:16px; cursor:pointer;">Print</button>
            <button onclick="window.close()" style="padding:10px 24px; font-size:16px; cursor:pointer;">Close</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, []);

  const filteredRequests = requests.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      String(r.id).includes(term) ||
      (r.certificate_type || "").toLowerCase().includes(term) ||
      (r.requester_name || "").toLowerCase().includes(term)
    ) && (statusFilter === "all" || r.status === statusFilter);
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    processing: requests.filter((r) => r.status === "processing").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const getStatusInfo = (status) => {
    const s = (status || "").toLowerCase().trim();
    if (s === "processing" || s.includes("approve")) {
      return { label: "Approved", color: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" };
    }
    if (s === "pending") {
      return { label: "Pending", color: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" };
    }
    if (s === "rejected") {
      return { label: "Rejected", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" };
    }
    return { label: "Unknown", color: "bg-gray-50 text-gray-700 border-gray-200", dot: "bg-gray-500" };
  };

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] p-6 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadRequests} className="px-6 py-3 bg-[#0F4C81] text-white rounded-2xl">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] relative overflow-hidden">
      {/* Floating background dots */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">

          {/* Hero */}
          <section className="mb-8 sm:mb-12">
            <div className="bg-gradient-to-br from-[#0F4C81] via-[#58A1D3] to-[#B3DEF8] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="w-7 h-7 text-yellow-300" />
                  </div>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-1 drop-shadow-lg">Certificate Requests</h2>
                    <p className="text-cyan-100">Review and manage all certificate requests</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total", value: stats.total, icon: FileText, color: "from-[#0F4C81] to-[#58A1D3]" },
              { label: "Pending", value: stats.pending, icon: Clock, color: "from-yellow-500 to-amber-500" },
              { label: "Approved", value: stats.processing, icon: CheckCircle, color: "from-green-500 to-emerald-500" },
              { label: "Rejected", value: stats.rejected, icon: AlertCircle, color: "from-red-500 to-pink-500" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-[#0F4C81]">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="text-white w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search + filter bar */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center bg-white/70 rounded-2xl px-4 py-3 border">
                  <Search className="text-gray-500 mr-3" size={16} />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/70 rounded-2xl border text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button onClick={handleRefresh} className="px-4 py-3 bg-white/70 rounded-2xl border hover:bg-white/80">
                  <RefreshCw size={18} />
                </button>
                <button
                  onClick={handleNewRequest}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-2xl font-medium"
                >
                  <Plus size={18} />
                  New Request
                </button>
              </div>
            </div>
          </div>

          {/* ─── Aligned Desktop Table ──────────────────────────────────────────────── */}
          <div className="hidden lg:block bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] sticky top-0 z-20">
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <th className="w-[18%] px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      REQUEST
                    </th>
                    <th className="w-[24%] px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      REQUESTER
                    </th>
                    <th className="w-[20%] px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      TYPE
                    </th>
                    <th className="w-[14%] px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      DATE
                    </th>
                    <th className="w-[14%] px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="w-[10%] min-w-[100px] px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            <div className="overflow-y-auto custom-scroll" style={{ maxHeight: "600px" }}>
              <table className="w-full table-fixed">
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-16">Loading...</td></tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-16 text-gray-500">No requests found</td></tr>
                  ) : (
                    filteredRequests.map((r) => {
                      const statusInfo = getStatusInfo(r.status);
                      return (
                        <tr key={r.id} className="hover:bg-blue-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FileText size={16} className="text-white" />
                              </div>
                              <div>
                                <div className="font-bold text-[#0F4C81]">REQ-{r.id}</div>
                                <div className="text-xs text-gray-500">Request #</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium truncate max-w-[220px]">{r.requester_name}</div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                r.requester_type === "resident" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {r.requester_type === "resident" ? "Resident" : "Non-Resident"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium inline-block max-w-full truncate">
                              {r.certificate_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {new Date(r.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
                            >
                              <div className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></div>
                              {statusInfo.label}
                            </span>
                            {r.status === "rejected" && r.rejection_reason && (
                              <div className="text-xs text-gray-500 mt-1 truncate max-w-[180px]">
                                Reason: {r.rejection_reason}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => viewDetails(r)}
                                className="p-2 rounded-xl bg-blue-500 text-white hover:scale-110 transition"
                                title="View details"
                              >
                                <Eye size={16} />
                              </button>

                              {r.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleApprove(r)}
                                    className="p-2 rounded-xl bg-emerald-500 text-white hover:scale-110 transition"
                                    title="Approve request"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleReject(r)}
                                    className="p-2 rounded-xl bg-red-500 text-white hover:scale-110 transition"
                                    title="Reject request"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              )}

                              {r.status === "processing" && (
                                <button
                                  onClick={() => handlePrint(r)}
                                  className="p-2 rounded-xl bg-indigo-600 text-white hover:scale-110 transition"
                                  title="Print certificate"
                                >
                                  <Download size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─── Mobile card view (unchanged from your original) ─── */}
          <div className="lg:hidden space-y-4">
            {loading ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 text-center">Loading...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 text-center text-gray-500">
                No requests
              </div>
            ) : (
              filteredRequests.map((r) => {
                const statusInfo = getStatusInfo(r.status);
                return (
                  <div key={r.id} className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-[#0F4C81]">REQ-{r.id}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(r.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></div>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Requester</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{r.requester_name}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              r.requester_type === "resident" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {r.requester_type === "resident" ? "Resident" : "Non-Resident"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Certificate Type</div>
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {r.certificate_type}
                        </span>
                      </div>
                      {r.status === "rejected" && r.rejection_reason && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Rejection Reason</div>
                          <div className="text-sm text-gray-700">{r.rejection_reason}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <button
                        onClick={() => viewDetails(r)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium active:scale-95 transition"
                      >
                        <Eye size={16} />
                        View
                      </button>

                      {r.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(r)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium active:scale-95 transition"
                          >
                            <Check size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(r)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium active:scale-95 transition"
                          >
                            <X size={16} />
                            Reject
                          </button>
                        </>
                      )}

                      {r.status === "processing" && (
                        <button
                          onClick={() => handlePrint(r)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium active:scale-95 transition"
                        >
                          <Download size={16} />
                          Print
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>

      {/* Notifications */}
      <NotificationSystem notifications={notifications} onRemove={handleRemoveNotification} />

      {/* ─── Approve Modal ─── */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg sm:text-xl font-bold text-emerald-600 mb-3 sm:mb-4">Approve Request</h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base">
              Approve for <strong>{selectedRequest?.requester_name}</strong>?
            </p>
            <input
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full border rounded-xl px-3 sm:px-4 py-2 mb-3 sm:mb-4 text-sm"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-2.5 sm:py-3 border rounded-xl text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                className="flex-1 py-2.5 sm:py-3 bg-emerald-500 text-white rounded-xl text-sm sm:text-base"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reject Modal ─── */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg sm:text-xl font-bold text-red-600 mb-3 sm:mb-4">Reject Request</h3>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base">
              Reject for <strong>{selectedRequest?.requester_name}</strong>?
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border rounded-xl px-3 sm:px-4 py-2 mb-3 sm:mb-4 text-sm"
              rows="3"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 sm:py-3 border rounded-xl text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 py-2.5 sm:py-3 bg-red-500 text-white rounded-xl text-sm sm:text-base"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Details Modal ─── */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0F4C81]">Request Details</h2>
                  <p className="text-sm text-gray-600">REQ-{selectedRequest.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-2xl transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status banner */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8 border-l-4 border-blue-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Status</span>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusInfo(selectedRequest.status).color}`}
                    >
                      <div className={`w-3 h-3 rounded-full ${getStatusInfo(selectedRequest.status).dot}`}></div>
                      {getStatusInfo(selectedRequest.status).label}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">Created</span>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedRequest.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* ... rest of your view modal content ... */}
            {/* You can paste the full view modal content from your previous version here */}
            {/* For brevity it's not repeated in this message, but keep your existing detailed view modal code */}

            {/* Action buttons at bottom */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-3xl p-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-2xl text-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
              >
                <X className="w-5 h-5" />
                Close
              </button>

              {selectedRequest.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleApprove(selectedRequest);
                    }}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl text-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Request
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleReject(selectedRequest);
                    }}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl text-lg font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <X className="w-5 h-5" />
                    Reject Request
                  </button>
                </>
              )}

              {selectedRequest.status === "processing" && (
                <button
                  onClick={() => handlePrint(selectedRequest)}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-2xl text-lg font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Print Certificate
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New request flow */}
      <CertificateRequestFlow isOpen={showRequestFlow} onClose={() => setShowRequestFlow(false)} />

      {/* Floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(5px) rotate(240deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default CertificateRequests;