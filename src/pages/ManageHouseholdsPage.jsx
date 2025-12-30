import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Home,
  Phone,
  MapPin,
  User,
  Search,
  Filter,
  X,
  FileText,
  Download,
} from "lucide-react";
import {
  householdsAPI,
  residentsAPI,
  reportsAPI,
  logUserActivity,
} from "../services/api";
import NotificationSystem from "../components/NotificationSystem";
import ReportGenerator from "../components/ReportGenerator";

const ManageHouseholdsPage = () => {
  const [households, setHouseholds] = useState([]);
  const [filteredHouseholds, setFilteredHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPurok, setFilterPurok] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingHousehold, setEditingHousehold] = useState(null);
  const [viewingMembers, setViewingMembers] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmReassign, setConfirmReassign] = useState(null);
  const [reassigning, setReassigning] = useState(false);
  const [reassignSuccess, setReassignSuccess] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [currentReportType, setCurrentReportType] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [purokOptions, setPurokOptions] = useState([]);

  const addNotification = useCallback(
    (type, title, message = "", autoDismiss = true) => {
      const newNotification = {
        id: Date.now() + Math.random(),
        type,
        title,
        message,
        autoDismiss,
        timestamp: new Date(),
      };
      setNotifications((prev) => [...prev, newNotification]);
    },
    []
  );

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchHouseholds();
    loadPurokOptions();
  }, []);

  useEffect(() => {
    filterHouseholds();
  }, [households, searchTerm, filterPurok]);

  // Load purok options for reports
  const loadPurokOptions = async () => {
    try {
      const response = await reportsAPI.getPuroks();
      if (response.success) {
        setPurokOptions(response.data);
      }
    } catch (error) {
      console.error("Error loading purok options:", error);
    }
  };

  const fetchHouseholds = async () => {
    try {
      setLoading(true);
      const response = await householdsAPI.getAll();
      if (response.success) {
        const households = response.households || [];

        // Fetch detailed information for each household including members
        const detailedHouseholds = await Promise.all(
          households.map(async (household) => {
            try {
              const detailResponse = await householdsAPI.getById(
                household.household_id
              );
              if (detailResponse.success) {
                return detailResponse.household;
              }
              return household; // Fallback to basic household data
            } catch (error) {
              console.error(
                `Error fetching details for household ${household.household_id}:`,
                error
              );
              return household; // Fallback to basic household data
            }
          })
        );

        setHouseholds(detailedHouseholds);
      } else {
        addNotification(
          "error",
          "Load Failed",
          response.message || "Failed to load households"
        );
      }
    } catch (error) {
      console.error("Error fetching households:", error);
      addNotification("error", "Load Failed", "Failed to load households data");
    } finally {
      setLoading(false);
    }
  };

  const filterHouseholds = () => {
    let filtered = households;

    if (searchTerm) {
      filtered = filtered.filter(
        (household) =>
          household.household_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          household.household_head_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (filterPurok) {
      filtered = filtered.filter(
        (household) => household.purok === filterPurok
      );
    }

    setFilteredHouseholds(filtered);
  };

  // Report generation functions
  const handleGenerateHouseholdSummaryReport = async (filters) => {
    try {
      const response = await reportsAPI.generateHouseholdSummary(filters);
      if (response.success) {
        if (filters.preview) {
          return response.data;
        } else {
          // Generate actual report file
          generateReportFile(response.data, "Household Summary Report", [
            { key: "household_number", label: "Household #", type: "text" },
            {
              key: "household_head_name",
              label: "Head of Household",
              type: "text",
            },
            { key: "spouse_name", label: "Spouse", type: "text" },
            { key: "purok", label: "Purok", type: "text" },
            { key: "member_count", label: "Total Members", type: "number" },
            { key: "member_names", label: "Members", type: "text" },
            { key: "male_count", label: "Male", type: "number" },
            { key: "female_count", label: "Female", type: "number" },
            { key: "minor_count", label: "Minors", type: "number" },
            { key: "senior_count", label: "Seniors", type: "number" },
          ]);
          addNotification(
            "success",
            "Report Generated",
            "Household summary report has been generated successfully"
          );
        }
      }
    } catch (error) {
      addNotification(
        "error",
        "Report Failed",
        error.message || "Failed to generate household summary report"
      );
      throw error;
    }
  };

  const generateReportFile = (data, title, columns) => {
    // Import jsPDF dynamically
    import("jspdf")
      .then(({ default: jsPDF }) => {
        import("jspdf-autotable").then(({ default: autoTable }) => {
          const doc = new jsPDF();

          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();

          // Add Republic of the Philippines header
          doc.setFontSize(10);
          doc.setFont(undefined, "normal");
          doc.text("Republic of the Philippines", pageWidth / 2, 12, {
            align: "center",
          });
          doc.text("Province of Southern Leyte", pageWidth / 2, 17, {
            align: "center",
          });
          doc.text("Municipality of Macrohon", pageWidth / 2, 22, {
            align: "center",
          });

          // Add barangay header
          doc.setFontSize(14);
          doc.setFont(undefined, "bold");
          doc.text("BARANGAY HEALTH RECORDS", pageWidth / 2, 30, {
            align: "center",
          });

          // Add title
          doc.setFontSize(11);
          doc.setFont(undefined, "normal");
          doc.text(title, pageWidth / 2, 36, { align: "center" });

          // Add date
          doc.setFontSize(9);
          const dateStr = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          doc.text(`Generated on: ${dateStr}`, 14, 43);

          // Prepare table data
          const tableColumns = columns.map((col) => col.label);
          const tableRows = data.map((row) =>
            columns.map((col) => {
              const value = row[col.key] || "";
              return value.toString();
            })
          );

          // Add table
          autoTable(doc, {
            head: [tableColumns],
            body: tableRows,
            startY: 48,
            styles: {
              fontSize: 8,
              cellPadding: 3,
            },
            headStyles: {
              fillColor: [15, 76, 129], // #0F4C81
              textColor: 255,
              fontStyle: "bold",
            },
            alternateRowStyles: {
              fillColor: [248, 249, 250],
            },
            margin: { top: 35 },
          });

          // Save the PDF
          doc.save(`${title}_${new Date().toISOString().split("T")[0]}.pdf`);
        });
      })
      .catch((error) => {
        console.error("Error loading PDF libraries:", error);
        addNotification(
          "error",
          "PDF Error",
          "Failed to generate PDF. Please try again."
        );
      });
  };

  const openReportGenerator = (reportType) => {
    setCurrentReportType(reportType);
    setShowReportGenerator(true);
  };

  const handleDelete = async (householdId) => {
    try {
      const response = await householdsAPI.delete(householdId);
      if (response.success) {
        // Log the activity
        await logUserActivity(
          "Delete Household",
          "household",
          householdId,
          `Household ID ${householdId}`,
          "completed",
          "Household removed from system",
          "Household deleted successfully"
        );

        addNotification(
          "success",
          "Household Deleted",
          "Household deleted successfully"
        );
        fetchHouseholds();
      } else {
        addNotification(
          "error",
          "Delete Failed",
          response.message || "Failed to delete household"
        );
      }
    } catch (error) {
      console.error("Error deleting household:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete household";
      addNotification("error", "Delete Failed", errorMessage);
    }
  };

  const handleEdit = (household) => {
    setEditingHousehold(household);
    setShowForm(true);
  };

  const handleViewMembers = (household) => {
    setViewingMembers(household);
  };

  const handleReassignMembers = async (household) => {
    if (!household.members || household.members.length === 0) {
      addNotification(
        "info",
        "No Members",
        "This household has no members to reassign"
      );
      return;
    }

    try {
      // Reassign all members to no household (set household_id to null)
      const reassignPromises = household.members.map((member) =>
        residentsAPI.updateHousehold(member.resident_id, null)
      );

      await Promise.all(reassignPromises);

      addNotification(
        "success",
        "Members Reassigned",
        "All members have been reassigned to 'No Household'"
      );

      // Refresh households to update member counts
      fetchHouseholds();
    } catch (error) {
      console.error("Error reassigning members:", error);
      addNotification(
        "error",
        "Reassign Failed",
        "Failed to reassign members. Please try again."
      );
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingHousehold(null);
  };

  const handleFormSubmit = () => {
    fetchHouseholds();
    handleFormClose();
  };

  const getUniquePuroks = () => {
    const puroks = households
      .map((h) => h.purok)
      .filter((purok) => purok && purok.trim() !== "")
      .filter((purok, index, arr) => arr.indexOf(purok) === index);
    return puroks.sort();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0F4C81]"></div>
      </div>
    );
  }

  return (
    <section className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section (matching Captain Dashboard style) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F4C81] via-[#58A1D3] to-[#B3DEF8] p-8 text-white shadow-2xl mb-8">
          {/* Animated wave background */}
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
            className={`relative z-10 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <Home size={32} className="text-yellow-300" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                    <span className="text-cyan-200 text-sm font-medium tracking-widest">
                      HOUSEHOLD MANAGEMENT
                    </span>
                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                  </div>
                  <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">
                    Household Management
                  </h2>
                  <p className="text-cyan-100 text-lg">
                    Manage and organize household records and family information
                  </p>
                  <p className="text-cyan-200 text-sm mt-2">
                    Today is{" "}
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {/* Scroll indicator - centered on mobile, right-aligned on desktop */}
              <div className="flex flex-col items-center gap-3 mx-auto sm:mx-0">
                <span className="text-black text-sm font-semibold drop-shadow-lg">
                  Scroll to explore
                </span>
                <div className="w-8 h-12 border-4 border-black rounded-full flex justify-center bg-white/90 shadow-lg animate-pulse">
                  <div className="w-2 h-4 bg-black rounded-full mt-2 animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <h2 className="text-3xl font-bold text-[#0F4C81]">
            Household Management
          </h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => openReportGenerator("household-summary")}
              className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <FileText size={18} />
              <span className="hidden sm:inline">Generate Report</span>
              <span className="sm:hidden">Summary</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#0F4C81] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#58A1D3] transition-colors font-medium flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <Plus size={18} />
              <span>Add Household</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search households..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                />
              </div>
            </div>
            <div className="lg:w-64">
              <div className="relative">
                <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <select
                  value={filterPurok}
                  onChange={(e) => setFilterPurok(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3] focus:border-[#58A1D3] appearance-none"
                >
                  <option value="">All Puroks</option>
                  {getUniquePuroks().map((purok) => (
                    <option key={purok} value={purok}>
                      {purok}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-[85vh] overflow-y-auto overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse table-auto md:table-fixed">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white">
                  <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm">
                    Household #
                  </th>
                  <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                    Head of Household
                  </th>
                  <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                    Spouse
                  </th>
                  <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                    Purok
                  </th>
                  <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                    Contact
                  </th>
                  <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                    Members
                  </th>
                  <th className="py-4 px-2 text-center font-semibold sticky top-0 z-10 bg-[#0F4C81]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHouseholds.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No households found
                    </td>
                  </tr>
                ) : (
                  filteredHouseholds.map((household) => (
                    <tr
                      key={household.household_id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Home className="w-4 h-4 text-[#0F4C81]" />
                          <span className="font-medium text-[#0F4C81]">
                            {household.household_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{household.household_head_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{household.spouse_name || "-"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {household.purok || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{household.contact_number || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{household.members_count || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleViewMembers(household)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Members"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(household)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Household"
                          >
                            <Edit3 size={18} />
                          </button>
                          {household.members &&
                            household.members.length > 0 && (
                              <button
                                onClick={() => setConfirmReassign(household)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Reassign Members"
                              >
                                <Users size={18} />
                              </button>
                            )}
                          <button
                            onClick={() => setConfirmDelete(household)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Household"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="lg:hidden bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-[85vh] overflow-y-auto">
            {filteredHouseholds.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Home size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-600 text-xl font-semibold mb-2">
                  No households found
                </p>
                <p className="text-gray-500 text-sm">
                  {searchTerm || filterPurok
                    ? "Try adjusting your search criteria"
                    : "No households registered yet"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredHouseholds.map((household) => (
                  <div
                    key={household.household_id}
                    className="p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2 shadow-md">
                          <Home size={16} className="text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-[#0F4C81] text-base">
                            {household.household_number}
                          </div>
                          <div className="text-xs text-gray-500">
                            Household ID
                          </div>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {household.purok || "N/A"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Head:</span>
                        <span className="font-medium text-gray-900 truncate max-w-[180px]">
                          {household.household_head_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Spouse:</span>
                        <span className="font-medium text-gray-900 truncate max-w-[180px]">
                          {household.spouse_name || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact:</span>
                        <span className="font-medium text-gray-900">
                          {household.contact_number || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Members:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {household.members_count || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleViewMembers(household)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(household)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>
                      {household.members && household.members.length > 0 && (
                        <button
                          onClick={() => setConfirmReassign(household)}
                          className="flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:shadow-md transition-all"
                        >
                          <Users size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmDelete(household)}
                        className="flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-md transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Household Form Modal */}
        {showForm && (
          <HouseholdForm
            household={editingHousehold}
            onClose={handleFormClose}
            onSubmit={handleFormSubmit}
            addNotification={addNotification}
          />
        )}

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl shadow-red-500/20 border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-200 rounded-full animate-pulse"></div>
                    <h2 className="text-xl font-bold text-white">
                      Confirm Deletion
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDelete(null);
                      setReassignSuccess(false);
                    }}
                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700">
                  Are you sure you want to delete household{" "}
                  <span className="font-semibold text-gray-900">
                    {confirmDelete.household_number ||
                      confirmDelete.household_id}
                  </span>
                  ? This action cannot be undone.
                </p>

                {reassignSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                    Members successfully reassigned to "No Household". You can
                    now delete this household.
                  </div>
                )}

                {((confirmDelete.members && confirmDelete.members.length > 0) ||
                  confirmDelete.members_count > 0) &&
                  !reassignSuccess && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 mt-0.5 text-yellow-700" />
                        <div>
                          <p className="font-medium">
                            This household has{" "}
                            {confirmDelete.members?.length ??
                              confirmDelete.members_count ??
                              0}{" "}
                            member(s).
                          </p>
                          <p>
                            We recommend reassigning members to "No Household"
                            before deleting to avoid orphaned records.
                          </p>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                setReassigning(true);
                                await handleReassignMembers(confirmDelete);
                                setReassignSuccess(true);
                                setConfirmDelete((prev) => ({
                                  ...prev,
                                  members: [],
                                  members_count: 0,
                                }));
                              } finally {
                                setReassigning(false);
                              }
                            }}
                            className="mt-2 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={reassigning}
                          >
                            {reassigning
                              ? "Reassigning..."
                              : "Reassign Members"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDelete(null);
                      setReassignSuccess(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const id = confirmDelete.household_id;
                      setConfirmDelete(null);
                      setReassignSuccess(false);
                      handleDelete(id);
                    }}
                    disabled={
                      (confirmDelete.members?.length ??
                        confirmDelete.members_count ??
                        0) > 0 && !reassignSuccess
                    }
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reassign Members Confirmation Modal */}
        {confirmReassign && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl shadow-yellow-500/20 border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-200 rounded-full animate-pulse"></div>
                    <h2 className="text-xl font-bold text-white">
                      Reassign Members
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmReassign(null)}
                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <p className="text-gray-700">
                  This household has{" "}
                  {confirmReassign.members?.length ??
                    confirmReassign.members_count ??
                    0}{" "}
                  member(s).
                </p>
                <p className="text-gray-700">
                  Do you want to reassign them to{" "}
                  <span className="font-semibold">"No Household"</span>?
                </p>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmReassign(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const h = confirmReassign;
                      setConfirmReassign(null);
                      await handleReassignMembers(h);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700"
                  >
                    Reassign
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Members Modal */}
        {viewingMembers && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-4xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[80vh] overflow-hidden">
              <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse"></div>
                    <h2 className="text-2xl font-bold text-white">
                      Household Members - {viewingMembers.household_number}
                    </h2>
                  </div>
                  <button
                    onClick={() => setViewingMembers(null)}
                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300 group"
                  >
                    <X
                      size={24}
                      className="group-hover:rotate-90 transition-transform duration-300"
                    />
                  </button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(80vh-120px)]">
                {/* Household Info Section */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Head of Household</p>
                      <p className="font-semibold text-gray-900">
                        {viewingMembers.household_head_name || "Not specified"}
                      </p>
                    </div>
                    {viewingMembers.spouse_name && (
                      <div>
                        <p className="text-sm text-gray-600">Spouse</p>
                        <p className="font-semibold text-gray-900">
                          {viewingMembers.spouse_name}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Purok</p>
                      <p className="font-semibold text-gray-900">
                        {viewingMembers.purok || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact Number</p>
                      <p className="font-semibold text-gray-900">
                        {viewingMembers.contact_number || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Members List */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Household Members
                </h3>
                {viewingMembers.members && viewingMembers.members.length > 0 ? (
                  <div className="space-y-4">
                    {viewingMembers.members.map((member) => {
                      // Build full name properly - filter out invalid suffixes
                      const fullName = [
                        member.first_name?.trim(),
                        member.middle_name?.trim(),
                        member.last_name?.trim(),
                        // ✅ FIXED: Only include suffix if it's valid (not "0", not empty, not null)
                        member.suffix &&
                        member.suffix !== 0 &&
                        member.suffix !== "0" &&
                        String(member.suffix).trim() !== "" &&
                        String(member.suffix).toLowerCase() !== "null"
                          ? String(member.suffix).trim()
                          : null,
                      ]
                        .filter(Boolean) // Remove null/undefined/empty values
                        .join(" ");

                      // Safe age calculation (handles invalid dates)
                      const calculateAge = (dob) => {
                        if (!dob) return "N/A";
                        const birth = new Date(dob);
                        const today = new Date();
                        if (isNaN(birth)) return "N/A";
                        let age = today.getFullYear() - birth.getFullYear();
                        const m = today.getMonth() - birth.getMonth();
                        if (
                          m < 0 ||
                          (m === 0 && today.getDate() < birth.getDate())
                        )
                          age--;
                        return age < 0 ? "N/A" : age;
                      };

                      return (
                        <div
                          key={member.resident_id}
                          className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            {/* Left: Avatar + Name + Details */}
                            <div className="flex items-center space-x-4">
                              <div className="w-14 h-14 bg-[#0F4C81] rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                                {fullName.charAt(0) || "?"}
                              </div>

                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                  {fullName || "Name not set"}
                                  {member.is_head && (
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                      Head of Household
                                    </span>
                                  )}
                                </h3>

                                <p className="text-gray-600 text-sm">
                                  {member.gender || "—"} •{" "}
                                  {member.civil_status || "—"}
                                </p>

                                {(member.contact_number || member.email) && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {member.contact_number &&
                                      `📞 ${member.contact_number}`}
                                    {member.contact_number &&
                                      member.email &&
                                      " • "}
                                    {member.email && `✉️ ${member.email}`}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Right: Age + Purok */}
                            <div className="text-right text-sm">
                              <p className="font-medium text-gray-700">
                                Age:{" "}
                                <span className="text-gray-900">
                                  {calculateAge(member.date_of_birth)}
                                </span>
                              </p>
                              <p className="text-gray-600">
                                Purok:{" "}
                                <span className="font-medium">
                                  {member.purok || "N/A"}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">
                      No members assigned to this household
                    </p>
                    <p className="text-sm">
                      Members will appear here when residents are assigned to
                      this household.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <NotificationSystem
          notifications={notifications}
          onRemove={removeNotification}
        />

        {showReportGenerator && currentReportType === "household-summary" && (
          <ReportGenerator
            reportType="household-summary"
            title="Household Summary Report"
            icon={Home}
            onGenerate={handleGenerateHouseholdSummaryReport}
            onClose={() => setShowReportGenerator(false)}
            filters={[
              {
                key: "purok",
                label: "Purok",
                type: "select",
                options: purokOptions,
              },
            ]}
            columns={[
              { key: "household_number", label: "Household #", type: "text" },
              {
                key: "household_head_name",
                label: "Head of Household",
                type: "text",
              },
              { key: "spouse_name", label: "Spouse", type: "text" },
              { key: "purok", label: "Purok", type: "text" },
              { key: "member_count", label: "Total Members", type: "number" },
              { key: "member_names", label: "Members", type: "text" },
              { key: "male_count", label: "Male", type: "number" },
              { key: "female_count", label: "Female", type: "number" },
              { key: "minor_count", label: "Minors", type: "number" },
              { key: "senior_count", label: "Seniors", type: "number" },
            ]}
          />
        )}
      </div>
    </section>
  );
};

// Household Form Component
const HouseholdForm = ({ household, onClose, onSubmit, addNotification }) => {
  const [formData, setFormData] = useState({
    household_number: "",
    household_head_name: "",
    spouse_name: "",
    purok: "",
    contact_number: "",
  });
  const [selectedHeadId, setSelectedHeadId] = useState("");
  const [loading, setLoading] = useState(false);
  const [allResidents, setAllResidents] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [manualMembers, setManualMembers] = useState([]);
  const [newMember, setNewMember] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    age: "",
  });

  useEffect(() => {
    if (household) {
      setFormData({
        household_number: household.household_number || "",
        household_head_name: household.household_head_name || "",
        spouse_name: household.spouse_name || "",
        purok: household.purok || "",
        contact_number: household.contact_number || "",
      });
      // Set current members as selected
      setSelectedMembers(
        household.members ? household.members.map((m) => m.resident_id) : []
      );

      // If there's a household head, try to find them in the residents list
      if (household.household_head_id) {
        setSelectedHeadId(household.household_head_id);
      }
    } else {
      setSelectedMembers([]);
      setSelectedHeadId("");
    }
  }, [household]);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    setLoadingResidents(true);
    try {
      const response = await residentsAPI.getAll();
      if (response.success) {
        setAllResidents(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching residents:", error);
      addNotification("error", "Load Failed", "Failed to load residents");
    } finally {
      setLoadingResidents(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.household_head_name.trim()) {
        addNotification(
          "error",
          "Validation Error",
          "Head of household name is required"
        );
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        household_head_id: selectedHeadId || null,
      };

      console.log("Submitting household data:", submitData);
      console.log("Household ID:", household?.household_id);

      if (household) {
        // Update existing household
        console.log("Updating household with ID:", household.household_id);
        const response = await householdsAPI.update(
          household.household_id,
          submitData
        );
        console.log("Update response:", response);

        if (response.success) {
          // Log the activity
          await logUserActivity(
            "Update Household",
            "household",
            household.household_id,
            `Household ${household.household_number} - ${formData.household_head_name}`,
            "completed",
            "Household information updated",
            "Household data modified successfully"
          );

          // Update member assignments
          await handleMemberAssignment(household.household_id);
          addNotification(
            "success",
            "Household Updated",
            "Household updated successfully"
          );
          onSubmit();
        } else {
          addNotification(
            "error",
            "Update Failed",
            response.message || "Failed to update household"
          );
        }
      } else {
        // Create new household
        console.log("Creating new household");
        const response = await householdsAPI.create(submitData);
        console.log("Create response:", response);

        if (response.success) {
          // Log the activity
          await logUserActivity(
            "Create Household",
            "household",
            response.household.household_id,
            `Household ${response.household.household_number} - ${formData.household_head_name}`,
            "completed",
            "New household created",
            "Household added to the system"
          );

          // Assign members to new household
          if (selectedMembers.length > 0) {
            await handleMemberAssignment(response.household.household_id);
          }
          addNotification(
            "success",
            "Household Created",
            "Household created successfully"
          );
          onSubmit();
        } else {
          addNotification(
            "error",
            "Create Failed",
            response.message || "Failed to create household"
          );
        }
      }
    } catch (error) {
      console.error("Error saving household:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to save household";
      addNotification("error", "Save Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMemberToggle = (residentId) => {
    setSelectedMembers((prev) =>
      prev.includes(residentId)
        ? prev.filter((id) => id !== residentId)
        : [...prev, residentId]
    );
  };

  const handleNewMemberChange = (e) => {
    setNewMember((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddManualMember = () => {
    // Validate required fields
    if (!newMember.first_name.trim() || !newMember.last_name.trim()) {
      addNotification(
        "error",
        "Validation Error",
        "First name and last name are required"
      );
      return;
    }

    // Add member to manual members list
    const memberToAdd = {
      id: Date.now(), // Temporary ID for UI purposes
      ...newMember,
    };

    setManualMembers((prev) => [...prev, memberToAdd]);

    // Reset form
    setNewMember({
      first_name: "",
      last_name: "",
      gender: "",
      age: "",
    });

    addNotification(
      "success",
      "Member Added",
      `${memberToAdd.first_name} ${memberToAdd.last_name} added to the list`
    );
  };

  const handleRemoveManualMember = (memberId) => {
    setManualMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  // Filter residents based on search term AND exclude the selected head
  const filteredResidents = allResidents.filter((resident) => {
    // Exclude the selected head of household from member options
    if (selectedHeadId && resident.resident_id == selectedHeadId) {
      return false;
    }

    // Apply search filter
    const fullName =
      `${resident.first_name} ${resident.middle_name} ${resident.last_name} ${resident.suffix}`.toLowerCase();
    const searchLower = memberSearchTerm.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      resident.purok?.toLowerCase().includes(searchLower) ||
      resident.contact_number?.includes(searchLower)
    );
  });

  const handleHeadOfHouseholdChange = (residentId) => {
    setSelectedHeadId(residentId);

    if (residentId) {
      const selectedResident = allResidents.find(
        (r) => r.resident_id == residentId
      );
      if (selectedResident) {
        setFormData((prev) => ({
          ...prev,
          household_head_name: [
            selectedResident.first_name,
            selectedResident.middle_name,
            selectedResident.last_name,
            selectedResident.suffix,
          ]
            .filter(
              (part) =>
                part &&
                part !== "null" &&
                part !== "0" &&
                String(part).trim() !== ""
            )
            .join(" ")
            .trim(),
          purok: selectedResident.purok || "",
          contact_number: selectedResident.contact_number || "",
        }));

        // Auto-fill spouse if the selected resident is married and has a spouse_name
        if (
          selectedResident.civil_status === "Married" &&
          selectedResident.spouse_name
        ) {
          // The spouse_name is already stored as a full name string
          setFormData((prev) => ({
            ...prev,
            spouse_name: selectedResident.spouse_name,
          }));
        } else if (selectedResident.civil_status === "Married") {
          // If married but no spouse_name, try to find a potential spouse
          const potentialSpouse = allResidents.find((r) => {
            // Match by opposite gender, married status, and same last name
            if (
              r.resident_id !== selectedResident.resident_id &&
              r.civil_status === "Married" &&
              r.gender !== selectedResident.gender &&
              r.last_name === selectedResident.last_name
            ) {
              // Check if this resident's spouse_name matches the selected resident's name
              const selectedFullName = [
                selectedResident.first_name,
                selectedResident.middle_name,
                selectedResident.last_name,
                selectedResident.suffix,
              ]
                .filter(
                  (part) =>
                    part &&
                    part !== "null" &&
                    part !== "0" &&
                    String(part).trim() !== ""
                )
                .join(" ")
                .trim();

              return r.spouse_name === selectedFullName;
            }
            return false;
          });

          if (potentialSpouse) {
            const spouseName = [
              potentialSpouse.first_name,
              potentialSpouse.middle_name,
              potentialSpouse.last_name,
              potentialSpouse.suffix,
            ]
              .filter(
                (part) =>
                  part &&
                  part !== "null" &&
                  part !== "0" &&
                  String(part).trim() !== ""
              )
              .join(" ")
              .trim();

            setFormData((prev) => ({
              ...prev,
              spouse_name: spouseName,
            }));
          } else {
            // No spouse found, leave empty
            setFormData((prev) => ({
              ...prev,
              spouse_name: "",
            }));
          }
        } else {
          // Clear spouse field if not married
          setFormData((prev) => ({
            ...prev,
            spouse_name: "",
          }));
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        household_head_name: "",
        spouse_name: "",
        purok: "",
        contact_number: "",
      }));
    }
  };

  // Function to find potential spouse
  const findPotentialSpouse = (headResident) => {
    // Priority 1: Look for residents in the same household with "Married" status and opposite gender
    const sameHouseholdSpouses = allResidents.filter((resident) => {
      return (
        resident.resident_id !== headResident.resident_id &&
        resident.civil_status === "Married" &&
        resident.gender !== headResident.gender &&
        resident.household_id === headResident.household_id &&
        resident.household_id !== null // Must have a household assigned
      );
    });

    if (sameHouseholdSpouses.length > 0) {
      // If multiple found, prefer one with same last name
      const sameLastName = sameHouseholdSpouses.find(
        (spouse) => spouse.last_name === headResident.last_name
      );
      return sameLastName || sameHouseholdSpouses[0];
    }

    // Priority 2: Look for married residents with same last name, opposite gender, and no household
    // (This helps when both spouses are not yet assigned to a household)
    const sameLastNameSpouses = allResidents.filter((resident) => {
      return (
        resident.resident_id !== headResident.resident_id &&
        resident.civil_status === "Married" &&
        resident.gender !== headResident.gender &&
        resident.last_name === headResident.last_name &&
        (resident.household_id === null ||
          resident.household_id === headResident.household_id)
      );
    });

    if (sameLastNameSpouses.length > 0) {
      return sameLastNameSpouses[0];
    }

    // No reliable spouse found - return null instead of guessing
    // User can manually enter spouse name if needed
    return null;
  };

  const handleMemberAssignment = async (householdId) => {
    try {
      // Get current members of this household
      const currentMembers = household?.members
        ? household.members.map((m) => m.resident_id)
        : [];

      // Find members to add and remove
      const membersToAdd = selectedMembers.filter(
        (id) => !currentMembers.includes(id)
      );
      const membersToRemove = currentMembers.filter(
        (id) => !selectedMembers.includes(id)
      );

      // Remove members from household
      for (const residentId of membersToRemove) {
        await residentsAPI.updateHousehold(residentId, null);
      }

      // Add members to household
      for (const residentId of membersToAdd) {
        await residentsAPI.updateHousehold(residentId, householdId);
      }

      if (membersToAdd.length > 0 || membersToRemove.length > 0) {
        addNotification(
          "success",
          "Members Updated",
          "Household members updated successfully"
        );
      }
    } catch (error) {
      console.error("Error updating members:", error);
      addNotification(
        "error",
        "Update Failed",
        "Failed to update household members"
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-4xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse"></div>
              <h3 className="text-2xl font-bold text-white">
                {household ? "Edit Household" : "Add New Household"}
              </h3>
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
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Household Number
              </label>
              <input
                type="text"
                name="household_number"
                value={household ? formData.household_number : "Auto-generated"}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                placeholder="Auto-generated (e.g., HH001)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {household
                  ? "Existing household number"
                  : "Will be automatically generated"}
              </p>
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Head of Household
              </label>
              <select
                value={selectedHeadId}
                onChange={(e) => handleHeadOfHouseholdChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3] focus:border-[#58A1D3]"
              >
                <option value="">Choose a resident as head of household</option>
                {allResidents.map((resident) => (
                  <option
                    key={resident.resident_id}
                    value={resident.resident_id}
                  >
                    {resident.first_name} {resident.middle_name}{" "}
                    {resident.last_name} {resident.suffix} - {resident.purok} (
                    {resident.civil_status})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Selecting a resident will auto-fill their name, purok, contact
                number, and spouse (if married)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Head of Household Name *
              </label>
              <input
                type="text"
                name="household_head_name"
                value={formData.household_head_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                placeholder="Full name of household head"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spouse Name
                {formData.spouse_name && selectedHeadId && (
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    (Auto-filled based on marital status)
                  </span>
                )}
              </label>
              <input
                type="text"
                name="spouse_name"
                value={formData.spouse_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                placeholder="Full name of spouse (optional)"
              />
              {selectedHeadId &&
                allResidents.find((r) => r.resident_id == selectedHeadId)
                  ?.civil_status === "Married" &&
                !formData.spouse_name && (
                  <p className="text-xs text-gray-500 mt-1">
                    No potential spouse found. You can manually enter the spouse
                    name.
                  </p>
                )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purok
              </label>
              <select
                name="purok"
                value={formData.purok}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3] focus:border-[#58A1D3]"
              >
                <option value="">Select Purok</option>
                <option value="Barola">Barola</option>
                <option value="Hanopol">Hanopol</option>
                <option value="Go">Go</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                placeholder="e.g., 09123456789"
              />
            </div>

            {/* Member Selection Section - Only show when head of household is selected or editing existing household */}
            {(selectedHeadId || household) && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Household Members
                </label>

                {/* Search input for members */}
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search residents by name, purok, or contact..."
                      value={memberSearchTerm}
                      onChange={(e) => setMemberSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                    />
                  </div>
                </div>

                {/* Add this info message when head is selected */}
                {selectedHeadId && formData.household_head_name && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <span className="font-semibold text-blue-900">
                          {formData.household_head_name}
                        </span>
                        <span className="text-blue-700">
                          {" "}
                          is set as the head of household and will be
                          automatically included.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {loadingResidents ? (
                  <div className="text-center py-4 text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0F4C81] mx-auto"></div>
                    <p className="mt-2">Loading residents...</p>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredResidents.length > 0 ? (
                      <div className="space-y-2 p-2">
                        {filteredResidents.map((resident) => (
                          <label
                            key={resident.resident_id}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedMembers.includes(
                                resident.resident_id
                              )}
                              onChange={() =>
                                handleMemberToggle(resident.resident_id)
                              }
                              className="rounded text-[#0F4C81] focus:ring-[#58A1D3]"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {resident.first_name} {resident.middle_name}{" "}
                                {resident.last_name} {resident.suffix}
                              </p>
                              <p className="text-xs text-gray-500">
                                {resident.gender} • {resident.civil_status} •{" "}
                                {resident.purok}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Users
                          size={24}
                          className="mx-auto mb-2 text-gray-300"
                        />
                        <p className="text-sm">
                          {memberSearchTerm
                            ? "No residents found matching your search"
                            : "No residents available"}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedMembers.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {selectedMembers.length} member(s) selected
                  </div>
                )}

                {/* Manual Member Entry Section - Only show when NO resident is selected */}
                {!selectedHeadId && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Or Add Members Manually
                    </h4>
                    <p className="text-xs text-gray-500 mb-3">
                      Add household members who are not yet registered as
                      residents
                    </p>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            name="first_name"
                            value={newMember.first_name}
                            onChange={handleNewMemberChange}
                            placeholder="First name"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            name="last_name"
                            value={newMember.last_name}
                            onChange={handleNewMemberChange}
                            placeholder="Last name"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Gender
                          </label>
                          <select
                            name="gender"
                            value={newMember.gender}
                            onChange={handleNewMemberChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Age
                          </label>
                          <input
                            type="number"
                            name="age"
                            value={newMember.age}
                            onChange={handleNewMemberChange}
                            placeholder="Age"
                            min="0"
                            max="150"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddManualMember}
                        className="w-full px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        + Add Member
                      </button>
                    </div>

                    {/* Display manually added members */}
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Manually Added Members ({manualMembers.length})
                      </p>
                      {manualMembers.length > 0 ? (
                        <div className="space-y-2">
                          {manualMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {member.first_name} {member.last_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {member.gender && `${member.gender}`}
                                  {member.age && ` • Age: ${member.age}`}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveManualMember(member.id)
                                }
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 text-center py-3 border border-dashed border-gray-300 rounded-lg">
                          No manually added members yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#58A1D3] transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : household ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageHouseholdsPage;

// Add CSS animations for floating effects (matching Captain Dashboard)
const styles = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`;

if (typeof document !== "undefined") {
  const id = "manage-households-float-styles";
  if (!document.getElementById(id)) {
    const styleEl = document.createElement("style");
    styleEl.id = id;
    styleEl.appendChild(document.createTextNode(styles));
    document.head.appendChild(styleEl);
  }
}
