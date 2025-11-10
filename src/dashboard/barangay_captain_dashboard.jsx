import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  FileText,
  Calendar,
  MapPin,
  UserCheck,
  ClipboardList,
  AlertTriangle,
  Shield,
  BarChart3,
  User,
  LogOut,
  Bell,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Home,
  Settings,
  CheckCircle,
  ClockIcon,
  XCircle,
  Activity,
  Crown,
  Lock,
  Mail,
  Phone,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import Logins from "../pages/LoginActivity";
import ManageResidentsPage, {
  formatDateForInput,
} from "../pages/ManageResidentPage";
import Blotter from "../pages/Blotter";
import CertificateRequests from "../pages/CertificateRequests";
import Complaints from "../pages/Complaints";
import UsersManagement from "../pages/UserManagement";
import BarangayInfo from "../pages/BarangayInfo";
import Officails from "../pages/Officials";
import Profile from "../pages/MyProfile";
import ActivityLogPage from "../pages/ActivityLogPage"; // Make sure this exists
import {
  dashboardAPI,
  loginsAPI,
  authAPI,
  activityAPI,
  officialsAPI,
  logUserActivity,
  notificationsAPI,
} from "../services/api";

/* -------------------------------------------------------------------------- */
/*  StatCard & QuickActionCard – unchanged                                   */
/* -------------------------------------------------------------------------- */
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  textColor = "text-gray-700",
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
                {trend.startsWith("+") ? "Up" : "Down"}
              </span>
              {trend} from last month
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

