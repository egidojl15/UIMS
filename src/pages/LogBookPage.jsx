import React, { useState, useEffect } from "react";
import { logbookAPI } from "../services/api";

import {
  CheckCircle,
  AlertCircle,
  XCircle,
  X,
  Search,
  Plus,
  Eye,
  Calendar,
  User,
  MapPin,
  FileText,
  Phone,
  Clock,
  BookOpen,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Enhanced Philippine locations data organized by region
const philippineLocations = {
  "Eastern Visayas": [
    "Tacloban, Leyte",
    "Ormoc, Leyte",
    "Baybay, Leyte",
    "Maasin, Southern Leyte",
    "Anahawan, Southern Leyte",
    "Bontoc, Southern Leyte",
    "Hinunangan, Southern Leyte",
    "Hinundayan, Southern Leyte",
    "Libagon, Southern Leyte",
    "Liloan, Southern Leyte",
    "Limasawa, Southern Leyte",
    "Macrohon, Southern Leyte",
    "Malitbog, Southern Leyte",
    "Padre Burgos, Southern Leyte",
    "Pintuyan, Southern Leyte",
    "Saint Bernard, Southern Leyte",
    "San Francisco, Southern Leyte",
    "San Juan, Southern Leyte",
    "San Ricardo, Southern Leyte",
    "Silago, Southern Leyte",
    "Sogod, Southern Leyte",
    "Tomas Oppus, Southern Leyte",
    "Catbalogan, Samar",
    "Calbayog, Samar",
    "Borongan, Eastern Samar",
  ],
};

// Flatten all locations for search
const getAllLocations = () => {
  const allLocations = [];
  Object.keys(philippineLocations).forEach((region) => {
    allLocations.push(...philippineLocations[region]);
  });
  return allLocations.sort();
};

// Notification Component
const Notification = ({ message, type, onClose }) => {
  const borderColor =
    type === "success" ? "border-green-500" : "border-red-500";
  const iconColor = type === "success" ? "text-green-500" : "text-red-500";
  const Icon = type === "success" ? CheckCircle : XCircle;

  return (
    <div
      className={`fixed top-6 right-6 bg-white rounded-lg shadow-lg border-l-4 ${borderColor} p-4 flex items-start gap-3 transform transition-transform duration-300 z-[9999] animate-slideInFromTop min-w-[320px] max-w-md`}
    >
      <Icon size={24} className={iconColor} />
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800 text-sm mb-1">
          {type === "success" ? "Logbook Updated" : "Error"}
        </h4>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
      >
        <X size={20} />
      </button>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl shadow-cyan-500/20 border border-white/20">
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
};

// Stat Card Component
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

// SVG Icons
const PrinterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <path d="M18 10V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v7" />
    <path d="M6 14h12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z" />
    <path d="M12 14v4" />
  </svg>
);

const FileTextIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <line x1="10" x2="8" y1="9" y2="9" />
  </svg>
);

