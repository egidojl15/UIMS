import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Activity,
  X,
} from "lucide-react";
import { projectsAPI } from "../services/api";

const ProjectActivity = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const openModal = (modalType, projectData) => {
    setActiveModal({ type: modalType, data: projectData });
  };
  const closeModal = () => setActiveModal(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Fetch projects from API using projectsAPI service
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const statusFilter = activeFilter !== "all" ? activeFilter : null;
        const response = await projectsAPI.getAll(statusFilter);

        // Handle different response formats
        const projectsData =
          response.data || response.projects || response || [];
        setProjects(projectsData);
      } catch (error) {
        console.error("Error loading projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [activeFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-300";
      case "ongoing":
        return "bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white border-blue-300";
      case "planning":
        return "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-yellow-300";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="text-white" />;
      case "ongoing":
        return <Clock size={16} className="text-white" />;
      case "planning":
        return <AlertCircle size={16} className="text-white" />;
      default:
        return <Clock size={16} className="text-white" />;
    }
  };

  const filteredProjects = projects.filter(
    (project) => activeFilter === "all" || project.status === activeFilter
  );

  const projectStats = {
    total: projects.length,
    completed: projects.filter((p) => p.status === "completed").length,
    ongoing: projects.filter((p) => p.status === "ongoing").length,
    planning: projects.filter((p) => p.status === "planning").length,
  };

  const Modal = ({ title, children }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl shadow-cyan-500/20 border border-white/20">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
              {title}
            </h2>
            <button
              onClick={closeModal}
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

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatBudget = (budget) => {
    if (!budget) return "Not specified";
    if (typeof budget === "number") {
      return `₱${budget.toLocaleString()}`;
    }
    return budget;
  };

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

      {/* Hero Header */}
      <section className="relative pt-32 pb-16 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-[#0F4C81] rounded-full animate-pulse"></div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] bg-clip-text text-transparent">
              Project Activity
            </h1>
            <div className="w-2 h-2 bg-[#58A1D3] rounded-full animate-pulse"></div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tracking community development initiatives and progress in Upper
            Ichon
          </p>
        </div>
      </section>

      {/* Project Dashboard */}
      <main className="relative z-10 px-6 sm:px-8 lg:px-12 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Stats Grid - NO BUDGET CARD */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Total", value: projectStats.total, color: "#0F4C81" },
              {
                label: "Completed",
                value: projectStats.completed,
                color: "green",
              },
              {
                label: "Ongoing",
                value: projectStats.ongoing,
                color: "#0F4C81",
              },
              {
                label: "Planning",
                value: projectStats.planning,
                color: "orange",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 text-center shadow-xl border border-white/20"
              >
                <div className={`text-3xl font-bold text-[${stat.color}]`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {["all", "completed", "ongoing", "planning"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                  activeFilter === filter
                    ? "bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white shadow-lg shadow-blue-500/30"
                    : "bg-white/90 text-[#0F4C81] hover:bg-white hover:shadow-md border border-white/20"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)} Projects
              </button>
            ))}
          </div>

          {/* 3-Column Project Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 animate-pulse shadow-xl border border-white/20"
                >
                  <div className="h-6 bg-gray-200 rounded-lg mb-4 w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded-lg mb-2 w-full"></div>
                  <div className="h-4 bg-gray-100 rounded-lg w-5/6"></div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-16 text-center border border-white/20 col-span-full">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity size={40} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">
                No Projects Found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {activeFilter === "all"
                  ? "No projects have been added yet."
                  : `No ${activeFilter} projects found.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <div
                  key={project.project_id}
                  className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all duration-500 border border-white/20 cursor-pointer ${
                    hoveredCard === project.project_id
                      ? "transform scale-105 shadow-2xl shadow-blue-500/20 bg-white/95"
                      : "hover:shadow-xl hover:shadow-blue-500/10"
                  }`}
                  onMouseEnter={() => setHoveredCard(project.project_id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => openModal("project-details", project)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Activity className="text-white" size={22} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300 line-clamp-2">
                            {project.title}
                          </h3>
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium mt-2 ${getStatusColor(
                              project.status
                            )}`}
                          >
                            {getStatusIcon(project.status)}
                            <span className="capitalize">{project.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#58A1D3]" />
                        <span className="text-xs">
                          Target: {formatDate(project.expected_completion)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed mb-4">
                      {project.description}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal("project-details", project);
                      }}
                      className="w-full bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                    >
                      View Details
                      <ChevronRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform duration-300"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ==== PROJECT DETAILS MODAL – TWO COLUMN LAYOUT ==== */}
      {activeModal?.type === "project-details" && (
        <Modal title={activeModal.data.title}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* LEFT COLUMN: REQUIRED FORMAT */}
            <div className="bg-gradient-to-r from-[#B3DEF8]/10 to-transparent p-6 rounded-xl border-l-4 border-[#58A1D3]">
              <div className="space-y-4 text-sm font-medium">
                <div>
                  <span className="text-[#0F4C81] font-bold">
                    NAME OF PROJECT:
                  </span>
                  <span className="ml-3 text-[#06172E]">
                    {activeModal.data.title}
                  </span>
                </div>
                <div>
                  <span className="text-[#0F4C81] font-bold">LOCATION:</span>
                  <span className="ml-3 text-[#06172E]">
                    {activeModal.data.location || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-[#0F4C81] font-bold">
                    NAME OF CONTRACTOR:
                  </span>
                  <span className="ml-3 text-[#06172E]">
                    {activeModal.data.contractor}
                  </span>
                </div>
                <div>
                  <span className="text-[#0F4C81] font-bold">
                    DATE STARTED:
                  </span>
                  <span className="ml-3 text-[#06172E]">
                    {formatDate(activeModal.data.start_date)}
                  </span>
                </div>
                <div>
                  <span className="text-[#0F4C81] font-bold">
                    CONTRACT COMPLETION DATE:
                  </span>
                  <span className="ml-3 text-[#06172E]">
                    {formatDate(activeModal.data.expected_completion)}
                  </span>
                </div>
                <div>
                  <span className="text-[#0F4C81] font-bold">
                    CONTRACT COST:
                  </span>
                  <span className="ml-3 text-[#06172E]">
                    {formatBudget(activeModal.data.budget)}
                  </span>
                </div>
                <div>
                  <span className="text-[#0F4C81] font-bold">
                    IMPLEMENTING OFFICE:
                  </span>
                  <span className="ml-3 text-[#06172E]">
                    {activeModal.data.implementing_office || "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-[#0F4C81] font-bold">
                    SOURCE OF FUND:
                  </span>
                  <span className="ml-3 text-[#06172E]">
                    {activeModal.data.source_of_fund || "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: DESCRIPTION + UPDATES */}
            <div className="space-y-8">
              {/* Project Description */}
              <div>
                <h4 className="font-bold text-[#0F4C81] mb-4 text-xl">
                  Project Description
                </h4>
                <div className="p-6 bg-gradient-to-r from-[#B3DEF8]/10 to-transparent rounded-xl border-l-4 border-[#58A1D3]">
                  <p className="text-gray-700 leading-relaxed">
                    {activeModal.data.description}
                  </p>
                </div>
              </div>

              {/* Recent Updates */}
              <div>
                <h4 className="font-bold text-[#0F4C81] mb-4 text-xl">
                  Recent Updates
                </h4>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  {activeModal.data.updates?.length > 0 ? (
                    activeModal.data.updates.map((update, i) => (
                      <div
                        key={i}
                        className="border-l-4 border-[#58A1D3] pl-6 py-4 bg-gradient-to-r from-[#B3DEF8]/10 to-transparent rounded-r-xl"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={14} className="text-[#58A1D3]" />
                          <span className="text-sm font-semibold text-[#06172E]">
                            {formatDate(update.date)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {update.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic text-center py-6">
                      No updates available.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
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

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProjectActivity;
