import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  X,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  complaintsAPI,
  residentsAPI,
  complaintCategoriesAPI,
} from "../services/api";
import NotificationSystem from "../components/NotificationSystem";

// ──────────────────────────────────────────────────────────────────────────────
// Modal Component
// ──────────────────────────────────────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="modal-backdrop bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn fixed inset-0 z-[99998]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/20 border border-white/20 relative z-[99999]">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                {title}
              </h3>
              {subtitle && (
                <p className="text-cyan-100 mt-1 text-sm">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300 group"
            >
              <X
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );

  const modalRoot = document.getElementById("modal-root") || document.body;
  return createPortal(modalContent, modalRoot);
};

// ──────────────────────────────────────────────────────────────────────────────
// Desktop Table Row
// ──────────────────────────────────────────────────────────────────────────────
const TableRow = ({ data, onView, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "filed":
        return "bg-red-50 text-red-700 border-red-200";
      case "under_investigation":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "for_hearing":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "resolved":
        return "bg-green-50 text-green-700 border-green-200";
      case "dismissed":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatStatus = (s) =>
    s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";

  return (
    <tr className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300 border-b border-gray-100 group">
      <td className="px-4 py-3">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-2.5 mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Calendar size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
              {data.complaint_number || `COMP-${data.complaint_id}`}
            </div>
            <div className="text-xs text-gray-500">Complaint #</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-semibold text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
          {data.complainant_name || "N/A"}
        </div>
        <div className="text-xs text-gray-500">Complainant</div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
          {data.category_name || "N/A"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
          {formatDate(data.created_at)}
        </div>
        <div className="text-xs text-gray-500">Date Filed</div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            data.status
          )} shadow-sm`}
        >
          <div className="w-2 h-2 rounded-full bg-current mr-2 opacity-70"></div>
          {formatStatus(data.status)}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex space-x-1">
          <button
            onClick={() => onView(data)}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 group/btn transform hover:scale-105"
            title="View Details"
          >
            <Eye
              size={16}
              className="group-hover/btn:scale-110 transition-transform duration-300"
            />
          </button>
          <button
            onClick={() => onEdit(data)}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 group/btn transform hover:scale-105"
            title="Edit Complaint"
          >
            <Edit
              size={16}
              className="group-hover/btn:scale-110 transition-transform duration-300"
            />
          </button>
          <button
            onClick={() => onDelete(data.complaint_id)}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 group/btn transform hover:scale-105"
            title="Delete Complaint"
          >
            <Trash2
              size={16}
              className="group-hover/btn:scale-110 transition-transform duration-300"
            />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────
const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // null | 'add' | 'edit' | 'view'
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [residents, setResidents] = useState([]);
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showResidentDropdown, setShowResidentDropdown] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Form state
  const initialForm = {
    complainant_type: "resident",
    resident_id: "",
    non_resident_name: "",
    non_resident_address: "",
    non_resident_contact: "",
    respondent_name: "",
    respondent_address: "",
    respondent_contact: "",
    category_id: "",
    incident_date: "",
    incident_time: "",
    incident_location: "",
    description: "",
    status: "filed",
  };
  const [form, setForm] = useState(initialForm);
  const [residentSearch, setResidentSearch] = useState("");
  const dropdownRef = useRef(null);

  // Notification helpers
  const handleRemoveNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };
  const addSuccessNotification = (title, message = null) => {
    const id = Date.now();
    setNotifications((prev) => [
      ...prev,
      { id, type: "success", title, message, autoDismiss: true },
    ]);
  };
  const addErrorNotification = (title, message = null) => {
    const id = Date.now();
    setNotifications((prev) => [
      ...prev,
      { id, type: "error", title, message, autoDismiss: false },
    ]);
  };
  const addDeleteConfirmation = (complaintId) => {
    const id = Date.now();
    setNotifications((prev) => [
      ...prev,
      {
        id,
        type: "warning",
        title: "Confirm Delete",
        message:
          "Are you sure you want to delete this complaint record? This action cannot be undone.",
        autoDismiss: false,
        complaintId,
        action: (
          <div className="flex space-x-3 mt-4">
            <button
              onClick={() => handleRemoveNotification(id)}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                handleRemoveNotification(id);
                await performDelete(complaintId);
              }}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        ),
      },
    ]);
  };
  const performDelete = async (id) => {
    try {
      await complaintsAPI.delete(id);
      fetchComplaints();
      addSuccessNotification(
        "Complaint Deleted",
        "The complaint record has been removed successfully."
      );
    } catch (err) {
      console.error("Delete failed:", err);
      addErrorNotification(
        "Delete Failed",
        "Could not delete the complaint record."
      );
    }
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ──────────────────────────────────────────────────────────────────────────────
  const fetchComplaints = async () => {
    try {
      const res = await complaintsAPI.getAll();
      setComplaints(res.data || []);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch complaints:", e);
      setError("Failed to load complaints");
      addErrorNotification(
        "Failed to Load",
        "Could not fetch complaint records."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const [resRes, resCat] = await Promise.all([
        residentsAPI.getAll(),
        complaintCategoriesAPI.getAll(),
      ]);
      setResidents(resRes.data || []);
      setCategories(resCat.data || []);
    } catch (e) {
      console.error("Failed to fetch dropdown data:", e);
      addErrorNotification("Failed to Load", "Could not fetch form data.");
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchFormData();
  }, []);

  // Complainant type switch
  useEffect(() => {
    if (form.complainant_type === "resident") {
      setForm((p) => ({
        ...p,
        non_resident_name: "",
        non_resident_address: "",
        non_resident_contact: "",
      }));
      setResidentSearch("");
    } else {
      setForm((p) => ({ ...p, resident_id: "" }));
      setResidentSearch("");
    }
  }, [form.complainant_type]);

  // Resident search filter
  useEffect(() => {
    if (!residentSearch.trim()) {
      setFilteredResidents(residents.slice(0, 5));
    } else {
      const filtered = residents
        .filter((r) =>
          `${r.first_name} ${r.last_name} ${r.middle_name || ""}`
            .toLowerCase()
            .includes(residentSearch.toLowerCase())
        )
        .slice(0, 5);
      setFilteredResidents(filtered);
    }
  }, [residentSearch, residents]);

  // Click-outside for dropdown
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowResidentDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Form handlers
  const handleChange = (e) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };
  const handleResidentSelect = (resident) => {
    if (isReadOnly) return;
    setForm((p) => ({ ...p, resident_id: resident.resident_id }));
    setResidentSearch(
      `${resident.first_name} ${resident.middle_name || ""} ${
        resident.last_name
      }`.trim()
    );
    setShowResidentDropdown(false);
  };
  const populateForm = (data) => {
    setForm({
      complainant_type: data.complainant_type || "resident",
      resident_id: data.resident_id || "",
      non_resident_name: data.non_resident_name || "",
      non_resident_address: data.non_resident_address || "",
      non_resident_contact: data.non_resident_contact || "",
      respondent_name: data.respondent_name || "",
      respondent_address: data.respondent_address || "",
      respondent_contact: data.respondent_contact || "",
      category_id: data.category_id || "",
      incident_date: data.incident_date ? data.incident_date.split("T")[0] : "",
      incident_time: data.incident_time || "",
      incident_location: data.incident_location || "",
      description: data.description || "",
      status: data.status || "filed",
    });

    if (data.complainant_type === "resident" && data.resident_id) {
      const r = residents.find((r) => r.resident_id == data.resident_id);
      setResidentSearch(
        r
          ? `${r.first_name} ${r.middle_name || ""} ${r.last_name}`.trim()
          : data.complainant_name || ""
      );
    } else {
      setResidentSearch(data.non_resident_name || "");
    }
  };

  // Modal handlers
  const handleAdd = () => {
    setForm(initialForm);
    setIsReadOnly(false);
    setModalType("add");
    setSelectedComplaint(null);
    setResidentSearch("");
  };
  const handleView = (c) => {
    populateForm(c);
    setIsReadOnly(true);
    setModalType("view");
    setSelectedComplaint(c);
  };
  const handleEdit = (c) => {
    populateForm(c);
    setIsReadOnly(false);
    setModalType("edit");
    setSelectedComplaint(c);
  };
  const handleDelete = (id) => addDeleteConfirmation(id);
  const handleClose = () => {
    setModalType(null);
    setForm(initialForm);
    setResidentSearch("");
    setShowResidentDropdown(false);
    setSelectedComplaint(null);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    try {
      setError(null);
      let msg;
      if (modalType === "edit") {
        await complaintsAPI.update(selectedComplaint.complaint_id, form);
        msg = "Complaint updated successfully.";
      } else {
        await complaintsAPI.create(form);
        msg = "New complaint created successfully.";
      }
      handleClose();
      fetchComplaints();
      addSuccessNotification(
        modalType === "edit" ? "Complaint Updated" : "Complaint Saved",
        msg
      );
    } catch (err) {
      console.error(`Failed to ${modalType} complaint:`, err);
      const msg =
        err.response?.data?.message || `Failed to ${modalType} complaint`;
      setError(msg);
      addErrorNotification(
        modalType === "edit" ? "Update Failed" : "Save Failed",
        msg
      );
    }
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // FILTERING
  // ──────────────────────────────────────────────────────────────────────────────
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.complaint_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complainant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.respondent_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: complaints.length,
    filed: complaints.filter((c) => c.status === "filed").length,
    investigation: complaints.filter((c) => c.status === "under_investigation")
      .length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  // Helpers
  const getStatusColor = (status) => {
    switch (status) {
      case "filed":
        return "bg-red-50 text-red-700 border-red-200";
      case "under_investigation":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "for_hearing":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "resolved":
        return "bg-green-50 text-green-700 border-green-200";
      case "dismissed":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  const formatStatus = (s) =>
    s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";

  // Render error
  if (error && !modalType) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchComplaints}
            className="mt-2 text-blue-600 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const modalTitle =
    modalType === "view"
      ? "View Complaint Details"
      : modalType === "edit"
      ? "Edit Complaint"
      : "Record New Complaint";
  const modalSubtitle =
    modalType === "view"
      ? "Review the complaint details below"
      : modalType === "edit"
      ? "Update the complaint information"
      : "Fill in the details below to register a new complaint";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] relative overflow-hidden">
      {/* Floating background */}
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

      <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {/* ────────────────────── HERO SECTION (MOUSE CENTERED) ────────────────────── */}
          <section className="relative mb-12">
            <div className="bg-gradient-to-br from-[#0F4C81] via-[#58A1D3] to-[#B3DEF8] rounded-3xl p-8 text-white relative overflow-hidden">
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

              <div
                className={`relative transition-all duration-1000 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText size={32} className="text-yellow-300" />
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                        <span className="text-cyan-200 text-xs sm:text-sm font-medium tracking-widest">
                          COMPLAINT RECORDS
                        </span>
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                      </div>

                      <h2 className="text-2xl sm:text-4xl font-bold mb-1 drop-shadow-lg">
                        Complaint Management
                      </h2>

                      <p className="text-cyan-100 text-sm sm:text-base">
                        Review and manage all recorded complaints in the system
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
            </div>
          </section>

          {/* Overview Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-[#0F4C81] rounded-full animate-pulse"></div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] bg-clip-text text-transparent">
                Complaint Overview
              </h2>
              <div className="w-2 h-2 bg-[#58A1D3] rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Monitor and manage all complaint records with real-time statistics
              and case management tools
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div
              className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-500 border border-white/20 cursor-pointer ${
                hoveredCard === "total"
                  ? "transform scale-105 shadow-2xl shadow-blue-500/20 bg-white/95"
                  : "hover:shadow-xl hover:shadow-blue-500/10"
              }`}
              onMouseEnter={() => setHoveredCard("total")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Total Complaints
                    </p>
                    <p className="text-3xl font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
                      {stats.total}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FileText className="text-white" size={28} />
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-500 border border-white/20 cursor-pointer ${
                hoveredCard === "filed"
                  ? "transform scale-105 shadow-2xl shadow-red-500/20 bg-white/95"
                  : "hover:shadow-xl hover:shadow-red-500/10"
              }`}
              onMouseEnter={() => setHoveredCard("filed")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Newly Filed</p>
                    <p className="text-3xl font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
                      {stats.filed}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="text-white" size={28} />
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-500 border border-white/20 cursor-pointer ${
                hoveredCard === "investigation"
                  ? "transform scale-105 shadow-2xl shadow-orange-500/20 bg-white/95"
                  : "hover:shadow-xl hover:shadow-orange-500/10"
              }`}
              onMouseEnter={() => setHoveredCard("investigation")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Under Investigation
                    </p>
                    <p className="text-3xl font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
                      {stats.investigation}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Clock className="text-white" size={28} />
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-500 border border-white/20 cursor-pointer ${
                hoveredCard === "resolved"
                  ? "transform scale-105 shadow-2xl shadow-green-500/20 bg-white/95"
                  : "hover:shadow-xl hover:shadow-green-500/10"
              }`}
              onMouseEnter={() => setHoveredCard("resolved")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Resolved Cases</p>
                    <p className="text-3xl font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
                      {stats.resolved}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="text-white" size={28} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search + Filter Bar */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-12 border border-white/20">
            <div className="flex flex-col gap-4">
              <div className="flex-1 relative">
                <div className="flex items-center bg-white/70 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] rounded-xl flex items-center justify-center shadow-lg mr-3">
                    <Search className="text-white" size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search complaints, names, or IDs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center bg-white/70 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3 flex-1 sm:flex-initial">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg mr-3">
                    <Filter className="text-white" size={16} />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent outline-none text-sm text-gray-700 flex-1"
                  >
                    <option value="all">All Status ({stats.total})</option>
                    <option value="filed">Filed ({stats.filed})</option>
                    <option value="under_investigation">
                      Under Investigation ({stats.investigation})
                    </option>
                    <option value="for_hearing">For Hearing</option>
                    <option value="resolved">
                      Resolved ({stats.resolved})
                    </option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>

                <button
                  onClick={handleAdd}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/30 text-white px-6 py-3 rounded-2xl transition-all duration-300 font-medium flex items-center justify-center space-x-2"
                >
                  <Plus size={18} />
                  <span>New Complaint</span>
                </button>
              </div>
            </div>
          </div>

          {/* ────────────────────── MOBILE CARDS (lg:hidden) ────────────────────── */}
          <div className="lg:hidden space-y-4 mb-8">
            {statusFilter !== "all" && (
              <div className="text-center text-sm text-gray-600 mb-4">
                Showing {filteredComplaints.length}{" "}
                {formatStatus(statusFilter).toLowerCase()} complaints
              </div>
            )}
            {statusFilter === "all" &&
              filteredComplaints.length !== stats.total && (
                <div className="text-center text-sm text-gray-600 mb-4">
                  Showing {filteredComplaints.length} of {stats.total}{" "}
                  complaints (filtered by search)
                </div>
              )}

            {loading ? (
              <div className="flex flex-col items-center py-12">
                <div className="w-16 h-16 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#0F4C81] font-medium">Loading...</p>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium">No complaints found</p>
                <p className="text-gray-500 text-sm mt-1">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter"
                    : "No complaints registered yet"}
                </p>
              </div>
            ) : (
              filteredComplaints.map((c) => (
                <div
                  key={c.complaint_id}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-5 border border-white/20 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#0F4C81]" />
                        <span className="font-bold text-sm text-[#0F4C81]">
                          {c.complaint_number || `COMP-${c.complaint_id}`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Complaint #
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        c.status
                      )} shadow-sm`}
                    >
                      <div className="w-2 h-2 rounded-full bg-current mr-1 opacity-70"></div>
                      {formatStatus(c.status)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {c.complainant_name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">Complainant</p>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                        {c.category_name || "N/A"}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-700">
                        {formatDate(c.created_at)}
                      </p>
                      <p className="text-xs text-gray-500">Date Filed</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleView(c)}
                      className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl text-xs font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(c)}
                      className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-xs font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.complaint_id)}
                      className="flex-1 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl text-xs font-medium hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ────────────────────── DESKTOP TABLE (lg+) ────────────────────── */}
          <div className="hidden lg:block">
            <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
              <div className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] sticky top-0 z-20">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Complaint ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Complainant
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Complaint Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Date Filed
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Actions
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
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-[#0F4C81] text-lg font-medium">
                              Loading complaints...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16">
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Search size={32} className="text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-xl font-semibold mb-2">
                              No complaints found
                            </p>
                            <p className="text-gray-500 text-sm">
                              {searchTerm || statusFilter !== "all"
                                ? "Try adjusting your search criteria"
                                : "No complaints registered yet"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map((c) => (
                        <TableRow
                          key={c.complaint_id}
                          data={c}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Modal */}
          <Modal
            isOpen={modalType !== null}
            onClose={handleClose}
            title={modalTitle}
            subtitle={modalSubtitle}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Complainant Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complainant Type *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="complainant_type"
                      value="resident"
                      checked={form.complainant_type === "resident"}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="mr-2"
                    />
                    <User size={16} className="mr-1" />
                    Resident
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="complainant_type"
                      value="non_resident"
                      checked={form.complainant_type === "non_resident"}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="mr-2"
                    />
                    <User size={16} className="mr-1" />
                    Non-Resident
                  </label>
                </div>
              </div>

              {/* Resident / Non-Resident */}
              {form.complainant_type === "resident" ? (
                <div ref={dropdownRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Resident *
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Type to search residents..."
                      value={residentSearch}
                      onChange={(e) => {
                        if (isReadOnly) return;
                        setResidentSearch(e.target.value);
                        setShowResidentDropdown(true);
                      }}
                      onFocus={() =>
                        !isReadOnly && setShowResidentDropdown(true)
                      }
                      disabled={isReadOnly}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                      required={!isReadOnly}
                    />
                    {showResidentDropdown &&
                      !isReadOnly &&
                      filteredResidents.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {filteredResidents.map((r) => (
                            <div
                              key={r.resident_id}
                              onClick={() => handleResidentSelect(r)}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">
                                {r.first_name} {r.middle_name || ""}{" "}
                                {r.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {r.purok} • {r.contact_number}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                  {form.resident_id && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-green-800">
                        Selected: {residentSearch}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Non-Resident Name *
                    </label>
                    <input
                      type="text"
                      name="non_resident_name"
                      placeholder="Enter full name"
                      value={form.non_resident_name}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                      required={!isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      name="non_resident_contact"
                      placeholder="Enter contact number"
                      value={form.non_resident_contact}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="non_resident_address"
                      placeholder="Enter complete address"
                      value={form.non_resident_address}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                    />
                  </div>
                </div>
              )}

              {/* Respondent */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Respondent Name *
                  </label>
                  <input
                    type="text"
                    name="respondent_name"
                    placeholder="Enter respondent name"
                    value={form.respondent_name}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                    required={!isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Respondent Contact
                  </label>
                  <input
                    type="text"
                    name="respondent_contact"
                    placeholder="Enter respondent contact"
                    value={form.respondent_contact}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                  />
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Respondent Address
                  </label>
                  <input
                    type="text"
                    name="respondent_address"
                    placeholder="Enter respondent address"
                    value={form.respondent_address}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Category + Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complaint Category *
                  </label>
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                    required={!isReadOnly}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    disabled={isReadOnly || modalType === "add"}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                    required={!isReadOnly}
                  >
                    <option value="filed">Filed</option>
                    <option value="under_investigation">
                      Under Investigation
                    </option>
                    <option value="for_hearing">For Hearing</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
              </div>

              {/* Incident Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Date *
                  </label>
                  <input
                    type="date"
                    name="incident_date"
                    value={form.incident_date}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                    required={!isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Time
                  </label>
                  <input
                    type="time"
                    name="incident_time"
                    value={form.incident_time}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                  />
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Location *
                  </label>
                  <input
                    type="text"
                    name="incident_location"
                    placeholder="Enter incident location"
                    value={form.incident_location}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                    required={!isReadOnly}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  placeholder="Provide detailed description of the complaint..."
                  value={form.description}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-vertical disabled:bg-gray-100"
                  rows="3"
                  required={!isReadOnly}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  {isReadOnly ? "Close" : "Cancel"}
                </button>
                {!isReadOnly && (
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
                  >
                    {modalType === "edit"
                      ? "Update Complaint"
                      : "Save Complaint"}
                  </button>
                )}
              </div>
            </form>
          </Modal>

          {/* Notification System */}
          <NotificationSystem
            notifications={notifications}
            onRemove={handleRemoveNotification}
          />
        </div>
      </div>
    </div>
  );
};

export default Complaints;

/* CSS Animations and Custom Scrollbar */
if (typeof document !== "undefined") {
  const styles = document.createElement("style");
  styles.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes float {
      0%,100% { transform: translateY(0) rotate(0deg); }
      33%     { transform: translateY(-10px) rotate(120deg); }
      66%     { transform: translateY(5px) rotate(240deg); }
    }
    .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
    .animate-float  { animation: float 6s ease-in-out infinite; }
    .custom-scroll {scrollbar-width:thin;scrollbar-color:#58A1D3 transparent}
    .custom-scroll::-webkit-scrollbar {width:12px}
    .custom-scroll::-webkit-scrollbar-track {background:transparent;border-radius:6px}
    .custom-scroll::-webkit-scrollbar-thumb {
      background:linear-gradient(to bottom,#0F4C81,#58A1D3);
      border-radius:6px;border:2px solid rgba(255,255,255,.6);
      transition:all .3s ease;
    }
    .custom-scroll::-webkit-scrollbar-thumb:hover {
      background:linear-gradient(to bottom,#0A3B66,#3D8BBF);
      box-shadow:0 0 12px rgba(88,161,211,.8);
    }
  `;

  if (!document.getElementById("complaints-styles")) {
    styles.id = "complaints-styles";
    document.head.appendChild(styles);
  }
}
