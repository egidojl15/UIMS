import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  FileText,
  ShieldAlert,
  HomeIcon,
  User,
  Activity,
  LogIn,
  LogOut,
  ChevronRight,
  BookCopyIcon,
  ChevronLeft,
  PanelLeftOpen,
  RefreshCw,
  ChevronDown,
  ClockIcon,
  Crown,
  HandFist,
  HandHelping,
  HandHelpingIcon,
  HandGrab,
  HandHeartIcon,
  HandPlatterIcon,
  ScanFaceIcon,
  SaveOffIcon,
  HandshakeIcon,
} from "lucide-react";
import api, {
  loginsAPI,
  logUserActivity,
  notificationsAPI,
  residentsAPI,
  complaintsAPI,
  blottersAPI,
  logbookAPI,
  activityAPI,
  dashboardAPI,
} from "../services/api";
import Complaints from "../pages/Complaints";
import Blotter from "../pages/Blotter";
import LogBookPage from "../pages/LogBookPage";
import ActivityLogPage from "../pages/ActivityLogPage";
import Profile from "../pages/Profile";

/* -------------------------------------------------------------------------- */
/*  NotificationBadge Component                                               */
/* -------------------------------------------------------------------------- */
const NotificationBadge = ({ count }) => {
  if (!count || count === 0) return null;

  return (
    <span className="ml-auto inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-extrabold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg border-2 border-white">
      {count > 99 ? "99+" : count}
    </span>
  );
};

const navItems = [
  { name: "Dashboard", path: "/dashboard/councilor", icon: HomeIcon },
  {
    name: "Complaints",
    path: "/dashboard/councilor/complaints",
    icon: FileText,
  },
  { name: "Blotter", path: "/dashboard/councilor/blotter", icon: ShieldAlert },
  {
    name: "Log Book",
    path: "/dashboard/councilor/logbook",
    icon: BookCopyIcon,
  },
  {
    name: "Activity Log",
    path: "/dashboard/councilor/activitylog",
    icon: ClockIcon,
  },
];

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
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
          {trend && (
            <p
              className={`text-xs mt-2 flex items-center gap-1 ${
                trend.startsWith("+") ? "text-green-600" : "text-red-600"
              }`}
            >
              <span className="text-lg">
                {trend.startsWith("+") ? "↗" : "↘"}
              </span>
              {trend}
            </p>
          )}
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

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  color,
  hovered,
  onMouseEnter,
  onMouseLeave,
}) => (
  <div
    className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all duration-500 border border-white/20 cursor-pointer ${
      hovered
        ? "transform scale-105 shadow-2xl shadow-purple-500/20 bg-white/95"
        : "hover:shadow-xl hover:shadow-purple-500/10"
    }`}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <div className="relative z-10">
      <div className="flex items-center space-x-4">
        <div
          className={`p-4 rounded-2xl ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="text-white" size={24} />
        </div>
        <div>
          <h3 className="font-bold text-[#0F4C81] group-hover:text-purple-600 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  </div>
);

