import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { Eye, Edit2, Trash2, X, Skull, FileText } from "lucide-react";
import { deathsAPI, logUserActivity } from "../services/api";
import NotificationSystem from "../components/NotificationSystem";
import ReportGenerator from "../components/ReportGenerator";
import { formatDateForInput } from "./ManageResidentPage";

// Convert ISO date string to yyyy-MM-dd format for HTML date input
// const formatDateForInput = (dateString) => {
//   if (!dateString) return "";
//   const date = new Date(dateString);
//   if (isNaN(date.getTime())) return "";

//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");

//   return `${year}-${month}-${day}`;
// };

const DeathReportModal = ({
  deathForm,
  setDeathForm,
  handleDeathSubmit,
  setShowDeathForm,
  residents,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4 border-b border-blue-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Skull size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Add Death Record
                </h2>
                <p className="text-blue-100 text-sm">
                  Complete all required fields
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDeathForm(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleDeathSubmit}
          className="p-6 max-h-[70vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resident Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Resident <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={deathForm.resident_id || ""}
                  onChange={(e) =>
                    setDeathForm({ ...deathForm, resident_id: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                >
                  <option value="" disabled className="text-gray-400">
                    Select a resident
                  </option>
                  {residents.map((r) => (
                    <option key={r.resident_id} value={r.resident_id}>
                      {`${r.first_name} ${r.last_name} (ID: ${r.resident_id})`}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3.5 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date of Death */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Death <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formatDateForInput(deathForm.date_of_death) || ""}
                  onChange={(e) =>
                    setDeathForm({
                      ...deathForm,
                      date_of_death: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Cause of Death */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cause of Death
              </label>
              <input
                type="text"
                value={deathForm.cause_of_death || ""}
                onChange={(e) =>
                  setDeathForm({ ...deathForm, cause_of_death: e.target.value })
                }
                placeholder="e.g., Natural Causes"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Place of Death */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Place of Death
              </label>
              <input
                type="text"
                value={deathForm.place_of_death || ""}
                onChange={(e) =>
                  setDeathForm({ ...deathForm, place_of_death: e.target.value })
                }
                placeholder="e.g., Hospital, Home"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Notes - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes & Additional Information
              </label>
              <textarea
                value={deathForm.notes || ""}
                onChange={(e) =>
                  setDeathForm({ ...deathForm, notes: e.target.value })
                }
                placeholder="Enter any additional notes or information..."
                rows="4"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowDeathForm(false)}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-sm"
            >
              Save Death Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ViewDeathModal = ({ selectedDeath, setSelectedDeath, calculateAge }) => {
  if (!selectedDeath) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4 border-b border-gray-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Death Record Details
                </h2>
                <p className="text-gray-300 text-sm">
                  Complete death information
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedDeath(null)}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Resident Information */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800">
                  Resident Information
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-medium text-gray-900">
                    {selectedDeath.resident_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Age at Death</p>
                  <p className="font-medium text-gray-900">
                    {calculateAge(selectedDeath.dob)} years
                  </p>
                </div>
              </div>
            </div>

            {/* Death Details */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Skull size={16} className="text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Death Details</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date of Death</p>
                    <p className="font-medium text-gray-900">
                      {formatDateForInput(selectedDeath.date_of_death)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Place of Death</p>
                    <p className="font-medium text-gray-900">
                      {selectedDeath.place_of_death || "Not specified"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cause of Death</p>
                  <p className="font-medium text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                    {selectedDeath.cause_of_death || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedDeath.notes && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    Additional Notes
                  </h3>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap bg-white p-3 rounded-lg border border-amber-200">
                  {selectedDeath.notes}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => setSelectedDeath(null)}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditDeathModal = ({
  editDeath,
  setEditDeath,
  handleDeathEdit,
  residents,
}) => {
  const residentName = editDeath?.resident_name || "Unknown Resident";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-4 border-b border-emerald-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Edit2 size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Edit Death Record
                </h2>
                <p className="text-emerald-100 text-sm">
                  Update record information
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditDeath(null)}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDeathEdit(editDeath.id, editDeath);
          }}
          className="p-6 max-h-[70vh] overflow-y-auto"
        >
          <div className="space-y-6">
            {/* Resident Display (Read-only) */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Resident
              </label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{residentName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Resident cannot be changed for existing records
                  </p>
                </div>
              </div>
            </div>

            {/* Date of Death */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Death <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formatDateForInput(editDeath?.date_of_death) || ""}
                onChange={(e) =>
                  setEditDeath({ ...editDeath, date_of_death: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>

            {/* Cause of Death */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cause of Death
              </label>
              <input
                type="text"
                value={editDeath?.cause_of_death || ""}
                onChange={(e) =>
                  setEditDeath({ ...editDeath, cause_of_death: e.target.value })
                }
                placeholder="Enter cause of death"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            {/* Place of Death */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Place of Death
              </label>
              <input
                type="text"
                value={editDeath?.place_of_death || ""}
                onChange={(e) =>
                  setEditDeath({ ...editDeath, place_of_death: e.target.value })
                }
                placeholder="e.g., Hospital, Home"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={editDeath?.notes || ""}
                onChange={(e) =>
                  setEditDeath({ ...editDeath, notes: e.target.value })
                }
                placeholder="Enter any additional notes..."
                rows="4"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setEditDeath(null)}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
            >
              <Edit2 size={16} />
              Update Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
const DeathReportsPage = () => {
  const {
    deaths,
    setDeaths,
    showDeathForm,
    setShowDeathForm,
    selectedDeath,
    setSelectedDeath,
    editDeath,
    setEditDeath,
    residents,
    calculateAge,
  } = useOutletContext();

  const [notifications, setNotifications] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [currentReportType, setCurrentReportType] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Notification handlers
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

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

  const [deathForm, setDeathForm] = useState({
    resident_id: "",
    date_of_death: "",
    cause_of_death: "",
    place_of_death: "",
    notes: "",
  });

  const handleDeathSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting death form:", deathForm);
      const response = await deathsAPI.create(deathForm);
      if (response.success) {
        // Fetch fresh data to ensure we have all fields
        const updatedDeaths = await deathsAPI.getAll();
        if (updatedDeaths.success) {
          setDeaths(updatedDeaths.data);
        }

        addNotification(
          "success",
          "Death Record Added",
          "Death record has been saved successfully"
        );
        setShowDeathForm(false);
        setDeathForm({
          resident_id: "",
          date_of_death: "",
          cause_of_death: "",
          place_of_death: "",
          notes: "",
        });
      }
    } catch (error) {
      console.error("Add death error:", error);
      addNotification("error", "Add Failed", "Failed to add death record");
    }
  };

  const handleDeathEdit = async (id, updatedData) => {
    try {
      console.log("Editing death record:", id, updatedData);
      const response = await deathsAPI.update(id, updatedData);
      if (response.success) {
        // Fetch fresh data to ensure we have all fields
        const updatedDeaths = await deathsAPI.getAll();
        if (updatedDeaths.success) {
          setDeaths(updatedDeaths.data);
        }

        addNotification(
          "success",
          "Death Record Updated",
          "Death record has been updated successfully"
        );
        setEditDeath(null);
      }
    } catch (error) {
      console.error("Update death error:", error);
      addNotification(
        "error",
        "Update Failed",
        "Failed to update death record"
      );
    }
  };

  const handleDeathDelete = async (id) => {
    try {
      const response = await deathsAPI.delete(id);
      if (response.success) {
        setDeaths(deaths.filter((d) => d.id !== id));
        addNotification(
          "success",
          "Death Record Deleted",
          "Death record has been deleted successfully"
        );
      }
    } catch (error) {
      console.error("Delete death error:", error);
      addNotification(
        "error",
        "Delete Failed",
        "Failed to delete death record"
      );
    }
  };

  // Report generation functions
  const handleGenerateDeathsReport = async (filters = {}) => {
    try {
      // Filter deaths based on provided filters
      let filteredData = [...deaths];

      if (filters.dateFrom) {
        filteredData = filteredData.filter(
          (death) => new Date(death.date_of_death) >= new Date(filters.dateFrom)
        );
      }

      if (filters.dateTo) {
        filteredData = filteredData.filter(
          (death) => new Date(death.date_of_death) <= new Date(filters.dateTo)
        );
      }

      // If preview mode, return the filtered data
      if (filters.preview) {
        return filteredData.map((death) => {
          const resident = residents.find(
            (r) => r.resident_id === death.resident_id
          );
          const residentName = resident
            ? `${resident.first_name} ${resident.middle_name || ""} ${
                resident.last_name
              }`.trim()
            : "N/A";

          return {
            id: death.id,
            resident_id: death.resident_id,
            resident_name: residentName,
            date_of_death: death.date_of_death,
            cause_of_death: death.cause_of_death,
            place_of_death: death.place_of_death,
            attending_physician: death.attending_physician || "N/A",
            remarks: death.remarks || "N/A",
          };
        });
      }

      // Generate PDF report
      const { jsPDF } = await import("jspdf");
      const { autoTable } = await import("jspdf-autotable");

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
      doc.text("Municipality/City of Macrohon", pageWidth / 2, 22, {
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
      doc.text("Death Records Report", pageWidth / 2, 36, { align: "center" });

      // Add date and record count
      doc.setFontSize(9);
      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.text(`Generated on: ${dateStr}`, 14, 43);

      // Add date range if filters applied
      if (filters.dateFrom || filters.dateTo) {
        const dateRange = `Date Range: ${filters.dateFrom || "All"} to ${
          filters.dateTo || "All"
        }`;
        doc.text(dateRange, 14, 50);
      }

      // Prepare table data
      const tableData = filteredData.map((death) => {
        const resident = residents.find(
          (r) => r.resident_id === death.resident_id
        );
        const residentName = resident
          ? `${resident.first_name} ${resident.middle_name || ""} ${
              resident.last_name
            }`.trim()
          : "N/A";

        return [
          death.id,
          death.resident_id,
          residentName,
          formatDateForInput(death.date_of_death),
          death.cause_of_death,
          death.place_of_death,
          death.attending_physician || "N/A",
          death.remarks || "N/A",
        ];
      });

      // Add table
      autoTable(doc, {
        head: [
          [
            "Record ID",
            "Resident ID",
            "Resident Name",
            "Date of Death",
            "Cause of Death",
            "Place of Death",
            "Attending Physician",
            "Remarks",
          ],
        ],
        body: tableData,
        startY: filters.dateFrom || filters.dateTo ? 55 : 48,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [15, 76, 129] },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        margin: { top: 35 },
      });

      // Save the PDF
      doc.save(
        `Death_Records_Report_${new Date().toISOString().split("T")[0]}.pdf`
      );

      addNotification(
        "success",
        "Report Generated",
        "Death records report has been generated successfully."
      );
    } catch (error) {
      console.error("Error generating deaths report:", error);
      addNotification(
        "error",
        "Report Error",
        "Failed to generate report. Please try again."
      );
    }
  };

  const openReportGenerator = (reportType) => {
    setCurrentReportType(reportType);
    setShowReportGenerator(true);
  };

  return (
    <section className="min-h-screen py-6 p-6">
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
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <Skull size={32} className="text-yellow-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                  <span className="text-cyan-200 text-sm font-medium tracking-widest">
                    DEATH REPORTS
                  </span>
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                </div>
                <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">
                  Death Records
                </h2>
                <p className="text-cyan-100 text-lg">
                  Manage and track death records and vital statistics
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-[#0F4C81]">Death Records</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => openReportGenerator("death-reports")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 w-full sm:w-auto"
          >
            <FileText size={18} />
            <span>Generate Report</span>
          </button>
          <button
            onClick={() => setShowDeathForm(true)}
            className="bg-[#0F4C81] text-white px-6 py-2 rounded-lg hover:bg-[#58A1D3] transition-colors font-medium w-full sm:w-auto"
          >
            Add Death Record
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="max-h-[85vh] overflow-y-auto overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse table-auto md:table-fixed">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white">
                <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm">
                  ID
                </th>
                <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                  Resident
                </th>
                <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                  Age at Death
                </th>
                <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                  Date of Death
                </th>
                <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                  Cause of Death
                </th>
                <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                  Place of Death
                </th>
                <th className="py-4 px-2 text-center font-semibold sticky top-0 z-10 bg-[#0F4C81]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {deaths && deaths.length > 0 ? (
                deaths.map((d, index) => {
                  // Debug log
                  console.log("Death record in table:", d);

                  return (
                    <tr
                      key={d.id}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-blue-50 transition-colors duration-200 border-b border-gray-200`}
                    >
                      <td className="py-4 px-2 border-r border-gray-200 font-medium text-[#0F4C81]">
                        {d.id}
                      </td>
                      <td className="py-4 px-2 border-r border-gray-200">
                        {d.resident_name}
                      </td>
                      <td className="py-4 px-2 border-r border-gray-200">
                        {calculateAge(d.dob)}
                      </td>
                      <td className="py-4 px-2 border-r border-gray-200">
                        {formatDateForInput(d.date_of_death)}
                      </td>
                      <td className="py-4 px-2 border-r border-gray-200">
                        {d.cause_of_death || "N/A"}
                      </td>
                      <td className="py-4 px-2 border-r border-gray-200">
                        {d.place_of_death || "N/A"}
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex justify-center space-x-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => setSelectedDeath(d)}
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            onClick={() => {
                              console.log("Setting editDeath with:", d);
                              // Make sure to spread all properties including resident_id
                              setEditDeath({
                                ...d,
                                resident_id: d.resident_id,
                              });
                            }}
                            title="Edit Record"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => setConfirmDelete(d)}
                            title="Delete Record"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="py-12 text-center text-gray-500 bg-gray-50"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Skull className="text-4xl text-gray-300" />
                      <div className="text-lg font-medium">
                        No death records found.
                      </div>
                      <div className="text-sm text-gray-400">
                        Click 'Add Death Record' to get started.
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="max-h-[85vh] overflow-y-auto">
          {deaths && deaths.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {deaths.map((d) => (
                <div
                  key={d.id}
                  className="p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl p-2 shadow-md">
                        <Skull size={16} className="text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-[#0F4C81] text-base">
                          {d.resident_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Death Record ID: {d.id}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age at Death:</span>
                      <span className="font-medium text-gray-900">
                        {calculateAge(d.dob)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date of Death:</span>
                      <span className="font-medium text-gray-900">
                        {formatDateForInput(d.date_of_death)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cause:</span>
                      <span className="font-medium text-gray-900 truncate max-w-[180px]">
                        {d.cause_of_death || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Place:</span>
                      <span className="font-medium text-gray-900 truncate max-w-[180px]">
                        {d.place_of_death || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setSelectedDeath(d)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => {
                        setEditDeath({
                          ...d,
                          resident_id: d.resident_id,
                        });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(d)}
                      className="flex items-center justify-center px-3 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-md transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <Skull size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-600 text-xl font-semibold mb-2">
                No death records found
              </p>
              <p className="text-gray-500 text-sm">No records available</p>
            </div>
          )}
        </div>
      </div>

      {showDeathForm && (
        <DeathReportModal
          deathForm={deathForm}
          setDeathForm={setDeathForm}
          handleDeathSubmit={handleDeathSubmit}
          setShowDeathForm={setShowDeathForm}
          residents={residents}
        />
      )}

      {selectedDeath && (
        <ViewDeathModal
          selectedDeath={selectedDeath}
          setSelectedDeath={setSelectedDeath}
          calculateAge={calculateAge}
        />
      )}

      {editDeath && (
        <EditDeathModal
          editDeath={editDeath}
          setEditDeath={setEditDeath}
          handleDeathEdit={handleDeathEdit}
          residents={residents}
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
                  onClick={() => setConfirmDelete(null)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete the death record for{" "}
                <span className="font-semibold text-gray-900">
                  {confirmDelete.resident_name || "this resident"}
                </span>{" "}
                (ID{" "}
                <span className="font-semibold text-gray-900">
                  {confirmDelete.id}
                </span>
                )? This action cannot be undone.
              </p>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setDeleting(true);
                      await handleDeathDelete(confirmDelete.id);
                      setConfirmDelete(null);
                    } finally {
                      setDeleting(false);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />

      {showReportGenerator && currentReportType === "death-reports" && (
        <ReportGenerator
          reportType="death-reports"
          title="Death Records Report"
          icon={Skull}
          onGenerate={handleGenerateDeathsReport}
          onClose={() => setShowReportGenerator(false)}
          filters={[]}
          columns={[
            { key: "id", label: "Record ID", type: "text" },
            { key: "resident_id", label: "Resident ID", type: "text" },
            { key: "resident_name", label: "Resident Name", type: "text" },
            { key: "date_of_death", label: "Date of Death", type: "date" },
            { key: "cause_of_death", label: "Cause of Death", type: "text" },
            { key: "place_of_death", label: "Place of Death", type: "text" },
            {
              key: "attending_physician",
              label: "Attending Physician",
              type: "text",
            },
            { key: "remarks", label: "Remarks", type: "text" },
          ]}
        />
      )}
    </section>
  );
};

export default DeathReportsPage;

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
  const id = "death-reports-float-styles";
  if (!document.getElementById(id)) {
    const styleEl = document.createElement("style");
    styleEl.id = id;
    styleEl.appendChild(document.createTextNode(styles));
    document.head.appendChild(styleEl);
  }
}
