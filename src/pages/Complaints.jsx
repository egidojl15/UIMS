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

// ────────────────────────────────────────────────
// SHARED FORMAT HELPERS (same as in Blotter)
// ────────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusColor = (status) => {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "filed":                return "bg-red-100 text-red-800 border-red-200";
    case "under_investigation":  return "bg-orange-100 text-orange-800 border-orange-200";
    case "for_hearing":          return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "resolved":             return "bg-green-100 text-green-800 border-green-200";
    case "dismissed":            return "bg-gray-100 text-gray-800 border-gray-200";
    default:                     return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

// ────────────────────────────────────────────────
// Modal (same style as Blotter)
// ────────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="modal-backdrop bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn fixed inset-0 z-[99999]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/20 border border-white/20 relative">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                {title}
              </h3>
              {subtitle && <p className="text-cyan-100 mt-1 text-sm">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300 group"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
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

// ────────────────────────────────────────────────
// Desktop Table Row (aligned like Blotter)
// ────────────────────────────────────────────────
const TableRow = ({ data, onView, onEdit, onDelete }) => {
  return (
    <tr className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300 border-b border-gray-100 group">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-3 mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Calendar size={18} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
              {data.complaint_number || `COMP-${data.complaint_id}`}
            </div>
            <div className="text-xs text-gray-500">Complaint #</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-semibold text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
          {data.complainant_name || "N/A"}
        </div>
        <div className="text-xs text-gray-500">Complainant</div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
          {data.category_name || "N/A"}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
          {formatDate(data.created_at)}
        </div>
        <div className="text-xs text-gray-500">Date Filed</div>
      </td>
      <td className="px-6 py-4 text-center">
        <span
          className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
            data.status
          )} shadow-sm border min-w-[110px] justify-center`}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-current mr-2 opacity-80"></div>
          {formatStatus(data.status)}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onView(data)}
            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 group/btn transform hover:scale-105"
            title="View Details"
          >
            <Eye size={18} className="group-hover/btn:scale-110 transition-transform duration-300" />
          </button>
          <button
            onClick={() => onEdit(data)}
            className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 group/btn transform hover:scale-105"
            title="Edit Complaint"
          >
            <Edit size={18} className="group-hover/btn:scale-110 transition-transform duration-300" />
          </button>
          <button
            onClick={() => onDelete(data.complaint_id)}
            className="p-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 group/btn transform hover:scale-105"
            title="Delete Complaint"
          >
            <Trash2 size={18} className="group-hover/btn:scale-110 transition-transform duration-300" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ────────────────────────────────────────────────
// MAIN Complaints Component
// ────────────────────────────────────────────────
const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null);
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

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => document.body.classList.remove("modal-open");
  }, []);

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

  const addDeleteConfirmation = (complaintId) => {
    const notifId = Date.now();
    setNotifications((prev) => [
      ...prev,
      {
        id: notifId,
        type: "warning",
        title: "Confirm Delete",
        message: "Are you sure you want to delete this complaint record? This action cannot be undone.",
        autoDismiss: false,
        complaintId,
        action: (
          <div className="flex space-x-3 mt-3">
            <button
              onClick={() => handleRemoveNotification(notifId)}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                handleRemoveNotification(notifId);
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
      addSuccessNotification("Complaint Deleted", "The complaint record has been removed successfully.");
    } catch (err) {
      console.error("Delete failed:", err);
      addErrorNotification("Delete Failed", "Could not delete the complaint record.");
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await complaintsAPI.getAll();
      setComplaints(res.data || []);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
      setError("Failed to load complaints");
      addErrorNotification("Failed to Load", "Could not fetch complaint records.");
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
    } catch (error) {
      console.error("Failed to fetch form data:", error);
      addErrorNotification("Failed to Load", "Could not fetch form data.");
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchFormData();
  }, []);

  useEffect(() => {
    if (form.complainant_type === "resident") {
      setForm((prev) => ({
        ...prev,
        non_resident_name: "",
        non_resident_address: "",
        non_resident_contact: "",
      }));
      setResidentSearch("");
    } else {
      setForm((prev) => ({ ...prev, resident_id: "" }));
      setResidentSearch("");
    }
  }, [form.complainant_type]);

  useEffect(() => {
    if (residentSearch.trim() === "") {
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowResidentDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResidentSelect = (resident) => {
    if (isReadOnly) return;
    setForm((prev) => ({ ...prev, resident_id: resident.resident_id }));
    setResidentSearch(
      `${resident.first_name} ${resident.middle_name || ""} ${resident.last_name}`.trim()
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
      const r = residents.find((r) => r.resident_id === data.resident_id);
      setResidentSearch(r ? `${r.first_name} ${r.middle_name || ""} ${r.last_name}`.trim() : "");
    } else {
      setResidentSearch(data.non_resident_name || "");
    }
  };

  const handleAdd = () => {
    setForm(initialForm);
    setIsReadOnly(false);
    setModalType("add");
    setSelectedComplaint(null);
    setResidentSearch("");
    document.body.classList.add("modal-open");
  };

  const handleView = (c) => {
    populateForm(c);
    setIsReadOnly(true);
    setModalType("view");
    setSelectedComplaint(c);
    document.body.classList.add("modal-open");
  };

  const handleEdit = (c) => {
    populateForm(c);
    setIsReadOnly(false);
    setModalType("edit");
    setSelectedComplaint(c);
    document.body.classList.add("modal-open");
  };

  const handleDelete = (id) => addDeleteConfirmation(id);

  const handleClose = () => {
    setModalType(null);
    setForm(initialForm);
    setResidentSearch("");
    setShowResidentDropdown(false);
    setSelectedComplaint(null);
    document.body.classList.remove("modal-open");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    try {
      setError(null);
      let successMessage;
      if (modalType === "edit") {
        await complaintsAPI.update(selectedComplaint.complaint_id, form);
        successMessage = "Complaint updated successfully.";
      } else {
        await complaintsAPI.create(form);
        successMessage = "New complaint created successfully.";
      }
      setModalType(null);
      setForm(initialForm);
      setResidentSearch("");
      fetchComplaints();
      addSuccessNotification(
        modalType === "edit" ? "Complaint Updated" : "Complaint Saved",
        successMessage
      );
    } catch (error) {
      console.error(`Failed to ${modalType} complaint:`, error);
      const errorMessage = error.response?.data?.message || `Failed to ${modalType} complaint`;
      setError(errorMessage);
      addErrorNotification(
        modalType === "edit" ? "Update Failed" : "Save Failed",
        errorMessage
      );
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      (c.complaint_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.complainant_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.respondent_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: complaints.length,
    filed: complaints.filter((c) => c.status === "filed").length,
    investigation: complaints.filter((c) => c.status === "under_investigation").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  const modalTitle =
    modalType === "view" ? "View Complaint Details" :
    modalType === "edit" ? "Edit Complaint" :
    "Record New Complaint";

  const modalSubtitle =
    modalType === "view" ? "Review the complaint details below" :
    modalType === "edit" ? "Update the complaint information" :
    "Fill in the details below to register a new complaint";

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

      <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section – same style as Blotter */}
          <section className="relative mb-12">
            <div className="bg-gradient-to-br from-[#0F4C81] via-[#58A1D3] to-[#B3DEF8] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
                  <path
                    d="M0,200 C300,250 600,150 900,200 C1050,220 1150,180 1200,200 L1200,400 L0,400 Z"
                    fill="currentColor"
                    className="text-white animate-pulse"
                  />
                </svg>
              </div>
              <div className={`relative transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText size={32} className="text-yellow-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                        <span className="text-cyan-200 text-xs sm:text-sm font-medium tracking-widest">COMPLAINT RECORDS</span>
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                      </div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold drop-shadow-lg">Complaint Management</h2>
                      <p className="text-cyan-100 text-sm sm:text-base mt-1">Track and manage all complaint records</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-black text-xs sm:text-sm font-semibold drop-shadow-lg">Scroll to explore</span>
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
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] bg-clip-text text-transparent">Complaint Overview</h2>
              <div className="w-2 h-2 bg-[#58A1D3] rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Monitor and manage all complaint records with real-time statistics</p>
          </div>

          {/* Stats Cards – same style as Blotter */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <StatCard title="Total Complaints" value={stats.total} icon={FileText} color="bg-gradient-to-br from-blue-500 to-cyan-500" hovered={hoveredCard === "total"} onMouseEnter={() => setHoveredCard("total")} onMouseLeave={() => setHoveredCard(null)} />
            <StatCard title="Filed" value={stats.filed} icon={AlertTriangle} color="bg-gradient-to-br from-red-500 to-pink-500" hovered={hoveredCard === "filed"} onMouseEnter={() => setHoveredCard("filed")} onMouseLeave={() => setHoveredCard(null)} />
            <StatCard title="Under Investigation" value={stats.investigation} icon={Clock} color="bg-gradient-to-br from-orange-500 to-yellow-500" hovered={hoveredCard === "investigation"} onMouseEnter={() => setHoveredCard("investigation")} onMouseLeave={() => setHoveredCard(null)} />
            <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="bg-gradient-to-br from-green-500 to-emerald-500" hovered={hoveredCard === "resolved"} onMouseEnter={() => setHoveredCard("resolved")} onMouseLeave={() => setHoveredCard(null)} />
          </div>

          {/* ────────────────────────────────────────────────
              SEARCH & FILTER – same style as Blotter
          ──────────────────────────────────────────────── */}
          <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Search size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0F4C81]">Search & Filter</h3>
                  <p className="text-sm text-gray-500">Find specific complaint records</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search size={22} strokeWidth={3} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-black z-10" style={{ filter: "none", opacity: 1 }} />
                  <input
                    type="text"
                    placeholder="Search by number, name, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 bg-white/70 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-500 font-medium"
                  />
                </div>
                <div className="relative">
                  <Filter size={22} strokeWidth={3} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-black z-10 font-bold" style={{ filter: "none", opacity: 1 }} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-14 pr-10 py-4 bg-white/70 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white transition-all duration-300 text-gray-800 appearance-none cursor-pointer font-medium text-base"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23000000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 16px center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "16px",
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="filed">Filed</option>
                    <option value="under_investigation">Under Investigation</option>
                    <option value="for_hearing">For Hearing</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/30 text-white px-6 py-4 rounded-2xl transition-all duration-300 font-medium group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span>New Complaint</span>
                </button>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────
              DESKTOP TABLE – aligned like Blotter
          ──────────────────────────────────────────────── */}
          <div className="hidden lg:block">
            <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
              <div className="overflow-x-auto custom-scroll">
                <table className="w-full min-w-[1100px] table-fixed border-collapse">
                  <thead className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] sticky top-0 z-20">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider w-[14%]">Complaint #</th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider w-[22%]">Complainant</th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider w-[18%]">Category</th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider w-[14%]">Date Filed</th>
                      <th className="px-6 py-5 text-center text-xs font-bold text-white uppercase tracking-wider w-[12%]">Status</th>
                      <th className="px-6 py-5 text-center text-xs font-bold text-white uppercase tracking-wider w-[12%] min-w-[140px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white/70">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-[#0F4C81] text-lg font-medium">Loading complaints...</p>
                            <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the data</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16">
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Search size={32} className="text-black" />
                            </div>
                            <p className="text-gray-600 text-xl font-semibold mb-2">No complaints found</p>
                            <p className="text-gray-500 text-sm">
                              {searchTerm || statusFilter !== "all" ? "Try adjusting your search criteria" : "No complaints registered yet"}
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

          {/* ────────────────────────────────────────────────
              MOBILE CARDS – styled like Blotter mobile
          ──────────────────────────────────────────────── */}
          <div className="lg:hidden space-y-6 px-2">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#0F4C81] font-medium text-lg">Loading complaints...</p>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl shadow-lg">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={40} className="text-gray-600" />
                </div>
                <p className="text-gray-700 text-xl font-semibold mb-2">No complaints found</p>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filters" : "No complaint records yet"}
                </p>
              </div>
            ) : (
              filteredComplaints.map((c) => (
                <div
                  key={c.complaint_id}
                  className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-3 shadow-lg">
                          <Calendar size={24} className="text-white" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-[#0F4C81]">
                            {c.complaint_number || `COMP-${c.complaint_id}`}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">Complaint #</div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(c.status)}`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-current opacity-80"></div>
                        {formatStatus(c.status)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-5 bg-white">
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <span className="text-gray-600 font-medium">Complainant:</span>
                        <p className="font-bold text-gray-900 mt-1 truncate">{c.complainant_name || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Category:</span>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                            {c.category_name || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Date:</span>
                        <p className="font-bold text-gray-900 mt-1">{formatDate(c.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleView(c)}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all duration-300"
                      >
                        <Eye size={20} /> View
                      </button>
                      <button
                        onClick={() => handleEdit(c)}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all duration-300"
                      >
                        <Edit size={20} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c.complaint_id)}
                        className="px-5 py-3.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl hover:shadow-lg transition-all duration-300"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal Form */}
          <Modal isOpen={modalType !== null} onClose={handleClose} title={modalTitle} subtitle={modalSubtitle}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Complainant Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Complainant Type *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-all duration-300">
                    <input type="radio" name="complainant_type" value="resident" checked={form.complainant_type === "resident"} onChange={handleChange} disabled={isReadOnly} className="text-blue-600" />
                    <User size={18} className="text-blue-600" />
                    <span className="font-medium">Resident</span>
                  </label>
                  <label className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-all duration-300">
                    <input type="radio" name="complainant_type" value="non_resident" checked={form.complainant_type === "non_resident"} onChange={handleChange} disabled={isReadOnly} className="text-blue-600" />
                    <User size={18} className="text-purple-600" />
                    <span className="font-medium">Non-Resident</span>
                  </label>
                </div>
              </div>

              {/* Complainant Details */}
              {form.complainant_type === "resident" ? (
                <div ref={dropdownRef} className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Search Resident *</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600" size={20} />
                    <input
                      type="text"
                      placeholder="Type to search residents..."
                      value={residentSearch}
                      onChange={(e) => {
                        if (isReadOnly) return;
                        setResidentSearch(e.target.value);
                        setShowResidentDropdown(true);
                      }}
                      onFocus={() => !isReadOnly && setShowResidentDropdown(true)}
                      disabled={isReadOnly}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                      required={!isReadOnly}
                    />
                    {showResidentDropdown && !isReadOnly && filteredResidents.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                        {filteredResidents.map((resident) => (
                          <div
                            key={resident.resident_id}
                            onClick={() => handleResidentSelect(resident)}
                            className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200"
                          >
                            <div className="font-semibold text-gray-900">
                              {resident.first_name} {resident.middle_name || ""} {resident.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{resident.purok || "—"} • {resident.contact_number || "—"}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {form.resident_id && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                      <div className="text-sm text-green-800 flex items-center gap-2">
                        <CheckCircle size={16} /> Selected resident
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Non-Resident Name *</label>
                    <input type="text" name="non_resident_name" placeholder="Enter full name" value={form.non_resident_name} onChange={handleChange} disabled={isReadOnly} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100" required={!isReadOnly} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                    <input type="text" name="non_resident_contact" placeholder="Enter contact" value={form.non_resident_contact || ""} onChange={handleChange} disabled={isReadOnly} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                    <input type="text" name="non_resident_address" placeholder="Enter address" value={form.non_resident_address || ""} onChange={handleChange} disabled={isReadOnly} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100" />
                  </div>
                </div>
              )}

              {/* Respondent */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Respondent Name *</label>
                  <input type="text" name="respondent_name" placeholder="Enter respondent name" value={form.respondent_name} onChange={handleChange} disabled={isReadOnly} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100" required={!isReadOnly} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Respondent Contact</label>
                  <input type="text" name="respondent_contact" placeholder="Enter contact" value={form.respondent_contact || ""} onChange={handleChange} disabled={isReadOnly} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Respondent Address</label>
                  <input type="text" name="respondent_address" placeholder="Enter address" value={form.respondent_address || ""} onChange={handleChange} disabled={isReadOnly} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100" />
                </div>
              </div>

              {/* Category + Status + Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select name="category_id" value={form.category_id} onChange={handleChange} disabled={isReadOnly} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100" required={!isReadOnly}>
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Incident Date *</label>
                  <input type="date" name="incident_date" value={form.incident_date} onChange={handleChange} disabled={isReadOnly} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100" required={!isReadOnly} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                  <select name="status" value={form.status} onChange={handleChange} disabled={isReadOnly || modalType === "add"} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100" required={!isReadOnly}>
                    <option value="filed">Filed</option>
                    <option value="under_investigation">Under Investigation</option>
                    <option value="for_hearing">For Hearing</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
              </div>

              {/* Location + Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Incident Location *</label>
                  <input type="text" name="incident_location" placeholder="e.g., Barangay Hall" value={form.incident_location} onChange={handleChange} disabled={isReadOnly} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100" required={!isReadOnly} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Incident Time</label>
                  <input type="time" name="incident_time" value={form.incident_time} onChange={handleChange} disabled={isReadOnly} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea name="description" placeholder="Provide detailed description of the complaint..." value={form.description} onChange={handleChange} disabled={isReadOnly} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-vertical disabled:bg-gray-100" rows="4" required={!isReadOnly} />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button type="button" onClick={handleClose} className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-gray-700 hover:border-gray-400">
                  {isReadOnly ? "Close" : "Cancel"}
                </button>
                {!isReadOnly && (
                  <button type="submit" className="px-6 py-3 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-semibold transform hover:scale-105">
                    {modalType === "edit" ? "Update Complaint" : "Save Complaint"}
                  </button>
                )}
              </div>
            </form>
          </Modal>

          <NotificationSystem notifications={notifications} onRemove={handleRemoveNotification} />
        </div>
      </div>
    </div>
  );
};

export default Complaints;