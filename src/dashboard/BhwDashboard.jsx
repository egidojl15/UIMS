// src/dashboard/BhwDashboard.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Menu,
  X,
  Users,
  HeartPulse,
  FileText,
  ClipboardPlus,
  ClockIcon,
  Baby,
  Syringe,
  User,
  Activity,
  LogOut,
  Bell,
  Skull,
  Home as HomeIcon,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  residentsAPI,
  deathsAPI,
  householdsAPI,
  loginsAPI,
} from "../services/api";
import NotificationSystem from "../components/NotificationSystem"; // Add this import
// import { create } from 'framer-motion/client';

// Helper to auto-update age
function calculateAge(birthdate) {
  if (!birthdate) return "";
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age < 0 ? 0 : age; // Prevent negative ages
}

const bhwUser = {
  name: "Jetler Egido",
  role: "Barangay Health Worker",
};

const navItems = [
  { name: "BHW Dashboard", key: "", icon: HomeIcon },
  { name: "Manage Residents", key: "manage-residents", icon: Users },
  { name: "Manage Households", key: "manage-households", icon: HomeIcon },
  { name: "Health Records", key: "health-records", icon: HeartPulse },
  {
    name: "Maternal & Child Health",
    key: "maternal-child-health",
    icons: [Baby, Syringe],
  }, // New item
  { name: "Medical Referral", key: "medical-referral", icon: ClipboardPlus },
  // { name: "Generate Reports", key: "generate-reports", icon: FileText },
  { name: "Death Reports", key: "death-reports", icon: Skull }, // New item
];

const purokOptions = [
  { value: "", label: "All Purok" },
  { value: "Barola", label: "Barola" },
  { value: "Go", label: "Go" },
  { value: "Hanopol", label: "Hanopol" },
];

const initialHealthRecords = [
  {
    id: "HR-001",
    residentId: "R-0001",
    patient: "Juan Dela Cruz",
    condition: "Regular Checkup",
    date: "2025-07-25",
    status: "Completed",
    notes: "",
  },
  {
    id: "HR-002",
    residentId: "R-0002",
    patient: "Maria Santos",
    condition: "Hypertension Monitoring",
    date: "2025-07-20",
    status: "Ongoing",
    notes: "",
  },
];

const initialReferrals = [
  {
    id: "REF-001",
    patient: "Pedro Reyes",
    facility: "Provincial Hospital",
    reason: "X-Ray",
    status: "Pending",
    date: "",
    height: "",
    weight: "",
  },
];

const BhwDashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showResidentForm, setShowResidentForm] = useState(false);
  const [showHealthRecordForm, setShowHealthRecordForm] = useState(false);
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [residents, setResidents] = useState([]);
  const [healthRecords, setHealthRecords] = useState(initialHealthRecords);
  const [referrals, setReferrals] = useState(initialReferrals);
  const [activityLog, setActivityLog] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [healthSearch, setHealthSearch] = useState("");
  const [referralSearch, setReferralSearch] = useState("");
  const [purokFilter, setPurokFilter] = useState("");
  const [selectedResident, setSelectedResident] = useState(null);
  const [editResident, setEditResident] = useState(null);
  const [selectedHealthRecord, setSelectedHealthRecord] = useState(null);
  const [editHealthRecord, setEditHealthRecord] = useState(null);
  const hasNotifiedRef = useRef(false);
  const [showDeathForm, setShowDeathForm] = useState(false);
  const [deaths, setDeaths] = useState([]);
  const [selectedDeath, setSelectedDeath] = useState(null);
  const [editDeath, setEditDeath] = useState(null);
  const [households, setHouseholds] = useState([]);
  const navigate = useNavigate();

  // Define removeNotification first
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  // Define addNotification after removeNotification
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
    [] // Remove removeNotification from dependency array
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log("Click outside detected, showUserMenu:", showUserMenu);
      console.log("Target element:", event.target);
      console.log(
        "Closest user-dropdown:",
        event.target.closest(".user-dropdown")
      );

      if (showUserMenu && !event.target.closest(".user-dropdown")) {
        console.log("Closing user menu due to outside click");
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        console.log("Fetching residents...");
        const data = await residentsAPI.getAll();
        console.log("Residents API response:", data);
        if (data.success) {
          setResidents(data.data || []);
          console.log("Residents loaded:", data.data.length);
          // Data loaded silently - no notification needed
          hasNotifiedRef.current = true;
        } else {
          console.error("API response unsuccessful:", data.message);
          setResidents([]);
          addNotification(
            "error",
            "Load Failed",
            data.message || "Failed to load residents data"
          );
        }
      } catch (error) {
        console.error("Failed to fetch residents:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setResidents([]);
        addNotification(
          "error",
          "Load Failed",
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch residents"
        );
      }
    };

    const fetchHouseholds = async () => {
      try {
        console.log("Fetching households...");
        const data = await householdsAPI.getAll();
        console.log("Households API response:", data);
        if (data && data.success) {
          setHouseholds(data.households || []);
          console.log("Households loaded:", data.households?.length || 0);
        } else {
          console.error(
            "Failed to load households:",
            data?.message || "Unknown error"
          );
          setHouseholds([]);
        }
      } catch (error) {
        console.error("Error fetching households:", error);
        setHouseholds([]);
      }
    };

    fetchResidents();
    fetchHouseholds();
  }, []);

  useEffect(() => {
    const fetchDeaths = async () => {
      try {
        const data = await deathsAPI.getAll();
        console.log("Fetched death records:", data); // Debugging
        if (data.success) {
          setDeaths(data.data || []);
          // Data loaded silently - no notification needed
        } else {
          setDeaths([]);
          addNotification(
            "error",
            "Load Failed",
            "Failed to load death records"
          );
        }
      } catch (error) {
        setDeaths([]);
        addNotification(
          "error",
          "Load Failed",
          "Failed to fetch death records"
        );
      }
    };
    fetchDeaths();
  }, [addNotification]);
  // Timer to auto-dismiss confirmation messages
  // useEffect(() => {
  //   if (addNotification) {
  //     const timer = setTimeout(() => {
  //       removeNotification(null);
  //     }, 5000); // Auto-dismiss after 5 seconds
  //     return () => clearTimeout(timer);
  //   }
  // }, [addNotification]);

  const [residentForm, setResidentForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    date_of_birth: "",
    gender: "",
    civil_status: "",
    contact_number: "",
    email: "",
    religion: "",
    occupation: "",
    educational_attainment: "",
    purok: "",
    is_registered_voter: false,
    is_4ps: false,
    is_pwd: false,
    is_senior_citizen: false,
    registered_date: "",
    created_at: "",
    updated_at: "",
    photo_url: "",
  });

  const [healthRecordForm, setHealthRecordForm] = useState({
    residentId: "",
    patient: "",
    condition: "",
    date: "",
    notes: "",
    status: "Ongoing",
  });

  const [referralForm, setReferralForm] = useState({
    patient: "",
    facility: "",
    reason: "",
    date: "",
    status: "Pending",
    height: "",
    weight: "",
  });

  const handleLogout = async () => {
    try {
      // Use the enhanced logout method that records logout in login_history
      await loginsAPI.logout();

      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still navigate to login even if there's an error
      navigate("/login");
    }
  };

  // FIXED: Add resident handler
  const handleResidentSubmit = async (e, photoFile = null) => {
    e.preventDefault();

    try {
      console.log("=== SUBMITTING RESIDENT FORM ===");
      console.log("Form data:", residentForm);
      console.log("Photo file:", photoFile);

      // Validate required fields
      if (
        !residentForm.first_name ||
        !residentForm.last_name ||
        !residentForm.date_of_birth ||
        !residentForm.gender ||
        !residentForm.civil_status ||
        !residentForm.purok
      ) {
        alert("Please fill in all required fields");
        return;
      }

      // Validate contact number if provided
      if (residentForm.contact_number) {
        const cleanNumber = residentForm.contact_number.replace(/\D/g, "");
        if (cleanNumber.length !== 11 || !cleanNumber.startsWith("09")) {
          alert("Contact number must be 11 digits starting with 09");
          return;
        }
      }

      // Prepare data for submission
      const submitData = {
        ...residentForm,
        photo_file: photoFile || residentForm.photo_file,
      };

      const response = await residentsAPI.create(submitData);

      if (response.success) {
        addNotification(
          "success",
          "Resident Added",
          "Resident information has been saved successfully"
        );
        setShowResidentForm(false);

        // Reset form
        setResidentForm({
          first_name: "",
          middle_name: "",
          last_name: "",
          suffix: "",
          date_of_birth: "",
          gender: "",
          civil_status: "",
          contact_number: "",
          email: "",
          purok: "",
          is_4ps: false,
          is_registered_voter: false,
          is_pwd: false,
          is_senior_citizen: false,
          photo_file: null,
        });

        // Refresh residents list
        await fetchResidents(); // Make sure this function exists
      }
    } catch (error) {
      console.error("Failed to add resident:", error);
      addNotification(
        "error",
        "Add Failed",
        `Failed to add resident: ${error.message || "Unknown error"}`
      );
    }
  };

  const fetchResidents = async () => {
    try {
      console.log("Fetching residents...");
      const response = await residentsAPI.getAll();

      if (response.success) {
        setResidents(response.data);
        console.log("Residents loaded:", response.data.length);
      } else {
        console.error("Failed to fetch residents:", response.message);
      }
    } catch (error) {
      console.error("Error fetching residents:", error);
    }
  };

  const fetchHouseholds = async () => {
    try {
      console.log("Fetching households...");
      const response = await householdsAPI.getAll();

      if (response.success) {
        setHouseholds(response.households || []);
        console.log("Households loaded:", response.households?.length || 0);
      } else {
        console.error("Failed to fetch households:", response.message);
      }
    } catch (error) {
      console.error("Error fetching households:", error);
    }
  };

  // FIXED: Edit resident handler
  const handleResidentEdit = async (id, updatedData) => {
    try {
      console.log("=== EDITING RESIDENT ===");
      console.log("Resident ID:", id);
      console.log("Updated data:", updatedData);

      // Validate required fields
      if (
        !updatedData.first_name ||
        !updatedData.last_name ||
        !updatedData.date_of_birth ||
        !updatedData.gender ||
        !updatedData.civil_status ||
        !updatedData.purok
      ) {
        alert("Please fill in all required fields");
        return;
      }

      // Validate contact number if provided
      if (updatedData.contact_number) {
        const cleanNumber = updatedData.contact_number.replace(/\D/g, "");
        if (cleanNumber.length !== 11 || !cleanNumber.startsWith("09")) {
          alert("Contact number must be 11 digits starting with 09");
          return;
        }
      }

      const response = await residentsAPI.update(id, updatedData);

      if (response.success) {
        addNotification(
          "success",
          "Resident Updated",
          "Resident information has been updated successfully"
        );
        setEditResident(null);
        fetchResidents();
      }
    } catch (error) {
      console.error("Failed to update resident:", error);
      addNotification(
        "error",
        "Update Failed",
        `Failed to update resident: ${error.message || "Unknown error"}`
      );
    }
  };

  // FIXED: Soft delete resident with new address tracking
  const handleResidentDelete = async (id, newAddress = null) => {
    try {
      const response = await residentsAPI.deactivate(id, {
        new_address: newAddress,
      });

      // Check API response for success
      if (response.success) {
        // SUCCESS: Remove the resident from the local state list (immediate view update)
        setResidents((prevResidents) =>
          prevResidents.filter((r) => r.resident_id !== id)
        );
        addNotification(
          "success",
          "Resident Deactivated",
          `Resident ID ${id} has been marked as inactive${
            newAddress ? ` and new address recorded` : ""
          }`
        );
        return true; // Indicate successful soft delete
      } else {
        // Handle non-success API responses (e.g., 400 for already inactive)
        addNotification(
          "error",
          "Delete Failed",
          response.message || "Failed to deactivate resident"
        );
        return false;
      }
    } catch (error) {
      // Extract error message
      const apiErrorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred.";
      console.error("Failed to soft delete resident:", apiErrorMessage, error);

      // Handle specific cases
      if (apiErrorMessage.includes("not found or already inactive")) {
        // Treat as success for UI purposes (remove from view)
        setResidents((prevResidents) =>
          prevResidents.filter((r) => r.resident_id !== id)
        );
        addNotification(
          "info",
          "Already Inactive",
          `Resident ID ${id} was already inactive and has been removed from view`
        );
        return true;
      }

      // Handle other errors (e.g., 500 Internal Server Error)
      addNotification(
        "error",
        "Delete Failed",
        `Could not delete resident. Error: ${apiErrorMessage}`
      );
      return false; // Indicate failed soft delete
    }
  };
  const handleHealthRecordSubmit = (e) => {
    e.preventDefault();
    const newId = `HR-${String(healthRecords.length + 1).padStart(3, "0")}`;
    setHealthRecords([...healthRecords, { id: newId, ...healthRecordForm }]);
    setActivityLog([
      {
        action: "Health record created",
        id: newId,
        time: new Date(),
        status: "Success",
      },
      ...activityLog,
    ]);
    setConfirmation(`Health record created. Record ID: ${newId}`);
    setShowHealthRecordForm(false);
    setHealthRecordForm({
      residentId: "",
      patient: "",
      condition: "",
      date: "",
      notes: "",
      status: "Ongoing",
    });
  };

  const handleHealthRecordEdit = (e) => {
    e.preventDefault();
    setHealthRecords(
      healthRecords.map((hr) =>
        hr.id === editHealthRecord.id ? editHealthRecord : hr
      )
    );
    setActivityLog([
      {
        action: "Health record updated",
        id: editHealthRecord.id,
        time: new Date(),
        status: "Edited",
      },
      ...activityLog,
    ]);
    setConfirmation(`Health record ${editHealthRecord.id} updated.`);
    setEditHealthRecord(null);
  };

  const handleHealthRecordDelete = (id) => {
    setHealthRecords(healthRecords.filter((hr) => hr.id !== id));
    setActivityLog([
      {
        action: "Health record deleted",
        id,
        time: new Date(),
        status: "Deleted",
      },
      ...activityLog,
    ]);
    setConfirmation(`Health record ${id} deleted.`);
  };

  const handleReferralSubmit = (e) => {
    e.preventDefault();
    const newId = `REF-${String(referrals.length + 1).padStart(3, "0")}`;
    setReferrals([...referrals, { id: newId, ...referralForm }]);
    setActivityLog([
      {
        action: "Medical referral created",
        id: newId,
        time: new Date(),
        status: "Success",
      },
      ...activityLog,
    ]);
    setConfirmation(`Medical referral created. Reference ID: ${newId}`);
    setShowReferralForm(false);
    setReferralForm({
      patient: "",
      facility: "",
      reason: "",
      date: "",
      status: "Pending",
      height: "",
      weight: "",
    });
  };

  const handleReferralPatientChange = (name) => {
    setReferralForm((form) => {
      const resident = residents.find((r) => r.name === name);
      return {
        ...form,
        patient: name,
        height: resident?.height || "",
        weight: resident?.weight || "",
      };
    });
  };

  // Update filteredResidents search to include new fields
  const filteredResidents = residents.filter((resident) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = `${resident.first_name || ""} ${
      resident.middle_name || ""
    } ${resident.last_name || ""} ${resident.suffix || ""} ${
      resident.gender || ""
    } ${resident.civil_status || ""} ${resident.contact_number || ""} ${
      resident.email || ""
    } ${resident.religion || ""} ${resident.occupation || ""} ${
      resident.educational_attainment || ""
    }`
      .toLowerCase()
      .includes(query);

    const matchesPurok = purokFilter === "" || resident.purok === purokFilter;

    return matchesSearch && matchesPurok;
  });

  const filteredHealthRecords = healthRecords.filter(
    (hr) =>
      hr.patient.toLowerCase().includes(healthSearch.toLowerCase()) ||
      hr.id.toLowerCase().includes(healthSearch.toLowerCase())
  );

  const filteredReferrals = referrals.filter(
    (ref) =>
      ref.patient.toLowerCase().includes(referralSearch.toLowerCase()) ||
      ref.id.toLowerCase().includes(referralSearch.toLowerCase())
  );

  const sidebarNav = [
    ...navItems,
    { name: "Activity Log", key: "activity-log", icon: ClockIcon },
  ];

  // Add notification badge to mobile menu
  const hasUnreadNotifications = notifications.length > 0;

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex">
      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />

      {/* Top Header (Councilor-style) */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg z-[100] h-24 flex items-center justify-between px-6 border-b border-white/20">
        <div className="flex items-center space-x-4">
          <img
            src="/images/UIMS.png"
            alt="UIMS Logo"
            className="w-20 h-20 object-contain"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] bg-clip-text text-transparent">
            BHW Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mobile Hamburger Menu */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-[#0F4C81] hover:bg-white/50 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop User Menu */}
          <div className="relative user-dropdown hidden lg:block">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/70"
            >
              <User size={20} className="text-gray-600" />
              <span className="font-medium">Barangay Health Worker</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl py-2 z-[9999] border border-white/20">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("my-profile");
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0F4C81] transition-colors duration-200 rounded-lg mx-2"
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 rounded-lg mx-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <nav className="hidden lg:block fixed left-0 top-24 h-[calc(100vh-6rem)] bg-white shadow-lg p-4 lg:p-6 border-r border-gray-200 transition-all duration-300 w-64 overflow-y-auto">
        {/* Nav */}
        <ul className="space-y-2">
          {sidebarNav
            .filter((item) => item.key !== "logout")
            .map((item) => (
              <li key={item.key}>
                <NavLink
                  to={item.key === "" ? "." : item.key}
                  end={item.key === ""}
                  className={({ isActive }) =>
                    `w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left font-medium transition-all duration-300 group relative
                    ${
                      isActive
                        ? "bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white shadow-lg shadow-blue-500/30"
                        : "text-gray-700 hover:bg-white/50 hover:text-[#0F4C81] hover:shadow-md"
                    }`
                  }
                  onClick={() => {
                    if (item.key === "activity-log") {
                      setShowActivityLog(true);
                    } else {
                      setShowActivityLog(false);
                    }
                  }}
                >
                  {/* Updated: Render single icon OR multiple icons */}
                  {item.icon ? (
                    <item.icon
                      size={20}
                      className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : item.icons ? (
                    <div className="flex space-x-1">
                      {item.icons.map((Icon, idx) => (
                        <Icon
                          key={idx}
                          size={20}
                          className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                        />
                      ))}
                    </div>
                  ) : null}
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
        </ul>
      </nav>

      {/* Mobile Menu (Councilor-style overlay) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="fixed top-24 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-white/20 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2 space-y-1 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <ul className="space-y-2">
                {sidebarNav
                  .filter((item) => item.key !== "logout")
                  .map((item) => (
                    <li key={item.key}>
                      <NavLink
                        to={item.key === "" ? "." : item.key}
                        end={item.key === ""}
                        className={({ isActive }) =>
                          `w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left font-medium transition-all duration-300 group ${
                            isActive
                              ? "bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white shadow-lg shadow-blue-500/30"
                              : "text-gray-700 hover:bg-white/50 hover:text-[#0F4C81]"
                          }`
                        }
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          if (item.key === "activity-log") {
                            setShowActivityLog(true);
                          } else {
                            setShowActivityLog(false);
                          }
                        }}
                      >
                        {item.icon ? (
                          <item.icon
                            size={20}
                            className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : item.icons ? (
                          <div className="flex space-x-1">
                            {item.icons.map((Icon, idx) => (
                              <Icon
                                key={idx}
                                size={20}
                                className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                              />
                            ))}
                          </div>
                        ) : null}
                        <span>{item.name}</span>
                      </NavLink>
                    </li>
                  ))}
              </ul>
              <button
                onClick={() => {
                  navigate("my-profile");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left font-medium transition-all duration-300 text-gray-700 hover:bg-white/50 hover:text-[#0F4C81]"
              >
                <User size={20} className="flex-shrink-0" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-2xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 mt-2 flex items-center justify-center space-x-2"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] overflow-y-auto lg:ml-64 pt-24 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 min-h-full">
          {/* Dynamic content rendering */}
          <Outlet
            context={{
              // Residents data
              residents,
              filteredResidents,
              searchQuery,
              setSearchQuery,
              purokFilter,
              setPurokFilter,
              setShowResidentForm,
              setSelectedResident,
              setEditResident,
              fetchResidents,
              handleResidentDelete,
              showResidentForm,
              selectedResident,
              editResident,
              residentForm,
              setResidentForm,
              handleResidentSubmit,
              handleResidentEdit,
              calculateAge,
              purokOptions,
              households,
              // Health records data - keep existing
              filteredHealthRecords,
              healthSearch,
              setHealthSearch,
              setShowHealthRecordForm,
              selectedHealthRecord,
              setSelectedHealthRecord,
              editHealthRecord,
              setEditHealthRecord,
              handleHealthRecordDelete,
              // Referrals data - keep existing
              filteredReferrals,
              referralSearch,
              setReferralSearch,
              setShowReferralForm,
              handleReferralPatientChange,
              bhwUser,
              // New notification system
              addNotification,
              removeNotification,
              // New death-related context
              deaths,
              setDeaths,
              showDeathForm,
              setShowDeathForm,
              selectedDeath,
              setSelectedDeath,
              editDeath,
              setEditDeath,
            }}
          />
        </div>
      </main>
    </div>
  );
};
export { calculateAge };
export default BhwDashboard;