/* -------------------------------------------------------------------------- */
/*  Dashboard Page – unchanged (only setActiveSection is now a prop)         */
/* -------------------------------------------------------------------------- */
const Dashboard = ({ setActiveSection }) => {
  const [stats, setStats] = useState({
    activeResidents: 0,
    openComplaints: 0,
    blotterRecords: 0,
    systemUsersOnline: 0,
  });
  const [loginActivityData, setLoginActivityData] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const userRole = authAPI.getCurrentUser()?.role || "barangay_captain";

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsResponse = await dashboardAPI.getStats(userRole);
      setStats({
        activeResidents: statsResponse.active_residents || 0,
        openComplaints: statsResponse.open_complaints || 0,
        blotterRecords: statsResponse.blotter_records || 0,
        systemUsersOnline: statsResponse.users_online || 0,
      });

      let loginData = [];
      try {
        const loginsResponse = await loginsAPI.recent(3);
        if (Array.isArray(loginsResponse) && loginsResponse.length > 0) {
          loginData = loginsResponse.map((login) => ({
            id: login.login_id,
            user: login.user || "Unknown",
            role: login.role || "Unknown",
            loginTime: login.login_time,
            status:
              login.login_status === "success"
                ? "Active"
                : login.login_status === "logout"
                ? "Logged Out"
                : "Failed",
            lastActivity: "N/A",
          }));
        }
      } catch (loginError) {
        console.error("Login activity fetch error:", loginError);
      }
      setLoginActivityData(loginData);

      let activityData = [];
      try {
        const activityResponse = await activityAPI.getAll({
          entity_type: "complaint",
          limit: 5,
        });
        const activityArray = activityResponse.data || activityResponse || [];
        activityData = activityArray.slice(0, 2).map((item) => ({
          id: item.entity_id,
          complainant: item.entity_identifier || "Unknown",
          type: item.action || "Complaint",
          date:
            item.log_time?.split(" ")[0] ||
            new Date().toISOString().split("T")[0],
          status: item.status || "Open",
          description: item.remarks || "No description",
        }));
      } catch (activityError) {
        console.error("Activity logs fetch error:", activityError);
      }
      setRecentIssues(activityData);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again later.");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userRole]);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#0F4C81] text-lg font-medium">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-500" />
          </div>
          <p className="text-red-600 text-lg font-medium">{error}</p>
        </div>
      </div>
    );

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
          {/* Hero */}
          <section className="relative mb-12">
            <div className="bg-gradient-to-br from-[#0F4C81] via-[#58A1D3] to-[#B3DEF8] rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <svg
                  className="absolute bottom-0 w-full h-full"
                  viewBox="0 0 1200 400"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,200 C300,250 600,150 900,200 C1050,220 1150,180 1200,200 L1200,400 L0,:click 400 Z"
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
                      <Crown size={32} className="text-yellow-300" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                        <span className="text-cyan-200 text-sm font-medium tracking-widest">
                          CAPTAIN DASHBOARD
                        </span>
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                      </div>
                      <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">
                        Welcome, Captain!
                      </h2>
                      <p className="text-cyan-100 text-lg">
                        Monitor and oversee all barangay operations
                      </p>
                      <p className="text-cyan-200 text-sm mt-2">
                        Today is{" "}
                        {new Date().toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
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

          {/* Overview Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-[#0F4C81] rounded-full animate-pulse"></div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] bg-clip-text text-transparent">
                Dashboard Overview
              </h2>
              <div className="w-2 h-2 bg-[#58A1D3] rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Real-time insights and statistics for effective barangay
              management
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <StatCard
              title="Active Residents"
              value={stats.activeResidents}
              icon={Users}
              color="bg-gradient-to-br from-emerald-500 to-teal-500"
              hovered={hoveredCard === "residents"}
              onMouseEnter={() => setHoveredCard("residents")}
              onMouseLeave={() => setHoveredCard(null)}
            />
            <StatCard
              title="Open Complaints"
              value={stats.openComplaints}
              icon={AlertTriangle}
              color="bg-gradient-to-br from-orange-500 to-red-500"
              hovered={hoveredCard === "complaints"}
              onMouseEnter={() => setHoveredCard("complaints")}
              onMouseLeave={() => setHoveredCard(null)}
            />
            <StatCard
              title="Blotter Records"
              value={stats.blotterRecords}
              icon={Shield}
              color="bg-gradient-to-br from-red-500 to-pink-500"
              hovered={hoveredCard === "blotter"}
              onMouseEnter={() => setHoveredCard("blotter")}
              onMouseLeave={() => setHoveredCard(null)}
            />
            <StatCard
              title="System Users Online"
              value={stats.systemUsersOnline}
              icon={Activity}
              color="bg-gradient-to-br from-blue-500 to-cyan-500"
              hovered={hoveredCard === "users"}
              onMouseEnter={() => setHoveredCard("users")}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <QuickActionCard
                title="View Login Activity"
                description="Monitor system access"
                icon={Activity}
                color="bg-gradient-to-br from-blue-500 to-cyan-500"
                onClick={() => setActiveSection("logins")}
                hovered={hoveredCard === "login-activity"}
                onMouseEnter={() => setHoveredCard("login-activity")}
                onMouseLeave={() => setHoveredCard(null)}
              />
              <QuickActionCard
                title="Manage Users"
                description="Add/edit system users"
                icon={UserCheck}
                color="bg-gradient-to-br from-emerald-500 to-teal-500"
                onClick={() => setActiveSection("users")}
                hovered={hoveredCard === "manage-users"}
                onMouseEnter={() => setHoveredCard("manage-users")}
                onMouseLeave={() => setHoveredCard(null)}
              />
              <QuickActionCard
                title="Review Complaints"
                description="Handle citizen complaints"
                icon={AlertTriangle}
                color="bg-gradient-to-br from-orange-500 to-red-500"
                onClick={() => setActiveSection("complaints")}
                hovered={hoveredCard === "review-complaints"}
                onMouseEnter={() => setHoveredCard("review-complaints")}
                onMouseLeave={() => setHoveredCard(null)}
              />
              <QuickActionCard
                title="Blotter Records"
                description="Manage blotter records"
                icon={Shield}
                color="bg-gradient-to-br from-purple-500 to-pink-500"
                onClick={() => setActiveSection("blotter")}
                hovered={hoveredCard === "blotter-records"}
                onMouseEnter={() => setHoveredCard("blotter-records")}
                onMouseLeave={() => setHoveredCard(null)}
              />
            </div>
          </div>

          {/* Recent Activity Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Login Activity */}
            <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-500 border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Activity size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#0F4C81] group-hover:text-blue-600 transition-colors duration-300">
                        Recent Login Activity
                      </h3>
                      <p className="text-sm text-gray-500">
                        System access monitoring
                      </p>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                    onClick={() => setActiveSection("logins")}
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {loginActivityData.length > 0 ? (
                    loginActivityData.map((activity, idx) => (
                      <div
                        key={`login-${activity.id}-${idx}`}
                        className="relative p-4 border-l-4 border-gradient-to-b from-blue-400 to-cyan-400 bg-gradient-to-r from-blue-50/50 to-transparent rounded-r-lg group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-cyan-50/50 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-[#06172E] mb-1 group-hover:text-[#0F4C81] transition-colors duration-300">
                              {activity.user}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              {activity.role}
                            </p>
                            <p className="text-xs text-gray-500">
                              Last activity: {activity.lastActivity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-2">
                              {activity.loginTime}
                            </p>
                            <span
                              className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                                activity.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {activity.status === "Active" && (
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              )}
                              {activity.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500">No recent login activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Issues & Concerns */}
            <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-500 border border-white/20 hover:shadow-2xl hover:shadow-orange-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <AlertTriangle size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#0F4C81] group-hover:text-orange-600 transition-colors duration-300">
                        Recent Issues & Concerns
                      </h3>
                      <p className="text-sm text-gray-500">
                        Community feedback
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {recentIssues.length > 0 ? (
                    recentIssues.map((item, idx) => (
                      <div
                        key={`issue-${item.id}-${idx}`}
                        className="relative p-4 border-l-4 border-gradient-to-b from-orange-400 to-red-400 bg-gradient-to-r from-orange-50/50 to-transparent rounded-r-lg group-hover:bg-gradient-to-r group-hover:from-orange-50 group-hover:to-red-50/50 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-[#06172E] mb-1 group-hover:text-[#0F4C81] transition-colors duration-300">
                              {item.complainant || item.resident}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              {item.type || item.concern}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.description
                                ? `${item.description.slice(0, 40)}...`
                                : item.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-2">
                              {formatDateForInput(item.date)}
                            </p>
                            <span
                              className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                                item.status === "Open"
                                  ? "bg-red-100 text-red-800"
                                  : item.status === "Resolved"
                                  ? "bg-green-100 text-green-800"
                                  : item.status === "New"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500">
                        No recent issues or concerns
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

/* -------------------------------------------------------------------------- */
/*  MAIN LAYOUT – now with URL persistence                                   */
/* -------------------------------------------------------------------------- */
const BarangayCaptainDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState({
    certificate_requests: 0,
    complaints: 0,
    blotter_records: 0,
    announcements: 0,
    events: 0,
    users: 0,
  });
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "logins", label: "Login Activity", icon: Activity },
    { id: "barangay-info", label: "Barangay Info", icon: ClipboardList },
    { id: "officials", label: "Officials Management", icon: Crown },
    { id: "certificate-request", label: "Certificate Request", icon: FileText },
    { id: "manage-residents", label: "Manage Residents", icon: Users },
    { id: "blotter", label: "Blotter Records", icon: Shield },
    { id: "complaints", label: "Complaint Records", icon: AlertTriangle },
    { id: "users", label: "User Management", icon: UserCheck },
    { id: "activity-logs", label: "Activity Logs", icon: ClockIcon },
  ];

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

  // Read section from URL on mount/refresh
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    // Check if section is valid (either in navItems or is 'profile')
    const validSections = [...navItems.map((item) => item.id), "profile"];
    if (section && validSections.includes(section)) {
      setActiveSection(section);
    } else {
      setActiveSection("dashboard");
    }
  }, [location.search]);

  // Update both state and URL
  const handleSetActiveSection = (sectionId) => {
    setActiveSection(sectionId);
    navigate(`?section=${sectionId}`);
    setMobileMenuOpen(false);
  };

  // Get notification count for a specific nav item
  const getNotificationCount = (itemId) => {
    switch (itemId) {
      case "certificate-request":
        return notificationCounts.certificate_requests;
      case "complaints":
        return notificationCounts.complaints;
      case "blotter":
        return notificationCounts.blotter_records;
      default:
        return 0;
    }
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard setActiveSection={handleSetActiveSection} />;
      case "logins":
        return <Logins />;
      case "barangay-info":
        return <BarangayInfo />;
      case "officials":
        return <Officails />;
      case "certificate-request":
        return <CertificateRequests />;
      case "manage-residents":
        return <ManageResidentsPage />;
      case "blotter":
        return <Blotter />;
      case "complaints":
        return <Complaints />;
      case "users":
        return <UsersManagement />;
      case "activity-logs":
        return <ActivityLogPage />;
      case "profile":
        return <Profile />;
      default:
        return <Dashboard setActiveSection={handleSetActiveSection} />;
    }
  };

  const handleLogout = async () => {
    try {
      await loginsAPI.logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (showUserMenu && !e.target.closest(".user-dropdown"))
        setShowUserMenu(false);
      if (
        mobileMenuOpen &&
        !e.target.closest(".mobile-menu") &&
        !e.target.closest(".hamburger-btn")
      )
        setMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showUserMenu, mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] font-sans flex flex-col">
      {/* TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg z-[100] h-24 flex items-center justify-between px-4 lg:px-6 border-b border-white/20">
        <div className="flex items-center space-x-4">
          <img
            src="/images/UIMS.png"
            alt="UIMS Logo"
            className="w-20 h-20 object-contain"
          />
          <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] bg-clip-text text-transparent">
            Captain Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="hamburger-btn lg:hidden p-2 rounded-xl text-[#0F4C81] hover:bg-white/50 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="relative user-dropdown hidden lg:block">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/70"
            >
              <User size={20} className="text-gray-600" />
              <span className="font-medium">Barangay Captain</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-[998]"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl py-2 z-[999] border border-white/20">
                  <button
                    onClick={() => {
                      handleSetActiveSection("profile");
                      setShowUserMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0F4C81] transition-colors rounded-lg mx-2"
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg mx-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="mobile-menu fixed top-24 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-white/20 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2 space-y-1 max-h-[calc(100vh-6rem)] overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSetActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left font-medium transition-all duration-300 group ${
                    activeSection === item.id
                      ? "bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-700 hover:bg-white/50 hover:text-[#0F4C81]"
                  }`}
                >
                  <item.icon
                    size={20}
                    className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  />
                  <span className="flex-1">{item.label}</span>
                  <NotificationBadge count={getNotificationCount(item.id)} />
                </button>
              ))}

              <button
                onClick={() => handleSetActiveSection("profile")}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left font-medium transition-all duration-300 text-gray-700 hover:bg-white/50 hover:text-[#0F4C81]"
              >
                <User size={20} className="flex-shrink-0" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-2xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <nav className="hidden lg:block fixed left-0 top-24 bottom-0 bg-white/95 backdrop-blur-xl shadow-xl p-6 border-r border-white/20 w-64 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleSetActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left font-medium transition-all duration-300 group
                  ${
                    activeSection === item.id
                      ? "bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-700 hover:bg-white/50 hover:text-[#0F4C81] hover:shadow-md"
                  }`}
              >
                <item.icon
                  size={20}
                  className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                />
                <span className="flex-1">{item.label}</span>
                <NotificationBadge count={getNotificationCount(item.id)} />
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* MAIN CONTENT */}
      <main
        className={`flex-1 transition-all duration-300 ${
          mobileMenuOpen ? "ml-0" : "lg:ml-64"
        } mt-24 h-[calc(100vh-6rem)] overflow-y-auto`}
      >
        {renderMainContent()}
      </main>
    </div>
  );
};

export default BarangayCaptainDashboard;

/* -------------------------------------------------------------------------- */
/*  CSS animations – same as before                                          */
/* -------------------------------------------------------------------------- */
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%      { transform: translateY(-10px) rotate(120deg); }
    66%      { transform: translateY(5px) rotate(240deg); }
  }
  .animate-float { animation: float 6s ease-in-out infinite; }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
