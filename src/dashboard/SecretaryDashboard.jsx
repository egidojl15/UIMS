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
  XCircle,
  Activity,
  Crown,
  ClockIcon,
  Lock,
  Mail,
  Phone,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import ManageResidentsPage from "../pages/ManageResidentPage";
import Blotter from "../pages/Blotter";
import Complaints from "../pages/Complaints";
import UsersPage from "../pages/UserManagement";
import Profile from "../pages/MyProfile";
import BarangayInfo from "../pages/BarangayInfo";
import ActivityLogPage from "../pages/ActivityLogPage";
import CertificateRequests from "../pages/CertificateRequests";
import Officials from "../pages/Officials";
import useAPI from "../hooks/useAPI";
import {
  secretaryDashboardAPI,
  requestsAPI,
  announcementsAPI,
  eventsAPI,
  officialsAPI,
  activityAPI,
  residentsAPI,
  notificationsAPI,
} from "../services/api";

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

const SecretaryDashboard = ({ setActiveSection }) => {
  const { loading, execute } = useAPI();
  const [overview, setOverview] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const data = await execute(secretaryDashboardAPI.getOverview);
        if (data?.success && data.overview) {
          setOverview(data.overview);
          const needsCompute =
            !data.overview.residents ||
            Number(data.overview.residents) === 0 ||
            !data.overview.households;
          if (needsCompute) await computeStatsFromResidents();
        } else {
          await computeStatsFromResidents();
        }
      } catch (err) {
        await computeStatsFromResidents();
      }
    };

    loadOverview();
  }, [execute]);

  const computeStatsFromResidents = async () => {
    try {
      const resp = await execute(residentsAPI.getAll);
      const payload = resp?.residents ?? resp?.data ?? resp ?? [];
      const residents = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.data)
        ? payload.data
        : [];

      const total = residents.length;
      const householdsSet = new Set();
      let seniors = 0;
      let voters = 0;

      residents.forEach((r) => {
        const hid =
          r.household_id ??
          r.householdId ??
          r.household_number ??
          r.household_no ??
          r.household;
        if (hid) householdsSet.add(String(hid));

        if (r.is_senior === true || r.senior === true) {
          seniors++;
        } else {
          const dob = r.birth_date ?? r.date_of_birth ?? r.dob;
          if (dob) {
            const age = Math.floor(
              (Date.now() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000)
            );
            if (age >= 60) seniors++;
          }
        }

        if (
          (typeof r.voter_status === "string" &&
            r.voter_status.toLowerCase() === "active") ||
          r.is_voter === true ||
          r.voter === true ||
          r.has_voter === true
        ) {
          voters++;
        }
      });

      const households = householdsSet.size;
      setOverview((prev) => ({
        ...(prev || {}),
        residents: total,
        households,
        senior_citizens: seniors,
        active_voters: voters,
      }));
    } catch (e) {
      console.debug("computeStatsFromResidents error", e?.message || e);
    }
  };

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
                      <FileText size={32} className="text-yellow-300" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                        <span className="text-cyan-200 text-sm font-medium tracking-widest">
                          SECRETARY DASHBOARD
                        </span>
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                      </div>
                      <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">
                        Welcome, Secretary!
                      </h2>
                      <p className="text-cyan-100 text-lg">
                        Manage records and support barangay operations
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
              Real-time insights and statistics for efficient record-keeping
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <StatCard
              title="Active Residents"
              value={overview?.residents ?? "—"}
              icon={Users}
              color="bg-gradient-to-br from-emerald-500 to-teal-500"
              hovered={hoveredCard === "residents"}
              onMouseEnter={() => setHoveredCard("residents")}
              onMouseLeave={() => setHoveredCard(null)}
            />
            <StatCard
              title="Open Complaints"
              value={overview?.complaints?.open ?? "—"}
              icon={AlertTriangle}
              color="bg-gradient-to-br from-orange-500 to-red-500"
              hovered={hoveredCard === "complaints"}
              onMouseEnter={() => setHoveredCard("complaints")}
              onMouseLeave={() => setHoveredCard(null)}
            />
            <StatCard
              title="Blotter Records"
              value={overview?.blotter?.open ?? "—"}
              icon={Shield}
              color="bg-gradient-to-br from-red-500 to-pink-500"
              hovered={hoveredCard === "blotter"}
              onMouseEnter={() => setHoveredCard("blotter")}
              onMouseLeave={() => setHoveredCard(null)}
            />
            <StatCard
              title="System Users Online"
              value={overview?.users ?? "—"}
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
                Access key administrative functions instantly
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                title="Certificate Requests"
                description="Process resident certificates"
                icon={FileText}
                color="bg-gradient-to-br from-blue-500 to-cyan-500"
                onClick={() => setActiveSection("certificate-requests")}
                hovered={hoveredCard === "certificates"}
                onMouseEnter={() => setHoveredCard("certificates")}
                onMouseLeave={() => setHoveredCard(null)}
              />
              <QuickActionCard
                title="Manage Residents"
                description="Manage resident data"
                icon={Users}
                color="bg-gradient-to-br from-emerald-500 to-teal-500"
                onClick={() => setActiveSection("manage-residents")}
                hovered={hoveredCard === "residents"}
                onMouseEnter={() => setHoveredCard("residents")}
                onMouseLeave={() => setHoveredCard(null)}
              />
              <QuickActionCard
                title="Review Complaints"
                description="Handle citizen concerns"
                icon={AlertTriangle}
                color="bg-gradient-to-br from-orange-500 to-red-500"
                onClick={() => setActiveSection("complaints")}
                hovered={hoveredCard === "complaints"}
                onMouseEnter={() => setHoveredCard("complaints")}
                onMouseLeave={() => setHoveredCard(null)}
              />
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

const BarangaySecretaryDashboard = () => {
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
    { id: "barangay-info", label: "Barangay Info", icon: ClipboardList },
    { id: "officials", label: "Officials Management", icon: Crown },
    {
      id: "certificate-requests",
      label: "Certificate Requests",
      icon: FileText,
    },
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (section && navItems.some((item) => item.id === section)) {
      setActiveSection(section);
    } else {
      setActiveSection("dashboard");
    }
  }, [location.search]);

  const handleSetActiveSection = (sectionId) => {
    setActiveSection(sectionId);
    navigate(`?section=${sectionId}`);
    setMobileMenuOpen(false);
  };

  // Get notification count for a specific nav item
  const getNotificationCount = (itemId) => {
    switch (itemId) {
      case "certificate-requests":
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
        return <SecretaryDashboard setActiveSection={handleSetActiveSection} />;
      case "barangay-info":
        return <BarangayInfo />;
      case "officials":
        return <Officials editable={true} />;
      case "certificate-requests":
        return <CertificateRequests />;
      case "manage-residents":
        return <ManageResidentsPage />;
      case "blotter":
        return <Blotter />;
      case "complaints":
        return <Complaints />;
      case "users":
        return <UsersPage />;
      case "activity-logs":
        return <ActivityLogPage />;
      case "profile":
        return <Profile />;
      default:
        return <SecretaryDashboard setActiveSection={handleSetActiveSection} />;
    }
  };

  const handleLogout = async () => {
    try {
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
      navigate("/login", { replace: true });
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
            Secretary Dashboard
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="hamburger-btn lg:hidden p-2 rounded-xl text-[#0F4C81] hover:bg-white/50 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="relative user-dropdown hidden lg:block">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/70"
          >
            <User size={20} className="text-gray-600" />
            <span className="font-medium">Barangay Secretary</span>
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

export default BarangaySecretaryDashboard;

// CSS animations
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
