import React, { useState } from "react";
import { LogIn, User, Lock, AlertCircle, Award, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Starting login process for:", username);
      const data = await authAPI.login({ username, password });
      console.log("Login response received:", data);

      if (data.success) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        const dashboardUrl = data.user?.dashboard_url || "/dashboard";
        navigate(dashboardUrl);
      } else {
        setError(
          data.message || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Incorrect username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] relative overflow-hidden">
      {/* Floating background elements - FIXED */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => {
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const delay = Math.random() * 5;
          const duration = 3 + Math.random() * 4;

          return (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </div>

      <Navbar />

      <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 py-8 relative z-10">
        {/* Security Notice */}
        <div className="w-full max-w-md mb-4 p-3 bg-gradient-to-r from-[#B3DEF8]/20 to-[#58A1D3]/10 rounded-xl border-l-4 border-[#0F4C81] shadow-md">
          <p className="text-xs text-[#0F4C81] text-center font-medium">
            <strong>Security Notice:</strong> This portal is restricted to
            authorized officials only. Unauthorized access is prohibited.
          </p>
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 overflow-hidden border-2 border-gray-300 mx-auto">
                <img
                  src="/images/UIMS.png"
                  alt="Upper Ichon Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div className="inline-flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-bold text-[#0F4C81]">
                  Officials Portal
                </h2>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
              </div>

              <div className="px-3 py-1 bg-gray-100 rounded-lg text-xs text-[#0F4C81] font-medium flex items-center justify-center">
                <Award size={14} className="inline mr-1" />
                Authorized Access Only
              </div>

              <p className="mt-2 text-xs text-gray-600">
                Enter your credentials to access the admin dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <div className="relative rounded-xl group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#0F4C81] group-focus-within:text-[#58A1D3] transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] bg-white focus:bg-white transition-all"
                    placeholder="Enter your username"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative rounded-xl group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#0F4C81] group-focus-within:text-[#58A1D3] transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] bg-white focus:bg-white transition-all"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="relative flex items-center p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border-l-4 border-red-500 animate-fade-in">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="flex-1">{error}</span>
                  <button
                    type="button"
                    onClick={clearError}
                    className="ml-2 text-red-700 hover:text-red-900"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-2 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] hover:from-[#58A1D3] hover:to-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81] shadow-lg hover:shadow-blue-500/30 transition-all ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(120deg);
          }
          66% {
            transform: translateY(5px) rotate(240deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
