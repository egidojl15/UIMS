import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Phone,
  Award,
  Calendar,
  X,
  AlertCircle,
  Mail,
  MapPin,
  FileText,
  Eye,
  Search,
} from "lucide-react";
import { officialsAPI } from "../services/api";

// Modal Component (matching LoginActivity style)
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

// Stat Card Component (matching LoginActivity style)
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

const Officials = ({ editable = false }) => {
  const { user } = useAuth();

  // Get role from either 'role' or 'role_name' property
  const userRole = (user?.role || user?.role_name || "").toLowerCase();

  // Debug: Log user data
  console.log("[Officials] User data:", user);
  console.log("[Officials] User role (normalized):", userRole);
  console.log("[Officials] Editable prop:", editable);

  // Auto-enable editing for secretary and captain
  const canEdit =
    editable ||
    userRole === "secretary" ||
    userRole === "barangay captain" ||
    userRole === "captain";

  console.log("[Officials] canEdit result:", canEdit);
  const [items, setItems] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedOfficial, setSelectedOfficial] = useState(null);
  const [detailOfficial, setDetailOfficial] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    position_id: "",
    term_start: "",
    term_end: "",
    phone: "",
    email: "",
    bio: "",
    image: "",
  });
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) {
      return imagePath;
    }
    if (imagePath.startsWith("/uploads")) {
      const backendURL =
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:5000";
      return `${backendURL}${imagePath}`;
    }
    return imagePath;
  };

  // Load positions
  const loadPositions = async () => {
    try {
      const data = await officialsAPI.getPositions();
      if (data.success && Array.isArray(data.positions)) {
        setPositions(data.positions);
      } else {
        setPositions([]);
      }
    } catch (e) {
      console.error("load positions error:", e);
      // Check for permission denied error
      if (e.response?.status === 403) {
        console.warn(
          "Access denied for positions. User may not have secretary/captain role."
        );
      }
      setPositions([]);
    }
  };

  // Load officials
  const load = async () => {
    setLoading(true);
    try {
      const data = await officialsAPI.list();
      if (data.success) {
        setItems(data.officials || []);
      }
    } catch (e) {
      console.error("load officials", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (canEdit) loadPositions();
  }, [canEdit]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      position_id: "",
      term_start: "",
      term_end: "",
      phone: "",
      email: "",
      bio: "",
      image: "",
    });
    setError("");
    setImageFile(null);
    setImagePreview(null);
  };

  // Open create modal
  const handleOpenCreate = () => {
    resetForm();
    setModalMode("create");
    setSelectedOfficial(null);
    setShowCreateEditModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (official) => {
    setFormData({
      name: official.name || "",
      position_id: official.position_id || "",
      term_start: official.term_start || "",
      term_end: official.term_end || "",
      phone: official.phone || "",
      email: official.email || "",
      bio: official.bio || "",
      image: official.image || "",
    });
    setModalMode("edit");
    setSelectedOfficial(official);
    setShowCreateEditModal(true);
    setImagePreview(official.image || null);
  };

  // Open detail modal
  const openDetailModal = (official) => {
    setDetailOfficial(official);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailOfficial(null);
  };

  // Image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setError("");
    }
  };

  // Submit create/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let imageUrl = formData.image;

      if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append("image", imageFile);
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Authentication required.");
          return;
        }

        const uploadResponse = await fetch(
          "https://uims-backend-production.up.railway.app/api/uploads/images",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formDataImage,
          }
        );

        if (!uploadResponse.ok) {
          const err = await uploadResponse.text();
          setError(JSON.parse(err).message || "Image upload failed");
          return;
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      const officialData = { ...formData, image: imageUrl };

      let response;
      if (modalMode === "create") {
        response = await officialsAPI.create(officialData);
      } else {
        response = await officialsAPI.update(
          selectedOfficial.official_id,
          officialData
        );
      }

      if (!response.success) {
        setError(response.message || "An error occurred");
        return;
      }

      setShowCreateEditModal(false);
      resetForm();
      await load();
      if (canEdit) await loadPositions();
    } catch (e) {
      console.error("Save official error:", e);
      // Check for permission denied error
      if (e.response?.status === 403 || e.message?.includes("Access denied")) {
        setError(
          "Access denied. Only Secretary and Captain can manage officials."
        );
      } else if (e.response?.data?.message) {
        setError(e.response.data.message);
      } else {
        setError("Failed to save official.");
      }
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm("Delete this official?")) return;
    try {
      const res = await officialsAPI.remove(id);
      if (!res.success) {
        alert(res.message || "Failed to delete");
        return;
      }
      await load();
      if (canEdit) await loadPositions();
    } catch (e) {
      console.error("Delete official error:", e);
      // Check for permission denied error
      if (e.response?.status === 403 || e.message?.includes("Access denied")) {
        alert(
          "Access denied. Only Secretary and Captain can delete officials."
        );
      } else if (e.response?.data?.message) {
        alert(e.response.data.message);
      } else {
        alert("Failed to delete official.");
      }
    }
  };

  const getPositionInfo = (id) =>
    positions.find((p) => p.position_id === parseInt(id));

  const groupedPositions = positions.reduce((acc, pos) => {
    const type = pos.position_type || "other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(pos);
    return acc;
  }, {});

  // Filter data
  const filteredData = items.filter(
    (i) =>
      i.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.position_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats calculations
  const totalOfficials = items.length;
  const positionsCount = new Set(items.map((i) => i.position_name)).size;
  const activeTerms = items.filter((i) => {
    const currentYear = new Date().getFullYear();
    const endYear = parseInt(i.term_end);
    return endYear >= currentYear;
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
          {/* Hero Section - Matching LoginActivity */}
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
                      <Users size={30} className="text-yellow-300" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                        <span className="text-cyan-200 text-xs sm:text-sm font-medium tracking-widest">
                          BARANGAY OFFICIALS
                        </span>
                        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-bold mb-1 drop-shadow-lg">
                        Leadership Directory
                      </h2>
                      <p className="text-cyan-100 text-sm sm:text-base">
                        Meet your community leaders and officials
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

          {/* Stats - Matching LoginActivity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <StatCard
              title="Total Officials"
              value={totalOfficials}
              icon={Users}
              color="bg-gradient-to-br from-emerald-500 to-teal-500"
              hovered={hoveredCard === "o"}
              onMouseEnter={() => setHoveredCard("o")}
              onMouseLeave={() => setHoveredCard(null)}
            />
            <StatCard
              title="Positions"
              value={positionsCount}
              icon={Award}
              color="bg-gradient-to-br from-blue-500 to-cyan-500"
              hovered={hoveredCard === "p"}
              onMouseEnter={() => setHoveredCard("p")}
              onMouseLeave={() => setHoveredCard(null)}
            />
            <StatCard
              title="Active Terms"
              value={activeTerms}
              icon={Calendar}
              color="bg-gradient-to-br from-purple-500 to-pink-500"
              hovered={hoveredCard === "a"}
              onMouseEnter={() => setHoveredCard("a")}
              onMouseLeave={() => setHoveredCard(null)}
            />
          </div>

          {/* Search & Add Button - Matching LoginActivity */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-5 mb-8 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Search size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#0F4C81]">
                  Search & Filter
                </h3>
                <p className="text-sm text-gray-500">Find officials</p>
              </div>
            </div>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name, position, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-navy/30 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-gray-700 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Officials Grid */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/20">
            <div className="p-8">
              {loading ? (
                <div className="flex flex-col items-center py-16">
                  <div className="w-16 h-16 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-[#0F4C81] font-medium">
                    Loading officials...
                  </p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users size={40} className="text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">
                    No Officials Found
                  </h3>
                  <p className="text-gray-500">
                    {search
                      ? "Try adjusting your search criteria"
                      : canEdit
                      ? "Add your first official to get started!"
                      : "Official information will be available soon."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredData.map((o, i) => (
                    <div
                      key={o.official_id || o.id}
                      className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all duration-500 border border-white/20 cursor-pointer ${
                        hoveredCard === i
                          ? "transform scale-105 shadow-2xl shadow-blue-500/20 bg-white/95"
                          : "hover:shadow-xl hover:shadow-blue-500/10"
                      }`}
                      onMouseEnter={() => setHoveredCard(i)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => openDetailModal(o)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="relative z-10">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0 overflow-hidden">
                            {getImageUrl(o.image) ? (
                              <img
                                src={getImageUrl(o.image)}
                                alt={o.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error(
                                    "Failed to load official image:",
                                    o.image
                                  );
                                  e.target.style.display = "none";
                                  e.target.parentElement.innerHTML =
                                    '<svg class="text-white" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
                                }}
                              />
                            ) : (
                              <Users className="text-white" size={28} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300 line-clamp-2">
                              {o.name}
                            </h3>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium mt-2 bg-gradient-to-r from-[#B3DEF8]/50 to-[#58A1D3]/20 text-[#0F4C81]">
                              <Award size={14} className="text-[#58A1D3]" />
                              <span>{o.position_name || o.position}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          {o.phone && (
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-[#58A1D3]" />
                              <span className="truncate">{o.phone}</span>
                            </div>
                          )}
                          {(o.term_start || o.term_end) && (
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-[#58A1D3]" />
                              <span>
                                {o.term_start} — {o.term_end}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detail Modal */}
          {showDetailModal && detailOfficial && (
            <Modal
              isOpen={showDetailModal}
              title={detailOfficial.name}
              subtitle={detailOfficial.position_name || detailOfficial.position}
              onClose={closeDetailModal}
            >
              <div className="space-y-8">
                {/* Photo Section - Centered */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-48 h-48 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] rounded-full p-1.5 shadow-2xl">
                      <div className="w-full h-full bg-white rounded-full overflow-hidden">
                        {getImageUrl(detailOfficial.image) ? (
                          <img
                            src={getImageUrl(detailOfficial.image)}
                            alt={detailOfficial.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(
                                "Failed to load official detail image:",
                                detailOfficial.image
                              );
                              e.target.style.display = "none";
                              const parent = e.target.parentElement;
                              parent.innerHTML =
                                '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"><svg class="text-gray-400" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <Users size={64} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Status indicator */}
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-lg"></div>
                  </div>

                  {/* Position Badge */}
                  <div className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] shadow-lg">
                    <Award size={18} className="text-yellow-300" />
                    <span className="text-white font-semibold text-sm">
                      {detailOfficial.position_name || detailOfficial.position}
                    </span>
                  </div>
                </div>

                {/* Information Grid - Professional Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  {detailOfficial.phone && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-[#58A1D3]/30 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <Phone size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                            Contact Number
                          </p>
                          <p className="font-bold text-[#0F4C81] text-base">
                            {detailOfficial.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {detailOfficial.email && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-[#58A1D3]/30 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <Mail size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                            Email Address
                          </p>
                          <p className="font-bold text-[#0F4C81] text-base truncate">
                            {detailOfficial.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Term */}
                  {(detailOfficial.term_start || detailOfficial.term_end) && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-[#58A1D3]/30 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <Calendar size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                            Term of Office
                          </p>
                          <p className="font-bold text-[#0F4C81] text-base">
                            {detailOfficial.term_start} —{" "}
                            {detailOfficial.term_end}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {detailOfficial.address && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-[#58A1D3]/30 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <MapPin size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                            Address
                          </p>
                          <p className="font-bold text-[#0F4C81] text-base">
                            {detailOfficial.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Biography - Full Width */}
                {detailOfficial.bio && (
                  <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <FileText size={18} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#0F4C81] uppercase tracking-wider mb-1">
                          Biography
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap pl-13">
                      {detailOfficial.bio}
                    </p>
                  </div>
                )}
              </div>
            </Modal>
          )}

          {/* Create/Edit Modal */}
          {showCreateEditModal && (
            <Modal
              title={
                modalMode === "create" ? "Add New Official" : "Edit Official"
              }
              onClose={() => setShowCreateEditModal(false)}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
                    <AlertCircle className="text-red-500 mt-0.5" size={20} />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-[#0F4C81] mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    placeholder="Enter official's name"
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-bold text-[#0F4C81] mb-2">
                    Position *
                  </label>
                  <select
                    required
                    value={formData.position_id}
                    onChange={(e) =>
                      setFormData({ ...formData, position_id: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  >
                    <option value="">Select a position</option>
                    {Object.entries(groupedPositions).map(([type, posList]) => (
                      <optgroup key={type} label={type.toUpperCase()}>
                        {posList.map((pos) => (
                          <option key={pos.position_id} value={pos.position_id}>
                            {pos.position_name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Term Years - Now as numbers */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#0F4C81] mb-2">
                      Term Start Year *
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      step="1"
                      value={formData.term_start}
                      onChange={(e) =>
                        setFormData({ ...formData, term_start: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                      placeholder="YYYY"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#0F4C81] mb-2">
                      Term End Year *
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      step="1"
                      value={formData.term_end}
                      onChange={(e) =>
                        setFormData({ ...formData, term_end: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                      placeholder="YYYY"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold text-[#0F4C81] mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-[#0F4C81] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-bold text-[#0F4C81] mb-2">
                    Biography
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 resize-none"
                    placeholder="Enter biography or description"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-bold text-[#0F4C81] mb-2">
                    Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={
                          imagePreview.startsWith("data:")
                            ? imagePreview
                            : getImageUrl(imagePreview)
                        }
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-xl border-2 border-blue-200"
                      />
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateEditModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-medium"
                  >
                    {modalMode === "create"
                      ? "Create Official"
                      : "Update Official"}
                  </button>
                </div>
              </form>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

export default Officials;

/* =============== CSS =============== */
const styles = `
  @keyframes fadeIn { from {opacity:0;transform:scale(.95)} to {opacity:1;transform:scale(1)} }
  @keyframes float { 0%,100%{transform:translateY(0) rotate(0)} 33%{transform:translateY(-10px) rotate(120deg)} 66%{transform:translateY(5px) rotate(240deg)} }
  .animate-fadeIn {animation:fadeIn .3s ease-out}
  .animate-float {animation:float 6s ease-in-out infinite}

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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
`;

if (typeof document !== "undefined") {
  const el = document.createElement("style");
  el.textContent = styles;
  document.head.appendChild(el);
}
