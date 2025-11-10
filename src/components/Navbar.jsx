// src/components/Navbar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookAIcon, Menu, X, Activity } from "lucide-react";
import {
  MapPin,
  Calendar,
  Users,
  FileText,
  Phone,
  Award,
  History,
  LogIn,
} from "lucide-react";

const navItems = [
  { name: "Announcements", to: "/announcements", icon: FileText },
  { name: "Events", to: "/events", icon: Calendar },
  { name: "Spot Map", to: "/spotmap", icon: MapPin },
  { name: "ProjectActivity", to: "/projectactivity", icon: Activity },
  { name: "Officials", to: "/officials", icon: Users },
  { name: "Requests", to: "/request", icon: Award },
  { name: "About", to: "/about", icon: BookAIcon },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const isLoginPage = pathname === "/login";

  return (
    <header className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo + Title */}
          <div className="flex items-center space-x-3">
            <div className="w-20 h-20 rounded-full flex items-center justify-center">
              <Link to="/">
                <img
                  src="./images/UIMS.png"
                  alt="Upper Ichon Logo"
                  className="w-full h-full object-cover"
                />
              </Link>
            </div>

            {/* Upper Ichon (side by side) + Management System (below) */}
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-bold text-[#0F4C81] flex items-center gap-1">
                <span>Upper</span>
                <span>Ichon</span>
              </h1>
              <p className="text-sm text-[#58A1D3] mt-0.5">Management System</p>
            </div>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.to;
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap
                    ${
                      isActive
                        ? "bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white shadow-lg shadow-blue-500/30"
                        : "text-[#0F4C81] hover:bg-[#B3DEF8] hover:text-[#0F4C81]"
                    }`}
                >
                  <item.icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Reserve space for Login button so nothing shifts */}
            <div className="w-28 h-10 ml-1 flex items-center justify-center">
              {isLoginPage && (
                <Link
                  to="/login"
                  className="bg-[#06172E] text-white px-6 py-2.5 rounded-lg hover:bg-opacity-90 transition-colors duration-200 text-sm font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </nav>

          {/* MOBILE TOGGLE */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 text-[#0F4C81] hover:bg-[#B3DEF8] rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE NAV */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.to;
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all duration-300
                    ${
                      isActive
                        ? "bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white shadow-lg shadow-blue-500/30"
                        : "text-[#0F4C81] hover:bg-[#B3DEF8]"
                    }`}
                >
                  <item.icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {isLoginPage && (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-[#06172E] text-white px-4 py-3 rounded-lg hover:bg-opacity-90 transition-colors mt-2"
              >
                <LogIn size={16} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