const BrgyCouncilor = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [blotters, setBlotters] = useState([]);
  const [logbooks, setLogbooks] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [residents, setResidents] = useState([]);
  const [stats, setStats] = useState({
    activeResidents: 0,
    openComplaints: 0,
    blotterRecords: 0,
    systemUsersOnline: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [notificationCounts, setNotificationCounts] = useState({
    certificate_requests: 0,
    complaints: 0,
    blotter_records: 0,
    announcements: 0,
    events: 0,
    users: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Fetch notification counts
  useEffect(() => {
    const fetchNotificationCounts = async () => {
      try {
        const counts = await notificationsAPI.getCounts();
        setNotificationCounts(counts);
      } catch (error) {
        console.error("Failed to fetch notification counts:", error);
      }
    };

    fetchNotificationCounts();
    // Refresh notification counts every 30 seconds
    const interval = setInterval(fetchNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get notification count for a specific nav item
  const getNotificationCount = (path) => {
    if (path.includes("complaints")) {
      return notificationCounts.complaints;
    } else if (path.includes("blotter")) {
      return notificationCounts.blotter_records;
    }
    return 0;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const userRole = "councilor"; // Set the role for councilor dashboard
        const statsResponse = await dashboardAPI.getStats(userRole);
        setStats({
          activeResidents: statsResponse.active_residents || 0,
          openComplaints: statsResponse.open_complaints || 0,
          blotterRecords: statsResponse.blotter_records || 0,
          systemUsersOnline: statsResponse.users_online || 0,
        });

        // Fetch residents for form dropdowns
        const residentsResponse = await residentsAPI.getAll();
        setResidents(residentsResponse.data || residentsResponse.residents || []);
        
        // Fetch complaints data
        try {
          const complaintsResponse = await complaintsAPI.getAll();
          const complaintsData = complaintsResponse.data || complaintsResponse || [];
          setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
        } catch (complaintError) {
          console.error("Error fetching complaints:", complaintError);
          setComplaints([]);
        }
        
        // Fetch blotters data
        try {
          const blottersResponse = await blottersAPI.getAll();
          const blottersData = blottersResponse.data || blottersResponse || [];
          setBlotters(Array.isArray(blottersData) ? blottersData : []);
        } catch (blotterError) {
          console.error("Error fetching blotters:", blotterError);
          setBlotters([]);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleNavigation = async (path) => {
    const pageName =
      navItems.find((item) => item.path === path)?.name ||
      (path.includes("my-profile") ? "My Profile" : "Unknown Page");
    await logNavigation(pageName, path);

    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logUserActivity(
        "User Logout",
        "authentication",
        "logout",
        "Councilor logged out",
        "completed",
        "User session ended",
        "Councilor successfully logged out of the system"
      );

      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const user_id = userData?.user_id;

      await loginsAPI.logout(user_id);

      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      sessionStorage.clear();

      window.history.replaceState(null, "", "/login");
      window.history.pushState(null, "", "/login");

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      sessionStorage.clear();
      window.history.replaceState(null, "", "/login");
      window.history.pushState(null, "", "/login");
      navigate("/login", { replace: true });
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Logging refresh activity");
      await logUserActivity(
        "Refresh Dashboard Data",
        "dashboard",
        "refresh",
        "Dashboard data refresh",
        "in_progress",
        "User initiated dashboard data refresh",
        "Refreshing all dashboard data"
      );
      console.log("✅ Refresh activity logged");

      const userRole = "councilor";
      const statsResponse = await dashboardAPI.getStats(userRole);
      setStats({
        activeResidents: statsResponse.active_residents || 0,
        openComplaints: statsResponse.open_complaints || 0,
        blotterRecords: statsResponse.blotter_records || 0,
        systemUsersOnline: statsResponse.users_online || 0,
      });

      // Still fetch residents for form dropdowns
      const residentsResponse = await residentsAPI.getAll();
      setResidents(residentsResponse.data || residentsResponse.residents || []);
      
      // Fetch complaints data
      try {
        const complaintsResponse = await complaintsAPI.getAll();
        const complaintsData = complaintsResponse.data || complaintsResponse || [];
        setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
      } catch (complaintError) {
        console.error("Error fetching complaints:", complaintError);
        setComplaints([]);
      }
      
      // Fetch blotters data
      try {
        const blottersResponse = await blottersAPI.getAll();
        const blottersData = blottersResponse.data || blottersResponse || [];
        setBlotters(Array.isArray(blottersData) ? blottersData : []);
      } catch (blotterError) {
        console.error("Error fetching blotters:", blotterError);
        setBlotters([]);
      }

      await logUserActivity(
        "Refresh Dashboard Data",
        "dashboard",
        "refresh",
        "Dashboard data refresh",
        "completed",
        "Dashboard data refreshed successfully",
        "All dashboard data reloaded successfully"
      );
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError(err.message || "Failed to refresh data");

      await logUserActivity(
        "Refresh Dashboard Data",
        "dashboard",
        "refresh",
        "Dashboard data refresh",
        "failed",
        "Failed to refresh dashboard data",
        `Error: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path) => {
    if (path === "/dashboard/councilor") {
      return (
        location.pathname === "/dashboard/councilor" ||
        location.pathname === "/dashboard/councilor/"
      );
    }
    return location.pathname.startsWith(path);
  };

  const logNavigation = async (pageName, pagePath) => {
    try {
      console.log("🔍 Logging navigation:", pageName, pagePath);
      await logUserActivity(
        "Navigate to Page",
        "navigation",
        pagePath,
        `Navigated to ${pageName}`,
        "completed",
        `User navigated to ${pageName} page`,
        `Accessed ${pagePath}`
      );
      console.log("✅ Navigation logged successfully");
    } catch (error) {
      console.error("❌ Failed to log navigation:", error);
    }
  };

  const testActivityLogging = async () => {
    try {
      console.log("🧪 Testing activity logging...");
      await logUserActivity(
        "Test Activity",
        "test",
        "test-123",
        "Test Activity Logging",
        "completed",
        "Testing if activity logging works",
        "This is a test activity"
      );
      console.log("✅ Test activity logged successfully");
    } catch (error) {
      console.error("❌ Test activity logging failed:", error);
    }
  };

  const [complaintSearch, setComplaintSearch] = useState("");
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    complainant: "",
    respondent_name: "",
    category_id: "",
    date: "",
    narrative: "",
    remarks: "",
    actionTaken: "",
    evidence: null,
    mobile: "",
  });
  const [editComplaint, setEditComplaint] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [blotterSearch, setBlotterSearch] = useState("");
  const [showBlotterForm, setShowBlotterForm] = useState(false);
  const [blotterForm, setBlotterForm] = useState({
    parties: "",
    summary: "",
    status: "Ongoing",
    remarks: "",
    actionTaken: "",
    attachment: null,
  });
  const [editBlotter, setEditBlotter] = useState(null);
  const [selectedBlotter, setSelectedBlotter] = useState(null);

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (complaintForm.mobile && complaintForm.mobile.length !== 11) {
      alert("Philippine mobile numbers must be exactly 11 digits");
      return;
    }
    const formData = new FormData();
    formData.append("complainant_id", complaintForm.complainant);
    formData.append("respondent_name", complaintForm.respondent_name);
    formData.append("category_id", complaintForm.category_id);
    formData.append("incident_date", complaintForm.date);
    formData.append("description", complaintForm.narrative);
    formData.append("narrative", complaintForm.narrative);
    formData.append("status", "Pending");
    formData.append("remarks", complaintForm.remarks);
    formData.append("action_taken", complaintForm.actionTaken);
    formData.append("mobile", complaintForm.mobile);
    if (complaintForm.evidence) {
      formData.append("evidence", complaintForm.evidence);
    }

    try {
      console.log("🔍 Starting complaint submission...");

      await logUserActivity(
        "Create Complaint",
        "complaint",
        "pending",
        `Complaint against ${complaintForm.respondent_name}`,
        "in_progress",
        "Submitting new complaint",
        "Complaint form being processed"
      );

      const result = await complaintsAPI.create(formData);

      console.log("📋 Complaint API response:", result);

      if (result.success) {
        await logUserActivity(
          "Create Complaint",
          "complaint",
          result.id || result.complaint_id,
          `Complaint against ${complaintForm.respondent_name}`,
          "completed",
          "New complaint submitted successfully",
          "Complaint recorded in the system"
        );

        alert("Complaint submitted successfully!");
        setShowComplaintForm(false);
        setComplaints([
          ...complaints,
          { id: result.id, ...complaintForm, status: "Pending" },
        ]);

        await refreshData();
      } else {
        await logUserActivity(
          "Create Complaint",
          "complaint",
          "failed",
          `Complaint against ${complaintForm.respondent_name}`,
          "failed",
          "Failed to submit complaint",
          `Error: ${result.message}`
        );
        alert("Failed to submit complaint: " + result.message);
      }
    } catch (error) {
      await logUserActivity(
        "Create Complaint",
        "complaint",
        "error",
        `Complaint against ${complaintForm.respondent_name}`,
        "failed",
        "Error occurred while submitting complaint",
        `Error: ${error.message}`
      );
      console.error("Error submitting complaint:", error);
      alert("An error occurred while submitting the complaint.");
    }
  };

  const handleComplaintEdit = async (e) => {
    e.preventDefault();

    try {
      console.log("🔍 Starting complaint edit...");

      await logUserActivity(
        "Update Complaint",
        "complaint",
        editComplaint?.id || "unknown",
        `Complaint ID ${editComplaint?.id || "unknown"}`,
        "completed",
        "Complaint information updated",
        "Complaint data modified successfully"
      );

      alert("Complaint updated!");
      setEditComplaint(null);

      await refreshData();
    } catch (error) {
      console.error("Error updating complaint:", error);
      alert("An error occurred while updating the complaint.");
    }
  };

  const handleBlotterSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("🔍 Starting blotter submission...");

      await logUserActivity(
        "Create Blotter",
        "blotter",
        "pending",
        `Blotter for ${blotterForm.parties}`,
        "in_progress",
        "Submitting new blotter report",
        "Blotter form being processed"
      );

      const result = await blottersAPI.create(blotterForm);

      console.log("📋 Blotter API response:", result);

      if (result.success) {
        await logUserActivity(
          "Create Blotter",
          "blotter",
          result.id || result.blotter_id,
          `Blotter for ${blotterForm.parties}`,
          "completed",
          "New blotter report created successfully",
          "Blotter report recorded in the system"
        );

        alert("Blotter submitted successfully!");
        setShowBlotterForm(false);
        setBlotters([
          ...blotters,
          { id: result.id, ...blotterForm, status: "Ongoing" },
        ]);

        await refreshData();
      } else {
        await logUserActivity(
          "Create Blotter",
          "blotter",
          "failed",
          `Blotter for ${blotterForm.parties}`,
          "failed",
          "Failed to submit blotter report",
          `Error: ${result.message}`
        );
        alert("Failed to submit blotter: " + result.message);
      }
    } catch (error) {
      await logUserActivity(
        "Create Blotter",
        "blotter",
        "error",
        `Blotter for ${blotterForm.parties}`,
        "failed",
        "Error occurred while submitting blotter report",
        `Error: ${error.message}`
      );
      console.error("Error submitting blotter:", error);
      alert("An error occurred while submitting the blotter report.");
    }
  };

  const handleBlotterEdit = async (e) => {
    e.preventDefault();

    try {
      console.log("🔍 Starting blotter edit...");

      await logUserActivity(
        "Update Blotter",
        "blotter",
        editBlotter?.id || "unknown",
        `Blotter ID ${editBlotter?.id || "unknown"}`,
        "completed",
        "Blotter report updated",
        "Blotter data modified successfully"
      );

      alert("Blotter updated!");
      setEditBlotter(null);

      await refreshData();
    } catch (error) {
      console.error("Error updating blotter:", error);
      alert("An error occurred while updating the blotter.");
    }
  };

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type.name === "ComplaintsPage") {
        return React.cloneElement(child, {
          complaints,
          complaintSearch,
          setComplaintSearch,
          showComplaintForm,
          setShowComplaintForm,
          complaintForm,
          setComplaintForm,
          handleComplaintSubmit,
          editComplaint,
          setEditComplaint,
          handleComplaintEdit,
          selectedComplaint,
          setSelectedComplaint,
          residents,
        });
      } else if (child.type.name === "BlotterPage") {
        return React.cloneElement(child, {
          blotters,
          blotterSearch,
          setBlotterSearch,
          showBlotterForm,
          setShowBlotterForm,
          blotterForm,
          setBlotterForm,
          handleBlotterSubmit,
          editBlotter,
          setEditBlotter,
          handleBlotterEdit,
          selectedBlotter,
          setSelectedBlotter,
        });
      } else if (child.type.name === "LogbookPage") {
        return React.cloneElement(child, {
          logbooks,
          setLogbooks,
        });
      } else if (child.type.name === "ActivityLogPage") {
        return React.cloneElement(child, {
          activityLog,
          onClose: () => navigate("/dashboard/councilor"),
        });
      }
    }
    return child;
  });

  const getCurrentDate = () => {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return now.toLocaleDateString("en-US", options);
  };

  const defaultContent = (
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
            <div className="bg-gradient-to-br from-[#0F4C81] via-[#58A1D3] to-[#B3DEF8] rounded-3xl p-8 text-white relative overflow-hidden">
              {/* Animated wave background */}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <HandshakeIcon size={32} className="text-cyan-300" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                        <span className="text-cyan-200 text-sm font-medium tracking-widest">
                          COUNCILOR DASHBOARD
                        </span>
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                      </div>
                      <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">
                        Welcome back, Councilor!
                      </h2>
                      <p className="text-cyan-100 text-lg">
                        Manage barangay operations efficiently with UIMS
                      </p>
                      <p className="text-cyan-200 text-sm mt-2">
                        Today is {getCurrentDate()}
                      </p>
                    </div>
                  </div>
                  {/* Scroll indicator */}
                  <div className="flex flex-col items-center gap-3">
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

          {loading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-2 text-gray-700">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Loading dashboard data...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="text-center py-8">
              <div className="bg-red-50/90 backdrop-blur-xl border border-red-200 rounded-3xl p-6 max-w-md mx-auto shadow-xl">
                <p className="text-red-600 font-medium">Error loading data</p>
                <p className="text-red-500 text-sm mt-1">{error}</p>
                <button
                  onClick={refreshData}
                  className="mt-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          {!loading && !error && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <StatCard
                  title="Active Residents"
                  value={stats.activeResidents}
                  icon={User}
                  color="bg-gradient-to-br from-blue-500 to-cyan-500"
                  hovered={hoveredCard === "residents"}
                  onMouseEnter={() => setHoveredCard("residents")}
                  onMouseLeave={() => setHoveredCard(null)}
                />
                <StatCard
                  title="Open Complaints"
                  value={stats.openComplaints}
                  icon={FileText}
                  color="bg-gradient-to-br from-orange-500 to-red-500"
                  hovered={hoveredCard === "complaints"}
                  onMouseEnter={() => setHoveredCard("complaints")}
                  onMouseLeave={() => setHoveredCard(null)}
                />
                <StatCard
                  title="Blotter Records"
                  value={stats.blotterRecords}
                  icon={ShieldAlert}
                  color="bg-gradient-to-br from-red-500 to-pink-500"
                  hovered={hoveredCard === "blotter"}
                  onMouseEnter={() => setHoveredCard("blotter")}
                  onMouseLeave={() => setHoveredCard(null)}
                />
                <StatCard
                  title="Users Online"
                  value={stats.systemUsersOnline}
                  icon={Activity}
                  color="bg-gradient-to-br from-emerald-500 to-teal-500"
                  hovered={hoveredCard === "online"}
                  onMouseEnter={() => setHoveredCard("online")}
                  onMouseLeave={() => setHoveredCard(null)}
                />
              </div>

              {/* Quick Actions */}
              <div className="mb-12">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Quick Actions
                    </h3>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-gray-600">
                    Access key management functions with a single click
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <QuickActionCard
                    title="Manage Complaints"
                    description="Review, process, or record complaints"
                    icon={FileText}
                    color="bg-gradient-to-br from-blue-500 to-cyan-500"
                    onClick={() => {
                      logNavigation(
                        "Complaints",
                        "/dashboard/councilor/complaints"
                      );
                      navigate("/dashboard/councilor/complaints");
                    }}
                    hovered={hoveredCard === "manage-complaints"}
                    onMouseEnter={() => setHoveredCard("manage-complaints")}
                    onMouseLeave={() => setHoveredCard(null)}
                  />
                  <QuickActionCard
                    title="Create Blotter"
                    description="Record incident report"
                    icon={ShieldAlert}
                    color="bg-gradient-to-br from-red-500 to-pink-500"
                    onClick={() => {
                      logNavigation("Blotter", "/dashboard/councilor/blotter");
                      navigate("/dashboard/councilor/blotter");
                    }}
                    hovered={hoveredCard === "create-blotter"}
                    onMouseEnter={() => setHoveredCard("create-blotter")}
                    onMouseLeave={() => setHoveredCard(null)}
                  />
                </div>
              </div>

              {/* Recent Activities Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Complaint Requests */}
                <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-500 border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <FileText size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#0F4C81] group-hover:text-blue-600 transition-colors duration-300">
                            Recent Complaint Requests
                          </h3>
                          <p className="text-sm text-gray-500">
                            Community feedback
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          logNavigation(
                            "Complaints",
                            "/dashboard/councilor/complaints"
                          );
                          navigate("/dashboard/councilor/complaints");
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center"
                      >
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {complaints.slice(0, 3).map((complaint, index) => (
                        <div
                          key={complaint.id || index}
                          className="relative p-4 border-l-4 border-gradient-to-b from-blue-400 to-cyan-400 bg-gradient-to-r from-blue-50/50 to-transparent rounded-r-lg group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-cyan-50/50 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-[#06172E] mb-1 group-hover:text-[#0F4C81] transition-colors duration-300">
                                {complaint.complainant_name ||
                                  complaint.complainant ||
                                  "Anonymous"}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                {complaint.description ||
                                  complaint.narrative ||
                                  "General Complaint"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Category: {complaint.category_name || "General"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500 mb-2">
                                {complaint.incident_date
                                  ? new Date(
                                      complaint.incident_date
                                    ).toLocaleDateString()
                                  : new Date().toLocaleDateString()}
                              </p>
                              <span
                                className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                                  complaint.status === "Pending" ||
                                  complaint.status === "Open"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : complaint.status === "Resolved"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {complaint.status || "Pending"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {complaints.length === 0 && (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText size={24} className="text-gray-400" />
                          </div>
                          <p className="text-gray-500">No recent complaints</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Issues */}
                <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-500 border border-white/20 hover:shadow-2xl hover:shadow-red-500/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <ShieldAlert size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#0F4C81] group-hover:text-red-600 transition-colors duration-300">
                            Recent Issues
                          </h3>
                          <p className="text-sm text-gray-500">
                            Incident reports
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          logNavigation(
                            "Blotter",
                            "/dashboard/councilor/blotter"
                          );
                          navigate("/dashboard/councilor/blotter");
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 flex items-center"
                      >
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {blotters.slice(0, 3).map((blotter, index) => (
                        <div
                          key={blotter.id || index}
                          className="relative p-4 border-l-4 border-gradient-to-b from-red-400 to-pink-400 bg-gradient-to-r from-red-50/50 to-transparent rounded-r-lg group-hover:bg-gradient-to-r group-hover:from-red-50 group-hover:to-pink-50/50 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-[#06172E] mb-1 group-hover:text-[#0F4C81] transition-colors duration-300">
                                {blotter.parties ||
                                  blotter.involved_parties ||
                                  "Unknown Party"}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                {blotter.summary ||
                                  blotter.description ||
                                  "Incident Report"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {blotter.remarks ||
                                  blotter.notes ||
                                  "Needs investigation"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500 mb-2">
                                {blotter.incident_date
                                  ? new Date(
                                      blotter.incident_date
                                    ).toLocaleDateString()
                                  : new Date().toLocaleDateString()}
                              </p>
                              <span
                                className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                                  blotter.status === "Open" ||
                                  blotter.status === "Ongoing"
                                    ? "bg-red-100 text-red-800"
                                    : blotter.status === "Closed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {blotter.status || "Open"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {blotters.length === 0 && (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert size={24} className="text-gray-400" />
                          </div>
                          <p className="text-gray-500">
                            No recent blotter reports
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest(".user-dropdown")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  // Routing logic to render page components based on current path
  const renderPageContent = () => {
    const currentPath = location.pathname;
    
    if (currentPath.includes("/complaints")) {
      return <Complaints />;
    } else if (currentPath.includes("/blotter")) {
      return <Blotter />;
    } else if (currentPath.includes("/logbook")) {
      return <LogBookPage />;
    } else if (currentPath.includes("/activitylog")) {
      return <ActivityLogPage onClose={() => navigate("/dashboard/councilor")} />;
    } else if (currentPath.include("/myprofile")) {
      return <Profile />;
    }else {
      return defaultContent;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] font-sans flex">
      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg z-[100] h-24 flex items-center justify-between px-6 border-b border-white/20">
        <div className="flex items-center space-x-4">
          <img
            src="/images/UIMS.png"
            alt="UIMS Logo"
            className="w-20 h-20 object-contain"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] bg-clip-text text-transparent">
            Councilor Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mobile Hamburger Menu */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-[#0F4C81] hover:bg-white/50 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop User Menu */}
          <div className="relative user-dropdown hidden lg:block">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/70"
            >
              <User size={20} className="text-gray-600" />
              <span className="font-medium">Barangay Councilor</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl py-2 z-[9999] border border-white/20">
                  <button
                    onClick={() => {
                      handleNavigation("/dashboard/councilor/my-profile");
                      setShowUserMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0F4C81] transition-colors duration-200 rounded-lg mx-2"
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 rounded-lg mx-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="fixed top-24 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-white/20 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2 space-y-1 max-h-[calc(100vh-6rem)] overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    handleNavigation(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left font-medium transition-all duration-300 group ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-700 hover:bg-white/50 hover:text-[#0F4C81]"
                  }`}
                >
                  <item.icon
                    size={20}
                    className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  />
                  <span className="flex-1">{item.name}</span>
                  <NotificationBadge count={getNotificationCount(item.path)} />
                </button>
              ))}
              <button
                onClick={() => {
                  handleNavigation("/dashboard/councilor/my-profile");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left font-medium transition-all duration-300 text-gray-700 hover:bg-white/50 hover:text-[#0F4C81]"
              >
                <User size={20} className="flex-shrink-0" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-2xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 mt-2 flex items-center justify-center space-x-2"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-24 bottom-0 bg-white/95 backdrop-blur-xl shadow-xl p-4 lg:p-6 border-r border-white/20 w-64 overflow-y-auto hidden lg:block">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left font-medium transition-all duration-300 group
                  ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-700 hover:bg-white/50 hover:text-[#0F4C81] hover:shadow-md"
                  }`}
              >
                <item.icon
                  size={20}
                  className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                />
                <span className="flex-1">{item.name}</span>
                <NotificationBadge count={getNotificationCount(item.path)} />
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="lg:ml-64 mt-24 h-[calc(100vh-6rem)] overflow-y-auto w-full">
        {renderPageContent()}
      </main>
    </div>
  );
};

export default BrgyCouncilor;

// Add CSS animations
const styles = `
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

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
