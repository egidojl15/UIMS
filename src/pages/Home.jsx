// Home.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  FileText,
  Users,
  MapPin,
  BookAIcon,
  ArrowRight,
  Award,
  Activity,
  Mouse as MouseIcon,
  X,
} from "lucide-react";
import { announcementsAPI, eventsAPI } from "../services/api";

const Home = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Fade-in effect for hero
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Fetch announcements and events from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const annRes = await announcementsAPI.getAll();
        const announcementsData =
          annRes.announcements ?? annRes.data ?? annRes ?? [];
        setAnnouncements(announcementsData.slice(0, 3));

        const eventsRes = await eventsAPI.getAll();
        const eventsData =
          eventsRes.events ?? eventsRes.data ?? eventsRes ?? [];
        setEvents(eventsData.slice(0, 3));
      } catch (error) {
        console.error("Error fetching data:", error);
        setAnnouncements([]);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Recent";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const CommunitySection = ({ title, subtitle, children, viewAllLink }) => (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#06172E] mb-2">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="flex items-center gap-2 text-[#0F4C81] hover:text-[#58A1D3] transition-colors duration-300 font-medium group"
          >
            View All
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </Link>
        )}
      </div>
      {children}
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

      {/* === ENHANCED HERO SECTION (from old code) === */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F4C81] via-[#58A1D3] to-[#B3DEF8]"></div>

        {/* Animated wave background */}
        <div className="absolute inset-0 opacity-20">
          <svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1200 800"
            preserveAspectRatio="none"
          >
            <path
              d="M0,400 C300,500 600,300 900,400 C1050,450 1150,350 1200,400 L1200,800 L0,800 Z"
              fill="currentColor"
              className="text-white animate-pulse"
            />
          </svg>
        </div>

        <div
          className={`relative text-center px-6 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse"></div>
              <span className="text-cyan-200 text-lg font-medium tracking-widest">
                WELCOME TO
              </span>
              <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse"></div>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 drop-shadow-2xl">
            Upper Ichon
          </h1>

          <p className="text-2xl md:text-3xl text-cyan-50 font-bold mb-8 drop-shadow-lg max-w-3xl mx-auto leading-relaxed">
            Technology for the People: Better Barangay Service Now, Not
            Tomorrow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() =>
                window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
              }
              className="px-8 py-4 bg-white/20 backdrop-blur-sm text-[#0F4C81] border border-white/30 rounded-2xl hover:bg-white/30 transition-all duration-300 group flex items-center gap-2 font-medium"
            >
              <MouseIcon
                size={20}
                className="group-hover:scale-110 transition-transform duration-300"
              />
              Scroll Down
            </button>
          </div>
        </div>
      </section>

      {/* === MAIN CONTENT === */}
      <main className="relative z-10 px-6 sm:px-8 lg:px-12 pb-20 -mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Announcements & Events */}
            <div className="lg:col-span-2 space-y-8">
              {/* Latest Announcements */}
              <CommunitySection
                title="Latest Announcements"
                subtitle="Stay informed"
                viewAllLink="/announcements"
              >
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded-lg mb-2 w-3/4"></div>
                        <div className="h-4 bg-gray-100 rounded-lg w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText
                      size={48}
                      className="mx-auto mb-4 text-gray-300"
                    />
                    <p>No announcements yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement, index) => (
                      <div
                        key={
                          announcement.announcement_id ||
                          announcement.id ||
                          index
                        }
                        className="group p-4 rounded-xl hover:bg-gradient-to-r hover:from-[#B3DEF8]/10 hover:to-transparent transition-all duration-300 border-l-4 border-[#58A1D3]"
                      >
                        <h3 className="font-semibold text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300 mb-2">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={14} />
                          <span>
                            {formatDate(
                              announcement.posted_date ||
                                announcement.created_at
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CommunitySection>

              {/* Upcoming Events */}
              <CommunitySection
                title="Upcoming Events"
                subtitle="Join the fun"
                viewAllLink="/events"
              >
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded-lg mb-2 w-3/4"></div>
                        <div className="h-4 bg-gray-100 rounded-lg w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar
                      size={48}
                      className="mx-auto mb-4 text-gray-300"
                    />
                    <p>No upcoming events</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event, index) => (
                      <div
                        key={event.event_id || event.id || index}
                        className="group p-4 rounded-xl hover:bg-gradient-to-r hover:from-[#B3DEF8]/10 hover:to-transparent transition-all duration-300 border-l-4 border-[#58A1D3]"
                      >
                        <h3 className="font-semibold text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300 mb-2">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Calendar size={14} />
                          <span>{formatDate(event.start_date)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin size={14} />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CommunitySection>
            </div>

            {/* Right Column - Community Overview & Quick Links */}
            <div className="space-y-8">
              {/* Community Overview */}
              <CommunitySection
                title="Upper Ichon Overview"
                subtitle="Know your community"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-[#B3DEF8]/10 to-transparent">
                    <span className="font-medium text-[#06172E]">
                      Population:
                    </span>
                    <span className="font-bold text-[#0F4C81]">50,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-[#B3DEF8]/10 to-transparent">
                    <span className="font-medium text-[#06172E]">
                      Established:
                    </span>
                    <span className="font-bold text-[#0F4C81]">1981</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-[#B3DEF8]/10 to-transparent">
                    <span className="font-medium text-[#06172E]">Area:</span>
                    <span className="font-bold text-[#0F4C81]">12.2 km²</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    to="/about"
                    className="flex items-center gap-2 text-[#0F4C81] hover:text-[#58A1D3] transition-colors duration-300 font-medium group"
                  >
                    Learn about our History
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </Link>
                </div>
              </CommunitySection>

              {/* Quick Links */}
              <CommunitySection
                title="Quick Access"
                subtitle="Explore our services"
              >
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    to="/spotmap"
                    className="group p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 text-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="text-white" size={24} />
                    </div>
                    <span className="font-medium text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
                      Maps
                    </span>
                  </Link>

                  <Link
                    to="/projectactivity"
                    className="group p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 text-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-lime-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Activity className="text-white" size={24} />
                    </div>
                    <span className="font-medium text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
                      Projects
                    </span>
                  </Link>

                  <Link
                    to="/officials"
                    className="group p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 text-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Users className="text-white" size={24} />
                    </div>
                    <span className="font-medium text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
                      Officials
                    </span>
                  </Link>

                  <Link
                    to="/request"
                    className="group p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 text-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Award className="text-white" size={24} />
                    </div>
                    <span className="font-medium text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
                      Requests
                    </span>
                  </Link>

                  <Link
                    to="/about"
                    className="group p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 text-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <BookAIcon className="text-white" size={24} />
                    </div>
                    <span className="font-medium text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
                      History
                    </span>
                  </Link>
                </div>
              </CommunitySection>
            </div>
          </div>
        </div>
      </main>

      {/* === ANIMATIONS === */}
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
      `}</style>
    </div>
  );
};

export default Home;
