import React, { useState, useEffect, useCallback } from "react";
import {
  Eye,
  Search,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  X,
  FileText,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Menu,
} from "lucide-react";
import { activityAPI } from "../services/api";
import NotificationSystem from "../components/NotificationSystem";

const ActivityLogPage = () => {
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [stats, setStats] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user from localStorage
  useEffect(() => {
    const userData =
      localStorage.getItem("userData") || localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Notification handlers
  const handleRemoveNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const addNotification = useCallback(
    (type, title, message = "", autoDismiss = true) => {
      const newNotification = {
        id: Date.now() + Math.random(),
        type,
        title,
        message,
        autoDismiss,
        timestamp: new Date(),
      };
      setNotifications((prev) => [...prev, newNotification]);
    },
    []
  );

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
        entity_type: typeFilter !== "all" ? typeFilter : undefined,
      };

      const response = await activityAPI.getAll(filters);
      setActivityLog(response.data || []);

      // Fetch stats
      const statsResponse = await activityAPI.getStats();
      setStats(statsResponse.data);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
      addNotification("error", "Load Failed", "Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSearch = () => {
    fetchActivities();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "resolved":
      case "success":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
      case "ongoing":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "failed":
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      case "processing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getActionIcon = (action) => {
    const actionLower = action?.toLowerCase() || "";
    if (actionLower.includes("create") || actionLower.includes("add"))
      return "📝";
    if (actionLower.includes("update") || actionLower.includes("edit"))
      return "✏️";
    if (actionLower.includes("delete") || actionLower.includes("remove"))
      return "🗑️";
    if (actionLower.includes("resolve") || actionLower.includes("complete"))
      return "✅";
    if (actionLower.includes("assign")) return "👤";
    if (actionLower.includes("approve")) return "👍";
    if (actionLower.includes("reject")) return "👎";
    return "📋";
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const formatStatus = (status) => {
    return (
      status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
      "Unknown"
    );
  };

  const MobileActivityCard = ({ data, onView }) => {
    const dateTime = formatDateTime(data.log_time);

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-3 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2 mr-3">
              <FileText size={14} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#0F4C81]">
                {data.entity_identifier || `LOG-${data.log_id}`}
              </div>
              <div className="text-xs text-gray-500">Activity ID</div>
            </div>
          </div>
          <button
            onClick={() => onView(data)}
            className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
            title="View Details"
          >
            <Eye size={14} />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-base mr-2">{getActionIcon(data.action)}</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#06172E] truncate">
                {data.action}
              </div>
              <div className="text-xs text-gray-500">Action</div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-[#06172E] truncate">
              {data.entity_details || "N/A"}
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {data.entity_type || "General"}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-[#06172E] font-medium">
                {dateTime.date}
              </div>
              <div className="text-xs text-gray-500">{dateTime.time}</div>
            </div>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                data.status
              )} shadow-sm`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current mr-1 opacity-70"></div>
              {formatStatus(data.status)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const ActivityRow = ({ data, onView }) => {
    const dateTime = formatDateTime(data.log_time);

    return (
      <tr className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300 border-b border-gray-100 group">
        <td className="px-4 py-3" style={{ width: "15%" }}>
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-2.5 mr-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FileText size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
                {data.entity_identifier || `LOG-${data.log_id}`}
              </div>
              <div className="text-xs text-gray-500">Activity ID</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3" style={{ width: "20%" }}>
          <div className="flex items-center">
            <span className="text-lg mr-3">{getActionIcon(data.action)}</span>
            <div>
              <div className="text-sm font-semibold text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
                {data.action}
              </div>
              <div className="text-xs text-gray-500">Action</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3" style={{ width: "30%" }}>
          <div className="text-sm font-semibold text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
            {data.entity_details || "N/A"}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {data.entity_type || "General"}
          </div>
        </td>
        <td className="px-4 py-3" style={{ width: "20%" }}>
          <div className="text-sm text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
            {dateTime.date}
          </div>
          <div className="text-xs text-gray-500">{dateTime.time}</div>
        </td>
        <td className="px-4 py-3" style={{ width: "10%" }}>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
              data.status
            )} shadow-sm`}
          >
            <div className="w-2 h-2 rounded-full bg-current mr-2 opacity-70"></div>
            {formatStatus(data.status)}
          </span>
        </td>
        <td className="px-4 py-3" style={{ width: "5%" }}>
          <div className="flex justify-center">
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
          </div>
        </td>
      </tr>
    );
  };

  if (error && !selectedActivity) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchActivities}
            className="mt-2 text-blue-600 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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

      <div className="relative z-[100]px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Hero Section */}
          <section className="relative mb-8 sm:mb-12">
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

              <div
                className={`relative transition-all duration-1000 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-6">
                  <div className="flex items-center space-x-4 sm:space-x-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                      <Clock
                        size={isMobile ? 24 : 32}
                        className="text-yellow-300"
                      />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                        <span className="text-cyan-200 text-xs sm:text-sm font-medium tracking-widest">
                          ACTIVITY LOGS
                        </span>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                      </div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 drop-shadow-lg">
                        Activity Management
                      </h2>
                      <p className="text-cyan-100 text-sm sm:text-base lg:text-lg">
                        {currentUser?.role_name === "barangay_captain" ||
                        currentUser?.role_name === "admin"
                          ? "Monitor and track all system activities and user actions"
                          : "View your activity history and track your actions"}
                      </p>
                      {currentUser && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                          <User size={16} className="text-cyan-200" />
                          <span className="text-white text-sm font-medium">
                            {currentUser.role_name === "barangay_captain" ||
                            currentUser.role_name === "admin"
                              ? "Viewing: All Users' Activities"
                              : `Viewing: My Activities (${currentUser.full_name})`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Scroll indicator - centered on mobile, right-aligned on desktop */}
                  <div className="flex flex-col items-center gap-3 mx-auto sm:mx-0">
                    <span className="text-black text-sm font-semibold drop-shadow-lg">
                      Scroll to explore
                    </span>
                    <div className="w-8 h-12 border-4 border-black rounded-full flex justify-center bg-white/90 shadow-lg animate-pulse">
                      <div className="w-2 h-4 bg-black rounded-full mt-2 animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#0F4C81] rounded-full animate-pulse"></div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] bg-clip-text text-transparent">
                Activity Overview
              </h2>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#58A1D3] rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
              {currentUser?.role_name === "barangay_captain" ||
              currentUser?.role_name === "admin"
                ? "Track all system activities with real-time statistics and comprehensive monitoring tools"
                : "Review your activity history with detailed statistics and tracking"}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            <div
              className={`group relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 transition-all duration-500 border border-white/20 cursor-pointer ${
                hoveredCard === "total"
                  ? "transform scale-105 shadow-2xl shadow-blue-500/20 bg-white/95"
                  : "hover:shadow-xl hover:shadow-blue-500/10"
              }`}
              onMouseEnter={() => setHoveredCard("total")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-[100]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2">
                      Total Activities
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
                      {stats?.by_type?.reduce(
                        (sum, item) => sum + item.activities_by_type,
                        0
                      ) || 0}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FileText
                      className="text-white"
                      size={isMobile ? 20 : 28}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`group relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 transition-all duration-500 border border-white/20 cursor-pointer ${
                hoveredCard === "days"
                  ? "transform scale-105 shadow-2xl shadow-orange-500/20 bg-white/95"
                  : "hover:shadow-xl hover:shadow-orange-500/10"
              }`}
              onMouseEnter={() => setHoveredCard("days")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-500/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-[100]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2">
                      Active Days
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
                      {stats?.by_type?.[0]?.active_days || 0}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Calendar
                      className="text-white"
                      size={isMobile ? 20 : 28}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`group relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 transition-all duration-500 border border-white/20 cursor-pointer ${
                hoveredCard === "today"
                  ? "transform scale-105 shadow-2xl shadow-purple-500/20 bg-white/95"
                  : "hover:shadow-xl hover:shadow-purple-500/10"
              }`}
              onMouseEnter={() => setHoveredCard("today")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-[100]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2">
                      Today's Activities
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
                      {stats?.recent_activity?.find(
                        (item) =>
                          item.date === new Date().toISOString().split("T")[0]
                      )?.count || 0}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Clock className="text-white" size={isMobile ? 20 : 28} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 mb-8 sm:mb-12 border border-white/20">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex-1 relative">
                <div className="flex items-center bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mr-2 sm:mr-3">
                    <Search className="text-white" size={isMobile ? 14 : 16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search activities, users, or entities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex items-center bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 flex-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mr-2 sm:mr-3">
                    <Filter className="text-white" size={isMobile ? 14 : 16} />
                  </div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-transparent outline-none text-sm text-gray-700 w-full"
                  >
                    <option value="all">All Types</option>
                    <option value="complaint">Complaints</option>
                    <option value="blotter">Blotter</option>
                    <option value="certificate">Certificates</option>
                    <option value="resident">Residents</option>
                  </select>
                </div>
                <div className="flex items-center bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 flex-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mr-2 sm:mr-3">
                    <Filter className="text-white" size={isMobile ? 14 : 16} />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent outline-none text-sm text-gray-700 w-full"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div className="flex gap-2 sm:gap-4">
                  <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 font-medium flex items-center space-x-2 flex-1 justify-center"
                  >
                    <Search size={isMobile ? 16 : 18} />
                    <span className="text-sm sm:text-base">Search</span>
                  </button>
                  <button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:shadow-lg hover:shadow-gray-500/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 font-medium flex items-center space-x-2 flex-1 justify-center"
                  >
                    <RefreshCw size={isMobile ? 16 : 18} />
                    <span className="text-sm sm:text-base">Clear</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table Container with Fixed Header */}
          <div className="group relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div
              className="relative z-[100] flex flex-col h-full"
              style={{ maxHeight: isMobile ? "60vh" : "70vh" }}
            >
              {/* Mobile View - Cards */}
              {isMobile ? (
                <div className="flex-1 overflow-auto p-4">
                  {loading ? (
                    <div className="text-center py-16">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-[#0F4C81] text-base font-medium">
                          Loading activities...
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                          Please wait while we fetch the data
                        </p>
                      </div>
                    </div>
                  ) : activityLog.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Search size={24} className="text-gray-400" />
                        </div>
                        <p className="text-gray-600 text-lg font-semibold mb-2">
                          No activities found
                        </p>
                        <p className="text-gray-500 text-sm">
                          {searchTerm ||
                          statusFilter !== "all" ||
                          typeFilter !== "all"
                            ? "Try adjusting your search criteria"
                            : "No activities recorded yet"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    activityLog.map((activity) => (
                      <MobileActivityCard
                        key={activity.log_id}
                        data={activity}
                        onView={setSelectedActivity}
                      />
                    ))
                  )}
                </div>
              ) : (
                /* Desktop View - Table */
                <>
                  {/* Fixed Header */}
                  <div className="flex-shrink-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3]">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th
                            className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider"
                            style={{ width: "15%" }}
                          >
                            Activity ID
                          </th>
                          <th
                            className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider"
                            style={{ width: "20%" }}
                          >
                            Action
                          </th>
                          <th
                            className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider"
                            style={{ width: "30%" }}
                          >
                            Entity
                          </th>
                          <th
                            className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider"
                            style={{ width: "20%" }}
                          >
                            Date & Time
                          </th>
                          <th
                            className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider"
                            style={{ width: "10%" }}
                          >
                            Status
                          </th>
                          <th
                            className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider"
                            style={{ width: "5%" }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </div>

                  {/* Scrollable Body */}
                  <div className="flex-1 overflow-auto">
                    <table className="w-full">
                      <tbody className="bg-white/50 backdrop-blur-sm">
                        {loading ? (
                          <tr>
                            <td colSpan="6" className="text-center py-16">
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-[#0F4C81] text-lg font-medium">
                                  Loading activities...
                                </p>
                                <p className="text-gray-500 text-sm mt-2">
                                  Please wait while we fetch the data
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : activityLog.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-16">
                              <div className="flex flex-col items-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                                  <Search size={32} className="text-gray-400" />
                                </div>
                                <p className="text-gray-600 text-xl font-semibold mb-2">
                                  No activities found
                                </p>
                                <p className="text-gray-500 text-sm">
                                  {searchTerm ||
                                  statusFilter !== "all" ||
                                  typeFilter !== "all"
                                    ? "Try adjusting your search criteria"
                                    : "No activities recorded yet"}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          activityLog.map((activity) => (
                            <ActivityRow
                              key={activity.log_id}
                              data={activity}
                              onView={setSelectedActivity}
                            />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Activity Detail Modal */}
          {selectedActivity && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={() => setSelectedActivity(null)}
              />

              {/* Modal */}
              <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-auto my-auto">
                <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        Activity Details
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base mt-1">
                        Review the complete activity information below
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedActivity(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={isMobile ? 20 : 24} className="text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Activity ID
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 text-sm">
                        {selectedActivity.entity_identifier ||
                          `LOG-${selectedActivity.log_id}`}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="p-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                            selectedActivity.status
                          )}`}
                        >
                          <div className="w-2 h-2 rounded-full bg-current mr-2 opacity-70"></div>
                          {formatStatus(selectedActivity.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 flex items-center">
                      <span className="text-xl mr-3">
                        {getActionIcon(selectedActivity.action)}
                      </span>
                      <span className="font-medium text-sm sm:text-base">
                        {selectedActivity.action}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entity
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                        <div className="font-medium text-[#0F4C81] text-sm sm:text-base">
                          {selectedActivity.entity_details || "N/A"}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 capitalize mt-1">
                          {selectedActivity.entity_type || "General"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Performed By
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                        <div className="font-medium text-sm sm:text-base">
                          {selectedActivity.user_name || "System"}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">
                          {selectedActivity.user_role || "User"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date & Time
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 text-sm">
                      {formatDateTime(selectedActivity.log_time).date} at{" "}
                      {formatDateTime(selectedActivity.log_time).time}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarks
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 min-h-[60px] sm:min-h-[80px] text-sm">
                      {selectedActivity.remarks || "No remarks provided"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action Taken
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 min-h-[60px] sm:min-h-[80px] text-sm">
                      {selectedActivity.action_taken ||
                        "No action taken recorded"}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 sm:pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedActivity(null)}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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

export default ActivityLogPage;
