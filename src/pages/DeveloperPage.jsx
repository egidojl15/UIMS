import React, { useState } from "react";
import { Github, Facebook, Instagram, Disc, Users, X } from "lucide-react";

const teamMembers = [
  {
    name: "Camille Tan Barola",
    role: "Lead Developer/QA Tester/DevOps Expert",
    contribution: "Oversees the full technical lifecycle as Lead Developer and DevOps Expert. Beyond architecting the core system, they implemented critical functionality while maintaining a double-layered QA framework to ensure seamless deployments and technical excellence across the board.",
    image: "/images/camille.jpg",
    github: "https://github.com/Xamilla",
    facebook: "https://www.facebook.com/xamillatb",
    instagram: "https://instagram.com/member1",
    discord: "member1#1234",
  },
  {
    name: "Jetler Egido",
    role: "Frontend Specialist/ DevOps Expert/QA Tester",
    contribution: "Bridging the gap between design and deployment, they crafted the intuitive UI/UX and high-performance React architecture. By managing the DevOps pipeline and rigorous QA testing, they ensure that every user interaction is not only visually stunning but also lightning-fast and bug-free.",
    image: "/images/jetler.jpg",
    github: "https://github.com/egidojl15",
    facebook: "https://www.facebook.com/mr.potato15",
    instagram: "https://instagram.com/",
    discord: "member2#5678",
  },
  {
    name: "Joshua Anthony Cabales",
    role: "Backend Engineer",
    contribution: "Engineered the high-performance server-side architecture and designed the complex database schemas that power our platform. By developing secure, scalable APIs and optimizing data retrieval, they ensure our application handles heavy traffic with absolute stability and speed.",
    image: "/images/tuwad.jpg",
    github: "https://github.com/",
    facebook: "https://www.facebook.com/sikee696",
    instagram: "https://instagram.com/",
    discord: "member3#9012",
  },
  {
    name: "Marion Dave Montederamos",
    role: "QA Tester/Backend Engineer",
    contribution: "Operates at the intersection of development and reliability, engineering high-performance backend logic while maintaining a comprehensive automated testing suite. By identifying edge cases and optimizing server-side performance, they ensure the platform remains secure, stable, and ready for enterprise-level traffic.",
    image: "/images/marion.jpg",
    github: "https://github.com/member4",
    facebook: "https://www.facebook.com/warion.poortweny.420",
    instagram: "https://instagram.com/member4",
    discord: "member4#3456",
  },
  {
    name: "Samantha Kate P. Barola",
    role: "UI Designer",
    contribution: "Revolutionizing the workflow by bridging creative design with technical execution. Beyond crafting high-fidelity user interfaces, they architected the deployment infrastructure and CI/CD pipelines, ensuring that every design iteration moves from the canvas to the live environment with automated precision and speed.",
    image: "/images/sam.jpg",
    github: "https://github.com/",
    facebook: "https://www.facebook.com/samanthabarola.2003",
    instagram: "https://instagram.com/",
    discord: "member5#7890",
  },
  {
    name: "Harris Requiso",
    role: "UI Designer",
    contribution: "Revolutionizing the workflow by bridging creative design with technical execution. Beyond crafting high-fidelity user interfaces, they architected the deployment infrastructure and CI/CD pipelines, ensuring that every design iteration moves from the canvas to the live environment with automated precision and speed.",
    image: "/images/harrish.png",
    github: "https://github.com/member6",
    facebook: "https://www.facebook.com/harris.requiso",
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
  facebook: "https://www.facebook.com/haidee.galdo.9",
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

  const Modal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl shadow-cyan-600/30 border border-white/30">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-6 py-5 flex justify-between items-center z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-cyan-300 rounded-full animate-pulse"></div>
            {selectedMember.name}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300 group"
          >
            <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 h-full">
          {/* Left: Full-size image */}
          <div className="relative bg-gradient-to-br from-[#B3DEF8]/50 to-[#58A1D3]/40 overflow-hidden">
            <img
              src={selectedMember.image}
              alt={selectedMember.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

          {/* Right: Details */}
          <div className="p-6 md:p-10 lg:p-12 overflow-y-auto flex flex-col bg-white/80">
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-[#0F4C81]">{selectedMember.name}</h3>
                <p className="text-xl md:text-2xl text-[#58A1D3] font-medium mt-2">{selectedMember.role}</p>
              </div>

              <div className="prose prose-lg md:prose-xl text-gray-800 leading-relaxed">
                <p className="whitespace-pre-wrap">{selectedMember.contribution}</p>
              </div>

              <div className="pt-8 border-t border-gray-300 mt-auto">
                <p className="text-sm text-gray-600 mb-4 font-medium uppercase tracking-wider">Connect</p>
                <div className="flex flex-wrap gap-5">
                  <a
                    href={selectedMember.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-xl hover:scale-110 transition-all duration-300"
                  >
                    <Github size={28} />
                  </a>
                  <a
                    href={selectedMember.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-xl hover:scale-110 transition-all duration-300"
                  >
                    <Facebook size={28} />
                  </a>
                  <a
                    href={selectedMember.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-xl hover:scale-110 transition-all duration-300"
                  >
                    <Instagram size={28} />
                  </a>
                  <a
                    href={`https://discord.com/users/${selectedMember.discord.split('#')[0] || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-xl hover:scale-110 transition-all duration-300"
                  >
                    <Disc size={28} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] relative overflow-hidden">
      {/* Floating bubbles */}
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
      <section className="relative pt-28 pb-16 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="w-3 h-3 bg-[#0F4C81] rounded-full animate-pulse"></div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] bg-clip-text text-transparent">
                Meet Our Oceanic Blueprint Team
              </h1>
              <div className="w-3 h-3 bg-[#58A1D3] rounded-full animate-pulse"></div>
            </div>

            <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap">
              <img
                src="/images/department-log.png"
                alt="Department Logo"
                className="h-16 md:h-20 w-auto object-contain drop-shadow-lg"
              />
              <img
                src="/images/SJC-LOGO-NEWER.png"
                alt="SJC Logo"
                className="h-16 md:h-20 w-auto object-contain drop-shadow-lg"
              />
            </div>
          </div>

          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto font-light">
            Dive into the depths of innovation with our team of dedicated developers and our esteemed adviser.
          </p>
        </div>
      </section>

      {/* Main content */}
      <main className="relative z-10 px-6 sm:px-8 lg:px-12 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-12 relative">
            <div className="lg:col-span-3">
              <h2 className="text-3xl font-bold text-[#0F4C81] mb-10 flex items-center gap-4">
                <Users size={32} className="text-[#58A1D3]" />
                Developers
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembers.map((member, i) => (
                  <div
                    key={i}
                    className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all duration-500 border border-white/20 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-[1.03] ${
                      hoveredCard === i ? "scale-[1.03] shadow-2xl shadow-blue-500/30" : ""
                    }`}
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => openDetailModal(member)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-5 right-5 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse-slow"></div>

                    <div className="relative z-10 text-center">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-32 h-32 mx-auto rounded-2xl object-cover shadow-lg mb-5 group-hover:scale-110 transition-transform duration-400"
                      />
                      <h3 className="text-xl font-bold text-[#06172E] group-hover:text-[#0F4C81] transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 mb-4">{member.role}</p>

                      <div className="p-4 bg-gradient-to-r from-[#B3DEF8]/20 to-transparent rounded-2xl border-l-4 border-[#58A1D3] text-left">
                        <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                          {member.contribution}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block absolute top-0 bottom-0 left-3/4 w-px bg-gradient-to-b from-transparent via-[#58A1D3]/50 to-transparent pointer-events-none" />

            <div className="lg:col-span-1">
              <h2 className="text-3xl font-bold text-[#0F4C81] mb-10 flex items-center gap-4">
                <Users size={32} className="text-[#58A1D3]" />
                Adviser
              </h2>

              <div
                className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 transition-all duration-500 border border-white/20 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-[1.03] sticky top-24"
                onClick={() => openDetailModal(adviser)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-5 right-5 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse-slow"></div>

                <div className="relative z-10 text-center">
                  <img
                    src={adviser.image}
                    alt={adviser.name}
                    className="w-32 h-32 mx-auto rounded-2xl object-cover shadow-lg mb-5 group-hover:scale-110 transition-transform duration-400"
                  />
                  <h3 className="text-xl font-bold text-[#06172E] group-hover:text-[#0F4C81] transition-colors">
                    {adviser.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 mb-4">{adviser.role}</p>

                  <div className="p-4 bg-gradient-to-r from-[#B3DEF8]/20 to-transparent rounded-2xl border-l-4 border-[#58A1D3] text-left">
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

      {showDetailModal && selectedMember && <Modal onClose={closeDetailModal} />}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }

        @keyframes bubble {
          0%   { transform: translateY(0) scale(1); opacity: 0.7; }
          50%  { transform: translateY(-60vh) translateX(${Math.random() * 30 - 15}px) scale(1.3); opacity: 1; }
          100% { transform: translateY(-120vh) translateX(${Math.random() * 50 - 25}px) scale(0.7); opacity: 0; }
        }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.4); }
        }

        .animate-fadeIn     { animation: fadeIn 0.4s ease-out; }
        .animate-bubble     { animation: bubble linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }

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