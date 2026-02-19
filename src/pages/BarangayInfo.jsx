// BarangayInfo.jsx - YOUR ORIGINAL + FIXED SPOT MAPS
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { formatDateForInput } from "./ManageResidentPage"; // Adjust path if needed
import {
  Bell,
  Calendar,
  FileText,
  MapPin,
  UserCheck,
  ClipboardList,
  X,
  Plus,
  Edit2,
  Trash2,
  Image,
  Save,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Phone,
  Mail,
} from "lucide-react";
import {
  announcementsAPI,
  eventsAPI,
  officialsAPI,
  spotmapsAPI,
  projectsAPI,
  barangayHistoryAPI,
} from "../services/api";
import { useMap } from "./MapContext";

// ==================== Notification System ====================
const NotificationSystem = ({ notifications, onRemove }) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const [progressWidths, setProgressWidths] = useState({});
  const startedTimersRef = useRef(new Set());
  const timersRef = useRef(new Map());

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    visibleNotifications.forEach((notification) => {
      if (
        notification.autoDismiss &&
        !startedTimersRef.current.has(notification.id)
      ) {
        startedTimersRef.current.add(notification.id);
        setProgressWidths((prev) => ({ ...prev, [notification.id]: 100 }));

        const fadeTimer = setTimeout(() => {
          setProgressWidths((prev) => ({ ...prev, [notification.id]: 0 }));
        }, 10);

        const removeTimer = setTimeout(() => {
          handleRemove(notification.id);
        }, 5000);

        timersRef.current.set(notification.id, { fadeTimer, removeTimer });
      }
    });

    return () => {
      timersRef.current.forEach(({ fadeTimer, removeTimer }) => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      });
      timersRef.current.clear();
      startedTimersRef.current.clear();
    };
  }, [visibleNotifications]);

  const handleRemove = (id) => {
    const timers = timersRef.current.get(id);
    if (timers) {
      clearTimeout(timers.fadeTimer);
      clearTimeout(timers.removeTimer);
      timersRef.current.delete(id);
    }

    setVisibleNotifications((prev) => prev.filter((notif) => notif.id !== id));
    setProgressWidths((prev) => {
      const newPrev = { ...prev };
      delete newPrev[id];
      return newPrev;
    });
    startedTimersRef.current.delete(id);
    onRemove(id);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationStyle = (type) => {
    const base =
      "relative p-6 rounded-xl shadow-2xl border-l-4 mb-2 transform transition-all duration-300 ease-in-out animate-slideInRight max-w-md w-full bg-white ring-2 ring-gray-200";
    switch (type) {
      case "success":
        return `${base} border-green-400 text-green-800 shadow-green-500/20`;
      case "error":
        return `${base} border-red-400 text-red-800 shadow-red-500/20`;
      case "warning":
        return `${base} border-yellow-400 text-yellow-800 shadow-yellow-500/20 animate-pulse`;
      case "info":
        return `${base} border-blue-400 text-blue-800 shadow-blue-500/20`;
      default:
        return `${base} border-gray-400 text-gray-800 shadow-gray-500/20`;
    }
  };

  const isCentered = (notification) => !!notification.action;

  if (visibleNotifications.length === 0) return null;

  return (
    <>
      <div className="fixed top-20 right-4 z-[99999999] max-w-sm w-full space-y-2 pointer-events-auto">
        {visibleNotifications
          .filter((n) => !isCentered(n))
          .map((n) => (
            <div key={n.id} className={getNotificationStyle(n.type)}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.message && (
                    <p className="text-sm mt-1 opacity-90">{n.message}</p>
                  )}
                  {n.action && <div className="mt-2">{n.action}</div>}
                </div>
                <button
                  onClick={() => handleRemove(n.id)}
                  className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {n.autoDismiss && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-current opacity-20 rounded-b-lg">
                  <div
                    className="h-full bg-current transition-all duration-5000 ease-linear rounded-b-lg"
                    style={{ width: `${progressWidths[n.id] || 100}%` }}
                  />
                </div>
              )}
            </div>
          ))}
      </div>

      {visibleNotifications.filter(isCentered).map((n) => (
        <div
          key={n.id}
          className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 bg-black bg-opacity-50"
        >
          <div
            className={`${getNotificationStyle(
              n.type,
            )} mx-auto max-w-lg w-full p-8 shadow-2xl ring-4 ring-gray-200`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold mb-2">{n.title}</p>
                {n.message && (
                  <p className="text-base leading-relaxed">{n.message}</p>
                )}
                {n.action && <div className="mt-4">{n.action}</div>}
              </div>
              <button
                onClick={() => handleRemove(n.id)}
                className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slideInRight { animation: slideInRight 0.3s ease-out; }
      `}</style>
    </>
  );
};

// ==================== Modal ====================
const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="modal-backdrop bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
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

// ==================== Info Card ====================
const InfoCard = ({ item }) => (
  <div
    onClick={item.onOpen ? item.onOpen : null}
    className={`group relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-6 transition-all duration-500 border border-white/20 ${
      item.onOpen
        ? "cursor-pointer hover:shadow-xl hover:shadow-blue-500/20 hover:scale-105"
        : "cursor-default"
    }`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`p-3 rounded-xl ${item.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <item.icon className="text-white" size={20} />
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-full text-xs font-semibold">
          <span>{item.count}</span>
          <span>items</span>
        </div>
      </div>
      <h3 className="text-lg font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300 mb-1">
        {item.title}
      </h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        {item.description}
      </p>
    </div>
  </div>
);

// ==================== Search Bar ====================
const SearchBar = ({ placeholder, onSearch, value, onChange }) => (
  <div className="relative w-full max-w-md mx-auto mb-6">
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 pl-12 rounded-2xl border-2 border-gray-200 focus:border-[#58A1D3] focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/80 backdrop-blur-sm"
      />
      <Search
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
        size={20}
      />
      <button
        onClick={onSearch}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-lg transition-all duration-300"
      >
        Search
      </button>
    </div>
  </div>
);

// ==================== Calendar Input ====================
const CalendarInput = ({ label, value, onChange, required = false }) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && "*"}
    </label>
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] focus:ring-2 focus:ring-blue-200 transition-all duration-300"
        required={required}
      />
      <Calendar
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
        size={20}
      />
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const BarangayInfo = () => {
  const navigate = useNavigate();
  const { mapImages, updateMapImages } = useMap();

  // Format date for display (e.g., "December 6, 2025")
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "Recent";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "Recent";
    }
  };

  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [positions, setPositions] = useState([]);
  const [openAnn, setOpenAnn] = useState(false);
  const [openEvt, setOpenEvt] = useState(false);
  const [openOff, setOpenOff] = useState(false);
  const [openSpotMap, setOpenSpotMap] = useState(false);
  const [isEditingMaps, setIsEditingMaps] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showCreateOfficialModal, setShowCreateOfficialModal] = useState(false);
  const [showEditOfficialModal, setShowEditOfficialModal] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    title: "",
    location: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    description: "",
  });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    position_id: "",
    term_start: "",
    term_end: "",
    phone: "",
    email: "",
    address: "",
    bio: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Project Activity states
  const [projects, setProjects] = useState([]);
  const [openProj, setOpenProj] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectFormData, setProjectFormData] = useState({
    title: "",
    description: "",
    location: "",
    contractor: "",
    start_date: "",
    expected_completion: "",
    budget: "",
    implementing_office: "",
    source_of_fund: "",
    status: "planning",
    category: "infrastructure",
  });

  const [projectSearch, setProjectSearch] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);

  // Barangay History states
  const [history, setHistory] = useState([]);
  const [openHistory, setOpenHistory] = useState(false);
  const [showCreateHistoryModal, setShowCreateHistoryModal] = useState(false);
  const [showEditHistoryModal, setShowEditHistoryModal] = useState(false);
  const [editingHistory, setEditingHistory] = useState(null);
  const [historyFormData, setHistoryFormData] = useState({
    title: "",
    content: "",
    year: new Date().getFullYear(),
    category: "general",
    file_url: "",
  });
  const [historySearch, setHistorySearch] = useState("");
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [historyFile, setHistoryFile] = useState(null);
  const [historyFilePreview, setHistoryFilePreview] = useState(null);
  const [uploadingHistoryFile, setUploadingHistoryFile] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setFilteredAnnouncements(announcements);
  }, [announcements]);
  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [
      ...prev,
      { id, autoDismiss: true, ...notification },
    ]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const loadAnnouncements = async () => {
    try {
      const res = await announcementsAPI.getAll();
      setAnnouncements(res.announcements ?? res.data ?? res ?? []);
      setFilteredAnnouncements(res.announcements ?? res.data ?? res ?? []);
    } catch (e) {
      setAnnouncements([]);
      setFilteredAnnouncements([]);
    }
  };

  const loadEvents = async () => {
    try {
      const res = await eventsAPI.getAll();
      setEvents(res.events ?? res.data ?? res ?? []);
      setFilteredEvents(res.events ?? res.data ?? res ?? []);
    } catch (e) {
      setEvents([]);
      setFilteredEvents([]);
    }
  };

  const loadOfficials = async () => {
    try {
      const res = await officialsAPI.list();
      if (res.success) {
        setOfficials(res.officials || []);
      } else {
        setOfficials([]);
      }
    } catch (e) {
      console.error("Error loading officials:", e);
      setOfficials([]);
    }
  };

  const loadPositions = async () => {
    try {
      const data = await officialsAPI.getPositions();
      setPositions(data.positions || []);
    } catch (e) {
      setPositions([]);
    }
  };

  const loadSpotMaps = async () => {
    try {
      const result = await spotmapsAPI.getAll();
      if (result.success && result.data) {
        const timestamp = Date.now();
        const backendURL =
          import.meta.env.VITE_API_URL?.replace("/api", "") ||
          "http://localhost:5000";
        const updated = {};
        Object.keys(result.data).forEach((k) => {
          if (result.data[k]) {
            // If the URL is relative (starts with /uploads), prepend backend URL
            const imageUrl = result.data[k].startsWith("/uploads")
              ? `${backendURL}${result.data[k]}`
              : result.data[k];
            updated[k] = `${imageUrl}?t=${timestamp}`;
          } else {
            updated[k] = "";
          }
        });
        console.log("✅ Loaded spot maps:", updated);
        updateMapImages(updated);
      }
    } catch (err) {
      console.error("❌ Error loading spot maps:", err);
    }
  };

  useEffect(() => {
    loadAnnouncements();
    loadEvents();
    loadOfficials();
    loadPositions();
    loadSpotMaps();
    loadProjects();
    loadHistory();
  }, []);

  const handleAnnouncementSearch = () => {
    if (!announcementSearch.trim()) {
      setFilteredAnnouncements(announcements);
      return;
    }
    const term = announcementSearch.toLowerCase();
    const filtered = announcements.filter(
      (a) =>
        a.title?.toLowerCase().includes(term) ||
        a.content?.toLowerCase().includes(term),
    );
    setFilteredAnnouncements(filtered);
  };

  const handleEventSearch = () => {
    if (!eventSearch.trim()) {
      setFilteredEvents(events);
      return;
    }
    const term = eventSearch.toLowerCase();
    const filtered = events.filter(
      (e) =>
        e.title?.toLowerCase().includes(term) ||
        e.location?.toLowerCase().includes(term) ||
        e.description?.toLowerCase().includes(term),
    );
    setFilteredEvents(filtered);
  };

  const handleCreateAnnouncement = async () => {
    if (!formData.title.trim()) return;
    try {
      await announcementsAPI.create({
        title: formData.title,
        content: formData.content,
      });
      await loadAnnouncements();
      setShowCreateModal(false);
      setFormData({ title: "", content: "" });
      addNotification({
        type: "success",
        title: "Created",
        message: "Announcement added",
      });
    } catch (e) {
      addNotification({ type: "error", title: "Failed", message: "Try again" });
    }
  };

  const handleEditAnnouncement = async () => {
    if (!formData.title.trim() || !editingAnnouncement) return;
    try {
      await announcementsAPI.update(
        editingAnnouncement.announcement_id || editingAnnouncement.id,
        { title: formData.title, content: formData.content },
      );
      await loadAnnouncements();
      setShowEditModal(false);
      setEditingAnnouncement(null);
      setFormData({ title: "", content: "" });
      addNotification({ type: "success", title: "Updated" });
    } catch (e) {
      addNotification({ type: "error", title: "Failed" });
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm("Delete?")) return;
    try {
      await announcementsAPI.remove(id);
      await loadAnnouncements();
      addNotification({ type: "success", title: "Deleted" });
    } catch (e) {
      addNotification({ type: "error", title: "Failed" });
    }
  };

  const openEditAnnouncement = (ann) => {
    setEditingAnnouncement(ann);
    setFormData({ title: ann.title, content: ann.content || "" });
    setShowEditModal(true);
  };

  const handleCreateEvent = async () => {
    if (
      !eventFormData.title.trim() ||
      !eventFormData.location.trim() ||
      !eventFormData.start_date ||
      !eventFormData.end_date
    )
      return;
    try {
      await eventsAPI.create(eventFormData);
      await loadEvents();
      setShowCreateEventModal(false);
      setEventFormData({
        title: "",
        location: "",
        start_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
        description: "",
      });
    } catch (e) {
      console.error("Error creating event:", e);
    }
  };

  const handleEditEvent = async () => {
    if (!eventFormData.title.trim() || !editingEvent) return;
    try {
      await eventsAPI.update(
        editingEvent.event_id || editingEvent.id,
        eventFormData,
      );
      await loadEvents();
      setShowEditEventModal(false);
      setEditingEvent(null);
      setEventFormData({
        title: "",
        location: "",
        start_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
        description: "",
      });
    } catch (e) {
      console.error("Error editing event:", e);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm("Delete?")) return;
    try {
      await eventsAPI.remove(id);
      await loadEvents();
    } catch (e) {
      console.error("Error deleting event:", e);
    }
  };

  const openEditEvent = (e) => {
    setEditingEvent(e);
    setEventFormData({
      title: e.title,
      location: e.location || "",
      start_date: formatDateForInput(e.start_date) || "", // ← FIXED
      end_date: formatDateForInput(e.end_date) || "", // ← FIXED
      start_time: e.start_time || "",
      end_time: e.end_time || "",
      description: e.description || "",
    });
    setShowEditEventModal(true);
  };

  // useEffect for filtered projects
  useEffect(() => {
    setFilteredProjects(projects);
  }, [projects]);

  // useEffect for filtered history
  useEffect(() => {
    setFilteredHistory(history);
  }, [history]);

  // Project Activity Functions
  const loadProjects = async () => {
    try {
      const res = await projectsAPI.getAll();
      setProjects(res.data ?? res.projects ?? res ?? []);
      setFilteredProjects(res.data ?? res.projects ?? res ?? []);
    } catch (e) {
      console.error("Error loading projects:", e);
      setProjects([]);
      setFilteredProjects([]);
    }
  };

  // Barangay History Functions
  const loadHistory = async () => {
    try {
      const res = await barangayHistoryAPI.getAll();
      setHistory(res.history ?? res.data ?? res ?? []);
      setFilteredHistory(res.history ?? res.data ?? res ?? []);
    } catch (e) {
      console.error("Error loading history:", e);
      setHistory([]);
      setFilteredHistory([]);
    }
  };

  const handleHistorySearch = () => {
    if (!historySearch.trim()) {
      setFilteredHistory(history);
      return;
    }
    const term = historySearch.toLowerCase();
    const filtered = history.filter(
      (h) =>
        h.title?.toLowerCase().includes(term) ||
        h.category?.toLowerCase().includes(term) ||
        h.year?.toString().includes(term),
    );
    setFilteredHistory(filtered);
  };

  const handleHistoryFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext !== "doc" && ext !== "docx") {
        addNotification({
          type: "error",
          title: "Invalid File Type",
          message: "Only .doc and .docx files are allowed",
        });
        e.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        addNotification({
          type: "error",
          title: "File Too Large",
          message: "File size must be less than 10MB",
        });
        e.target.value = "";
        return;
      }
      setHistoryFile(file);
      setHistoryFilePreview(file.name);
    }
  };

  const handleCreateHistory = async () => {
    if (!historyFormData.title.trim()) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Title is required",
      });
      return;
    }
    if (!historyFile) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Document file is required",
      });
      return;
    }

    setUploadingHistoryFile(true);
    try {
      await barangayHistoryAPI.create({
        title: historyFormData.title,
        year: historyFormData.year,
        category: historyFormData.category,
        file: historyFile,
      });
      await loadHistory();
      setShowCreateHistoryModal(false);
      setHistoryFormData({
        title: "",
        content: "",
        year: new Date().getFullYear(),
        category: "general",
        file_url: "",
      });
      setHistoryFile(null);
      setHistoryFilePreview(null);
      addNotification({
        type: "success",
        title: "Created",
        message: "History entry created successfully",
      });
    } catch (e) {
      console.error("Error creating history:", e);
      addNotification({
        type: "error",
        title: "Failed",
        message: e.message || "Failed to create history entry",
      });
    } finally {
      setUploadingHistoryFile(false);
    }
  };

  const handleEditHistory = async () => {
    if (!historyFormData.title.trim() || !editingHistory) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Title is required",
      });
      return;
    }

    setUploadingHistoryFile(true);
    try {
      const payload = {
        title: historyFormData.title,
        year: historyFormData.year,
        category: historyFormData.category,
      };

      // Only add file if a new one was selected
      if (historyFile) {
        payload.file = historyFile;
      }

      await barangayHistoryAPI.update(
        editingHistory.history_id || editingHistory.id,
        payload,
      );
      await loadHistory();
      setShowEditHistoryModal(false);
      setEditingHistory(null);
      setHistoryFormData({
        title: "",
        content: "",
        year: new Date().getFullYear(),
        category: "general",
        file_url: "",
      });
      setHistoryFile(null);
      setHistoryFilePreview(null);
      addNotification({
        type: "success",
        title: "Updated",
        message: "History entry updated successfully",
      });
    } catch (e) {
      console.error("Error editing history:", e);
      addNotification({
        type: "error",
        title: "Failed",
        message: e.message || "Failed to update history entry",
      });
    } finally {
      setUploadingHistoryFile(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    if (!confirm("Delete this history entry?")) return;
    try {
      await barangayHistoryAPI.remove(id);
      await loadHistory();
      addNotification({
        type: "success",
        title: "Deleted",
        message: "History entry deleted successfully",
      });
    } catch (e) {
      console.error("Error deleting history:", e);
      addNotification({
        type: "error",
        title: "Failed",
        message: "Failed to delete history entry",
      });
    }
  };

  const openEditHistory = (h) => {
    setEditingHistory(h);
    setHistoryFormData({
      title: h.title || "",
      content: h.content || "",
      year: h.year || new Date().getFullYear(),
      category: h.category || "general",
      file_url: h.file_url || "",
    });
    setHistoryFile(null);
    setHistoryFilePreview(h.file_url ? h.file_url.split("/").pop() : null);
    setShowEditHistoryModal(true);
  };

  const handleProjectSearch = () => {
    if (!projectSearch.trim()) {
      setFilteredProjects(projects);
      return;
    }
    const term = projectSearch.toLowerCase();
    const filtered = projects.filter(
      (p) =>
        p.title?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.location?.toLowerCase().includes(term) ||
        p.contractor?.toLowerCase().includes(term),
    );
    setFilteredProjects(filtered);
  };

  const handleCreateProject = async () => {
    if (!projectFormData.title.trim() || !projectFormData.contractor.trim()) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Title and Contractor are required",
      });
      return;
    }

    try {
      const createData = {
        title: projectFormData.title,
        status: projectFormData.status,
        budget: projectFormData.budget || null, // Convert empty string to null
        expected_completion:
          formatDateForInput(projectFormData.expected_completion) || null,
        start_date: formatDateForInput(projectFormData.start_date) || null,
        contractor: projectFormData.contractor,
        category: projectFormData.category || "infrastructure", // FIXED: was undefined variable
        location: projectFormData.location || null,
        implementing_office: projectFormData.implementing_office || null,
        source_of_fund: projectFormData.source_of_fund || null,
        description: projectFormData.description || null,
      };

      console.log("📤 Sending create data:", createData);

      await projectsAPI.create(createData);
      await loadProjects();
      setShowCreateProjectModal(false);
      setProjectFormData({
        title: "",
        description: "",
        location: "",
        contractor: "",
        start_date: "",
        expected_completion: "",
        budget: "",
        implementing_office: "",
        source_of_fund: "",
        status: "planning",
        category: "infrastructure",
      });
      addNotification({
        type: "success",
        title: "Created",
        message: "Project created successfully",
      });
    } catch (e) {
      console.error("❌ Error creating project:", e);
      addNotification({
        type: "error",
        title: "Failed",
        message: e.message || "Failed to create project",
      });
    }
  };

  const handleEditProject = async () => {
    if (!projectFormData.title.trim() || !editingProject) return;

    try {
      // Prepare the data with null for empty values instead of undefined
      const updateData = {
        title: projectFormData.title,
        status: projectFormData.status,
        budget: projectFormData.budget || null, // Convert empty string to null
        expected_completion:
          formatDateForInput(projectFormData.expected_completion) || null,
        start_date: formatDateForInput(projectFormData.start_date) || null,
        contractor: projectFormData.contractor,
        category: projectFormData.category || "infrastructure", // FIXED: was undefined variable
        location: projectFormData.location || null,
        implementing_office: projectFormData.implementing_office || null,
        source_of_fund: projectFormData.source_of_fund || null,
        description: projectFormData.description || null,
      };

      console.log("📤 Sending update data:", updateData);

      await projectsAPI.update(
        editingProject.project_id || editingProject.id,
        updateData,
      );

      await loadProjects();
      setShowEditProjectModal(false);
      setEditingProject(null);
      setProjectFormData({
        title: "",
        description: "",
        location: "",
        contractor: "",
        start_date: "",
        expected_completion: "",
        budget: "",
        implementing_office: "",
        source_of_fund: "",
        status: "planning",
        category: "infrastructure",
      });
      addNotification({
        type: "success",
        title: "Updated",
        message: "Project updated successfully",
      });
    } catch (e) {
      console.error("❌ Error editing project:", e);
      addNotification({
        type: "error",
        title: "Failed",
        message: e.message || "Failed to update project",
      });
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm("Delete this project?")) return;
    try {
      await projectsAPI.delete(id);
      await loadProjects();
      addNotification({
        type: "success",
        title: "Deleted",
        message: "Project deleted successfully",
      });
    } catch (e) {
      console.error("Error deleting project:", e);
      addNotification({
        type: "error",
        title: "Failed",
        message: "Failed to delete project",
      });
    }
  };

  const openEditProject = (p) => {
    setEditingProject(p);
    setProjectFormData({
      title: p.title || "",
      description: p.description || "",
      location: p.location || "",
      contractor: p.contractor || "",
      start_date: formatDateForInput(p.start_date) || "",
      expected_completion: formatDateForInput(p.expected_completion) || "",
      budget: p.budget || "",
      implementing_office: p.implementing_office || "",
      source_of_fund: p.source_of_fund || "",
      status: p.status || "planning",
      category: p.category || "infrastructure", // Add this line
    });
    setShowEditProjectModal(true);
  };

  const openCreate = (type) => {
    setForm({
      name: "",
      position_id: "",
      term_start: "",
      term_end: "",
      phone: "",
      email: "",
      address: "",
      bio: "",
      image: "",
    });
    setImageFile(null);
    setImagePreview(null);
    if (type === "off") {
      setEditingOfficial(null);
      setShowCreateOfficialModal(true);
    }
  };

  const openEdit = (type, item) => {
    setForm({
      name: item.name ?? "",
      position_id: item.position_id?.toString() ?? "",
      term_start: item.term_start ?? "",
      term_end: item.term_end ?? "",
      phone: item.phone ?? "",
      email: item.email ?? "",
      address: item.address ?? "",
      bio: item.bio ?? "",
      image: item.image ?? "",
    });
    setImageFile(null);

    // Construct full image URL if path is relative
    if (item.image) {
      const backendURL =
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:5000";
      const imageUrl = item.image.startsWith("/uploads")
        ? `${backendURL}${item.image}`
        : item.image;
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }

    if (type === "off") {
      setEditingOfficial(item);
      setShowEditOfficialModal(true);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        addNotification({
          type: "error",
          title: "Invalid File",
          message: "Please select a valid image file",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        addNotification({
          type: "error",
          title: "File Too Large",
          message: "Image size must be less than 5MB",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      let imageUrl = form.image;

      // Upload image if a new file was selected
      if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append("image", imageFile);
        const token = localStorage.getItem("authToken");
        if (!token) {
          addNotification({
            type: "error",
            title: "Authentication required",
          });
          return;
        }

        const uploadResponse = await fetch(
          "https://uims-backend-production.up.railway.app/api/upload/image",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formDataImage,
          },
        );

        if (!uploadResponse.ok) {
          const err = await uploadResponse.text();
          addNotification({ type: "error", title: "Image upload failed" });
          return;
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      const payload = {
        name: form.name,
        position_id: parseInt(form.position_id),
        term_start: form.term_start,
        term_end: form.term_end,
        phone: form.phone,
        email: form.email,
        address: form.address,
        bio: form.bio,
        image: imageUrl,
      };

      if (editingOfficial) {
        await officialsAPI.update(
          editingOfficial.official_id || editingOfficial.id,
          payload,
        );
        addNotification({ type: "success", title: "Official Updated" });
      } else {
        await officialsAPI.create(payload);
        addNotification({ type: "success", title: "Official Created" });
      }

      await loadOfficials();
      setShowCreateOfficialModal(false);
      setShowEditOfficialModal(false);
      setEditingOfficial(null);
      setImageFile(null);
      setImagePreview(null);
      setForm({
        name: "",
        position_id: "",
        term_start: "",
        term_end: "",
        phone: "",
        email: "",
        address: "",
        bio: "",
        image: "",
      });
    } catch (e) {
      console.error("Save error:", e);
      addNotification({
        type: "error",
        title: "The position has already reached it's limit!",
      });
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm("Delete this official?")) return;
    if (type === "off") {
      try {
        await officialsAPI.remove(id);
        await loadOfficials();
        addNotification({ type: "success", title: "Deleted" });
      } catch (e) {
        console.error("Delete error:", e);
        addNotification({ type: "error", title: "Failed to delete" });
      }
    }
  };

  // Replace the handleFileChange function in BarangayInfo.jsx

  const handleFileChange = async (mapType, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addNotification({
        type: "error",
        title: "Invalid File",
        message: "Please upload an image file only",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      addNotification({
        type: "error",
        title: "File Too Large",
        message: "Maximum file size is 10MB",
      });
      return;
    }

    setUploading(true);

    try {
      // Pass file and mapType directly - spotmapsAPI.upload will create FormData
      const res = await spotmapsAPI.upload(file, mapType);

      if (!res.success) throw new Error(res.message);

      await loadSpotMaps();

      addNotification({
        type: "success",
        title: "Upload Successful",
        message: `${mapType} has been updated`,
      });
    } catch (err) {
      console.error("Upload error:", err);
      addNotification({
        type: "error",
        title: "Upload Failed",
        message: err.message || "Failed to upload spot map",
      });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDeleteMapImage = async (mapType) => {
    if (!confirm("Delete this map?")) return;
    try {
      await spotmapsAPI.delete(mapType);
      updateMapImages({ ...mapImages, [mapType]: "" });
      addNotification({ type: "success", title: "Deleted" });
    } catch (err) {
      addNotification({ type: "error", title: "Failed" });
    }
  };

  const renderMapSection = (mapType, title) => {
    const imageUrl = mapImages[mapType];
    return (
      <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin size={16} /> {title}
            </h3>
            {isEditingMaps && imageUrl && (
              <button
                onClick={() => handleDeleteMapImage(mapType)}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 hover:scale-110"
                disabled={uploading}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div className="relative overflow-hidden p-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-48 object-contain rounded-xl cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() =>
                  !isEditingMaps && window.open(imageUrl, "_blank")
                }
              />
            ) : (
              <div className="h-48 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <div className="text-center">
                  <Image size={32} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">
                    No image available
                  </p>
                  {isEditingMaps && (
                    <p className="text-gray-400 text-xs mt-1">
                      Upload a new image
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          {isEditingMaps && (
            <div className="p-4 border-t border-gray-200 bg-gray-50/50">
              <label className="block text-sm font-medium text-gray-700">
                Upload New {title}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(mapType, e)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={uploading}
              />
              <p className="text-xs text-gray-500">
                JPEG, PNG, GIF, WebP (Max: 5MB)
              </p>
              {uploading && (
                <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>{" "}
                  Uploading...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const infoItems = [
    {
      title: "Announcements",
      icon: Bell,
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
      description: "View and manage public announcements",
      onOpen: () => setOpenAnn(true),
      count: announcements.length,
    },
    {
      title: "Events",
      icon: Calendar,
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      description: "Community events and schedules",
      onOpen: () => setOpenEvt(true),
      count: events.length,
    },
    {
      title: "History",
      icon: FileText,
      color: "bg-gradient-to-br from-gray-500 to-slate-500",
      description: "Barangay history and milestones",
      onOpen: () => setOpenHistory(true),
      count: history.length,
    },
    {
      title: "Spot Map",
      icon: MapPin,
      color: "bg-gradient-to-br from-emerald-500 to-teal-500",
      description: "Geographical spot map",
      onOpen: () => setOpenSpotMap(true),
      count: 3,
    },
    {
      title: "Officials & Workers",
      icon: UserCheck,
      color: "bg-gradient-to-br from-indigo-500 to-blue-500",
      description: "Create, edit, and delete barangay officials",
      onOpen: () => setOpenOff(true),
      count: officials.length,
    },
    {
      title: "Project Activities",
      icon: ClipboardList,
      color: "bg-gradient-to-br from-amber-500 to-orange-500",
      description: "Manage community project activities",
      onOpen: () => setOpenProj(true),
      count: projects.length,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] relative overflow-hidden">
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />

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

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="relative mb-12">
            <div className="bg-gradient-to-br from-[#0F4C81] via-[#58A1D3] to-[#B3DEF8] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
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
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText size={30} className="text-yellow-300" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                        <span className="text-cyan-200 text-xs sm:text-sm font-medium tracking-widest">
                          BARANGAY INFORMATION
                        </span>
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-bold mb-1 drop-shadow-lg">
                        Information Hub
                      </h2>
                      <p className="text-cyan-100 text-sm sm:text-base">
                        Access announcements, events, officials, and community
                        resources
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

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {infoItems.map((item, i) => (
              <div
                key={i}
                className={isVisible ? "animate-fadeIn" : ""}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <InfoCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements Modal */}
      <Modal
        isOpen={openAnn}
        onClose={() => setOpenAnn(false)}
        title="Announcements"
        subtitle="Manage community announcements"
      >
        <div className="space-y-6">
          <SearchBar
            placeholder="Search announcements..."
            value={announcementSearch}
            onChange={(e) => setAnnouncementSearch(e.target.value)}
            onSearch={handleAnnouncementSearch}
          />
          <div className="flex justify-center">
            <button
              onClick={() => {
                setFormData({ title: "", content: "" });
                setShowCreateModal(true);
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl hover:shadow-xl flex items-center gap-3 font-medium transform hover:scale-105"
            >
              <Plus size={20} /> Create Announcement
            </button>
          </div>
          <div className="space-y-4">
            {filteredAnnouncements.map((a) => (
              <div
                key={a.announcement_id || a.id}
                className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg p-6 transition-all duration-300 border border-white/20 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300 mb-2">
                      {a.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />{" "}
                      <span>
                        {formatDisplayDate(a.posted_date || a.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditAnnouncement(a)}
                      className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl hover:scale-105"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteAnnouncement(a.announcement_id || a.id)
                      }
                      className="p-3 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-xl hover:scale-105"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {a.content && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-[#B3DEF8]/20 to-cyan-50/50 rounded-xl border-l-4 border-[#58A1D3]">
                    <p className="text-gray-700 leading-relaxed">{a.content}</p>
                  </div>
                )}
              </div>
            ))}
            {filteredAnnouncements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No announcements found
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ title: "", content: "" });
        }}
        title="Create New Announcement"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3]"
              placeholder="Enter title"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] min-h-32"
              placeholder="Enter details"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setFormData({ title: "", content: "" });
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAnnouncement}
              disabled={!formData.title.trim()}
              className="px-6 py-3 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:scale-105 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Announcement Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Announcement"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] min-h-32"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditAnnouncement}
              disabled={!formData.title.trim()}
              className="px-6 py-3 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:scale-105 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Events Modal */}
      <Modal
        isOpen={openEvt}
        onClose={() => setOpenEvt(false)}
        title="Events Management"
        subtitle="Manage community events"
      >
        <div className="space-y-6">
          <SearchBar
            placeholder="Search events..."
            value={eventSearch}
            onChange={(e) => setEventSearch(e.target.value)}
            onSearch={handleEventSearch}
          />
          <div className="flex justify-center">
            <button
              onClick={() => setShowCreateEventModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 group flex items-center gap-3 font-medium transform hover:scale-105"
            >
              <Plus
                size={20}
                className="group-hover:rotate-90 transition-transform duration-300"
              />{" "}
              Create Event
            </button>
          </div>
          <div className="space-y-4">
            {filteredEvents.map((e) => (
              <div
                key={e.event_id ?? e.id}
                className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg p-6 transition-all duration-300 border border-white/20 hover:shadow-xl hover:shadow-purple-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#06172E] group-hover:text-purple-600 transition-colors duration-300">
                        {e.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin size={14} /> <span>{e.location}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {e.start_date} {e.start_time && `at ${e.start_time}`} -{" "}
                        {e.end_date} {e.end_time && `at ${e.end_time}`}
                      </div>
                      {e.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {e.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditEvent(e)}
                      className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-110"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(e.event_id ?? e.id)}
                      className="p-2.5 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-110"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No events found
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Create/Edit Event Modals */}
      <Modal
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        title="Create New Event"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={eventFormData.title}
              onChange={(e) =>
                setEventFormData({ ...eventFormData, title: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500"
              placeholder="Enter title"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              value={eventFormData.location}
              onChange={(e) =>
                setEventFormData({ ...eventFormData, location: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500"
              placeholder="Enter location"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CalendarInput
              label="Start Date *"
              value={formatDateForInput(eventFormData.start_date)}
              onChange={(e) =>
                setEventFormData({
                  ...eventFormData,
                  start_date: e.target.value,
                })
              }
              required
            />
            <CalendarInput
              label="End Date *"
              value={formatDateForInput(eventFormData.end_date)}
              onChange={(e) =>
                setEventFormData({ ...eventFormData, end_date: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={eventFormData.start_time}
                onChange={(e) =>
                  setEventFormData({
                    ...eventFormData,
                    start_time: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={eventFormData.end_time}
                onChange={(e) =>
                  setEventFormData({
                    ...eventFormData,
                    end_time: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={eventFormData.description}
              onChange={(e) =>
                setEventFormData({
                  ...eventFormData,
                  description: e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 min-h-32"
              placeholder="Enter details"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={() => setShowCreateEventModal(false)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateEvent}
              disabled={
                !eventFormData.title.trim() ||
                !eventFormData.location.trim() ||
                !eventFormData.start_date ||
                !eventFormData.end_date
              }
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:scale-105 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditEventModal}
        onClose={() => setShowEditEventModal(false)}
        title="Edit Event"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={eventFormData.title}
              onChange={(e) =>
                setEventFormData({ ...eventFormData, title: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              value={eventFormData.location}
              onChange={(e) =>
                setEventFormData({ ...eventFormData, location: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CalendarInput
              label="Start Date *"
              value={formatDateForInput(eventFormData.start_date)}
              onChange={(e) =>
                setEventFormData({
                  ...eventFormData,
                  start_date: e.target.value,
                })
              }
              required
            />
            <CalendarInput
              label="End Date *"
              value={formatDateForInput(eventFormData.end_date)}
              onChange={(e) =>
                setEventFormData({ ...eventFormData, end_date: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={eventFormData.start_time}
                onChange={(e) =>
                  setEventFormData({
                    ...eventFormData,
                    start_time: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={eventFormData.end_time}
                onChange={(e) =>
                  setEventFormData({
                    ...eventFormData,
                    end_time: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={eventFormData.description}
              onChange={(e) =>
                setEventFormData({
                  ...eventFormData,
                  description: e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 min-h-32"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={() => setShowEditEventModal(false)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditEvent}
              disabled={
                !eventFormData.title.trim() ||
                !eventFormData.location.trim() ||
                !eventFormData.start_date ||
                !eventFormData.end_date
              }
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:scale-105 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Officials Modal */}
      <Modal
        isOpen={openOff}
        onClose={() => setOpenOff(false)}
        title="Manage Officials & Workers"
        subtitle="Create, edit, and delete barangay officials"
      >
        <div className="space-y-6">
          <div className="flex justify-center">
            <button
              onClick={() => openCreate("off")}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-2xl hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 group flex items-center gap-3 font-medium transform hover:scale-105"
            >
              <Plus
                size={20}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
              Add New Official
            </button>
          </div>
          <div className="space-y-4">
            {officials.map((o) => (
              <div
                key={o.official_id || o.id}
                className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg p-6 transition-all duration-300 border border-white/20 hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110">
                      <UserCheck className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#06172E] group-hover:text-indigo-600">
                        {o.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {o.position_name || o.position}
                      </p>
                      {(o.term_start || o.term_end) && (
                        <p className="text-xs text-gray-500">
                          {o.term_start} – {o.term_end}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit("off", o)}
                      className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl hover:scale-110"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete("off", o.official_id || o.id)}
                      className="p-2.5 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-xl hover:scale-110"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {officials.length === 0 && (
              <div className="text-center py-12 bg-white/90 rounded-3xl border border-gray-200">
                <UserCheck size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No officials found</p>
                <p className="text-gray-400 text-sm mt-1">
                  Create your first official to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Create Official Modal */}
      <Modal
        isOpen={showCreateOfficialModal}
        onClose={() => {
          setShowCreateOfficialModal(false);
          setImageFile(null);
          setImagePreview(null);
        }}
        title="Add New Official"
        subtitle="Create a new barangay official"
      >
        <div className="space-y-6">
          {/* Photo Upload - Centered at top */}
          <div className="flex flex-col items-center">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Photo
            </label>
            <div className="space-y-3 flex flex-col items-center">
              {imagePreview && (
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-200 shadow-lg">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setForm({ ...form, image: "" });
                    }}
                    className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              <p className="text-xs text-gray-500 text-center">
                Recommended: Square image, max 5MB (JPEG, PNG, GIF)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Position *
              </label>
              <select
                value={form.position_id}
                onChange={(e) =>
                  setForm({ ...form, position_id: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="">Select position</option>
                {positions.map((p) => (
                  <option key={p.position_id} value={p.position_id}>
                    {p.position_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Term Start *
              </label>
              <input
                type="date"
                value={form.term_start}
                onChange={(e) =>
                  setForm({ ...form, term_start: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Term End *
              </label>
              <input
                type="date"
                value={form.term_end}
                onChange={(e) => setForm({ ...form, term_end: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                placeholder="Contact number"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                placeholder="email@example.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all min-h-24"
                placeholder="Short biography..."
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={() => {
                setShowCreateOfficialModal(false);
                setImageFile(null);
                setImagePreview(null);
              }}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={
                !form.name ||
                !form.position_id ||
                !form.term_start ||
                !form.term_end
              }
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl hover:scale-105 disabled:opacity-50 transition-all"
            >
              Create Official
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Official Modal */}
      <Modal
        isOpen={showEditOfficialModal}
        onClose={() => {
          setShowEditOfficialModal(false);
          setEditingOfficial(null);
          setImageFile(null);
          setImagePreview(null);
        }}
        title="Edit Official"
        subtitle="Update official information"
      >
        <div className="space-y-6">
          {/* Photo Upload - Centered at top */}
          <div className="flex flex-col items-center">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Photo
            </label>
            <div className="space-y-3 flex flex-col items-center">
              {imagePreview && (
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-200 shadow-lg">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setForm({ ...form, image: "" });
                    }}
                    className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              <p className="text-xs text-gray-500 text-center">
                Recommended: Square image, max 5MB (JPEG, PNG, GIF)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Position *
              </label>
              <select
                value={form.position_id}
                onChange={(e) =>
                  setForm({ ...form, position_id: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="">Select position</option>
                {positions.map((p) => (
                  <option key={p.position_id} value={p.position_id}>
                    {p.position_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Term Start *
              </label>
              <input
                type="date"
                value={form.term_start}
                onChange={(e) =>
                  setForm({ ...form, term_start: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Term End *
              </label>
              <input
                type="date"
                value={form.term_end}
                onChange={(e) => setForm({ ...form, term_end: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                placeholder="Contact number"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                placeholder="email@example.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all min-h-24"
                placeholder="Short biography..."
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={() => {
                setShowEditOfficialModal(false);
                setEditingOfficial(null);
                setImageFile(null);
                setImagePreview(null);
              }}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={
                !form.name ||
                !form.position_id ||
                !form.term_start ||
                !form.term_end
              }
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl hover:scale-105 disabled:opacity-50 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Project Activities Modal - ENHANCED VERSION */}
      <Modal
        isOpen={openProj}
        onClose={() => setOpenProj(false)}
        title="Project Activities Management"
        subtitle="Create, edit, and manage community project activities"
      >
        <div className="space-y-6">
          <SearchBar
            placeholder="Search projects by title, location, or contractor..."
            value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
            onSearch={handleProjectSearch}
          />
          <div className="flex justify-center">
            <button
              onClick={() => setShowCreateProjectModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 group flex items-center gap-3 font-medium transform hover:scale-105"
            >
              <Plus
                size={20}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
              Create New Project
            </button>
          </div>

          <div className="space-y-4">
            {filteredProjects.map((p) => (
              <div
                key={p.project_id ?? p.id}
                className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg p-6 transition-all duration-300 border border-white/20 hover:shadow-xl hover:shadow-orange-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  {/* Header with Title and Actions */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <ClipboardList className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#06172E] group-hover:text-orange-600 transition-colors duration-300 mb-2">
                          {p.title}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                              p.status === "completed"
                                ? "bg-green-100 text-green-800 border border-green-300"
                                : p.status === "ongoing"
                                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                                  : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                            }`}
                          >
                            {p.status?.toUpperCase()}
                          </span>
                          {p.budget && (
                            <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                              Budget: {p.budget}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditProject(p)}
                        className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-110"
                        title="Edit Project"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteProject(p.project_id ?? p.id)
                        }
                        className="p-3 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-110"
                        title="Delete Project"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Project Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={16}
                        className="text-orange-500 mt-1 flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Location
                        </p>
                        <p className="text-sm text-gray-700">
                          {p.location || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <UserCheck
                        size={16}
                        className="text-orange-500 mt-1 flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Contractor
                        </p>
                        <p className="text-sm text-gray-700">
                          {p.contractor || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar
                        size={16}
                        className="text-orange-500 mt-1 flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Start Date
                        </p>
                        <p className="text-sm text-gray-700">
                          {formatDateForInput(p.start_date) || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar
                        size={16}
                        className="text-orange-500 mt-1 flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Expected Completion
                        </p>
                        <p className="text-sm text-gray-700">
                          {formatDateForInput(p.expected_completion) ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>
                    {p.implementing_office && (
                      <div className="flex items-start gap-2">
                        <FileText
                          size={16}
                          className="text-orange-500 mt-1 flex-shrink-0"
                        />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Implementing Office
                          </p>
                          <p className="text-sm text-gray-700">
                            {p.implementing_office}
                          </p>
                        </div>
                      </div>
                    )}
                    {p.source_of_fund && (
                      <div className="flex items-start gap-2">
                        <FileText
                          size={16}
                          className="text-orange-500 mt-1 flex-shrink-0"
                        />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Source of Fund
                          </p>
                          <p className="text-sm text-gray-700">
                            {p.source_of_fund}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {p.description && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-l-4 border-orange-400">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        Description
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filteredProjects.length === 0 && (
              <div className="text-center py-12 bg-white/90 rounded-3xl border border-gray-200">
                <ClipboardList
                  size={48}
                  className="text-gray-300 mx-auto mb-4"
                />
                <p className="text-gray-500 font-medium">No projects found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {projectSearch
                    ? "Try a different search term"
                    : "Create your first project to get started"}
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        title="Create New Project"
        subtitle="Add a new community project activity"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={projectFormData.title}
              onChange={(e) =>
                setProjectFormData({
                  ...projectFormData,
                  title: e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              placeholder="Enter project title"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={projectFormData.location}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    location: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                placeholder="Project location"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contractor *
              </label>
              <input
                type="text"
                value={projectFormData.contractor}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    contractor: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                placeholder="Contractor name"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CalendarInput
              label="Start Date"
              value={formatDateForInput(projectFormData.start_date)}
              onChange={(e) =>
                setProjectFormData({
                  ...projectFormData,
                  start_date: e.target.value,
                })
              }
            />
            <CalendarInput
              label="Expected Completion"
              value={formatDateForInput(projectFormData.expected_completion)}
              onChange={(e) =>
                setProjectFormData({
                  ...projectFormData,
                  expected_completion: e.target.value,
                })
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ADDED: Category Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={projectFormData.category || "infrastructure"}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    category: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              >
                <option value="infrastructure">Infrastructure</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
                <option value="environment">Environment</option>
                <option value="social">Social Services</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Budget (₱)
              </label>
              <input
                type="text"
                value={projectFormData.budget}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    budget: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                placeholder="₱0.00"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={projectFormData.status}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    status: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              >
                <option value="planning">Planning</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Implementing Office
              </label>
              <input
                type="text"
                value={projectFormData.implementing_office}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    implementing_office: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                placeholder="Office name"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Source of Fund
              </label>
              <input
                type="text"
                value={projectFormData.source_of_fund}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    source_of_fund: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                placeholder="Funding source"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={projectFormData.description}
              onChange={(e) =>
                setProjectFormData({
                  ...projectFormData,
                  description: e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all min-h-32"
              placeholder="Project description and objectives"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={() => setShowCreateProjectModal(false)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProject}
              disabled={
                !projectFormData.title.trim() ||
                !projectFormData.contractor.trim()
              }
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Create Project
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={showEditProjectModal}
        onClose={() => setShowEditProjectModal(false)}
        title="Edit Project"
        subtitle="Update project information"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={projectFormData.title}
              onChange={(e) =>
                setProjectFormData({
                  ...projectFormData,
                  title: e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={projectFormData.location}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    location: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contractor *
              </label>
              <input
                type="text"
                value={projectFormData.contractor}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    contractor: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CalendarInput
              label="Start Date"
              value={formatDateForInput(projectFormData.start_date)}
              onChange={(e) =>
                setProjectFormData({
                  ...projectFormData,
                  start_date: e.target.value,
                })
              }
            />
            <CalendarInput
              label="Expected Completion"
              value={formatDateForInput(projectFormData.expected_completion)}
              onChange={(e) =>
                setProjectFormData({
                  ...projectFormData,
                  expected_completion: e.target.value,
                })
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ADDED: Category Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={projectFormData.category || "infrastructure"}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    category: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              >
                <option value="infrastructure">Infrastructure</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
                <option value="environment">Environment</option>
                <option value="social">Social Services</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Budget (₱)
              </label>
              <input
                type="text"
                value={projectFormData.budget}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    budget: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={projectFormData.status}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    status: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              >
                <option value="planning">Planning</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Implementing Office
              </label>
              <input
                type="text"
                value={projectFormData.implementing_office}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    implementing_office: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Source of Fund
              </label>
              <input
                type="text"
                value={projectFormData.source_of_fund}
                onChange={(e) =>
                  setProjectFormData({
                    ...projectFormData,
                    source_of_fund: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={projectFormData.description}
              onChange={(e) =>
                setProjectFormData({
                  ...projectFormData,
                  description: e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all min-h-32"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={() => setShowEditProjectModal(false)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleEditProject}
              disabled={
                !projectFormData.title.trim() ||
                !projectFormData.contractor.trim()
              }
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={openHistory}
        onClose={() => setOpenHistory(false)}
        title="Barangay History"
        subtitle="Manage historical records and milestones"
      >
        <div className="space-y-6">
          {history.length === 0 && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowCreateHistoryModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-gray-500 to-slate-500 text-white rounded-2xl hover:shadow-xl flex items-center gap-3 font-medium transform hover:scale-105 transition-all"
              >
                <Plus size={20} /> Add History Entry
              </button>
            </div>
          )}
          <div className="space-y-4">
            {filteredHistory.map((h) => (
              <div
                key={h.history_id || h.id}
                className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg p-6 transition-all duration-300 border border-white/20 hover:shadow-xl hover:shadow-gray-500/10"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-[#06172E] group-hover:text-gray-600 transition-colors duration-300">
                        {h.title}
                      </h3>
                      {h.year && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                          {h.year}
                        </span>
                      )}
                      {h.category && (
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                          {h.category}
                        </span>
                      )}
                    </div>
                    {h.file_url && (
                      <div className="mt-3">
                        <a
                          href={`${
                            import.meta.env.VITE_API_URL?.replace("/api", "") ||
                            "http://localhost:5000"
                          }${h.file_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-xl hover:shadow-md transition-all duration-300 text-sm font-medium"
                        >
                          <FileText size={16} />
                          View Document
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditHistory(h)}
                      className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl hover:scale-105 transition-all"
                      title="Edit History"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteHistory(h.history_id || h.id)}
                      className="p-3 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-xl hover:scale-105 transition-all"
                      title="Delete History"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredHistory.length === 0 && (
              <div className="text-center py-12 bg-white/90 rounded-3xl border border-gray-200">
                <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">
                  No history entries found
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {historySearch
                    ? "Try a different search term"
                    : "Add your first history entry to get started"}
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Create History Modal */}
      <Modal
        isOpen={showCreateHistoryModal}
        onClose={() => {
          setShowCreateHistoryModal(false);
          setHistoryFile(null);
          setHistoryFilePreview(null);
        }}
        title="Add History Entry"
        subtitle="Upload a historical document"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={historyFormData.title}
              onChange={(e) =>
                setHistoryFormData({
                  ...historyFormData,
                  title: e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all"
              placeholder="Enter title"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Document File * (.doc, .docx only)
            </label>
            <input
              type="file"
              accept=".doc,.docx"
              onChange={handleHistoryFileChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-blue-500 file:to-cyan-500 file:text-white hover:file:from-blue-600 hover:file:to-cyan-600 file:cursor-pointer file:shadow-md hover:file:shadow-lg transition-all cursor-pointer"
              disabled={uploadingHistoryFile}
            />
            {historyFilePreview && (
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                <FileText size={16} />
                {historyFilePreview}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Only .doc and .docx files (Max: 10MB)
            </p>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={() => {
                setShowCreateHistoryModal(false);
                setHistoryFile(null);
                setHistoryFilePreview(null);
              }}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
              disabled={uploadingHistoryFile}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateHistory}
              disabled={
                !historyFormData.title.trim() ||
                !historyFile ||
                uploadingHistoryFile
              }
              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-slate-500 text-white rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {uploadingHistoryFile ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                "Create Entry"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit History Modal */}
      <Modal
        isOpen={showEditHistoryModal}
        onClose={() => {
          setShowEditHistoryModal(false);
          setEditingHistory(null);
          setHistoryFile(null);
          setHistoryFilePreview(null);
        }}
        title="Edit History Entry"
        subtitle="Update historical document"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={historyFormData.title}
              onChange={(e) =>
                setHistoryFormData({
                  ...historyFormData,
                  title: e.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Document File (.doc, .docx only)
            </label>
            <input
              type="file"
              accept=".doc,.docx"
              onChange={handleHistoryFileChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-blue-500 file:to-cyan-500 file:text-white hover:file:from-blue-600 hover:file:to-cyan-600 file:cursor-pointer file:shadow-md hover:file:shadow-lg transition-all cursor-pointer"
              disabled={uploadingHistoryFile}
            />
            {historyFilePreview && (
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                <FileText size={16} />
                Current: {historyFilePreview}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to keep existing file. Only .doc and .docx files (Max:
              10MB)
            </p>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={() => {
                setShowEditHistoryModal(false);
                setEditingHistory(null);
                setHistoryFile(null);
                setHistoryFilePreview(null);
              }}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
              disabled={uploadingHistoryFile}
            >
              Cancel
            </button>
            <button
              onClick={handleEditHistory}
              disabled={!historyFormData.title.trim() || uploadingHistoryFile}
              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-slate-500 text-white rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {uploadingHistoryFile ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Spot Map Modal */}
      <Modal
        isOpen={openSpotMap}
        onClose={() => setOpenSpotMap(false)}
        title="Spot Maps Management"
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsEditingMaps(!isEditingMaps)}
              className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 ${
                isEditingMaps ? "bg-orange-500" : "bg-gray-600"
              } text-white`}
              disabled={uploading}
            >
              {isEditingMaps ? <Save size={18} /> : <Edit2 size={18} />}
              {isEditingMaps ? "Save" : "Edit Maps"}
            </button>
            {isEditingMaps && (
              <>
                <button
                  onClick={() => setIsEditingMaps(false)}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl flex items-center gap-2"
                  disabled={uploading}
                >
                  <X size={18} /> Cancel
                </button>
                <button
                  onClick={() => setIsEditingMaps(false)}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-xl flex items-center gap-2"
                  disabled={uploading}
                >
                  <Save size={18} /> Save All
                </button>
              </>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderMapSection("spotMap", "Spot Map")}
            {renderMapSection("detailedSpotMap", "Detailed Spot Map")}
            {renderMapSection("evacuationMap", "Evacuation Route")}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BarangayInfo;

// === ANIMATIONS ===
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    @keyframes float { 0%,100% { transform: translateY(0) rotate(0deg); } 33% { transform: translateY(-10px) rotate(120deg); } 66% { transform: translateY(5px) rotate(240deg); } }
    .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
    .animate-float { animation: float 6s ease-in-out infinite; }
  `;
  if (!document.getElementById("barangay-animations")) {
    style.id = "barangay-animations";
    document.head.appendChild(style);
  }
}
