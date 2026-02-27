import React from 'react';
import { Github, Facebook, Instagram, Disc, Users } from 'lucide-react'; // Assuming Disc for Discord, adjust if needed
import { motion } from 'framer-motion'; // Add framer-motion for animations: npm install framer-motion

// Assuming team member images are in public/images/ with names like member1.jpg, adviser.jpg, etc.
// For demo, using a placeholder image path. Replace with actual paths.
const teamMembers = [
  {
    name: 'Member 1',
    role: 'Lead Developer',
    contribution: 'Architected the core system and implemented key features.',
    image: '/images/oocdm.jpg', // Replace with actual
    github: 'https://github.com/member1',
    facebook: 'https://facebook.com/member1',
    instagram: 'https://instagram.com/member1',
    discord: 'member1#1234',
  },
  {
    name: 'Member 2',
    role: 'Frontend Specialist',
    contribution: 'Designed intuitive UI/UX and integrated React components.',
    image: '/images/member2.jpg',
    github: 'https://github.com/member2',
    facebook: 'https://facebook.com/member2',
    instagram: 'https://instagram.com/member2',
    discord: 'member2#5678',
  },
  {
    name: 'Member 3',
    role: 'Backend Engineer',
    contribution: 'Built robust APIs and database integrations.',
    image: '/images/member3.jpg',
    github: 'https://github.com/member3',
    facebook: 'https://facebook.com/member3',
    instagram: 'https://instagram.com/member3',
    discord: 'member3#9012',
  },
  {
    name: 'Member 4',
    role: 'QA Tester',
    contribution: 'Ensured system reliability through rigorous testing.',
    image: '/images/member4.jpg',
    github: 'https://github.com/member4',
    facebook: 'https://facebook.com/member4',
    instagram: 'https://instagram.com/member4',
    discord: 'member4#3456',
  },
  {
    name: 'Member 5',
    role: 'DevOps Expert',
    contribution: 'Managed deployments and CI/CD pipelines.',
    image: '/images/member5.jpg',
    github: 'https://github.com/member5',
    facebook: 'https://facebook.com/member5',
    instagram: 'https://instagram.com/member5',
    discord: 'member5#7890',
  },
  {
    name: 'Member 6',
    role: 'UI Designer',
    contribution: 'Crafted visually appealing designs aligned with Oceanic Blueprint theme.',
    image: '/images/member6.jpg',
    github: 'https://github.com/member6',
    facebook: 'https://facebook.com/member6',
    instagram: 'https://instagram.com/member6',
    discord: 'member6#2345',
  },
  {
    name: 'Adviser',
    role: 'Project Adviser',
    contribution: 'Provided guidance, mentorship, and strategic direction.',
    image: '/images/oocdm.jpg', // Using the provided path as adviser image
    github: 'https://github.com/adviser',
    facebook: 'https://facebook.com/adviser',
    instagram: 'https://instagram.com/adviser',
    discord: 'adviser#6789',
  },
];

const DeveloperPage = () => {
  return (
    <div className="min-h-screen bg-[#0F4CB1] text-[#FFFFFF] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Oceanic Wave Animation Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute bottom-0 left-0 w-full h-1/3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#3D0EF8" fillOpacity="0.3" d="M0,288L48,272C96,256,192,224,288,229.3C384,235,480,277,576,277.3C672,277,768,235,864,213.3C960,192,1056,192,1152,197.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill="#58A1D3" fillOpacity="0.5" d="M0,160L48,176C96,192,192,224,288,229.3C384,235,480,213,576,197.3C672,181,768,171,864,181.3C960,192,1056,224,1152,229.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="animate-wave"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold text-center mb-12 text-[#58A1D3]"
        >
          Meet Our Oceanic Blueprint Team
          <Users className="inline-block ml-2" size={40} />
        </motion.h1>
        
        <p className="text-center text-xl mb-16 max-w-3xl mx-auto">
          Dive into the depths of innovation with our team of 6 dedicated developers and our esteemed adviser. 
          We're passionate about building systems that make waves in the tech ocean!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(88, 161, 211, 0.3)' }}
              className="bg-[#06172D] rounded-xl overflow-hidden shadow-lg"
            >
              <div className="relative">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#06172D] to-transparent p-4">
                  <h2 className="text-2xl font-semibold">{member.name}</h2>
                  <p className="text-[#58A1D3]">{member.role}</p>
                </div>
              </div>
              <div className="p-6">
                <p className="mb-4">{member.contribution}</p>
                <div className="flex justify-around">
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-[#3D0EF8] hover:text-[#58A1D3]">
                    <Github size={24} />
                  </a>
                  <a href={member.facebook} target="_blank" rel="noopener noreferrer" className="text-[#3D0EF8] hover:text-[#58A1D3]">
                    <Facebook size={24} />
                  </a>
                  <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="text-[#3D0EF8] hover:text-[#58A1D3]">
                    <Instagram size={24} />
                  </a>
                  <a href={`https://discord.com/users/${member.discord}`} target="_blank" rel="noopener noreferrer" className="text-[#3D0EF8] hover:text-[#58A1D3]">
                    <Disc size={24} /> {/* Assuming Disc icon for Discord */}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add some unique particle effect for ocean bubbles */}
      <style jsx global>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          50% { transform: translateX(-25%); }
          100% { transform: translateX(0); }
        }
        .animate-wave {
          animation: wave 20s cubic-bezier(0.36, 0.45, 0.63, 0.91) infinite;
        }
      `}</style>
    </div>
  );
};

export default DeveloperPage;