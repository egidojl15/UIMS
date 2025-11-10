"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Users as UsersIcon,
  Shield,
  Activity,
  Search,
  X,
  Mail,
  User,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { usersAPI } from "../services/api";
import api from "../services/api";

// ────────────────────────────────────────────────────────────────
// Reusable Stat Card
// ────────────────────────────────────────────────────────────────
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

// ────────────────────────────────────────────────────────────────
// Modal (portal)
// ────────────────────────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/20 border border-white/20 relative">
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

  const root = document.getElementById("modal-root") || document.body;
  return createPortal(modalContent, root);
};

// ────────────────────────────────────────────────────────────────
// Desktop Table Row (unchanged)
// ────────────────────────────────────────────────────────────────
const TableRow = ({ data, onView, onEdit, onDelete }) => {
  const getStatusColor = (s) =>
    s ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  const getStatusIcon = (s) =>
    s ? (
      <CheckCircle size={14} className="text-green-600" />
    ) : (
      <XCircle size={14} className="text-red-600" />
    );

  return (
    <tr className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300 border-b border-gray-100 group">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-3 mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <UsersIcon size={18} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
              #{data.user_id}
            </div>
            <div className="text-xs text-gray-500">User ID</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-semibold text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
          {data.full_name}
        </div>
        <div className="text-xs text-gray-500">Full Name</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
          {data.email}
        </div>
        <div className="text-xs text-gray-500">Email</div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200">
          {data.position || "—"}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            data.is_active
          )} shadow-sm`}
        >
          {getStatusIcon(data.is_active)}
          <span className="ml-2">{data.is_active ? "Active" : "Inactive"}</span>
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
            title="Edit User"
          >
            <Edit
              size={18}
              className="group-hover/btn:scale-110 transition-transform duration-300"
            />
          </button>
          <button
            onClick={() => onDelete(data.user_id)}
            className="p-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 group/btn transform hover:scale-105"
            title="Delete User"
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

// ────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────────
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [search, setSearch] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    full_name: "",
    role_id: 2,
    is_active: 1,
    position: "",
  });

  const perPage = 10;

  // -----------------------------------------------------------------
  // Effects
  // -----------------------------------------------------------------
  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRoles = async () => {
    try {
      const r = await api.get("/user-roles");
      if (r.data.success && r.data.data) setRoles(r.data.data);
      else useFallbackRoles();
    } catch (e) {
      console.error(e);
      useFallbackRoles();
    }
  };

  const useFallbackRoles = () => {
    setRoles([
      {
        role_id: 1,
        role_name: "barangay_captain",
        dashboard_url: "/dashboard/captain",
        role_description: "Barangay Captain - Full system access",
      },
      {
        role_id: 2,
        role_name: "barangay_secretary",
        dashboard_url: "/dashboard/secretary",
        role_description: "Barangay Secretary - Administrative access",
      },
      {
        role_id: 3,
        role_name: "barangay_councilor",
        dashboard_url: "/dashboard/councilor",
        role_description: "Barangay Councilor - Limited access",
      },
      {
        role_id: 4,
        role_name: "barangay_health_worker",
        dashboard_url: "/dashboard/bhw",
        role_description: "Barangay Health Worker - Health records access",
      },
      {
        role_id: 5,
        role_name: "admin",
        dashboard_url: "/dashboard/admin",
        role_description: "System Administrator",
      },
    ]);
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Auto-fill position from role (only when adding new user)
  const positionMap = {
    1: "Barangay Captain",
    2: "Barangay Secretary",
    3: "Barangay Councilor",
    4: "Barangay Health Worker",
    5: "System Admin",
  };
  useEffect(() => {
    if (!editingUser && roles.length) {
      const pos = positionMap[formData.role_id] || "";
      setFormData((p) => ({ ...p, position: pos }));
    }
  }, [formData.role_id, roles, editingUser]);

  const getSelectedRole = () =>
    roles.find((r) => r.role_id === Number(formData.role_id));

  // -----------------------------------------------------------------
  // CRUD Handlers
  // -----------------------------------------------------------------
  const handleSave = async () => {
    // Email uniqueness
    const emailTaken = users.some(
      (u) => u.email === formData.email && u.user_id !== editingUser?.user_id
    );
    if (emailTaken) {
      alert("Email already in use.");
      return;
    }

    try {
      if (editingUser) {
        await usersAPI.updateAdmin(editingUser.user_id, {
          username: formData.username,
          full_name: formData.full_name,
          email: formData.email,
          role_id: formData.role_id,
          is_active: formData.is_active,
          position: formData.position,
          phone: formData.phone || "0",
        });
      } else {
        // Get the dashboard_url from the selected role
        const selectedRole = roles.find(
          (r) => r.role_id === Number(formData.role_id)
        );
        const dashboard_url = selectedRole?.dashboard_url || "/dashboard";

        await usersAPI.create({
          ...formData,
          dashboard_url: dashboard_url,
        });
      }
      setShowModal(false);
      setViewMode(false);
      fetchUsers();
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to save user.");
    }
  };

  const handleDelete = async (id) => {
    const u = users.find((x) => x.user_id === id);
    if (!u) return;
    if (!window.confirm(`Delete ${u.full_name}?`)) return;
    try {
      await usersAPI.delete(id);
      alert(`${u.full_name} deleted.`);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed.");
    }
  };

  // -----------------------------------------------------------------
  // Modal Openers
  // -----------------------------------------------------------------
  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      password: "",
      email: "",
      full_name: "",
      role_id: 2,
      is_active: 1,
      position: "",
    });
    setViewMode(false);
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      full_name: u.full_name || "",
      email: u.email || "",
      role_id: u.role_id || 2,
      is_active: u.is_active ?? 1,
      username: u.username || "",
      password: "",
      position: u.position || "",
    });
    setViewMode(false);
    setShowModal(true);
  };

  const openViewModal = (u) => {
    setEditingUser(u);
    setFormData({
      full_name: u.full_name || "",
      email: u.email || "",
      role_id: u.role_id || 2,
      is_active: u.is_active ?? 1,
      username: u.username || "",
      password: "",
      position: u.position || "",
    });
    setViewMode(true);
    setShowModal(true);

    // Mark user as viewed to update notification badge
    notificationsAPI.markViewed("user", u.user_id);
  };

  // -----------------------------------------------------------------
  // Filtering & Pagination
  // -----------------------------------------------------------------
  const filtered = users.filter(
    (i) =>
      i.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.email?.toLowerCase().includes(search.toLowerCase()) ||
      i.position?.toLowerCase().includes(search.toLowerCase()) ||
      i.username?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // Stats
  const active = users.filter((u) => u.is_active).length;
  const total = users.length;
  const roleCount = new Set(users.map((u) => u.role_id)).size;

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] relative overflow-hidden">
        {/* Floating particles */}
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
            {/* ──────── Hero ──────── */}
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
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                        <UsersIcon size={30} className="text-yellow-300" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                          <span className="text-cyan-200 text-xs sm:text-sm font-medium tracking-widest">
                            USER MANAGEMENT
                          </span>
                          <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-bold mb-1 drop-shadow-lg">
                          System Users Control
                        </h2>
                        <p className="text-cyan-100 text-sm sm:text-base">
                          Manage user accounts, roles, and permissions
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

            {/* ──────── Stats ──────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <StatCard
                title="Total Users"
                value={total}
                icon={UsersIcon}
                color="bg-gradient-to-br from-blue-500 to-cyan-500"
                hovered={hoveredCard === "total"}
                onMouseEnter={() => setHoveredCard("total")}
                onMouseLeave={() => setHoveredCard(null)}
              />
              <StatCard
                title="Active Users"
                value={active}
                icon={CheckCircle}
                color="bg-gradient-to-br from-emerald-500 to-teal-500"
                hovered={hoveredCard === "active"}
                onMouseEnter={() => setHoveredCard("active")}
                onMouseLeave={() => setHoveredCard(null)}
              />
              <StatCard
                title="Total Roles"
                value={roleCount}
                icon={Shield}
                color="bg-gradient-to-br from-purple-500 to-pink-500"
                hovered={hoveredCard === "roles"}
                onMouseEnter={() => setHoveredCard("roles")}
                onMouseLeave={() => setHoveredCard(null)}
              />
            </div>

            {/* ──────── Search ──────── */}
            <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Search size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0F4C81]">
                      Search Users
                    </h3>
                    <p className="text-sm text-gray-500">
                      Find specific user records
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Search by name, email, position, or username..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-gray-700 placeholder-gray-500"
                    />
                  </div>
                  <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/30 text-white px-6 py-4 rounded-2xl transition-all duration-300 font-medium group"
                  >
                    <Plus
                      size={20}
                      className="group-hover:rotate-90 transition-transform duration-300"
                    />
                    <span>Add User</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ──────── Table / Cards ──────── */}
            <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
              <div className="relative z-10 flex flex-col h-full">
                {/* Desktop Table */}
                <div className="hidden lg:block bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/20">
                  <div className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] sticky top-0 z-20">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            User ID
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Full Name
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                            Position
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
                        {paginated.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-16">
                              <div className="flex flex-col items-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                                  <Search size={32} className="text-gray-400" />
                                </div>
                                <p className="text-gray-600 text-xl font-semibold mb-2">
                                  No users found
                                </p>
                                <p className="text-gray-500 text-sm">
                                  {search
                                    ? "Try adjusting your search criteria"
                                    : "No users registered yet"}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginated.map((u) => (
                            <TableRow
                              key={u.user_id}
                              data={u}
                              onView={openViewModal}
                              onEdit={openEditModal}
                              onDelete={handleDelete}
                            />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4 p-4">
                  {paginated.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-lg font-semibold mb-2">
                        No users found
                      </p>
                      <p className="text-gray-500 text-sm">
                        {search
                          ? "Try adjusting your search criteria"
                          : "No users registered yet"}
                      </p>
                    </div>
                  ) : (
                    paginated.map((u) => (
                      <div
                        key={u.user_id}
                        className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-5 border border-white/30 flex flex-col gap-3"
                      >
                        {/* ID + Avatar */}
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2">
                            <UsersIcon size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-[#0F4C81]">
                              #{u.user_id}
                            </div>
                            <div className="text-xs text-gray-500">User ID</div>
                          </div>
                        </div>

                        {/* Full Name */}
                        <div>
                          <div className="text-sm font-semibold text-[#06172E]">
                            {u.full_name}
                          </div>
                          <div className="text-xs text-gray-500">Full Name</div>
                        </div>

                        {/* Email */}
                        <div>
                          <div className="text-sm text-[#06172E]">
                            {u.email}
                          </div>
                          <div className="text-xs text-gray-500">Email</div>
                        </div>

                        {/* Position */}
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200">
                            {u.position || "—"}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              u.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {u.is_active ? (
                              <CheckCircle
                                size={14}
                                className="mr-1 text-green-600"
                              />
                            ) : (
                              <XCircle
                                size={14}
                                className="mr-1 text-red-600"
                              />
                            )}
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => openViewModal(u)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium"
                          >
                            <Eye size={16} /> View
                          </button>
                          <button
                            onClick={() => openEditModal(u)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium"
                          >
                            <Edit size={16} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(u.user_id)}
                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-medium"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination (shared) */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 bg-white/80 backdrop-blur-sm border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                    <span>
                      Showing {(currentPage - 1) * perPage + 1} to{" "}
                      {Math.min(currentPage * perPage, filtered.length)} of{" "}
                      {filtered.length}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="p-1.5 rounded bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ──────── Modal ──────── */}
            <Modal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              title={
                viewMode
                  ? "View User Details"
                  : editingUser
                  ? "Edit User"
                  : "Add New User"
              }
              subtitle={
                viewMode
                  ? "Review user information and permissions"
                  : editingUser
                  ? "Update user information and role"
                  : "Create a new user account with role assignment"
              }
            >
              <div className="space-y-6">
                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <User size={16} className="text-blue-500" />
                      Full Name
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter full name"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      disabled={viewMode}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Mail size={16} className="text-blue-500" />
                      Email
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={viewMode}
                    />
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Briefcase size={16} className="text-blue-500" />
                    Position
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter position/title"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    disabled={viewMode}
                  />
                  {!viewMode && !editingUser && (
                    <p className="text-xs text-blue-600 mt-1">
                      Auto-filled from role. You can override.
                    </p>
                  )}
                </div>

                {/* Username & Password (only on Add) */}
                {!editingUser && !viewMode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <User size={16} className="text-blue-500" />
                        Username
                      </label>
                      <input
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Shield size={16} className="text-blue-500" />
                        Password
                      </label>
                      <input
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        type="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Role */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Shield size={16} className="text-blue-500" />
                    Role & Dashboard
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    value={formData.role_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role_id: Number(e.target.value),
                      })
                    }
                    disabled={viewMode}
                  >
                    <option value="">-- Select Role --</option>
                    {roles.map((r) => (
                      <option key={r.role_id} value={r.role_id}>
                        {r.role_name
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                  {getSelectedRole() && (
                    <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                      <p className="text-sm flex items-center gap-2">
                        <span className="font-semibold text-blue-900">
                          Dashboard URL:
                        </span>
                        <span className="text-blue-700">
                          {getSelectedRole().dashboard_url}
                        </span>
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        {getSelectedRole().role_description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Activity size={16} className="text-blue-500" />
                    Status
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    value={formData.is_active}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: Number(e.target.value),
                      })
                    }
                    disabled={viewMode}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-gray-700 hover:border-gray-400"
                  >
                    Close
                  </button>
                  {!viewMode && (
                    <button
                      onClick={handleSave}
                      className="px-6 py-3 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-semibold transform hover:scale-105"
                    >
                      {editingUser ? "Update User" : "Create User"}
                    </button>
                  )}
                  {viewMode && editingUser && getSelectedRole() && (
                    <button
                      onClick={() => {
                        const url = getSelectedRole().dashboard_url;
                        if (url) window.location.href = url;
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 font-semibold transform hover:scale-105"
                    >
                      Go to Dashboard
                    </button>
                  )}
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>

      {/* ──────── CSS Animations ──────── */}
      <style jsx>{`
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
          0%,
          100% {
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
        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: #58a1d3 transparent;
        }
        .custom-scroll::-webkit-scrollbar {
          width: 12px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 6px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #0f4c81, #58a1d3);
          border-radius: 6px;
          border: 2px solid rgba(255, 255, 255, 0.6);
          transition: all 0.3s ease;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0a3b66, #3d8bbf);
          box-shadow: 0 0 12px rgba(88, 161, 211, 0.8);
        }
      `}</style>
    </>
  );
};

export default UserManagement;
