import React, { useEffect, useState, useCallback } from "react";
import {
  Eye,
  Check,
  X,
  FileText,
  Search,
  Filter,
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
  const [hoveredCard, setHoveredCard] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [showRequestFlow, setShowRequestFlow] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Notification management
  const handleRemoveNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addSuccessNotification = (title, message = null) => {
    const notifId = Date.now();
    setNotifications((prev) => [
      ...prev,
      {
        id: notifId,
        type: "success",
        title,
        message,
        autoDismiss: true,
      },
    ]);
  };

  const addErrorNotification = (title, message = null) => {
    const notifId = Date.now();
    setNotifications((prev) => [
      ...prev,
      {
        id: notifId,
        type: "error",
        title,
        message,
        autoDismiss: false,
      },
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
      addErrorNotification(
        "Failed to Load",
        "Could not fetch certificate requests"
      );
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
          r.id === selectedRequest.id
            ? { ...r, ...updated, status: "processing" }
            : r
        )
      );

      setShowApproveModal(false);
      setRescheduleDate("");

      addSuccessNotification(
        "Request Approved Successfully! ✅",
        `Certificate request for ${
          selectedRequest.requester_name
        } is now in processing${
          rescheduleDate ? `, scheduled for ${rescheduleDate}` : ""
        }`
      );
    } catch (err) {
      addErrorNotification(
        "Approval Failed ❌",
        err.message || "Failed to approve the certificate request"
      );
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      addErrorNotification(
        "Validation Error ❌",
        "Please enter a rejection reason"
      );
      return;
    }
    try {
      const updated = await requestsAPI.updateStatus(selectedRequest.id, {
        status: "rejected",
        rejection_reason: rejectionReason,
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, ...updated, status: "rejected" }
            : r
        )
      );

      setShowRejectModal(false);
      setRejectionReason("");

      addSuccessNotification(
        "Request Rejected Successfully! ❌",
        `Certificate request for ${selectedRequest.requester_name} has been rejected`
      );
    } catch (err) {
      addErrorNotification(
        "Rejection Failed ❌",
        err.message || "Failed to reject the certificate request"
      );
    }
  };

  const viewDetails = (r) => {
    setSelectedRequest(r);
    setShowViewModal(true);
  };

  const handleRefresh = () => {
    loadRequests();
    addSuccessNotification(
      "Refreshed Successfully! 🔄",
      "Certificate requests list updated"
    );
  };

  const handleNewRequest = () => {
    setShowRequestFlow(true);
    addSuccessNotification(
      "New Request Started! ➕",
      "Complete the form to submit a new certificate request"
    );
  };

  const filteredRequests = requests.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      String(r.id).includes(term) ||
      (r.certificate_type || "").toLowerCase().includes(term) ||
      (r.requester_name || "").toLowerCase().includes(term);
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    processing: requests.filter((r) => r.status === "processing").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const getStatusInfo = (status) => {
    const s = (status || "").toString().trim().toLowerCase();

    if (s.includes("approve") || s === "processing") {
      return {
        label: "Approved",
        color: "bg-green-50 text-green-700 border-green-200",
        dot: "bg-green-500",
      };
    }
    if (s.includes("pend") || s === "pending") {
      return {
        label: "Pending",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        dot: "bg-yellow-500",
      };
    }
    if (s.includes("reject") || s === "rejected") {
      return {
        label: "Rejected",
        color: "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-500",
      };
    }
    return {
      label: "Unknown",
      color: "bg-gray-50 text-gray-700 border-gray-200",
      dot: "bg-gray-500",
    };
  };

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] p-4 sm:p-6 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadRequests}
            className="px-6 py-3 bg-[#0F4C81] text-white rounded-2xl"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] relative overflow-hidden">
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
            <div className="bg-gradient-to-br from-[#0F4C81] via-[#58A1D3] to-[#B3DEF8] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <svg
                  className="absolute bottom-0 w-full h-full"
                  viewBox="0 0 1200 400"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,200 C300,250 600,150 900,200 C1050,220 1150,180 1200,200 L1200,400 L0,400 Z"
                    fill="currentColor"
                    className="text-white animate-pulse"
                  />
                </svg>
              </div>
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-300" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                      <span className="text-cyan-200 text-xs sm:text-sm font-medium tracking-widest">
                        CERTIFICATE MANAGEMENT
                      </span>
                      <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-bold mb-1 drop-shadow-lg">
                      Certificate Requests
                    </h2>
                    <p className="text-sm sm:text-base text-cyan-100">
                      Review and manage all certificate requests
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-black text-xs sm:text-sm font-semibold drop-shadow-lg">
                    Scroll to explore
                  </span>
                  <div className="w-7 h-10 sm:w-8 sm:h-12 border-4 border-black rounded-full flex justify-center bg-white/90 shadow-lg animate-pulse">
                    <div className="w-1.5 h-3 sm:w-2 sm:h-4 bg-black rounded-full mt-1.5 sm:mt-2 animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            {[
              {
                label: "Total",
                value: stats.total,
                icon: FileText,
                color: "from-[#0F4C81] to-[#58A1D3]",
              },
              {
                label: "Pending",
                value: stats.pending,
                icon: Clock,
                color: "from-yellow-500 to-amber-500",
              },
              {
                label: "Approved",
                value: stats.processing,
                icon: CheckCircle,
                color: "from-green-500 to-emerald-500",
              },
              {
                label: "Rejected",
                value: stats.rejected,
                icon: AlertCircle,
                color: "from-red-500 to-pink-500",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {stat.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0F4C81]">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.color}`}
                  >
                    <stat.icon className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="flex-1">
                <div className="flex items-center bg-white/70 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border">
                  <Search
                    className="text-gray-500 mr-2 sm:mr-3 flex-shrink-0"
                    size={16}
                  />
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
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 bg-white/70 rounded-xl sm:rounded-2xl border text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  onClick={handleRefresh}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-white/70 rounded-xl sm:rounded-2xl border hover:bg-white/80 transition-all duration-300"
                  title="Refresh requests"
                >
                  <RefreshCw size={18} className="animate-spin" />
                </button>
                <button
                  onClick={handleNewRequest}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 font-medium text-sm"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">New Request</span>
                  <span className="sm:hidden">New</span>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] sticky top-0 z-20">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      REQUEST
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      REQUESTER
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      TYPE
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      DATE
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div
              className="overflow-y-auto custom-scroll"
              style={{ maxHeight: "600px" }}
            >
              <table className="w-full">
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-16 text-gray-500"
                      >
                        No requests
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((r) => {
                      const statusInfo = getStatusInfo(r.status);
                      return (
                        <tr key={r.id} className="border-b hover:bg-blue-50/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                <FileText size={16} className="text-white" />
                              </div>
                              <div>
                                <div className="font-bold text-[#0F4C81]">
                                  REQ-{r.id}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Request #
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium">
                              {r.requester_name}
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                r.requester_type === "resident"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {r.requester_type === "resident"
                                ? "Resident"
                                : "Non-Resident"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                              {r.certificate_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {new Date(r.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${statusInfo.dot}`}
                              ></div>
                              {statusInfo.label}
                            </span>
                            {r.status === "rejected" && r.rejection_reason && (
                              <div className="text-xs text-gray-500 mt-1">
                                Reason: {r.rejection_reason}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
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

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {loading ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 text-center">
                Loading...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 text-center text-gray-500">
                No requests
              </div>
            ) : (
              filteredRequests.map((r) => {
                const statusInfo = getStatusInfo(r.status);
                return (
                  <div
                    key={r.id}
                    className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-[#0F4C81]">
                            REQ-{r.id}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(r.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}
                        ></div>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          Requester
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            {r.requester_name}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              r.requester_type === "resident"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {r.requester_type === "resident"
                              ? "Resident"
                              : "Non-Resident"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          Certificate Type
                        </div>
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {r.certificate_type}
                        </span>
                      </div>
                      {r.status === "rejected" && r.rejection_reason && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Rejection Reason
                          </div>
                          <div className="text-sm text-gray-700">
                            {r.rejection_reason}
                          </div>
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
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ✅ NOTIFICATION SYSTEM */}
      <NotificationSystem
        notifications={notifications}
        onRemove={handleRemoveNotification}
      />

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg sm:text-xl font-bold text-emerald-600 mb-3 sm:mb-4">
              Approve Request
            </h3>
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg sm:text-xl font-bold text-red-600 mb-3 sm:mb-4">
              Reject Request
            </h3>
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

      {/* ✅ COMPLETE VIEW DETAILS MODAL */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-6xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0F4C81] flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <FileText size={20} className="text-white" />
                </div>
                Request Details - REQ-{selectedRequest.id}
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Request ID & Status Banner */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 sm:p-6 border border-blue-200 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <div className="text-xs text-gray-500 mb-1">Request ID</div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#0F4C81]">
                    REQ-{selectedRequest.id}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="text-xs text-gray-500 mb-1 text-right sm:text-left">
                    Status
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                      getStatusInfo(selectedRequest.status).color
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        getStatusInfo(selectedRequest.status).dot
                      }`}
                    ></div>
                    {getStatusInfo(selectedRequest.status).label}
                  </span>
                </div>
              </div>
              {selectedRequest.status === "rejected" &&
                selectedRequest.rejection_reason && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-sm font-medium text-red-800">
                      <AlertCircle size={16} />
                      <span>Rejection Reason:</span>
                    </div>
                    <p className="mt-2 text-sm text-red-700 bg-red-100/50 p-3 rounded-lg border-l-4 border-red-400">
                      {selectedRequest.rejection_reason}
                    </p>
                  </div>
                )}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Requester Information */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
                  <h4 className="font-bold text-[#0F4C81] mb-4 flex items-center gap-2 text-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Requester Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Full Name
                      </div>
                      <div className="font-semibold text-gray-900 text-lg">
                        {selectedRequest.requester_name || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Type
                      </div>
                      <span
                        className={`inline-block text-xs px-3 py-1.5 rounded-full font-semibold ${
                          selectedRequest.requester_type === "resident"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {selectedRequest.requester_type === "resident"
                          ? "🏠 Registered Resident"
                          : "👤 Non-Resident"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-blue-200">
                    {selectedRequest.contact_number && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Contact Number
                        </div>
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          <Phone size={16} className="text-blue-500" />
                          {selectedRequest.contact_number}
                        </div>
                      </div>
                    )}
                    {selectedRequest.email && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Email Address
                        </div>
                        <div className="font-semibold text-gray-900 flex items-center gap-2 break-all">
                          <Mail size={16} className="text-blue-500" />
                          {selectedRequest.email}
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedRequest.address && (
                    <div className="mt-6 pt-6 border-t border-blue-200">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Address
                      </div>
                      <div className="font-semibold text-gray-900 bg-white rounded-xl p-4 border border-gray-200">
                        {selectedRequest.address}
                      </div>
                    </div>
                  )}
                </div>

                {/* Certificate Information */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                  <h4 className="font-bold text-purple-800 mb-4 flex items-center gap-2 text-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    Certificate Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Certificate Type
                      </div>
                      <div className="inline-flex items-center gap-3 p-4 bg-white rounded-xl border border-purple-200">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-lg">
                            {selectedRequest.certificate_type || "N/A"}
                          </div>
                          <div className="text-sm text-purple-600">
                            Certificate Request
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedRequest.purpose && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Purpose of Request
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {selectedRequest.purpose}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Request Timeline */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                  <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2 text-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Request Timeline
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border-l-4 border-green-400">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Clock size={16} className="text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            Request Submitted
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(
                              selectedRequest.created_at
                            ).toLocaleString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                        START
                      </div>
                    </div>

                    {selectedRequest.updated_at &&
                      selectedRequest.updated_at !==
                        selectedRequest.created_at && (
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border-l-4 border-blue-400">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <RefreshCw
                                size={16}
                                className="text-blue-600 animate-spin"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                Last Updated
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(
                                  selectedRequest.updated_at
                                ).toLocaleString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                            UPDATED
                          </div>
                        </div>
                      )}

                    {selectedRequest.reschedule_date && (
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border-l-4 border-yellow-400">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Calendar size={16} className="text-yellow-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              Scheduled For
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(
                                selectedRequest.reschedule_date
                              ).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-medium text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                          SCHEDULED
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* System Information */}
                {selectedRequest.resident_id && (
                  <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-6">
                    <h4 className="font-bold text-indigo-800 mb-4 flex items-center gap-2 text-lg">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                      System Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Resident ID
                        </div>
                        <div className="font-mono bg-white rounded-lg p-2 border border-indigo-200 text-indigo-900">
                          {selectedRequest.resident_id}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Request Type
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-indigo-200 text-sm font-medium text-indigo-800">
                          <Database size={14} />
                          Database Verified
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-2xl p-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 py-3 px-6 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <X size={18} />
                Close Details
              </button>
              {selectedRequest.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleApprove(selectedRequest);
                    }}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve Request
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleReject(selectedRequest);
                    }}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    Reject Request
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Certificate Request Flow */}
      <CertificateRequestFlow
        isOpen={showRequestFlow}
        onClose={() => setShowRequestFlow(false)}
      />

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(120deg);
          }
          66% {
            transform: translateY(5px) rotate(240deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CertificateRequests;
