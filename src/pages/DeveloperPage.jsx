import React, { useState } from "react";
import { Github, Facebook, Instagram, Disc, Users, X } from "lucide-react";

const teamMembers = [
  {
    name: "Camille Tan Barola",
    role: "Lead Developer",
    contribution: "Architected the core system and implemented key features.",
    image: "/images/oocdm.jpg",
    github: "https://github.com/member1",
    facebook: "https://facebook.com/member1",
    instagram: "https://instagram.com/member1",
    discord: "member1#1234",
  },
  {
    name: "Jetler Egido",
    role: "Frontend Specialist",
    contribution: "Designed intuitive UI/UX and integrated React components.",
    image: "/images/jetlog.jpg",
    github: "https://github.com/member2",
    facebook: "https://facebook.com/member2",
    instagram: "https://instagram.com/member2",
    discord: "member2#5678",
  },
  {
    name: "Joshua Anthony Cabales",
    role: "Backend Engineer",
    contribution: "Built robust APIs and database integrations.",
    image: "/images/tuwad.jpg",
    github: "https://github.com/member3",
    facebook: "https://facebook.com/member3",
    instagram: "https://instagram.com/member3",
    discord: "member3#9012",
  },
  {
    name: "Marion Dave Montederamos",
    role: "QA Tester",
    contribution: "Ensured system reliability through rigorous testing.",
    image: "/images/yorn.jpg",
    github: "https://github.com/member4",
    facebook: "https://facebook.com/member4",
    instagram: "https://instagram.com/member4",
    discord: "member4#3456",
  },
  {
    name: "Samantha Kate P. Barola",
    role: "DevOps Expert",
    contribution: "Managed deployments and CI/CD pipelines.",
    image: "/images/member5.jpg",
    github: "https://github.com/member5",
    facebook: "https://facebook.com/member5",
    instagram: "https://instagram.com/member5",
    discord: "member5#7890",
  },
  {
    name: "Harris Requiso",
    role: "UI Designer",
    contribution: "Crafted visually appealing designs aligned with Oceanic Blueprint theme.",
    image: "/images/member6.jpg",
    github: "https://github.com/member6",
    facebook: "https://facebook.com/member6",
    instagram: "https://instagram.com/member6",
    discord: "member6#2345",
  },
];

const adviser = {
  name: "Haidee Galdo",
  role: "Project Adviser",
  contribution: "Provided guidance, mentorship, and strategic direction.",
  image: "/images/maam.jpg",
  github: "https://github.com/adviser",
  facebook: "https://facebook.com/adviser",
  instagram: "https://instagram.com/adviser",
  discord: "adviser#6789",
};

const DeveloperPage = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const openDetailModal = (member) => {
    setSelectedMember(member);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedMember(null);
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
      {/* Floating background elements - enhanced with bubble-like animations */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-white/30 rounded-full animate-bubble"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-${Math.random() * 20}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
              transform: `scale(${0.5 + Math.random()})`,
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
              Meet Our Oceanic Blueprint Team
            </h1>
            <div className="w-2 h-2 bg-[#58A1D3] rounded-full animate-pulse"></div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Dive into the depths of innovation with our team of dedicated developers and our esteemed adviser.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 px-6 sm:px-8 lg:px-12 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Developers Section */}
            <div className="lg:col-span-3">
              <h2 className="text-3xl font-bold text-[#0F4C81] mb-8 flex items-center gap-3">
                <Users size={28} className="text-[#58A1D3]" />
                Developers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembers.map((member, i) => (
                  <div
                    key={i}
                    className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all duration-500 border border-white/20 cursor-pointer ${
                      hoveredCard === i
                        ? "transform scale-105 shadow-2xl shadow-blue-500/20 bg-white/95"
                        : "hover:shadow-xl hover:shadow-blue-500/10"
                    }`}
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => openDetailModal(member)}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Pulse dot */}
                    <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-slow"></div>

                    <div className="relative z-10">
                      <div className="flex flex-col items-center mb-4">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-32 h-32 rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4"
                        />
                        <h3 className="text-lg font-bold text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300 text-center">
                          {member.name}
                        </h3>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>

                      <div className="mt-3 p-4 bg-gradient-to-r from-[#B3DEF8]/10 to-transparent rounded-xl border-l-4 border-gradient-to-b from-[#58A1D3] to-[#B3DEF8] group-hover:from-[#B3DEF8]/20 group-hover:to-[#58A1D3]/10 transition-all duration-300">
                        <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                          {member.contribution}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Adviser Section - On right side */}
            <div className="lg:col-span-1">
              <h2 className="text-3xl font-bold text-[#0F4C81] mb-8 flex items-center gap-3">
                <Users size={28} className="text-[#58A1D3]" />
                Project Adviser
              </h2>
              <div
                className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all duration-500 border border-white/20 cursor-pointer hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 hover:bg-white/95 sticky top-20`}
                onClick={() => openDetailModal(adviser)}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Pulse dot */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-slow"></div>

                <div className="relative z-10">
                  <div className="flex flex-col items-center mb-4">
                    <img
                      src={adviser.image}
                      alt={adviser.name}
                      className="w-32 h-32 rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4"
                    />
                    <h3 className="text-lg font-bold text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300 text-center">
                      {adviser.name}
                    </h3>
                    <p className="text-sm text-gray-500">{adviser.role}</p>
                  </div>

                  <div className="mt-3 p-4 bg-gradient-to-r from-[#B3DEF8]/10 to-transparent rounded-xl border-l-4 border-gradient-to-b from-[#58A1D3] to-[#B3DEF8] group-hover:from-[#B3DEF8]/20 group-hover:to-[#58A1D3]/10 transition-all duration-300">
                    <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                      {adviser.contribution}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedMember && (
        <Modal title={selectedMember.name} onClose={closeDetailModal}>
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <img
                src={selectedMember.image}
                alt={selectedMember.name}
                className="w-48 h-48 rounded-full object-cover shadow-xl mb-4 animate-fadeIn"
              />
              <h3 className="text-2xl font-bold text-[#0F4C81]">{selectedMember.role}</h3>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <p className="whitespace-pre-wrap">{selectedMember.contribution}</p>
            </div>

            <div className="flex justify-center gap-6 pt-6 border-t border-gray-200">
              <a
                href={selectedMember.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-md transition-all duration-300"
              >
                <Github size={24} />
              </a>
              <a
                href={selectedMember.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-md transition-all duration-300"
              >
                <Facebook size={24} />
              </a>
              <a
                href={selectedMember.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-md transition-all duration-300"
              >
                <Instagram size={24} />
              </a>
              <a
                href={`https://discord.com/users/${selectedMember.discord}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-md transition-all duration-300"
              >
                <Disc size={24} />
              </a>
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

        @keyframes bubble {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-50vh) translateX(${Math.random() * 20 - 10}px) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(${Math.random() * 40 - 20}px) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-bubble {
          animation: bubble linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .border-gradient-to-b {
          border-image: linear-gradient(to bottom, #58a1d3, #b3def8) 1;
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

export default DeveloperPage;