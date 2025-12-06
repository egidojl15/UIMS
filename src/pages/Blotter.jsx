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
  Home,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { blottersAPI, residentsAPI } from "../services/api";
import NotificationSystem from "../components/NotificationSystem";

// Reusable StatCard component
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  hovered,
  onMouseEnter,
  onMouseLeave,
}) => (
  <div
    className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-500 border border-white/20 ${
      hovered
        ? "transform scale-105 shadow-2xl shadow-blue-500/20 bg-white/95"
        : "hover:shadow-xl hover:shadow-blue-500/10"
    }`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
            {value}
          </p>
        </div>
        <div
          className={`p-4 rounded-2xl ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="text-white" size={28} />
        </div>
      </div>
    </div>
  </div>
);

// Modal component with portal rendering
const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="modal-backdrop bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn fixed inset-0 z-[99999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/20 border border-white/20 relative">
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

const TableRow = ({ data, onView, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800 border-red-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";
  };

  const formatReporterType = (type) => {
    if (!type) return "N/A";
    return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <tr className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300 border-b border-gray-100 group">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-3 mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Calendar size={18} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
              #{data.blotter_id}
            </div>
            <div className="text-xs text-gray-500">Blotter ID</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-semibold text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
          {data.reported_by || "N/A"}
        </div>
        <div className="text-xs text-gray-500">Reporter</div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
          {formatReporterType(data.reporter_type)}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
          {data.incident_type || "N/A"}
        </div>
        <div className="text-xs text-gray-500">Incident Type</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
          {formatDate(data.incident_date)}
        </div>
        <div className="text-xs text-gray-500">Date</div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            data.status
          )} shadow-sm border`}
        >
          <div className="w-2 h-2 rounded-full bg-current mr-2 opacity-70"></div>
          {formatStatus(data.status)}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-1">
          <button
            onClick={() => onView(data)}
            className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 group/btn transform hover:scale-105"
            title="View Details"
          >
            <Eye
              size={18}
              className="group-hover/btn:scale-110 transition-transform duration-300"
            />
          </button>
          <button
            onClick={() => onEdit(data)}
            className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 group/btn transform hover:scale-105"
            title="Edit Blotter"
          >
            <Edit
              size={18}
              className="group-hover/btn:scale-110 transition-transform duration-300"
            />
          </button>
          <button
            onClick={() => onDelete(data.blotter_id)}
            className="p-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 group/btn transform hover:scale-105"
            title="Delete Blotter"
          >
            <Trash2
              size={18}
              className="group-hover/btn:scale-110 transition-transform duration-300"
            />
          </button>
        </div>
      </td>
    </tr>
  );
};

const Blotter = () => {
  const [blotters, setBlotters] = useState([]);
  const [residents, setResidents] = useState([]);
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedBlotter, setSelectedBlotter] = useState(null);
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
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  const initialForm = {
    complaint_id: null,
    incident_type: "",
    incident_date: "",
    incident_time: "",
    location: "",
    persons_involved: "",
    incident_details: "",
    action_taken: "",
    reported_by: "",
    reporter_type: "resident",
    status: "active",
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

  const addDeleteConfirmation = (blotterId) => {
    const notifId = Date.now();
    setNotifications((prev) => [
      ...prev,
      {
        id: notifId,
        type: "warning",
        title: "Confirm Delete",
        message:
          "Are you sure you want to delete this blotter record? This action cannot be undone.",
        autoDismiss: false,
        blotterId,
        action: (
          <div className="flex space-x-3 mt-3">
            <button
              onClick={() => {
                handleRemoveNotification(notifId);
              }}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                handleRemoveNotification(notifId);
                await performDelete(blotterId);
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
      await blottersAPI.delete(id);
      fetchBlotters();
      addSuccessNotification(
        "Blotter Deleted",
        "The blotter record has been removed successfully."
      );
    } catch (err) {
      console.error("Delete failed:", err);
      addErrorNotification(
        "Delete Failed",
        "Could not delete the blotter record."
      );
    }
  };

  const fetchBlotters = async () => {
    try {
      const res = await blottersAPI.getAll();
      setBlotters(res.data || []);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch blotters:", error);
      setError("Failed to load blotters");
      addErrorNotification(
        "Failed to Load",
        "Could not fetch blotter records."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const resResidents = await residentsAPI.getAll();
      setResidents(resResidents.data || []);
    } catch (error) {
      console.error("Failed to fetch residents:", error);
      addErrorNotification("Failed to Load", "Could not fetch resident data.");
    }
  };

  useEffect(() => {
    fetchBlotters();
    fetchFormData();
  }, []);

  useEffect(() => {
    if (form.reporter_type === "resident") {
      setForm((prev) => ({
        ...prev,
        reported_by: "",
      }));
      setResidentSearch("");
    }
  }, [form.reporter_type]);

  useEffect(() => {
    if (residentSearch.trim() === "") {
      setFilteredResidents(residents.slice(0, 5));
    } else {
      const filtered = residents
        .filter((resident) =>
          `${resident.first_name} ${resident.last_name} ${
            resident.middle_name || ""
          }`
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
    const fullName = `${resident.first_name} ${resident.middle_name || ""} ${
      resident.last_name
    }`.trim();
    setForm((prev) => ({
      ...prev,
      reported_by: fullName,
    }));
    setResidentSearch(fullName);
    setShowResidentDropdown(false);
  };

  const populateForm = (data) => {
    setForm({
      complaint_id: data.complaint_id || null,
      incident_type: data.incident_type || "",
      incident_date: data.incident_date ? data.incident_date.split("T")[0] : "",
      incident_time: data.incident_time || "",
      location: data.location || "",
      persons_involved: data.persons_involved || "",
      incident_details: data.incident_details || "",
      action_taken: data.action_taken || "",
      reported_by: data.reported_by || "",
      reporter_type: data.reporter_type || "resident",
      status: data.status || "active",
    });
    setResidentSearch(data.reported_by || "");
  };

  const handleAdd = () => {
    setForm(initialForm);
    setIsReadOnly(false);
    setModalType("add");
    setSelectedBlotter(null);
    setResidentSearch("");
    document.body.classList.add("modal-open");
  };

  const handleView = (blotter) => {
    populateForm(blotter);
    setIsReadOnly(true);
    setModalType("view");
    setSelectedBlotter(blotter);
    document.body.classList.add("modal-open");
  };

  const handleEdit = (blotter) => {
    populateForm(blotter);
    setIsReadOnly(false);
    setModalType("edit");
    setSelectedBlotter(blotter);
    document.body.classList.add("modal-open");
  };

  const handleDelete = (id) => {
    addDeleteConfirmation(id);
  };

  const handleClose = () => {
    setModalType(null);
    setForm(initialForm);
    setResidentSearch("");
    setShowResidentDropdown(false);
    setSelectedBlotter(null);
    document.body.classList.remove("modal-open");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    try {
      setError(null);
      let successMessage;
      if (modalType === "edit") {
        await blottersAPI.update(selectedBlotter.blotter_id, form);
        successMessage = "Blotter updated successfully.";
      } else {
        await blottersAPI.create(form);
        successMessage = "New blotter created successfully.";
      }
      setModalType(null);
      setForm(initialForm);
      setResidentSearch("");
      fetchBlotters();
      addSuccessNotification(
        modalType === "edit" ? "Blotter Updated" : "Blotter Saved",
        successMessage
      );
    } catch (error) {
      console.error(`Failed to ${modalType} blotter:`, error);
      const errorMessage =
        error.response?.data?.message || `Failed to ${modalType} blotter`;
      setError(errorMessage);
      addErrorNotification(
        modalType === "edit" ? "Update Failed" : "Save Failed",
        errorMessage
      );
    }
  };

  const filteredBlotters = blotters.filter((blotter) => {
    const matchesSearch =
      blotter.blotter_id?.toString().includes(searchTerm) ||
      blotter.reported_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blotter.incident_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blotter.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || blotter.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: blotters.length,
    active: blotters.filter((b) => b.status === "active").length,
    resolved: blotters.filter((b) => b.status === "resolved").length,
    closed: blotters.filter((b) => b.status === "closed").length,
  };

  const modalTitle =
    modalType === "view"
      ? "View Blotter Details"
      : modalType === "edit"
      ? "Edit Blotter"
      : "Record New Blotter";
  const modalSubtitle =
    modalType === "view"
      ? "Review the blotter details below"
      : modalType === "edit"
      ? "Update the blotter information"
      : "Fill in the details below to register a new blotter";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] relative overflow-hidden">
      {/* Floating background elements */}
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
          {/* Enhanced Hero Section */}
          <section className="relative mb-12">
            <div className="bg-gradient-to-br from-[#0F4C81] via-[#58A1D3] to-[#B3DEF8] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
              {/* Subtle wave background */}
              <div className="absolute inset-0 opacity-20">
                <svg
                  className="w-full h-full"
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
                  {/* Left side – Icon + Text */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText size={32} className="text-yellow-300" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                        <span className="text-cyan-200 text-xs sm:text-sm font-medium tracking-widest">
                          BLOTTER RECORDS
                        </span>
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                      </div>

                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold drop-shadow-lg">
                        Blotter Management
                      </h2>

                      <p className="text-cyan-100 text-sm sm:text-base mt-1">
                        Track and manage all incident reports and blotter
                        records
                      </p>
                    </div>
                  </div>

                  {/* Right side – Scroll indicator */}
                  <div className="flex flex-col items-center gap-3">
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

          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-[#0F4C81] rounded-full animate-pulse"></div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] bg-clip-text text-transparent">
                Blotter Overview
              </h2>
              <div className="w-2 h-2 bg-[#58A1D3] rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Monitor and manage all blotter records with real-time statistics
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <StatCard
              title="Total Blotters"
              value={stats.total}
              icon={FileText}
              color="bg-gradient-to-br from-blue-500 to-cyan-500"
              hovered={hoveredCard === "total"}
              onMouseEnter={() => setHoveredCard("total")}
              onMouseLeave={() => setHoveredCard(null)}
            />
            <StatCard
              title="Active Cases"
              value={stats.active}
              icon={AlertTriangle}
              color="bg-gradient-to-br from-red-500 to-pink-500"
              hovered={hoveredCard === "active"}
              onMouseEnter={() => setHoveredCard("active")}
              onMouseLeave={() => setHoveredCard(null)}
            />
            <StatCard
              title="Resolved Cases"
              value={stats.resolved}
              icon={CheckCircle}
              color="bg-gradient-to-br from-emerald-500 to-teal-500"
              hovered={hoveredCard === "resolved"}
              onMouseEnter={() => setHoveredCard("resolved")}
              onMouseLeave={() => setHoveredCard(null)}
            />
            <StatCard
              title="Closed Cases"
              value={stats.closed}
              icon={Clock}
              color="bg-gradient-to-br from-gray-500 to-slate-500"
              hovered={hoveredCard === "closed"}
              onMouseEnter={() => setHoveredCard("closed")}
              onMouseLeave={() => setHoveredCard(null)}
            />
          </div>

          {/* Search and Filter Bar - FIXED: Solid Black Icons */}
          <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Search size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0F4C81]">
                    Search & Filter
                  </h3>
                  <p className="text-sm text-gray-500">
                    Find specific blotter records
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search
                    size={22}
                    strokeWidth={3}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-black z-10"
                    style={{ filter: "none", opacity: 1 }}
                  />
                  <input
                    type="text"
                    placeholder="Search by ID, reporter, incident type, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 bg-white/70 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-500 font-medium"
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <Filter
                    size={22}
                    strokeWidth={3}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-black z-10 font-bold"
                    style={{ filter: "none", opacity: 1 }}
                  />
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
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* New Blotter Button */}
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/30 text-white px-6 py-4 rounded-2xl transition-all duration-300 font-medium group"
                >
                  <Plus
                    size={20}
                    className="group-hover:rotate-90 transition-transform duration-300"
                  />
                  <span>New Blotter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
              <div className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] sticky top-0 z-20">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Blotter ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Reported By
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Reporter Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Incident Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Date
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
                        <td colSpan="7" className="text-center py-16">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-[#0F4C81] text-lg font-medium">
                              Loading blotters...
                            </p>
                            <p className="text-gray-500 text-sm mt-2">
                              Please wait while we fetch the data
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredBlotters.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-16">
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Search size={32} className="text-black" />
                            </div>
                            <p className="text-gray-600 text-xl font-semibold mb-2">
                              No blotters found
                            </p>
                            <p className="text-gray-500 text-sm">
                              {searchTerm || statusFilter !== "all"
                                ? "Try adjusting your search criteria"
                                : "No blotters registered yet"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredBlotters.map((b) => (
                        <TableRow
                          key={b.blotter_id}
                          data={b}
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

          {/* Mobile Card Layout */}
          <div className="lg:hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#0F4C81] font-medium">
                  Loading blotters...
                </p>
              </div>
            ) : filteredBlotters.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-gray-600" />
                </div>
                <p className="text-gray-600 text-xl font-semibold mb-2">
                  No blotters found
                </p>
                <p className="text-gray-500 text-sm">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search criteria"
                    : "No blotters registered yet"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredBlotters.map((b) => (
                  <div
                    key={b.blotter_id}
                    className="p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2 shadow-md">
                          <Calendar size={16} className="text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-[#0F4C81] text-lg">
                            #{b.blotter_id}
                          </div>
                          <div className="text-xs text-gray-500">
                            Blotter ID
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          b.status === "active"
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : b.status === "resolved"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></div>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reporter:</span>
                        <span className="font-medium text-gray-900 truncate max-w-[180px]">
                          {b.reported_by || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                          {(b.reporter_type || "")
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Incident:</span>
                        <span className="font-medium text-gray-900 truncate max-w-[180px]">
                          {b.incident_type || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium text-gray-900">
                          {b.incident_date
                            ? new Date(b.incident_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleView(b)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(b)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b.blotter_id)}
                        className="flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-md transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal for Add/Edit/View */}
          <Modal
            isOpen={modalType !== null}
            onClose={handleClose}
            title={modalTitle}
            subtitle={modalSubtitle}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Reporter Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Reporter Type *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-all duration-300">
                    <input
                      type="radio"
                      name="reporter_type"
                      value="resident"
                      checked={form.reporter_type === "resident"}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="text-blue-600"
                    />
                    <Home size={18} className="text-blue-600" />
                    <span className="font-medium">Resident</span>
                  </label>
                  <label className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-all duration-300">
                    <input
                      type="radio"
                      name="reporter_type"
                      value="non_resident"
                      checked={form.reporter_type === "non_resident"}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="text-blue-600"
                    />
                    <User size={18} className="text-purple-600" />
                    <span className="font-medium">Non-Resident</span>
                  </label>
                </div>
              </div>

              {/* Reported By Details */}
              {form.reporter_type === "resident" ? (
                <div ref={dropdownRef} className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Search Resident *
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600"
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
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                      required={!isReadOnly}
                    />

                    {showResidentDropdown &&
                      !isReadOnly &&
                      filteredResidents.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                          {filteredResidents.map((resident) => (
                            <div
                              key={resident.resident_id}
                              onClick={() => handleResidentSelect(resident)}
                              className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200"
                            >
                              <div className="font-semibold text-gray-900">
                                {resident.first_name}{" "}
                                {resident.middle_name || ""}{" "}
                                {resident.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {resident.purok} • {resident.contact_number}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                  {form.reported_by && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                      <div className="text-sm text-green-800 flex items-center gap-2">
                        <CheckCircle size={16} />
                        Selected: {residentSearch}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Non-Resident Name *
                    </label>
                    <input
                      type="text"
                      name="reported_by"
                      placeholder="Enter full name"
                      value={form.reported_by}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                      required={!isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      name="non_resident_contact"
                      placeholder="Enter contact"
                      value={form.non_resident_contact || ""}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="non_resident_address"
                      placeholder="Enter address"
                      value={form.non_resident_address || ""}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                    />
                  </div>
                </div>
              )}

              {/* Incident Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Incident Type *
                  </label>
                  <input
                    type="text"
                    name="incident_type"
                    placeholder="e.g., Theft, Dispute"
                    value={form.incident_type}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                    required={!isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g., Main Street"
                    value={form.location}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                    required={!isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Persons Involved
                </label>
                <textarea
                  name="persons_involved"
                  placeholder="Describe individuals involved"
                  value={form.persons_involved}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-vertical disabled:bg-gray-100"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Incident Details *
                </label>
                <textarea
                  name="incident_details"
                  placeholder="Provide detailed description of the incident..."
                  value={form.incident_details}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-vertical disabled:bg-gray-100"
                  rows="3"
                  required={!isReadOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Action Taken
                </label>
                <textarea
                  name="action_taken"
                  placeholder="Actions already taken or planned"
                  value={form.action_taken}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-vertical disabled:bg-gray-100"
                  rows="2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-gray-700 hover:border-gray-400"
                >
                  {isReadOnly ? "Close" : "Cancel"}
                </button>
                {!isReadOnly && (
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-semibold transform hover:scale-105"
                  >
                    {modalType === "edit" ? "Update Blotter" : "Save Blotter"}
                  </button>
                )}
              </div>
            </form>
          </Modal>

          {/* Render the NotificationSystem */}
          <NotificationSystem
            notifications={notifications}
            onRemove={handleRemoveNotification}
          />
        </div>
      </div>
    </div>
  );
};

export default Blotter;

// Add CSS animations and modal styles
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    33% {
      transform: translateY(-10px) rotate(120deg);
    }
    66% {
      transform: translateY(5px) rotate(240deg);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

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

  #modal-root {
    position: relative;
    z-index: 99999;
  }

  .modal-backdrop {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    z-index: 99999 !important;
    width: 100vw !important;
    height: 100vh !important;
  }

  body.modal-open {
    overflow: hidden;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  if (!document.getElementById("blotter-animations")) {
    styleSheet.id = "blotter-animations";
    document.head.appendChild(styleSheet);
  }
}