const LogbookPage = () => {
  const [formData, setFormData] = useState({
    visitor_name: "",
    address: "",
    purpose: "",
    contact_number: "",
  });

  // ADD this function after your states, inside the component:
  const loadLogbooks = async () => {
    try {
      console.log("🔄 Loading logbooks...");
      const response = await logbookAPI.getAll();
      console.log("📊 Logbook API response:", response);

      // Handle the response format from backend
      if (response && response.success) {
        setLogbooks(response.data || []);
      } else if (Array.isArray(response)) {
        setLogbooks(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setLogbooks(response.data);
      } else {
        setLogbooks([]);
      }
    } catch (err) {
      console.error("❌ Failed to load logbooks:", err);
      setNotification({
        show: true,
        message:
          "Failed to load logbook entries: " + (err.message || "Unknown error"),
        type: "error",
      });
      setLogbooks([]);
    }
  };

  const [logbooks, setLogbooks] = useState([]); // ADD this line
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("add");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [allLocations, setAllLocations] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss the notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // ✅ FIXED: Load initial data
  useEffect(() => {
    const locations = getAllLocations();
    setAllLocations(locations);

    const fetchLogs = async () => {
      try {
        const response = await logbookAPI.getAll();
        console.log("🔄 Initial load - Logbook API response:", response);

        // ✅ Handle ALL possible response formats
        let logsArray = [];

        if (response && response.success && Array.isArray(response.data)) {
          logsArray = response.data;
        } else if (Array.isArray(response)) {
          logsArray = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          logsArray = response.data;
        } else {
          logsArray = [];
        }

        setLogbooks(logsArray);
      } catch (err) {
        console.error("❌ Failed to load logbooks:", err);
        setNotification({
          show: true,
          message:
            "Failed to load logbook entries: " +
            (err.message || "Unknown error"),
          type: "error",
        });
        setLogbooks([]);
      }
    };

    fetchLogs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact_number") {
      let cleanNumber = value.replace(/\D/g, "");
      if (cleanNumber.length > 11) {
        cleanNumber = cleanNumber.slice(0, 11);
      }
      setFormData({ ...formData, [name]: cleanNumber });
    } else if (name === "address") {
      setFormData({ ...formData, [name]: value });

      if (value.trim().length > 0) {
        const filtered = allLocations
          .filter((location) =>
            location.toLowerCase().includes(value.toLowerCase())
          )
          .slice(0, 8);

        setAddressSuggestions(filtered);
        setShowAddressSuggestions(true);
      } else {
        setShowAddressSuggestions(false);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddressSelect = (selectedAddress) => {
    setFormData({ ...formData, address: selectedAddress });
    setShowAddressSuggestions(false);
  };

  // ✅ FIXED: Complete handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation (keep your existing validation)
      if (!formData.visitor_name.trim() || !formData.purpose.trim()) {
        setNotification({
          show: true,
          message: "Please fill in all required fields",
          type: "error",
        });
        setIsLoading(false);
        return;
      }

      if (formData.contact_number) {
        if (
          formData.contact_number.length !== 11 ||
          !formData.contact_number.startsWith("09")
        ) {
          setNotification({
            show: true,
            message:
              "Please enter a valid Philippine mobile number (11 digits starting with 09)",
            type: "error",
          });
          setIsLoading(false);
          return;
        }
      }

      // ✅ Simple API Call
      console.log("📤 Sending form data:", formData);
      await logbookAPI.create(formData);

      // ✅ Show SUCCESS notification
      setNotification({
        show: true,
        message: "✅ Logbook entry added successfully!",
        type: "success",
      });

      // ✅ Refresh data from server (SIMPLIFIED)
      const refreshedData = await logbookAPI.getAll();
      console.log("🔄 Refreshed data:", refreshedData);

      // Handle getAll response format
      let logsArray = [];
      if (
        refreshedData &&
        refreshedData.success &&
        Array.isArray(refreshedData.data)
      ) {
        logsArray = refreshedData.data;
      } else if (Array.isArray(refreshedData)) {
        logsArray = refreshedData;
      } else if (
        refreshedData &&
        refreshedData.data &&
        Array.isArray(refreshedData.data)
      ) {
        logsArray = refreshedData.data;
      }

      setLogbooks(logsArray);

      // ✅ Reset form
      setFormData({
        visitor_name: "",
        address: "",
        purpose: "",
        contact_number: "",
      });

      // ✅ Switch to records tab
      setActiveTab("records");
    } catch (err) {
      console.error("❌ Logbook create error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to save entry. Please try again.";

      setNotification({
        show: true,
        message: `❌ ${errorMessage}`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogbooks = selectedMonth
    ? logbooks.filter((log) => {
        // REMOVE optional chaining
        const logDate = new Date(log.date_logged);
        const logMonth = `${logDate.getFullYear()}-${String(
          logDate.getMonth() + 1
        ).padStart(2, "0")}`;
        return logMonth === selectedMonth;
      })
    : logbooks; // REMOVE optional chaining

  const searchFilteredLogbooks = filteredLogbooks.filter((log) => {
    // REMOVE optional chaining
    const matchesSearch =
      log.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.contact_number?.includes(searchTerm);
    return matchesSearch;
  });

  const stats = {
    total: logbooks.length || 0, // REMOVE the optional chaining (?.) since logbooks is now always an array
    today:
      logbooks.filter(
        // REMOVE the optional chaining
        (l) =>
          new Date(l.date_logged).toDateString() === new Date().toDateString()
      ).length || 0,
    // ... do the same for thisWeek and thisMonth (remove ?. from logbooks)
    thisWeek:
      logbooks.filter((l) => {
        // REMOVE ?.
        const date = new Date(l.date_logged);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      }).length || 0,
    thisMonth:
      logbooks.filter((l) => {
        // REMOVE ?.
        const date = new Date(l.date_logged);
        const now = new Date();
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }).length || 0,
  };
  const handlePrint = () => {
    const printContents = document.getElementById("printArea").innerHTML;
    const newWindow = window.open("", "", "width=900,height=650");
    newWindow.document.write(`
      <html>
        <head>
          <title>Visitor Logbook</title>
          <style>
            @media print {
              body { font-family: sans-serif; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #000; padding: 8px; text-align: left; }
              th { background: #f2f2f2; }
            }
          </style>
        </head>
        <body>
          <h2 style="text-align:center;">Visitor Logbook - ${
            selectedMonth || "All Records"
          }</h2>
          ${printContents}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Visitor Logbook Records", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString("en-PH")}`, 14, 22);

      doc.autoTable({
        startY: 28,
        head: [
          ["#", "Visitor Name", "Address", "Contact No.", "Purpose", "Date"],
        ],
        body: searchFilteredLogbooks.map((log, i) => [
          i + 1,
          log.visitor_name,
          log.address || "—",
          log.contact_number
            ? log.contact_number.startsWith("0")
              ? `+63${log.contact_number.substring(1)}`
              : log.contact_number
            : "—",
          log.purpose,
          log.date_logged
            ? new Date(log.date_logged).toLocaleString("en-PH")
            : "—",
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      doc.save("logbook.pdf");
    } catch (err) {
      setNotification({
        show: true,
        message: "Error generating PDF: " + err.message,
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] relative overflow-hidden">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(5px) rotate(240deg); }
        }
        @keyframes slideInFromTop {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-slideInFromTop { animation: slideInFromTop 0.3s ease-out; }

        @media (max-width: 640px) {
          .logbook-table th,
          .logbook-table td {
            padding: 8px 4px;
            font-size: 12px;
          }
          .logbook-table thead {
            display: none;
          }
          .logbook-table tbody,
          .logbook-table tr {
            display: block;
            width: 100%;
          }
          .logbook-table tr {
            margin-bottom: 12px;
            border-bottom: 1px solid #e5e7eb;
            padding: 8px;
            background: white;
            border-radius: 8px;
          }
          .logbook-table td {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border: none;
          }
          .logbook-table td::before {
            content: attr(data-label);
            font-weight: bold;
            color: #1e40af;
            width: 40%;
            text-align: left;
          }
          .logbook-table td:last-child {
            border-bottom: 0;
          }
        }
      `}</style>

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

      {/* Notification */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() =>
            setNotification({ show: false, message: "", type: "" })
          }
        />
      )}

      <div className="relative z-10 px-4 sm:px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="relative mb-6 sm:mb-12">
            <div className="bg-gradient-to-br from-[#0F4C81] via-[#58A1D3] to-[#B3DEF8] rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white relative overflow-hidden">
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
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex items-center space-x-4 sm:space-x-6 mb-4 sm:mb-0">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                      <BookOpen
                        size={window.innerWidth < 640 ? 24 : 32}
                        className="text-yellow-300"
                      />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                        <span className="text-cyan-200 text-xs sm:text-sm font-medium tracking-wide">
                          VISITOR MANAGEMENT
                        </span>
                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                      </div>
                      <h2 className="text-xl sm:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg">
                        Visitor Logbook
                      </h2>
                      <p className="text-sm sm:text-lg text-cyan-100">
                        Track and manage all visitor entries
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-black text-xs sm:text-sm font-semibold drop-shadow-lg">
                      Scroll to explore
                    </span>
                    <div className="w-6 sm:w-8 h-8 sm:h-12 border-2 sm:border-4 border-black rounded-full flex justify-center bg-white/90 shadow-lg animate-pulse">
                      <div className="w-1.5 sm:w-2 h-2 sm:h-4 bg-black rounded-full mt-1 sm:mt-2 animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tab Navigation */}
          <div className="group relative bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-3xl shadow-xl p-2 mb-4 sm:mb-8 border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <nav className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => setActiveTab("add")}
                  className={`flex-1 py-2 sm:py-4 px-3 sm:px-6 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 ${
                    activeTab === "add"
                      ? "bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white shadow-lg"
                      : "text-gray-600 hover:bg-white/50"
                  }`}
                >
                  Add New Entry
                </button>
                <button
                  onClick={() => setActiveTab("records")}
                  className={`flex-1 py-2 sm:py-4 px-3 sm:px-6 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 ${
                    activeTab === "records"
                      ? "bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white shadow-lg"
                      : "text-gray-600 hover:bg-white/50"
                  }`}
                >
                  All Records ({logbooks?.length || 0})
                </button>
              </nav>
            </div>
          </div>

          {activeTab === "add" ? (
            /* Add Entry Form */
            <div className="group relative bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-3xl shadow-xl p-4 sm:p-8 border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold text-[#0F4C81] mb-4 sm:mb-6">
                  Enter Visitor Information
                </h3>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                        Visitor Name *
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={window.innerWidth < 640 ? 16 : 20}
                        />
                        <input
                          type="text"
                          name="visitor_name"
                          value={formData.visitor_name}
                          onChange={handleChange}
                          placeholder="Enter visitor's full name"
                          required
                          className="w-full pl-9 sm:pl-12 pr-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                        Contact Number
                      </label>
                      <div className="relative">
                        <Phone
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={window.innerWidth < 640 ? 16 : 20}
                        />
                        <input
                          type="tel"
                          name="contact_number"
                          value={formData.contact_number}
                          onChange={handleChange}
                          placeholder="e.g., 09123456789"
                          maxLength={11}
                          className="w-full pl-9 sm:pl-12 pr-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>
                      {formData.contact_number &&
                        (formData.contact_number.length !== 11 ||
                          !formData.contact_number.startsWith("09")) && (
                          <p className="mt-1 text-xs text-red-600">
                            Please enter a valid 11-digit Philippine mobile
                            number starting with 09
                          </p>
                        )}
                    </div>

                    <div className="relative">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                        Address (City/Municipality, Province)
                      </label>
                      <div className="relative">
                        <MapPin
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={window.innerWidth < 640 ? 16 : 20}
                        />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          onFocus={() => {
                            if (formData.address.trim().length > 0)
                              setShowAddressSuggestions(true);
                          }}
                          onBlur={() => {
                            setTimeout(
                              () => setShowAddressSuggestions(false),
                              150
                            );
                          }}
                          placeholder="Start typing a Philippine location..."
                          className="w-full pl-9 sm:pl-12 pr-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        {showAddressSuggestions &&
                          addressSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 sm:mt-2 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-40 sm:max-h-60 overflow-y-auto">
                              {addressSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onMouseDown={() =>
                                    handleAddressSelect(suggestion)
                                  }
                                  className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 border-b border-gray-100 last:border-b-0 text-xs sm:text-sm"
                                >
                                  <div className="flex items-center">
                                    <span className="text-gray-400 mr-1 sm:mr-2">
                                      📍
                                    </span>
                                    <span className="text-gray-700">
                                      {suggestion}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Optional: Help us identify your location for better
                        service
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                        Purpose of Visit *
                      </label>
                      <div className="relative">
                        <BookOpen
                          className="absolute left-3 top-3 sm:top-4 text-gray-400"
                          size={window.innerWidth < 640 ? 16 : 20}
                        />
                        <textarea
                          name="purpose"
                          value={formData.purpose}
                          onChange={handleChange}
                          placeholder="Describe the purpose of this visit..."
                          required
                          rows={window.innerWidth < 640 ? 3 : 4}
                          className="w-full pl-9 sm:pl-12 pr-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-vertical"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold transform hover:scale-105 text-xs sm:text-sm"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Saving Entry...
                          </span>
                        ) : (
                          "Save Entry"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Records Section - REMAINS THE SAME */
            <>
              {/* Section Header */}
              <div className="text-center mb-6 sm:mb-12">
                <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6">
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#0F4C81] rounded-full animate-pulse"></div>
                  <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] bg-clip-text text-transparent">
                    Logbook Overview
                  </h2>
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#58A1D3] rounded-full animate-pulse"></div>
                </div>
                <p className="text-gray-600 text-sm sm:text-lg max-w-xl mx-auto">
                  Monitor visitor entries with real-time statistics
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-6 sm:mb-12">
                <StatCard
                  title="Total Visitors"
                  value={stats.total}
                  icon={User}
                  color="bg-gradient-to-br from-blue-500 to-cyan-500"
                  hovered={hoveredCard === "total"}
                  onMouseEnter={() => setHoveredCard("total")}
                  onMouseLeave={() => setHoveredCard(null)}
                />
                <StatCard
                  title="Today"
                  value={stats.today}
                  icon={Calendar}
                  color="bg-gradient-to-br from-emerald-500 to-teal-500"
                  hovered={hoveredCard === "today"}
                  onMouseEnter={() => setHoveredCard("today")}
                  onMouseLeave={() => setHoveredCard(null)}
                />
                <StatCard
                  title="This Week"
                  value={stats.thisWeek}
                  icon={Clock}
                  color="bg-gradient-to-br from-purple-500 to-pink-500"
                  hovered={hoveredCard === "week"}
                  onMouseEnter={() => setHoveredCard("week")}
                  onMouseLeave={() => setHoveredCard(null)}
                />
                <StatCard
                  title="This Month"
                  value={stats.thisMonth}
                  icon={FileText}
                  color="bg-gradient-to-br from-orange-500 to-red-500"
                  hovered={hoveredCard === "month"}
                  onMouseEnter={() => setHoveredCard("month")}
                  onMouseLeave={() => setHoveredCard(null)}
                />
              </div>

              {/* Search and Filter Bar - FIXED: Solid Black Icons (Same as Blotter) */}
              <div className="group relative bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-3xl shadow-xl p-3 sm:p-6 mb-4 sm:mb-8 border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Search
                        size={window.innerWidth < 640 ? 16 : 20}
                        className="text-white"
                      />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[#0F4C81]">
                        Search & Filter
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Find specific logbook entries
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    {/* Search Input - Solid Black Icon */}
                    <div className="flex-1 relative">
                      <Search
                        size={22}
                        strokeWidth={3}
                        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-black z-10"
                        style={{ filter: "none", opacity: 1 }}
                      />
                      <input
                        type="text"
                        placeholder="Search by name, address, contact, or purpose..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-4 py-3 sm:py-4 bg-white/70 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-500 font-medium text-sm"
                      />
                    </div>

                    {/* Month Filter - Solid Black Calendar Icon */}
                    <div className="relative">
                      <Calendar
                        size={22}
                        strokeWidth={3}
                        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-black z-10"
                        style={{ filter: "none", opacity: 1 }}
                      />
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="pl-14 pr-8 py-3 sm:py-4 bg-white/70 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white transition-all duration-300 text-gray-800 appearance-none cursor-pointer font-medium text-sm"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23000000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: "right 16px center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "16px",
                        }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-1.5 bg-white/70 backdrop-blur-sm px-4 py-3 sm:py-4 rounded-xl hover:bg-white/90 border border-gray-300/50 transition-all duration-300 font-medium text-gray-800 text-sm whitespace-nowrap"
                        title="Print Records"
                      >
                        <PrinterIcon />
                        <span className="hidden sm:inline">Print</span>
                      </button>
                      <button
                        onClick={handleExportPDF}
                        className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white px-4 py-3 sm:py-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-medium text-sm whitespace-nowrap"
                        title="Export as PDF"
                      >
                        <FileTextIcon />
                        <span className="hidden sm:inline">PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div
                className="group relative bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-3xl shadow-xl overflow-hidden border border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 logbook-table-container"
                style={{ height: "60vh", minHeight: "400px" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex-1 overflow-auto">
                    <div id="printArea">
                      <table className="w-full divide-y divide-gray-200 logbook-table">
                        <thead className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] sticky top-0 z-10">
                          <tr>
                            <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                              Visitor Name
                            </th>
                            <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                              Address
                            </th>
                            <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                              Purpose
                            </th>
                            <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                              Officer
                            </th>
                            <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                          {searchFilteredLogbooks &&
                          searchFilteredLogbooks.length > 0 ? (
                            searchFilteredLogbooks.map((log, i) => (
                              <tr
                                key={log.logbook_id || i}
                                className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300 border-b border-gray-100 group"
                              >
                                <td
                                  className="px-2 sm:px-6 py-2 sm:py-4"
                                  data-label="Visitor Name"
                                >
                                  <div className="flex items-center">
                                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-1 sm:p-3 mr-1 sm:mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                      <User
                                        size={window.innerWidth < 640 ? 12 : 18}
                                        className="text-white"
                                      />
                                    </div>
                                    <div>
                                      <div className="text-xs sm:text-sm font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
                                        {log.visitor_name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Visitor
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td
                                  className="px-2 sm:px-6 py-2 sm:py-4"
                                  data-label="Address"
                                >
                                  <div className="text-xs sm:text-sm font-medium text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
                                    {log.address || "—"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Address
                                  </div>
                                </td>
                                <td
                                  className="px-2 sm:px-6 py-2 sm:py-4"
                                  data-label="Contact"
                                >
                                  <div className="text-xs sm:text-sm text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
                                    {log.contact_number
                                      ? log.contact_number.startsWith("0")
                                        ? `+63${log.contact_number.substring(
                                            1
                                          )}`
                                        : log.contact_number
                                      : "—"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Contact
                                  </div>
                                </td>
                                <td
                                  className="px-2 sm:px-6 py-2 sm:py-4"
                                  data-label="Purpose"
                                >
                                  <div className="text-xs sm:text-sm font-medium text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
                                    {log.purpose}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Purpose
                                  </div>
                                </td>
                                <td
                                  className="px-2 sm:px-6 py-2 sm:py-4"
                                  data-label="Officer"
                                >
                                  <div className="text-xs sm:text-sm text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
                                    {log.officer_in_charge}
                                  </div>
                                  {log.role_name && (
                                    <div className="text-xs text-gray-500">
                                      {log.role_name
                                        .replace(/_/g, " ")
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase()
                                        )}
                                    </div>
                                  )}
                                </td>
                                <td
                                  className="px-2 sm:px-6 py-2 sm:py-4"
                                  data-label="Date"
                                >
                                  <div className="text-xs sm:text-sm text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
                                    {log.date_logged
                                      ? new Date(
                                          log.date_logged
                                        ).toLocaleString("en-PH")
                                      : "—"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Logged
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="6"
                                className="text-center py-4 sm:py-16"
                              >
                                <div className="flex flex-col items-center">
                                  <div className="w-12 sm:w-20 h-12 sm:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-6">
                                    <Search
                                      size={window.innerWidth < 640 ? 16 : 32}
                                      className="text-gray-400"
                                    />
                                  </div>
                                  <p className="text-gray-600 text-sm sm:text-xl font-semibold mb-1 sm:mb-2">
                                    No visitor records found
                                  </p>
                                  <p className="text-gray-500 text-xs sm:text-sm">
                                    {searchTerm || selectedMonth
                                      ? "Try adjusting your search criteria"
                                      : "Start by adding your first visitor entry"}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogbookPage;
