import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Calendar, MapPin, Clock, Plus, Edit2, Trash2, X } from "lucide-react";
import { eventsAPI } from "../services/api";

const Events = ({ editable = false }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
  });

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isEditable = editable || params.get("editable") === "1";

  const load = async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.getAll();
      setItems(res.events ?? res.data ?? res ?? []);
    } catch (e) {
      console.error("load events", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!formData.title.trim()) return;
    try {
      await eventsAPI.create({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
      });
      await load();
      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        location: "",
        start_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
      });
    } catch (e) {
      console.error("create event", e);
    }
  };

  const handleEdit = async () => {
    if (!formData.title.trim() || !editingItem) return;
    try {
      await eventsAPI.update(editingItem.event_id || editingItem.id, {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
      });
      await load();
      setShowEditModal(false);
      setEditingItem(null);
      setFormData({
        title: "",
        description: "",
        location: "",
        start_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
      });
    } catch (e) {
      console.error("update event", e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await eventsAPI.remove(id);
      await load();
    } catch (e) {
      console.error("delete event", e);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      location: item.location || "",
      start_date: item.start_date || "",
      end_date: item.end_date || "",
      start_time: item.start_time || "",
      end_time: item.end_time || "",
    });
    setShowEditModal(true);
  };

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (timeStr) {
      return `${dateFormatted} at ${timeStr}`;
    }
    return dateFormatted;
  };

  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl shadow-cyan-500/20 border border-white/20">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
              {title}
            </h2>
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
              Community Events
            </h1>
            <div className="w-2 h-2 bg-[#58A1D3] rounded-full animate-pulse"></div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join us in celebrating the vibrant spirit of Upper Ichon
          </p>

          {isEditable && (
            <div className="mt-8">
              <button
                onClick={() => {
                  setFormData({
                    title: "",
                    description: "",
                    location: "",
                    start_date: "",
                    end_date: "",
                    start_time: "",
                    end_time: "",
                  });
                  setShowCreateModal(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 group flex items-center gap-2 font-medium"
              >
                <Plus
                  size={20}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
                Create New Event
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3-Column Grid */}
      <main className="relative z-10 px-6 sm:px-8 lg:px-12 pb-20">
        <div className="max-w-7xl mx-auto">
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
          ) : items.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-16 text-center border border-white/20 col-span-full">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar size={40} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">
                No Events Yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {isEditable
                  ? "Create your first event to get started!"
                  : "There are currently no events. Check back soon!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((e, i) => (
                <div
                  key={e.event_id || e.id}
                  className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all duration-500 border border-white/20 cursor-pointer ${
                    hoveredCard === i
                      ? "transform scale-105 shadow-2xl shadow-blue-500/20 bg-white/95"
                      : "hover:shadow-xl hover:shadow-blue-500/10"
                  }`}
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => openDetailModal(e)}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Pulse dot */}
                  <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Calendar className="text-white" size={22} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300 line-clamp-2">
                            {e.title}
                          </h3>
                          <div className="text-xs text-gray-500 mt-1 space-y-1">
                            {e.location && (
                              <div className="flex items-center gap-1">
                                <MapPin size={12} />
                                <span className="line-clamp-1">
                                  {e.location}
                                </span>
                              </div>
                            )}
                            {e.start_date && (
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span className="line-clamp-1">
                                  {new Date(e.start_date).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                  {e.start_time && ` at ${e.start_time}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {isEditable && (
                        <div
                          className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          onClick={(ev) => ev.stopPropagation()}
                        >
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              openEditModal(e);
                            }}
                            className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-lg hover:shadow-md transition-all duration-300"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleDelete(e.event_id || e.id);
                            }}
                            className="p-2 bg-gradient-to-br from-red-400 to-pink-500 text-white rounded-lg hover:shadow-md transition-all duration-300"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {e.description && (
                      <div className="mt-3 p-4 bg-gradient-to-r from-[#B3DEF8]/10 to-transparent rounded-xl border-l-4 border-gradient-to-b from-[#58A1D3] to-[#B3DEF8] group-hover:from-[#B3DEF8]/20 group-hover:to-[#58A1D3]/10 transition-all duration-300">
                        <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                          {e.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <Modal title={selectedItem.title} onClose={closeDetailModal}>
          <div className="space-y-6">
            <div className="space-y-3 text-sm text-gray-600">
              {selectedItem.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{selectedItem.location}</span>
                </div>
              )}
              {selectedItem.start_date && (
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>
                    {formatDateTime(
                      selectedItem.start_date,
                      selectedItem.start_time,
                    )}
                    {selectedItem.end_date &&
                      ` – ${formatDateTime(selectedItem.end_date, selectedItem.end_time)}`}
                  </span>
                </div>
              )}
            </div>

            {selectedItem.description ? (
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <p className="whitespace-pre-wrap">
                  {selectedItem.description}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No description available.</p>
            )}

            {isEditable && (
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    closeDetailModal();
                    openEditModal(selectedItem);
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:shadow-md transition-all duration-300 flex items-center gap-2 font-medium"
                >
                  <Edit2 size={16} />
                  Edit Event
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <Modal
          title="Create New Event"
          onClose={() => {
            setShowCreateModal(false);
            setFormData({
              title: "",
              description: "",
              location: "",
              start_date: "",
              end_date: "",
            });
          }}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] focus:outline-none transition-colors duration-300"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] focus:outline-none transition-colors duration-300 min-h-32 resize-none"
                placeholder="Enter event description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] focus:outline-none transition-colors duration-300"
                placeholder="Enter event location"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] focus:outline-none transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] focus:outline-none transition-colors duration-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] focus:outline-none transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] focus:outline-none transition-colors duration-300"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    title: "",
                    description: "",
                    location: "",
                    start_date: "",
                    end_date: "",
                    start_time: "",
                    end_time: "",
                  });
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.title.trim()}
                className="px-6 py-3 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Create Event
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <Modal
          title="Edit Event"
          onClose={() => {
            setShowEditModal(false);
            setEditingItem(null);
            setFormData({
              title: "",
              description: "",
              location: "",
              start_date: "",
              end_date: "",
            });
          }}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] focus:outline-none transition-colors duration-300"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] focus:outline-none transition-colors duration-300 min-h-32 resize-none"
                placeholder="Enter event description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] focus:outline-none transition-colors duration-300"
                placeholder="Enter event location"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] focus:outline-none transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] focus:outline-none transition-colors duration-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] focus:outline-none transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#58A1D3] focus:outline-none transition-colors duration-300"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setFormData({
                    title: "",
                    description: "",
                    location: "",
                    start_date: "",
                    end_date: "",
                    start_time: "",
                    end_time: "",
                  });
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={!formData.title.trim()}
                className="px-6 py-3 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Save Changes
              </button>
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

        .border-gradient-to-b {
          border-image: linear-gradient(to bottom, #58a1d3, #b3def8) 1;
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

export default Events;
