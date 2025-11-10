import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Activity,
  Users,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  LogOut,
  X,
} from "lucide-react";
import { loginsAPI } from "../services/api";

// Modal
const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  if (!isOpen) return null;
  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl shadow-cyan-500/20 border border-white/20">
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
  return createPortal(
    modalContent,
    document.getElementById("modal-root") || document.body
  );
};

// Stat Card
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

// Format time
const formatTime = (dateTimeString) => {
  if (!dateTimeString) return "N/A";
  try {
    const date = new Date(dateTimeString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} ${hours}:${minutes}${ampm}`;
  } catch (e) {
    return dateTimeString;
  }
};

/* =============== DESKTOP TABLE ROW =============== */
const TableRow = ({ data, onView }) => {
  const getStatusBadge = (status) => {
    const base =
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
    if (status === "success") return `${base} bg-green-100 text-green-800`;
    if (status === "failed") return `${base} bg-red-100 text-red-800`;
    if (status === "logout") return `${base} bg-blue-100 text-blue-800`;
    return `${base} bg-gray-100 text-gray-800`;
  };

  const getStatusIcon = (status) => {
    if (status === "success")
      return <CheckCircle size={14} className="text-green-600 mr-1" />;
    if (status === "failed")
      return <XCircle size={14} className="text-red-600 mr-1" />;
    if (status === "logout")
      return <LogOut size={14} className="text-blue-600 mr-1" />;
    return null;
  };

  const getStatusText = (status) => {
    if (status === "success") return "Active";
    if (status === "failed") return "Failed";
    if (status === "logout") return "Logged Out";
    return status;
  };

  return (
    <tr className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300 border-b border-gray-100 group">
      {/* Login ID */}
      <td className="px-6 py-4 align-top">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
              #{data.login_id}
            </div>
            <div className="text-xs text-gray-500">Login ID</div>
          </div>
        </div>
      </td>

      {/* User */}
      <td className="px-6 py-4 align-top">
        <div className="text-sm font-semibold text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
          {data.user || "Unknown"}
        </div>
        <div className="text-xs text-gray-500">User</div>
      </td>

      {/* Role */}
      <td className="px-6 py-4 align-top">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200">
          {data.role || "N/A"}
        </span>
      </td>

      {/* Login Time */}
      <td className="px-6 py-4 align-top">
        <div className="text-sm text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
          {formatTime(data.login_time)}
        </div>
        <div className="text-xs text-gray-500">Login Time</div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 align-top">
        <span className={`${getStatusBadge(data.login_status)} shadow-sm`}>
          {getStatusIcon(data.login_status)}
          <span className="ml-1">{getStatusText(data.login_status)}</span>
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 align-top text-right pr-8">
        <button
          onClick={() => onView(data)}
          className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 group/btn transform hover:scale-105"
        >
          <Eye
            size={18}
            className="group-hover/btn:scale-110 transition-transform duration-300"
          />
        </button>
      </td>
    </tr>
  );
};

/* =============== MOBILE CARD =============== */
const MobileCard = ({ data, onView }) => {
  const getStatusBadge = (status) => {
    const base =
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
    if (status === "success") return `${base} bg-green-100 text-green-800`;
    if (status === "failed") return `${base} bg-red-100 text-red-800`;
    if (status === "logout") return `${base} bg-blue-100 text-blue-800`;
    return `${base} bg-gray-100 text-gray-800`;
  };

  const getStatusIcon = (status) => {
    if (status === "success")
      return <CheckCircle size={14} className="text-green-600 mr-1" />;
    if (status === "failed")
      return <XCircle size={14} className="text-red-600 mr-1" />;
    if (status === "logout")
      return <LogOut size={14} className="text-blue-600 mr-1" />;
    return null;
  };

  const getStatusText = (status) => {
    if (status === "success") return "Active";
    if (status === "failed") return "Failed";
    if (status === "logout") return "Logged Out";
    return status;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 mb-4 shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2">
            <Activity size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-[#0F4C81]">#{data.login_id}</div>
            <div className="text-xs text-gray-500">Login ID</div>
          </div>
        </div>
        <button
          onClick={() => onView(data)}
          className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-md transition-transform duration-200 hover:scale-105"
        >
          <Eye size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="font-medium text-[#06172E]">
            {data.user || "Unknown"}
          </div>
          <div className="text-xs text-gray-500">User</div>
        </div>
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800">
            {data.role || "N/A"}
          </span>
        </div>
        <div>
          <div className="text-[#06172E]">{formatTime(data.login_time)}</div>
          <div className="text-xs text-gray-500">Login Time</div>
        </div>
        <div>
          <span className={getStatusBadge(data.login_status)}>
            {getStatusIcon(data.login_status)}
            {getStatusText(data.login_status)}
          </span>
        </div>
      </div>
    </div>
  );
};

/* =============== MAIN COMPONENT =============== */
const LoginActivity = () => {
  const [loginActivityData, setLoginActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchLogins = async () => {
      try {
        const result = await loginsAPI.getAll();
        if (result.success) setLoginActivityData(result.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogins();
  }, []);

  const handleView = (record) => {
    setSelected(record);
    setIsViewOpen(true);
  };

  const filteredData = loginActivityData.filter(
    (i) =>
      i.user?.toLowerCase().includes(search.toLowerCase()) ||
      i.role?.toLowerCase().includes(search.toLowerCase()) ||
      i.login_status?.toLowerCase().includes(search.toLowerCase())
  );

  const activeSessions = loginActivityData.filter(
    (l) => l.login_status === "success"
  ).length;
  const totalUsers = new Set(loginActivityData.map((l) => l.user)).size;
  const todayLogins = loginActivityData.filter((l) => {
    const today = new Date().toISOString().split("T")[0];
    return l.login_time?.startsWith(today);
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] relative overflow-hidden">
      {/* Floating dots */}
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

      <div className="relative z-10 px-4 sm:px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
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
                      <Activity size={30} className="text-yellow-300" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                        <span className="text-cyan-200 text-xs sm:text-sm font-medium tracking-widest">
                          LOGIN ACTIVITY
                        </span>
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-bold mb-1 drop-shadow-lg">
                        System Access Monitor
                      </h2>
                      <p className="text-cyan-100 text-sm sm:text-base">
                        Track user logins in real-time
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

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <StatCard
              title="Total Users"
              value={totalUsers}
              icon={Users}
              color="bg-gradient-to-br from-emerald-500 to-teal-500"
              hovered={hoveredCard === "u"}
              onMouseEnter={() => setHoveredCard("u")}
              onMouseLeave={() => setHoveredCard(null)}
            />
            <StatCard
              title="Today's Logins"
              value={todayLogins}
              icon={Clock}
              color="bg-gradient-to-br from-blue-500 to-cyan-500"
              hovered={hoveredCard === "t"}
              onMouseEnter={() => setHoveredCard("t")}
              onMouseLeave={() => setHoveredCard(null)}
            />
            <StatCard
              title="Total Records"
              value={filteredData.length}
              icon={Activity}
              color="bg-gradient-to-br from-purple-500 to-pink-500"
              hovered={hoveredCard === "r"}
              onMouseEnter={() => setHoveredCard("r")}
              onMouseLeave={() => setHoveredCard(null)}
            />
          </div>

          {/* Search */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-5 mb-8 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Search size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F4C81]">
                  Search & Filter
                </h3>
                <p className="text-sm text-gray-500">Find login records</p>
              </div>
            </div>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by user, role, or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-navy/30 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-gray-700 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Table / Cards */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/20">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <div className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] sticky top-0 z-20">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-[15%]">
                        Login ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-[20%]">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-[18%]">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-[18%]">
                        Login Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-[15%]">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-[14%]">
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
                  <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-[#0F4C81] font-medium">
                              Loading...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16">
                          <p className="text-gray-600 font-semibold">
                            No records found
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((a) => (
                        <TableRow
                          key={a.login_id}
                          data={a}
                          onView={handleView}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4">
              {loading ? (
                <div className="flex flex-col items-center py-12">
                  <div className="w-16 h-16 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-[#0F4C81] font-medium">Loading...</p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 font-semibold">
                    No records found
                  </p>
                </div>
              ) : (
                filteredData.map((a) => (
                  <MobileCard key={a.login_id} data={a} onView={handleView} />
                ))
              )}
            </div>
          </div>

          {/* Modal */}
          <Modal
            isOpen={isViewOpen}
            onClose={() => setIsViewOpen(false)}
            title="Login Details"
          >
            {selected && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/50">
                    <h4 className="font-bold text-[#0F4C81] mb-3 flex items-center gap-2">
                      <Activity size={20} />
                      Login Info
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Login ID:</strong> {selected.login_id}
                      </p>
                      <p>
                        <strong>User:</strong> {selected.user}
                      </p>
                      <p>
                        <strong>Role:</strong> {selected.role}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/50">
                    <h4 className="font-bold text-[#0F4C81] mb-3 flex items-center gap-2">
                      <Clock size={20} />
                      Activity
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Login Time:</strong>{" "}
                        {formatTime(selected.login_time)}
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                            selected.login_status === "success"
                              ? "bg-green-100 text-green-800"
                              : selected.login_status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {selected.login_status === "success"
                            ? "Active"
                            : selected.login_status === "failed"
                            ? "Failed"
                            : "Logged Out"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default LoginActivity;

/* =============== CSS =============== */
const styles = `
  @keyframes fadeIn { from {opacity:0;transform:scale(.95)} to {opacity:1;transform:scale(1)} }
  @keyframes float { 0%,100%{transform:translateY(0) rotate(0)} 33%{transform:translateY(-10px) rotate(120deg)} 66%{transform:translateY(5px) rotate(240deg)} }
  .animate-fadeIn {animation:fadeIn .3s ease-out}
  .animate-float {animation:float 6s ease-in-out infinite}

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

if (typeof document !== "undefined") {
  const el = document.createElement("style");
  el.textContent = styles;
  document.head.appendChild(el);
}
