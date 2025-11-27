import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CertificateRequestFlow from "../components/CertificateRequestFlow";
import NotificationSystem from "../components/NotificationSystem";

const Request = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);
  // Add notification functions
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const addNotification = useCallback(
    (type, title, message = "", action = null, autoDismiss = true) => {
      const newNotification = {
        id: Date.now() + Math.random(),
        type,
        title,
        message,
        action,
        autoDismiss,
        timestamp: new Date(),
      };
      setNotifications((prev) => [...prev, newNotification]);
    },
    []
  );
  // Listen for request creation success
  useEffect(() => {
    const handleRequestCreated = () => {
      addNotification(
        "success",
        "Request Submitted",
        "Your certificate request has been submitted successfully"
      );
    };

    window.addEventListener("requests:created", handleRequestCreated);
    return () =>
      window.removeEventListener("requests:created", handleRequestCreated);
  }, [addNotification]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] relative overflow-hidden">
      {/* Floating background particles */}
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-[#0F4C81] rounded-full animate-pulse"></div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] bg-clip-text text-transparent">
              Certificate Request
            </h1>
            <div className="w-2 h-2 bg-[#58A1D3] rounded-full animate-pulse"></div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Request barangay certificates online — fast, secure, and convenient.
          </p>
        </div>
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 px-6 sm:px-8 lg:px-12 pb-20">
        <div className="max-w-4xl mx-auto">
          <div
            className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-12 border border-white/20 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {/* Header */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-[#0F4C81] mb-4 flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] rounded-full animate-pulse"></div>
                Start Your Request
              </h2>
              <p className="text-gray-600 text-lg">
                Click below to begin. You’ll verify your identity and choose
                your certificate type.
              </p>
            </div>

            {/* CTA Button */}
            <div className="mb-10 flex justify-center">
              <CertificateRequestFlow
                buttonText="Start Certificate Request"
                className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 group flex items-center gap-3"
              />
            </div>

            {/* Instructions Card */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border border-blue-200 shadow-inner">
              <h3 className="text-2xl font-bold text-[#0F4C81] mb-6 flex items-center gap-3">
                <div className="w-2 h-2 bg-[#58A1D3] rounded-full animate-pulse"></div>
                How It Works
              </h3>
              <ol className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </span>
                  <div>
                    <strong className="text-[#0F4C81]">Residents:</strong>{" "}
                    Verify using{" "}
                    <strong>first name, last name, and birth date</strong>. Full
                    access to all certificates.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </span>
                  <div>
                    <strong className="text-[#0F4C81]">Non-Residents:</strong>{" "}
                    Fill out full details. Only{" "}
                    <strong>permits and clearances</strong> available.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </span>
                  <div>Complete the form and submit your request.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </span>
                  <div>Barangay staff will process your request.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    5
                  </span>
                  <div>You’ll be notified when your certificate is ready.</div>
                </li>
              </ol>
            </div>

            {/* Warning Note */}
            <div className="mt-8 p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border-l-4 border-yellow-500 shadow-sm">
              <p className="text-sm font-medium text-amber-800 flex items-start gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  <strong>Note:</strong> Provide accurate information. Incorrect
                  details may delay processing.
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Add Notification System */}
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
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
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Request;
