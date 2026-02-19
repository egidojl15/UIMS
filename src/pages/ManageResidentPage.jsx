import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Eye,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  RefreshCw,
  Users,
  AlertCircle,
  FileText,
  Download,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import {
  residentsAPI,
  reportsAPI,
  householdsAPI,
  logUserActivity,
} from "../services/api";

import ReportGenerator from "../components/ReportGenerator";
import NotificationSystem from "../components/NotificationSystem";

const educationalAttainmentOptions = [
  { value: "", label: "Select Educational Attainment" },
  { value: "No Formal Education", label: "No Formal Education" },
  { value: "Elementary Undergraduate", label: "Elementary Undergraduate" },
  { value: "Elementary Graduate", label: "Elementary Graduate" },
  { value: "High School Undergraduate", label: "High School Undergraduate" },
  { value: "High School Graduate", label: "High School Graduate" },
  {
    value: "Senior High School Undergraduate",
    label: "Senior High School Undergraduate",
  },
  {
    value: "Senior High School Graduate",
    label: "Senior High School Graduate",
  },
  { value: "Vocational", label: "Vocational" },
  { value: "College Undergraduate", label: "College Undergraduate" },
  { value: "College Graduate", label: "College Graduate" },
  { value: "Post Graduate", label: "Post Graduate" },
];

// Helper function to check if a URL is absolute
const isAbsoluteUrl = (url) =>
  url.startsWith("http://") || url.startsWith("https://");

// Convert various date formats to yyyy-MM-dd format for HTML date input
const formatDateForInput = (dateString) => {
  if (!dateString) return "";

  // Handle different date formats
  let date;

  // If it's already in yyyy-MM-dd format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Try to parse the date
  date = new Date(dateString);

  // If invalid, try parsing as MM-dd-yyyy or dd-MM-yyyy
  if (isNaN(date.getTime())) {
    // Try MM-dd-yyyy format
    const parts = dateString.split("-");
    if (parts.length === 3) {
      // Check if it's MM-dd-yyyy (month first)
      if (
        parts[0].length <= 2 &&
        parts[1].length <= 2 &&
        parts[2].length === 4
      ) {
        date = new Date(
          `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(
            2,
            "0",
          )}`,
        );
      }
      // Check if it's dd-MM-yyyy (day first)
      else if (
        parts[0].length <= 2 &&
        parts[1].length <= 2 &&
        parts[2].length === 4
      ) {
        date = new Date(
          `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(
            2,
            "0",
          )}`,
        );
      }
    }
  }

  if (isNaN(date.getTime())) return ""; // Invalid date

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// 1. InactiveResidentsModal - MUST BE FIRST
const InactiveResidentsModal = ({
  isOpen,
  onClose,
  onRestore,
  onRestoreAll,
  calculateAge,
}) => {
  const [inactiveResidents, setInactiveResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResidents, setSelectedResidents] = useState([]);
  const [showRestoreConfirmation, setShowRestoreConfirmation] = useState(false);
  const [restoreType, setRestoreType] = useState(null); // 'single', 'selected', 'all'
  const [residentToRestore, setResidentToRestore] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchInactiveResidents();
    }
  }, [isOpen]);

  const fetchInactiveResidents = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://uims-backend-production.up.railway.app/api/residents/inactive",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setInactiveResidents(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch inactive residents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResident = (residentId) => {
    setSelectedResidents((prev) =>
      prev.includes(residentId)
        ? prev.filter((id) => id !== residentId)
        : [...prev, residentId],
    );
  };

  const handleSelectAll = () => {
    if (selectedResidents.length === inactiveResidents.length) {
      setSelectedResidents([]);
    } else {
      setSelectedResidents(inactiveResidents.map((r) => r.resident_id));
    }
  };

  const handleRestoreSelected = () => {
    if (selectedResidents.length === 0) return;
    setRestoreType("selected");
    setShowRestoreConfirmation(true);
  };

  const handleRestoreAll = () => {
    setRestoreType("all");
    setShowRestoreConfirmation(true);
  };

  const handleRestoreSingle = (resident) => {
    setResidentToRestore(resident);
    setRestoreType("single");
    setShowRestoreConfirmation(true);
  };

  const confirmRestore = async () => {
    try {
      if (restoreType === "single" && residentToRestore) {
        await onRestore([residentToRestore.resident_id]);
      } else if (restoreType === "selected") {
        await onRestore(selectedResidents);
        setSelectedResidents([]);
      } else if (restoreType === "all") {
        await onRestoreAll();
        setSelectedResidents([]);
      }
      fetchInactiveResidents();
    } catch (error) {
      console.error("Restore error:", error);
    } finally {
      setShowRestoreConfirmation(false);
      setRestoreType(null);
      setResidentToRestore(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Inactive Residents
              </h2>
              <p className="text-sm text-gray-600">
                {inactiveResidents.length} deactivated record
                {inactiveResidents.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Action Buttons */}
        {inactiveResidents.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selectedResidents.length === inactiveResidents.length
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({selectedResidents.length} selected)
                </span>
              </label>
            </div>
            <div className="flex space-x-2">
              {selectedResidents.length > 0 && (
                <button
                  onClick={handleRestoreSelected}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Restore Selected ({selectedResidents.length})</span>
                </button>
              )}
              <button
                onClick={handleRestoreAll}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restore All</span>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : inactiveResidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <AlertCircle className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No inactive residents found</p>
              <p className="text-sm">All residents are currently active</p>
            </div>
          ) : (
            <div className="max-h-[85vh] overflow-y-auto overflow-x-auto">
              <table className="min-w-[900px] w-full border-collapse table-auto md:table-fixed">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <th className="py-3 px-4 text-left sticky top-0 z-10 bg-red-600/95 backdrop-blur-sm whitespace-nowrap text-xs sm:text-sm">
                      <input
                        type="checkbox"
                        checked={
                          selectedResidents.length === inactiveResidents.length
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </th>
                    <th className="py-3 px-4 text-left font-semibold sticky top-0 z-10 bg-red-600/95 backdrop-blur-sm">
                      ID
                    </th>
                    <th className="py-3 px-4 text-left font-semibold sticky top-0 z-10 bg-red-600/95 backdrop-blur-sm">
                      Name
                    </th>
                    <th className="py-3 px-4 text-left font-semibold sticky top-0 z-10 bg-red-600/95 backdrop-blur-sm">
                      Gender
                    </th>
                    <th className="py-3 px-4 text-left font-semibold sticky top-0 z-10 bg-red-600/95 backdrop-blur-sm">
                      Age
                    </th>
                    <th className="py-3 px-4 text-left font-semibold sticky top-0 z-10 bg-red-600/95 backdrop-blur-sm">
                      Purok
                    </th>
                    <th className="py-3 px-4 text-left font-semibold sticky top-0 z-10 bg-red-600/95 backdrop-blur-sm">
                      New Address
                    </th>
                    <th className="py-3 px-4 text-left font-semibold sticky top-0 z-10 bg-red-600/95 backdrop-blur-sm">
                      Deactivated
                    </th>
                    <th className="py-3 px-4 text-center font-semibold sticky top-0 z-10 bg-red-600/95 backdrop-blur-sm">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inactiveResidents.map((resident, index) => (
                    <tr
                      key={resident.resident_id}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-orange-50 hover:ring-1 hover:ring-red-300/40 transition-colors border-b border-gray-200`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedResidents.includes(
                            resident.resident_id,
                          )}
                          onChange={() =>
                            handleSelectResident(resident.resident_id)
                          }
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {resident.resident_id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {resident.first_name} {resident.middle_name}{" "}
                          {resident.last_name}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            resident.gender === "Male"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-pink-100 text-pink-800"
                          }`}
                        >
                          {resident.gender}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {calculateAge(resident.date_of_birth)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium">
                          {resident.purok}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-700 max-w-xs">
                          {resident.new_address ? (
                            <div>
                              <div className="font-medium text-green-700">
                                {resident.new_address}
                              </div>
                              {resident.address && (
                                <div className="text-xs text-gray-500 mt-1">
                                  <span className="font-medium">Original:</span>{" "}
                                  {resident.address}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="font-medium text-gray-900">
                              {resident.address || "Not specified"}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(resident.updated_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleRestoreSingle(resident)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-1 mx-auto"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Restore</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreConfirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl shadow-green-500/20 border border-white/20">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6 rounded-t-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-200 rounded-full animate-pulse"></div>
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <RefreshCw className="w-6 h-6 text-green-200" />
                  Confirm Restoration
                </h3>
              </div>
              <p className="text-green-100 text-sm mt-2">
                This action will reactivate the resident(s)
              </p>
            </div>
            <div className="p-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium text-sm">
                  {restoreType === "single" && residentToRestore && (
                    <>
                      Are you sure you want to restore{" "}
                      <span className="font-bold">
                        {residentToRestore.first_name}{" "}
                        {residentToRestore.last_name}
                      </span>
                      ?
                    </>
                  )}
                  {restoreType === "selected" && (
                    <>
                      Are you sure you want to restore{" "}
                      <span className="font-bold">
                        {selectedResidents.length} selected resident(s)
                      </span>
                      ?
                    </>
                  )}
                  {restoreType === "all" && (
                    <>
                      Are you sure you want to restore{" "}
                      <span className="font-bold">
                        ALL {inactiveResidents.length} inactive residents
                      </span>
                      ?
                    </>
                  )}
                </p>
                {restoreType === "single" && residentToRestore && (
                  <p className="text-green-700 text-xs mt-1">
                    Resident ID: {residentToRestore.resident_id} • Purok:{" "}
                    {residentToRestore.purok}
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 text-sm font-medium">
                      Important Notice
                    </p>
                    <p className="text-yellow-700 text-xs mt-1">
                      Restoring will make the resident(s) active again and they
                      will appear in all active resident lists.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRestoreConfirmation(false);
                    setRestoreType(null);
                    setResidentToRestore(null);
                  }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRestore}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <RefreshCw size={16} />
                  <span>
                    Restore Resident
                    {restoreType === "selected" || restoreType === "all"
                      ? "s"
                      : ""}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Re-defining modals to make the component self-contained for simplicity
const ViewResidentModal = ({
  selectedResident,
  setSelectedResident,
  calculateAge,
}) => {
  if (!selectedResident) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-4xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">
                Resident Details
              </h2>
            </div>
            <button
              onClick={() => setSelectedResident(null)}
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
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column for Image */}
            <div className="flex-shrink-0 flex justify-center md:justify-start">
              {selectedResident.photo_url ? (
                <img
                  src={`https://uims-backend-production.up.railway.app${selectedResident.photo_url}`}
                  alt="Resident"
                  className="w-48 h-48 rounded-full object-cover border-4 border-[#B3DEF8]"
                  onError={(e) => {
                    e.target.src = "/placeholder-avatar.png"; // Fallback image (add this asset to your public folder)
                    console.error("Image load failed:", e.target.src);
                  }}
                />
              ) : (
                <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm border-4 border-[#B3DEF8]">
                  No Photo
                </div>
              )}
            </div>
            {/* Right Column for Details */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Last Name</p>
                <p className="font-semibold">{selectedResident.last_name}</p>
              </div>
              <div>
                <p className="text-gray-500">First Name</p>
                <p className="font-semibold">{selectedResident.first_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Middle Name</p>
                <p className="font-semibold">{selectedResident.middle_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Suffix</p>
                <p className="font-semibold">{selectedResident.suffix}</p>
              </div>
              <div>
                <p className="text-gray-500">Gender</p>
                <p className="font-semibold">{selectedResident.gender}</p>
              </div>
              <div>
                <p className="text-gray-500">Age</p>
                <p className="font-semibold">
                  {calculateAge(selectedResident.date_of_birth)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Date of Birth</p>
                <p className="font-semibold">
                  {formatDateForInput(selectedResident.date_of_birth)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Purok</p>
                <p className="font-semibold">{selectedResident.purok}</p>
              </div>
              <div>
                <p className="text-gray-500">Civil Status</p>
                <p className="font-semibold">{selectedResident.civil_status}</p>
              </div>
              <div>
                <p className="text-gray-500">Religion</p>
                <p className="font-semibold">
                  {selectedResident.religion || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Occupation</p>
                <p className="font-semibold">
                  {selectedResident.occupation || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Educational Attainment</p>
                <p className="font-semibold">
                  {selectedResident.educational_attainment || "Not specified"}
                </p>
              </div>
              {selectedResident.civil_status === "Married" && (
                <div>
                  <p className="text-gray-500">Spouse</p>
                  <p className="font-semibold">
                    {selectedResident.spouse_name || "Not specified"}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Contact No.</p>
                <p className="font-semibold">
                  {selectedResident.contact_number}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Email</p>
                <p className="font-semibold">
                  {selectedResident.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Registered Voter</p>
                <p className="font-semibold">
                  {selectedResident.is_registered_voter ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">4P's Member</p>
                <p className="font-semibold">
                  {selectedResident.is_4ps ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">PWD</p>
                <p className="font-semibold">
                  {selectedResident.is_pwd ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Senior Citizen</p>
                <p className="font-semibold">
                  {calculateAge(selectedResident.date_of_birth) >= 60
                    ? "Yes"
                    : "No"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Registered Date</p>
                <p className="font-semibold">
                  {formatDateForInput(selectedResident.registered_date)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Household</p>
                <p className="font-semibold">
                  {selectedResident.household_number
                    ? `${selectedResident.household_number}`
                    : "Not assigned"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-gray-500">Last Updated</p>
                <p className="font-semibold">
                  {formatDateForInput(selectedResident.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditResidentModal = ({
  editResident,
  setEditResident,
  handleResidentEdit,
  purokOptions,
  households,
  residents,
}) => {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    editResident?.photo_url
      ? isAbsoluteUrl(editResident.photo_url)
        ? editResident.photo_url
        : `https://uims-backend-production.up.railway.app${editResident.photo_url}` // FIXED: Correct base URL + photo_url
      : null,
  );

  const [isUpdating, setIsUpdating] = useState(false); // NEW: Loading state for update button
  const [spouseMode, setSpouseMode] = useState("select"); // 'select' or 'manual'

  // Helper function to calculate age
  const calculateAge = (birthdate) => {
    if (!birthdate) return "";
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age < 0 ? 0 : age; // Prevent negative ages
  };

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  if (!editResident) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        e.target.value = "";
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        e.target.value = "";
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true); // NEW: Show loading
    const age = calculateAge(editResident.date_of_birth);
    try {
      await handleResidentEdit(editResident.resident_id, {
        ...editResident,
        is_senior_citizen: age >= 60 ? 1 : 0,
        photo_file: photoFile,
      });
    } finally {
      setIsUpdating(false); // NEW: End loading
    }
  };

  useEffect(() => {
    if (editResident.civil_status !== "Married") {
      setSpouseMode("select");
      return;
    }

    if (!editResident.spouse_name) {
      setSpouseMode("select");
      return;
    }

    const possibleNames = (residents || [])
      .filter((r) => {
        if (r.resident_id === editResident.resident_id) return false;
        if (r.civil_status !== "Married") return false;
        if (editResident.gender && r.gender === editResident.gender)
          return false;
        return true;
      })
      .map((r) => {
        return `${r.first_name}${r.middle_name ? " " + r.middle_name : ""} ${
          r.last_name
        } ${r.suffix || ""}`.trim();
      });

    if (possibleNames.includes(editResident.spouse_name)) {
      setSpouseMode("select");
    } else {
      setSpouseMode("manual");
    }
  }, [
    editResident.civil_status,
    editResident.spouse_name,
    editResident.gender,
    residents,
  ]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-4xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">Edit Resident</h2>
            </div>
            <button
              type="button"
              onClick={() => setEditResident(null)}
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
          <form
            onSubmit={handleEditSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="col-span-1 md:col-span-2 flex flex-col items-center">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Resident"
                  className="w-24 h-24 rounded-full object-cover mb-2"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                  <span className="text-gray-500">No Photo</span>
                </div>
              )}
              <label className="block text-sm font-medium text-gray-700">
                Change Photo
              </label>
              <input
                type="file"
                accept="image/*"
                name="photo"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={editResident.last_name || ""}
                onChange={(e) =>
                  setEditResident({
                    ...editResident,
                    last_name: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={editResident.first_name || ""}
                onChange={(e) =>
                  setEditResident({
                    ...editResident,
                    first_name: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Middle Name
              </label>
              <input
                type="text"
                name="middle_name"
                value={editResident.middle_name || ""}
                onChange={(e) =>
                  setEditResident({
                    ...editResident,
                    middle_name: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Suffix (e.g., Jr., Sr.)
              </label>
              <input
                type="text"
                name="suffix"
                value={editResident.suffix || ""}
                onChange={(e) =>
                  setEditResident({ ...editResident, suffix: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formatDateForInput(editResident.date_of_birth)}
                onChange={(e) => {
                  const newBirthdate = e.target.value;
                  setEditResident({
                    ...editResident,
                    date_of_birth: newBirthdate,
                  });
                }}
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={editResident.gender || ""}
                onChange={(e) =>
                  setEditResident({ ...editResident, gender: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Civil Status
              </label>
              <select
                name="civil_status"
                value={editResident.civil_status || ""}
                onChange={(e) =>
                  setEditResident({
                    ...editResident,
                    civil_status: e.target.value,
                    spouse_name:
                      e.target.value !== "Married"
                        ? ""
                        : editResident.spouse_name,
                  })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
                required
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                <option value="Widower">Widower</option>
                <option value="Separated">Separated</option>
                <option value="Live-in Partner">Live-in Partner</option>
                <option value="Annulled">Annulled</option>
              </select>
            </div>
            {editResident.civil_status === "Married" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Spouse{" "}
                  <span className="text-gray-500 text-xs">(Optional)</span>
                </label>

                <select
                  value={
                    spouseMode === "manual"
                      ? "__manual__"
                      : editResident.spouse_name || ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "__manual__") {
                      setSpouseMode("manual");
                    } else if (value === "") {
                      setSpouseMode("select");
                      setEditResident({ ...editResident, spouse_name: "" });
                    } else {
                      setSpouseMode("select");
                      setEditResident({ ...editResident, spouse_name: value });
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
                >
                  <option value="">Select Spouse (Optional)</option>
                  {(residents || [])
                    .filter((r) => {
                      if (r.resident_id === editResident.resident_id)
                        return false;
                      if (r.civil_status !== "Married") return false;
                      if (
                        editResident.gender &&
                        r.gender === editResident.gender
                      )
                        return false;
                      return true;
                    })
                    .map((resident) => {
                      const fullName = `${resident.first_name}${
                        resident.middle_name ? " " + resident.middle_name : ""
                      } ${resident.last_name} ${resident.suffix || ""}`.trim();
                      return (
                        <option key={resident.resident_id} value={fullName}>
                          {fullName} - {resident.purok} ({resident.gender})
                        </option>
                      );
                    })}
                  <option value="__manual__">Enter manually...</option>
                </select>

                {/* Manual Input Field - Only shows when in manual mode */}
                {spouseMode === "manual" && (
                  <input
                    type="text"
                    placeholder="Enter spouse's full name"
                    value={editResident.spouse_name || ""}
                    onChange={(e) =>
                      setEditResident({
                        ...editResident,
                        spouse_name: e.target.value,
                      })
                    }
                    className="mt-2 block w-full rounded-md border-2 border-gray-400 shadow-sm px-3 py-2"
                  />
                )}

                <p className="text-xs text-gray-500 mt-1">
                  {editResident.gender
                    ? `Showing ${
                        editResident.gender === "Male" ? "female" : "male"
                      } married residents`
                    : "Please select gender first to see spouse options"}
                </p>
              </div>
            )}

            {/* === RELIGION IN EDIT MODE === */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Religion
              </label>
              <input
                type="text"
                name="religion"
                value={editResident.religion || ""}
                onChange={(e) =>
                  setEditResident({
                    ...editResident,
                    religion: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
                placeholder="e.g., Roman Catholic, Protestant, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Educational Attainment
              </label>
              <select
                name="educational_attainment"
                value={editResident.educational_attainment || ""}
                onChange={(e) =>
                  setEditResident({
                    ...editResident,
                    educational_attainment: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
              >
                {educationalAttainmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <input
                type="tel"
                name="contact_number"
                value={editResident.contact_number || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const numbersOnly = value.replace(/[^0-9]/g, "");
                  setEditResident({
                    ...editResident,
                    contact_number: numbersOnly,
                  });
                }}
                maxLength="11"
                inputMode="numeric"
                pattern="[0-9]{11}"
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={editResident.email || ""}
                onChange={(e) =>
                  setEditResident({ ...editResident, email: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Purok
              </label>
              <select
                name="purok"
                value={editResident.purok || ""}
                onChange={(e) =>
                  setEditResident({ ...editResident, purok: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
                required
              >
                <option value="">Select Purok</option>
                {purokOptions.slice(1).map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Household
              </label>
              <select
                name="household_id"
                value={editResident.household_id || ""}
                onChange={(e) =>
                  setEditResident({
                    ...editResident,
                    household_id: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
              >
                <option value="">Select Household (Optional)</option>
                {households && households.length > 0 ? (
                  households.map((household) => (
                    <option
                      key={household.household_id}
                      value={household.household_id}
                    >
                      {household.household_number} -{" "}
                      {household.household_head_name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No households available
                  </option>
                )}
              </select>
            </div>

            <div className="flex items-center space-x-4 col-span-1 md:col-span-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={editResident.is_pwd || false}
                  onChange={(e) =>
                    setEditResident({
                      ...editResident,
                      is_pwd: e.target.checked,
                    })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">PWD</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={editResident.is_4ps || false}
                  onChange={(e) =>
                    setEditResident({
                      ...editResident,
                      is_4ps: e.target.checked,
                    })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">4P's Member</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={editResident.is_registered_voter || false}
                  onChange={(e) =>
                    setEditResident({
                      ...editResident,
                      is_registered_voter: e.target.checked,
                    })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Voter</span>
              </label>
              <div className="inline-flex items-center">
                <span className="text-sm text-gray-700">Senior Citizen: </span>
                <span
                  className={`ml-2 text-sm font-medium ${
                    calculateAge(editResident.date_of_birth) >= 60
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {calculateAge(editResident.date_of_birth) >= 60
                    ? "✓ Yes"
                    : "✗ No"}
                </span>
              </div>
            </div>

            <div className="flex justify-end col-span-1 md:col-span-2 space-x-2">
              <button
                type="button"
                onClick={() => setEditResident(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating} // NEW: Disable during update
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Updating..." : "Update Resident"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
const AddResidentModal = ({
  residentForm,
  setResidentForm,
  handleResidentSubmit,
  setShowResidentForm,
  purokOptions,
  households,
  filteredResidents,
  duplicateError,
  setDuplicateError,
}) => {
  const [photoPreview, setPhotoPreview] = useState(null);

  // Helper function to calculate age
  const calculateAge = (birthdate) => {
    if (!birthdate) return "";
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age < 0 ? 0 : age; // Prevent negative ages
  };

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        e.target.value = "";
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        e.target.value = "";
        return;
      }
      setResidentForm({ ...residentForm, photo_file: file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();

    // Create FormData directly from the form (includes file + all fields)
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    // Auto-calculate is_senior_citizen
    const birthdate = formData.get("date_of_birth");
    const age = birthdate ? calculateAge(birthdate) : 0;
    formData.set("is_senior_citizen", age >= 60 ? "1" : "0");

    // Call the perfect handler passed from parent
    handleResidentSubmit(e);
  };
  // ——— RELIGION DROPDOWN DATA ———
  const [showReligionDropdown, setShowReligionDropdown] = useState(false);

  const religions = [
    "Roman Catholic",
    "Iglesia ni Cristo",
    "Islam",
    "Protestant",
    "Born Again Christian",
    "Aglipayan (Philippine Independent Church)",
    "Seventh-day Adventist",
    "Baptist",
    "Jehovah’s Witnesses",
    "Church of Christ",
    "Methodist",
    "Evangelical",
    "Buddhism",
    "Hinduism",
    "None / No Religion",
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-4xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">
                Add New Resident
              </h2>
            </div>
            <button
              onClick={() => setShowResidentForm(null)}
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
          <form
            onSubmit={handleAddSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="col-span-1 md:col-span-2 flex flex-col items-center">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Resident"
                  className="w-24 h-24 rounded-full object-cover mb-2"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                  <span className="text-gray-500">No Photo</span>
                </div>
              )}
              <label className="block text-sm font-medium text-gray-700">
                Resident Photo
              </label>
              <input
                type="file"
                accept="image/*"
                name="photo"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={residentForm.last_name}
                onChange={(e) =>
                  setResidentForm({
                    ...residentForm,
                    last_name: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={residentForm.first_name}
                onChange={(e) =>
                  setResidentForm({
                    ...residentForm,
                    first_name: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Middle Name
              </label>
              <input
                type="text"
                name="middle_name"
                value={residentForm.middle_name}
                onChange={(e) =>
                  setResidentForm({
                    ...residentForm,
                    middle_name: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Suffix (e.g., Jr., Sr.)
              </label>
              <input
                type="text"
                name="suffix"
                value={residentForm.suffix}
                onChange={(e) =>
                  setResidentForm({ ...residentForm, suffix: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formatDateForInput(residentForm.date_of_birth)}
                onChange={(e) => {
                  const newBirthdate = e.target.value;
                  setResidentForm({
                    ...residentForm,
                    date_of_birth: newBirthdate,
                  });
                }}
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={residentForm.gender}
                onChange={(e) =>
                  setResidentForm({ ...residentForm, gender: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Civil Status
              </label>
              <select
                name="civil_status"
                value={residentForm.civil_status}
                onChange={(e) =>
                  setResidentForm({
                    ...residentForm,
                    civil_status: e.target.value,
                    spouse_name:
                      e.target.value !== "Married"
                        ? ""
                        : residentForm.spouse_name, // Clear spouse if not married
                  })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
                required
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                <option value="Widower">Widower</option>
                <option value="Separated">Separated</option>
                <option value="Live-in Partner">Live-in Partner</option>
                <option value="Annulled">Annulled</option>
              </select>
            </div>
            {residentForm.civil_status === "Married" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Spouse Name{" "}
                  <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="spouse_name"
                  list="spouse-list-add"
                  value={residentForm.spouse_name || ""}
                  onChange={(e) =>
                    setResidentForm({
                      ...residentForm,
                      spouse_name: e.target.value,
                    })
                  }
                  placeholder="Type or select spouse name"
                  className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm px-3 py-2"
                />
                <datalist id="spouse-list-add">
                  {(filteredResidents || [])
                    .filter(
                      (r) =>
                        r.civil_status === "Married" &&
                        r.gender !== residentForm.gender &&
                        residentForm.gender,
                    )
                    .map((resident) => {
                      const fullName = `${resident.first_name} ${
                        resident.middle_name || ""
                      } ${resident.last_name} ${resident.suffix || ""}`.trim();
                      return (
                        <option key={resident.resident_id} value={fullName}>
                          {resident.purok}
                        </option>
                      );
                    })}
                </datalist>
                <p className="text-xs text-gray-500 mt-1">
                  {residentForm.gender
                    ? `Select from ${
                        residentForm.gender === "Male" ? "female" : "male"
                      } married residents or type manually`
                    : "Please select gender first to see spouse suggestions"}
                </p>
              </div>
            )}

            {/* === RELIGION: Beautiful Searchable Dropdown === */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Religion <span className="text-red-500">*</span>
              </label>

              {/* Hidden select (for form submission) */}
              <select
                name="religion"
                value={residentForm.religion || ""}
                onChange={(e) =>
                  setResidentForm({ ...residentForm, religion: e.target.value })
                }
                className="hidden"
              >
                <option value="">Select religion</option>
                {religions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>

              {/* Beautiful searchable input */}
              <div className="relative">
                <input
                  type="text"
                  value={residentForm.religion || ""}
                  onChange={(e) => {
                    setResidentForm({
                      ...residentForm,
                      religion: e.target.value,
                    });
                    setShowReligionDropdown(true);
                  }}
                  onFocus={() => setShowReligionDropdown(true)}
                  placeholder="Search or select religion..."
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent transition-all"
                />
                <div className="absolute right-3 top-4 text-gray-400">▼</div>
              </div>

              {/* Dropdown list - stays INSIDE the modal */}
              {showReligionDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                  {religions
                    .filter((r) =>
                      r
                        .toLowerCase()
                        .includes((residentForm.religion || "").toLowerCase()),
                    )
                    .map((religion) => (
                      <div
                        key={religion}
                        onClick={() => {
                          setResidentForm({ ...residentForm, religion });
                          setShowReligionDropdown(false);
                        }}
                        className="px-4 py-3 hover:bg-[#0F4C81] hover:text-white cursor-pointer transition-all"
                      >
                        <span className="font-medium">{religion}</span>
                        {religion === "Roman Catholic" && (
                          <span className="text-xs block opacity-75"></span>
                        )}
                      </div>
                    ))}
                  <div
                    onClick={() => {
                      setResidentForm({ ...residentForm, religion: "Other" });
                      setShowReligionDropdown(false);
                    }}
                    className="px-4 py-3 hover:bg-orange-100 cursor-pointer border-t"
                  >
                    🔹 <strong>Other</strong> (type your own)
                  </div>
                </div>
              )}

              {/* Click outside to close */}
              {showReligionDropdown && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowReligionDropdown(false)}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Occupation
              </label>
              <input
                type="text"
                name="occupation"
                value={residentForm.occupation}
                onChange={(e) =>
                  setResidentForm({
                    ...residentForm,
                    occupation: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
                placeholder="e.g., Farmer, Teacher, Student, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Educational Attainment
              </label>
              <select
                name="educational_attainment"
                value={residentForm.educational_attainment}
                onChange={(e) =>
                  setResidentForm({
                    ...residentForm,
                    educational_attainment: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
              >
                {educationalAttainmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <input
                type="tel"
                name="contact_number"
                value={residentForm.contact_number}
                onChange={(e) => {
                  const value = e.target.value;
                  const numbersOnly = value.replace(/[^0-9]/g, "");
                  setResidentForm({
                    ...residentForm,
                    contact_number: numbersOnly,
                  });
                }}
                maxLength="11"
                inputMode="numeric"
                pattern="[0-9]{11}"
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Household
              </label>
              <select
                name="household_id"
                value={residentForm.household_id}
                onChange={(e) =>
                  setResidentForm({
                    ...residentForm,
                    household_id: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
              >
                <option value="">Select Household (Optional)</option>
                {households && households.length > 0 ? (
                  households.map((household) => (
                    <option
                      key={household.household_id}
                      value={household.household_id}
                    >
                      {household.household_number} -{" "}
                      {household.household_head_name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No households available
                  </option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={residentForm.email}
                onChange={(e) =>
                  setResidentForm({ ...residentForm, email: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Purok
              </label>
              <select
                name="purok"
                value={residentForm.purok}
                onChange={(e) =>
                  setResidentForm({ ...residentForm, purok: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm"
                required
              >
                <option value="">Select Purok</option>
                {purokOptions.slice(1).map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-4 col-span-1 md:col-span-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={residentForm.is_pwd}
                  onChange={(e) =>
                    setResidentForm({
                      ...residentForm,
                      is_pwd: e.target.checked,
                    })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">PWD</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={residentForm.is_4ps}
                  onChange={(e) =>
                    setResidentForm({
                      ...residentForm,
                      is_4ps: e.target.checked,
                    })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">4P's Member</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={residentForm.is_registered_voter}
                  onChange={(e) =>
                    setResidentForm({
                      ...residentForm,
                      is_registered_voter: e.target.checked,
                    })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Voter</span>
              </label>
              <div className="inline-flex items-center">
                <span className="text-sm text-gray-700">Senior Citizen: </span>
                <span
                  className={`ml-2 text-sm font-medium ${
                    calculateAge(residentForm.date_of_birth) >= 60
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {calculateAge(residentForm.date_of_birth) >= 60
                    ? "✓ Yes"
                    : "✗ No"}
                </span>
              </div>
            </div>
            <div className="flex justify-end col-span-1 md:col-span-2 space-x-2">
              {duplicateError && (
                <div className="w-full mb-2 flex items-start gap-2 bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
                  <div>
                    <p className="font-semibold">Resident Already Exists</p>
                    <p>
                      A resident with the same name and birthdate is already
                      registered in the system.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDuplicateError && setDuplicateError(false)
                    }
                    className="ml-auto text-red-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowResidentForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Resident
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Enhanced ConfirmationModal with new address field
const ConfirmationModal = ({ resident, onConfirm, onCancel }) => {
  const [newAddress, setNewAddress] = useState("");
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleConfirm = () => {
    if (!newAddress.trim()) {
      alert("Please enter the resident's new address before deactivating.");
      return;
    }
    setIsDeactivating(true);
    onConfirm(newAddress.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-lg shadow-2xl shadow-red-500/20 border border-white/20">
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-200 rounded-full animate-pulse"></div>
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-200" />
              Deactivate Resident
            </h3>
          </div>
          <p className="text-red-100 text-sm mt-2">
            Please provide the resident's new address
          </p>
        </div>
        <div className="p-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Resident Information
                </h4>
                <p className="text-blue-800 font-medium text-sm">
                  {resident.first_name} {resident.middle_name || ""}{" "}
                  {resident.last_name}
                </p>
                <p className="text-blue-700 text-xs mt-1">
                  Resident ID: {resident.resident_id} • Purok: {resident.purok}
                </p>
                <p className="text-blue-700 text-xs">
                  Current Address: {resident.address || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Enter the resident's new address..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows={3}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This information will be recorded for tracking purposes.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-800 text-sm font-medium">
                  Important Notice
                </p>
                <p className="text-yellow-700 text-xs mt-1">
                  Deactivating this resident will mark their records as
                  inactive. They will no longer appear in active resident lists
                  but their data will be preserved.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={isDeactivating}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeactivating || !newAddress.trim()}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeactivating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Deactivating...</span>
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span>Deactivate Resident</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to calculate age from birthdate
function calculateAgeHelper(birthdate) {
  if (!birthdate) return "";
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age < 0 ? 0 : age;
}

const defaultPurokOptions = [
  { value: "", label: "All Purok" },
  { value: "Barola", label: "Barola" },
  { value: "Go", label: "Go" },
  { value: "Hanopol", label: "Hanopol" },
];

const ManageResidentsPage = () => {
  // Get context from Outlet - returns undefined if no Outlet parent
  const context = useOutletContext() || null;

  // Determine if we're in standalone mode
  const isStandalone =
    !context ||
    typeof context !== "object" ||
    !context.residents ||
    Array.isArray(context.residents) === false;

  // Debug logging
  console.log("ManageResidentsPage - Context:", context);
  console.log("ManageResidentsPage - isStandalone:", isStandalone);

  // Standalone state (used when context is not available)
  const [standaloneResidents, setStandaloneResidents] = useState([]);
  const [standaloneSearchQuery, setStandaloneSearchQuery] = useState("");
  const [standalonePurokFilter, setStandalonePurokFilter] = useState("");
  const [standaloneShowResidentForm, setStandaloneShowResidentForm] =
    useState(false);
  const [standaloneSelectedResident, setStandaloneSelectedResident] =
    useState(null);
  const [standaloneEditResident, setStandaloneEditResident] = useState(null);
  const [standaloneResidentForm, setStandaloneResidentForm] = useState({});
  const [standaloneHouseholds, setStandaloneHouseholds] = useState([]);
  const [standaloneNotifications, setStandaloneNotifications] = useState([]);
  const [standaloneLoading, setStandaloneLoading] = useState(true);
  const [standaloneDuplicateError, setStandaloneDuplicateError] =
    useState(false);

  // Standalone notification functions
  const standaloneRemoveNotification = useCallback((id) => {
    setStandaloneNotifications((prev) =>
      prev.filter((notif) => notif.id !== id),
    );
  }, []);

  const standaloneAddNotification = useCallback(
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
      setStandaloneNotifications((prev) => [...prev, newNotification]);
    },
    [],
  );

  // Standalone fetch residents
  const standaloneFetchResidents = useCallback(async () => {
    try {
      setStandaloneLoading(true);
      const data = await residentsAPI.getAll();
      if (data.success) {
        setStandaloneResidents(data.data || []);
      } else {
        setStandaloneResidents([]);
        standaloneAddNotification(
          "error",
          "Load Failed",
          data.message || "Failed to load residents data",
        );
      }
    } catch (error) {
      console.error("Error fetching residents:", error);
      standaloneAddNotification(
        "error",
        "Error",
        "An error occurred while loading residents",
      );
    } finally {
      setStandaloneLoading(false);
    }
  }, [standaloneAddNotification]);

  // Standalone fetch households
  const standaloneFetchHouseholds = useCallback(async () => {
    try {
      const data = await householdsAPI.getAll();
      if (data.success) {
        setStandaloneHouseholds(data.households || []);
      }
    } catch (error) {
      console.error("Error fetching households:", error);
    }
  }, []);

  // Standalone initial data fetch
  useEffect(() => {
    if (isStandalone) {
      standaloneFetchResidents();
      standaloneFetchHouseholds();
    }
  }, [isStandalone, standaloneFetchResidents, standaloneFetchHouseholds]);

  // Standalone filter residents
  const standaloneFilteredResidents = standaloneResidents.filter((resident) => {
    const matchesSearch = standaloneSearchQuery
      ? Object.values(resident)
          .join(" ")
          .toLowerCase()
          .includes(standaloneSearchQuery.toLowerCase())
      : true;
    const matchesPurok = standalonePurokFilter
      ? resident.purok === standalonePurokFilter
      : true;
    return matchesSearch && matchesPurok;
  });

  // Replace the standaloneHandleResidentSubmit function in ManageResidentsPage.jsx
  const standaloneHandleResidentSubmit = async (formDataOrEvent) => {
    try {
      console.log("=== STANDALONE RESIDENT SUBMIT ===");
      console.log("Received:", formDataOrEvent);

      let submitData;

      // Check if this is an Event object (form submission)
      if (formDataOrEvent && formDataOrEvent.preventDefault) {
        // It's an event - prevent default and create FormData
        formDataOrEvent.preventDefault();
        const form = formDataOrEvent.target;
        const formData = new FormData(form);

        submitData = {};
        for (let [key, value] of formData.entries()) {
          // Handle checkboxes
          if (
            key === "is_4ps" ||
            key === "is_registered_voter" ||
            key === "is_pwd"
          ) {
            submitData[key] = value === "on" || value === "1" || value === true;
          }
          // Handle photo file
          else if (key === "photo" && value instanceof File) {
            submitData.photo_file = value;
          }
          // Handle empty values
          else if (value === "" || value === "null" || value === "undefined") {
            submitData[key] = null;
          }
          // Handle regular fields
          else {
            submitData[key] = value;
          }
        }
      }
      // Check if this is a FormData object
      else if (formDataOrEvent instanceof FormData) {
        // Convert FormData to plain object
        submitData = {};
        for (let [key, value] of formDataOrEvent.entries()) {
          // Handle checkboxes
          if (
            key === "is_4ps" ||
            key === "is_registered_voter" ||
            key === "is_pwd"
          ) {
            submitData[key] = value === "on" || value === "1" || value === true;
          }
          // Handle photo file
          else if (key === "photo" && value instanceof File) {
            submitData.photo_file = value;
          }
          // Handle empty values
          else if (value === "" || value === "null" || value === "undefined") {
            submitData[key] = null;
          }
          // Handle regular fields
          else {
            submitData[key] = value;
          }
        }
      } else {
        // If it's already an object, use it directly
        submitData = formDataOrEvent;
      }

      // Validate required fields
      if (
        !submitData.first_name ||
        !submitData.last_name ||
        !submitData.date_of_birth ||
        !submitData.gender ||
        !submitData.civil_status ||
        !submitData.purok
      ) {
        standaloneAddNotification(
          "error",
          "Validation Error",
          "Please fill in all required fields: First Name, Last Name, Date of Birth, Gender, Civil Status, and Purok",
        );
        return;
      }

      // Call the API
      setStandaloneDuplicateError(false); // reset before each attempt
      const result = await residentsAPI.create(submitData);

      if (result.success) {
        standaloneAddNotification(
          "success",
          "Success",
          "Resident created successfully",
        );

        // Refresh the residents list
        await standaloneFetchResidents();

        // Close the form and reset
        setStandaloneShowResidentForm(false);
        setStandaloneDuplicateError(false);
        setStandaloneResidentForm({
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
          is_4ps: false,
          is_registered_voter: false,
          is_pwd: false,
          photo_file: null,
        });
      } else {
        // Check if it's a duplicate resident error
        const isDuplicate =
          result.message &&
          result.message.toLowerCase().includes("already exists");
        if (isDuplicate) setStandaloneDuplicateError(true);
        standaloneAddNotification(
          "error",
          isDuplicate ? "Resident Already Exists" : "Error",
          isDuplicate
            ? "Resident already exists. A resident with the same first name, middle name, last name, and birthdate is already registered."
            : result.message || "Failed to create resident",
        );
      }
    } catch (error) {
      console.error("Error saving resident:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to save resident";
      const isDuplicate = errMsg.toLowerCase().includes("already exists");
      if (isDuplicate) setStandaloneDuplicateError(true);
      standaloneAddNotification(
        "error",
        isDuplicate ? "Resident Already Exists" : "Error",
        isDuplicate
          ? "Resident already exists. A resident with the same first name, middle name, last name, and birthdate is already registered."
          : errMsg,
      );
    }
  };

  // Standalone handle resident edit - saves the edited resident data
  const standaloneHandleResidentEdit = async (residentId, residentData) => {
    try {
      const result = await residentsAPI.update(residentId, residentData);
      if (result.success) {
        standaloneAddNotification(
          "success",
          "Success",
          "Resident updated successfully",
        );
        standaloneFetchResidents();
        setStandaloneEditResident(null);
      } else {
        standaloneAddNotification(
          "error",
          "Error",
          "Failed to update resident",
        );
      }
    } catch (error) {
      console.error("Error updating resident:", error);
      standaloneAddNotification("error", "Error", "Failed to update resident");
    }
  };

  // Standalone handle resident delete
  const standaloneHandleResidentDelete = async (
    residentId,
    newAddress = "",
  ) => {
    try {
      const result = await residentsAPI.delete(residentId, newAddress);

      if (result.success) {
        standaloneAddNotification(
          "success",
          "Success",
          "Resident moved to inactive residents",
        );
        standaloneFetchResidents();
      } else {
        standaloneAddNotification(
          "error",
          "Error",
          "Failed to move resident to inactive list",
        );
      }
    } catch (error) {
      console.error("Error deactivating resident:", error);
      standaloneAddNotification(
        "error",
        "Error",
        "Failed to move resident to inactive list",
      );
    }
  };

  // Use context values if available, otherwise use standalone values
  const residents = isStandalone ? standaloneResidents : context.residents;
  const filteredResidents = isStandalone
    ? standaloneFilteredResidents
    : context.filteredResidents;
  const searchQuery = isStandalone
    ? standaloneSearchQuery
    : context.searchQuery;
  const setSearchQuery = isStandalone
    ? setStandaloneSearchQuery
    : context.setSearchQuery;
  const purokFilter = isStandalone
    ? standalonePurokFilter
    : context.purokFilter;
  const setPurokFilter = isStandalone
    ? setStandalonePurokFilter
    : context.setPurokFilter;
  const setShowResidentForm = isStandalone
    ? setStandaloneShowResidentForm
    : context.setShowResidentForm;
  const setSelectedResident = isStandalone
    ? setStandaloneSelectedResident
    : context.setSelectedResident;
  const setEditResident = isStandalone
    ? setStandaloneEditResident
    : context.setEditResident;
  const handleResidentDelete = isStandalone
    ? standaloneHandleResidentDelete
    : context.handleResidentDelete;
  const showResidentForm = isStandalone
    ? standaloneShowResidentForm
    : context.showResidentForm;
  const selectedResident = isStandalone
    ? standaloneSelectedResident
    : context.selectedResident;
  const editResident = isStandalone
    ? standaloneEditResident
    : context.editResident;
  const residentForm = isStandalone
    ? standaloneResidentForm
    : context.residentForm;
  const setResidentForm = isStandalone
    ? setStandaloneResidentForm
    : context.setResidentForm;
  const handleResidentSubmit = isStandalone
    ? standaloneHandleResidentSubmit
    : context.handleResidentSubmit;
  const handleResidentEdit = isStandalone
    ? standaloneHandleResidentEdit
    : context.handleResidentEdit;
  const calculateAge = isStandalone ? calculateAgeHelper : context.calculateAge;
  const purokOptions = isStandalone
    ? defaultPurokOptions
    : context.purokOptions;
  const addNotification = isStandalone
    ? standaloneAddNotification
    : context.addNotification;
  const removeNotification = isStandalone
    ? standaloneRemoveNotification
    : context.removeNotification;
  const notifications = isStandalone
    ? standaloneNotifications
    : context.notifications || [];
  const fetchResidents = isStandalone
    ? standaloneFetchResidents
    : context.fetchResidents;
  const households = isStandalone ? standaloneHouseholds : context.households;
  const duplicateError = isStandalone ? standaloneDuplicateError : false;
  const setDuplicateError = isStandalone
    ? setStandaloneDuplicateError
    : () => {};

  // Declare all additional state hooks BEFORE any conditional returns
  const [residentToDelete, setResidentToDelete] = useState(null);
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [currentReportType, setCurrentReportType] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [reportPurokOptions, setReportPurokOptions] = useState([]);

  // Declare all useEffect hooks BEFORE any conditional returns
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Load purok options for reports
  useEffect(() => {
    // Use existing purokOptions from context instead of API call
    if (purokOptions && purokOptions.length > 0) {
      console.log("Purok options for reports:", purokOptions);
      // Filter out any "All" or "All Purok" options to avoid duplicates
      const filteredOptions = purokOptions.filter(
        (option) =>
          option.value !== "" &&
          option.value !== "All" &&
          option.value !== "All Purok" &&
          option.label !== "All" &&
          option.label !== "All Purok",
      );
      setReportPurokOptions(filteredOptions);
    }
  }, [purokOptions]);

  // Show loading state for standalone mode
  if (isStandalone && standaloneLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#0F4C81] text-lg font-medium">
            Loading Residents...
          </p>
        </div>
      </div>
    );
  }

  // Generate detailed age distribution PDF
  const generateDetailedAgeDistributionPDF = (ageDistributionData, filters) => {
    // Import jsPDF dynamically
    import("jspdf")
      .then(({ default: jsPDF }) => {
        const doc = new jsPDF("landscape", "mm", "a4");

        // Set up fonts and colors
        const primaryColor = "#0F4C81";
        const secondaryColor = "#58A1D3";
        const lightGray = "#F8F9FA";
        const borderColor = "#000000";

        // Title
        doc.setFontSize(20);
        doc.setTextColor(primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text("Age Group Distribution Table", 148, 20, { align: "center" });

        // Subtitle with filters
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        let subtitle = "Resident Age Distribution by Gender";
        if (filters.purok) {
          subtitle += ` - ${filters.purok}`;
        }
        if (filters.dateFrom && filters.dateTo) {
          subtitle += ` (${filters.dateFrom} to ${filters.dateTo})`;
        }
        doc.text(subtitle, 148, 30, { align: "center" });

        // Table setup - proper spacing like the image
        const startX = 15;
        const startY = 40;
        const cellWidth = 16;
        const cellHeight = 7;
        const headerHeight = 10;
        const subHeaderHeight = 7;

        // Define age groups for first table (0-10 years)
        const firstTableAgeGroups = [
          "0-5 mos",
          "0-11 mos",
          "1 Y.O",
          "2 Y.O",
          "3 Y.O",
          "4 Y.O",
          "5 Y.O",
          "6 Y.O",
          "7 Y.O",
          "8 Y.O",
          "9 Y.O",
          "10 Y.O",
          "Total",
        ];

        // Define age groups for second table (11-22 years)
        const secondTableAgeGroups = [
          "11 Y.O",
          "12 Y.O",
          "13 Y.O",
          "14 Y.O",
          "15 Y.O",
          "16 Y.O",
          "17 Y.O",
          "18 Y.O",
          "19 Y.O",
          "20 Y.O",
          "21 Y.O",
          "22 Y.O",
          "Total",
        ];

        // Define age groups for third table (23-34 years)
        const thirdTableAgeGroups = [
          "23 Y.O",
          "24 Y.O",
          "25 Y.O",
          "26 Y.O",
          "27 Y.O",
          "28 Y.O",
          "29 Y.O",
          "30 Y.O",
          "31 Y.O",
          "32 Y.O",
          "33 Y.O",
          "34 Y.O",
          "Total",
        ];

        // Define age groups for fourth table (35-46 years)
        const fourthTableAgeGroups = [
          "35 Y.O",
          "36 Y.O",
          "37 Y.O",
          "38 Y.O",
          "39 Y.O",
          "40 Y.O",
          "41 Y.O",
          "42 Y.O",
          "43 Y.O",
          "44 Y.O",
          "45 Y.O",
          "46 Y.O",
          "Total",
        ];

        // Define age groups for fifth table (47-60+ years)
        const fifthTableAgeGroups = [
          "47 Y.O",
          "48 Y.O",
          "49 Y.O",
          "50 Y.O",
          "51 Y.O",
          "52 Y.O",
          "53 Y.O",
          "54 Y.O",
          "55 Y.O",
          "56 Y.O",
          "57 Y.O",
          "58 Y.O",
          "59 Y.O",
          "60+ Y.O",
          "Total",
        ];

        // Helper function to draw a table
        const drawTable = (ageGroups, tableStartY, tableTotal = null) => {
          // Draw main table header (dark blue)
          doc.setFillColor(primaryColor);
          doc.rect(
            startX,
            tableStartY,
            cellWidth * ageGroups.length,
            headerHeight,
            "F",
          );

          // Age group headers
          doc.setTextColor(255);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          ageGroups.forEach((ageGroup, index) => {
            const x = startX + index * cellWidth;
            doc.text(
              ageGroup,
              x + cellWidth / 2,
              tableStartY + headerHeight / 2 + 2,
              { align: "center" },
            );
          });

          // Gender sub-headers (lighter blue)
          doc.setFillColor(secondaryColor);
          doc.rect(
            startX,
            tableStartY + headerHeight,
            cellWidth * ageGroups.length,
            subHeaderHeight,
            "F",
          );

          doc.setTextColor(255);
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          ageGroups.forEach((ageGroup, index) => {
            const x = startX + index * cellWidth;
            const subCellWidth = cellWidth / 2;

            // Male header
            doc.text(
              "M",
              x + subCellWidth / 2,
              tableStartY + headerHeight + subHeaderHeight / 2 + 2,
              { align: "center" },
            );

            // Female header
            doc.text(
              "F",
              x + subCellWidth + subCellWidth / 2,
              tableStartY + headerHeight + subHeaderHeight / 2 + 2,
              { align: "center" },
            );
          });

          // Create a single clean data row
          const dataRowY = tableStartY + headerHeight + subHeaderHeight;

          // Draw data row background (white)
          doc.setFillColor(255, 255, 255);
          doc.rect(
            startX,
            dataRowY,
            cellWidth * ageGroups.length,
            cellHeight,
            "F",
          );

          // Draw data for each age group
          doc.setTextColor(0);
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");

          ageGroups.forEach((ageGroup, colIndex) => {
            const x = startX + colIndex * cellWidth;
            const subCellWidth = cellWidth / 2;

            let maleCount = 0;
            let femaleCount = 0;

            if (ageGroup === "Total" && tableTotal) {
              // Use individual table total
              maleCount = tableTotal.male;
              femaleCount = tableTotal.female;
            } else {
              // Find data for this age group
              const rowData = ageDistributionData.find(
                (row) => row.ageGroup === ageGroup,
              );
              maleCount = rowData ? rowData.male : 0;
              femaleCount = rowData ? rowData.female : 0;
            }

            // Male count
            doc.text(
              maleCount.toString(),
              x + subCellWidth / 2,
              dataRowY + cellHeight / 2 + 2,
              { align: "center" },
            );

            // Female count
            doc.text(
              femaleCount.toString(),
              x + subCellWidth + subCellWidth / 2,
              dataRowY + cellHeight / 2 + 2,
              { align: "center" },
            );
          });

          // Draw table borders (black lines)
          doc.setDrawColor(borderColor);
          doc.setLineWidth(0.5);

          // Vertical lines
          for (let i = 0; i <= ageGroups.length; i++) {
            const x = startX + i * cellWidth;
            doc.line(
              x,
              tableStartY,
              x,
              tableStartY + headerHeight + subHeaderHeight + cellHeight,
            );
          }

          // Horizontal lines
          doc.line(
            startX,
            tableStartY,
            startX + ageGroups.length * cellWidth,
            tableStartY,
          );
          doc.line(
            startX,
            tableStartY + headerHeight,
            startX + ageGroups.length * cellWidth,
            tableStartY + headerHeight,
          );
          doc.line(
            startX,
            tableStartY + headerHeight + subHeaderHeight,
            startX + ageGroups.length * cellWidth,
            tableStartY + headerHeight + subHeaderHeight,
          );
          doc.line(
            startX,
            tableStartY + headerHeight + subHeaderHeight + cellHeight,
            startX + ageGroups.length * cellWidth,
            tableStartY + headerHeight + subHeaderHeight + cellHeight,
          );

          // Add gender sub-header lines
          for (let i = 0; i < ageGroups.length; i++) {
            const x = startX + i * cellWidth;
            const subCellWidth = cellWidth / 2;
            doc.line(
              x + subCellWidth,
              tableStartY + headerHeight,
              x + subCellWidth,
              tableStartY + headerHeight + subHeaderHeight,
            );
          }

          return tableStartY + headerHeight + subHeaderHeight + cellHeight;
        };

        // Get table totals from the data
        const totalDataRow = ageDistributionData.find(
          (row) => row.ageGroup === "Total",
        );
        const tableTotals = totalDataRow?.tableTotals || {};

        // Draw first table (0-10 years)
        const firstTableEndY = drawTable(
          firstTableAgeGroups,
          startY,
          tableTotals.firstTable,
        );

        // Draw second table (11-22 years) below the first table
        const secondTableStartY = firstTableEndY + 5; // 5mm gap between tables
        const secondTableEndY = drawTable(
          secondTableAgeGroups,
          secondTableStartY,
          tableTotals.secondTable,
        );

        // Draw third table (23-34 years) below the second table
        const thirdTableStartY = secondTableEndY + 5; // 5mm gap between tables
        const thirdTableEndY = drawTable(
          thirdTableAgeGroups,
          thirdTableStartY,
          tableTotals.thirdTable,
        );

        // Draw fourth table (35-46 years) below the third table
        const fourthTableStartY = thirdTableEndY + 5; // 5mm gap between tables
        const fourthTableEndY = drawTable(
          fourthTableAgeGroups,
          fourthTableStartY,
          tableTotals.fourthTable,
        );

        // Draw fifth table (47-60+ years) below the fourth table
        const fifthTableStartY = fourthTableEndY + 5; // 5mm gap between tables
        const fifthTableEndY = drawTable(
          fifthTableAgeGroups,
          fifthTableStartY,
          tableTotals.fifthTable,
        );

        // Add summary section (clean and simple) - positioned after fifth table
        const summaryY = fifthTableEndY + 5;

        // Summary title
        doc.setFontSize(12);
        doc.setTextColor(primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text("SUMMARY", startX, summaryY);

        const totalRow = ageDistributionData.find(
          (row) => row.ageGroup === "Total",
        );
        if (totalRow) {
          doc.setFontSize(10);
          doc.setTextColor(0);
          doc.setFont("helvetica", "normal");

          // Overall totals with compact spacing
          doc.text(`Total Male: ${totalRow.male}`, startX, summaryY + 8);
          doc.text(`Total Female: ${totalRow.female}`, startX, summaryY + 16);
          doc.text(`Grand Total: ${totalRow.total}`, startX, summaryY + 24);

          // Individual table totals with compact spacing
          if (totalRow.tableTotals) {
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text("Table Breakdown:", startX, summaryY + 35);
            doc.text(
              `0-10 Y.O: ${totalRow.tableTotals.firstTable?.male || 0}M, ${
                totalRow.tableTotals.firstTable?.female || 0
              }F`,
              startX,
              summaryY + 44,
            );
            doc.text(
              `11-22 Y.O: ${totalRow.tableTotals.secondTable?.male || 0}M, ${
                totalRow.tableTotals.secondTable?.female || 0
              }F`,
              startX,
              summaryY + 53,
            );
            doc.text(
              `23-34 Y.O: ${totalRow.tableTotals.thirdTable?.male || 0}M, ${
                totalRow.tableTotals.thirdTable?.female || 0
              }F`,
              startX,
              summaryY + 62,
            );
            doc.text(
              `35-46 Y.O: ${totalRow.tableTotals.fourthTable?.male || 0}M, ${
                totalRow.tableTotals.fourthTable?.female || 0
              }F`,
              startX,
              summaryY + 71,
            );
            doc.text(
              `47-60+ Y.O: ${totalRow.tableTotals.fifthTable?.male || 0}M, ${
                totalRow.tableTotals.fifthTable?.female || 0
              }F`,
              startX,
              summaryY + 80,
            );
          }
        }

        // Add generation info at the bottom
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Generated on: ${new Date().toLocaleDateString()}`,
          startX,
          summaryY + 95,
        );

        // Save the PDF
        const fileName = `Age_Group_Distribution_${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        doc.save(fileName);
      })
      .catch((error) => {
        console.error("Error loading jsPDF:", error);
        addNotification(
          "error",
          "PDF Generation Failed",
          "Failed to load PDF library. Please try again.",
        );
      });
  };

  // Report generation functions
  const handleGenerateAgeGroupingReport = async (filters) => {
    try {
      const response = await reportsAPI.generateAgeGrouping(filters);
      if (response.success) {
        if (filters.preview) {
          // Use detailed age distribution data for preview to match PDF
          const previewData = response.detailedAgeDistribution.map((item) => ({
            age_group: item.ageGroup,
            male: item.male,
            female: item.female,
            total: item.total,
          }));

          return {
            data: previewData,
            total: previewData.length,
          };
        } else {
          // Generate detailed age distribution table PDF
          generateDetailedAgeDistributionPDF(
            response.detailedAgeDistribution,
            filters,
          );
          addNotification(
            "success",
            "Report Generated",
            "Age grouping report has been generated successfully",
          );
        }
      }
    } catch (error) {
      addNotification(
        "error",
        "Report Failed",
        error.message || "Failed to generate age grouping report",
      );
      throw error;
    }
  };

  const handleGeneratePWDMembersReport = async (filters) => {
    try {
      const response = await reportsAPI.generatePWDMembers(filters);
      if (response.success) {
        if (filters.preview) {
          return {
            data: response.data,
            total: response.total || response.data.length,
          };
        } else {
          // Generate actual report file
          generateReportFile(response.data, "PWD Members Report", [
            { key: "full_name", label: "Full Name", type: "text" },
            { key: "age", label: "Age", type: "number" },
            { key: "gender", label: "Gender", type: "text" },
            { key: "purok", label: "Purok", type: "text" },
            { key: "household_number", label: "Household #", type: "text" },
            { key: "contact_number", label: "Contact", type: "text" },
          ]);
          addNotification(
            "success",
            "Report Generated",
            "PWD members report has been generated successfully",
          );
        }
      }
    } catch (error) {
      addNotification(
        "error",
        "Report Failed",
        error.message || "Failed to generate 4Ps members report",
      );
      throw error;
    }
  };
  const handleGenerate4PsReport = async (filters) => {
    try {
      const response = await reportsAPI.generate4PsMembers(filters);
      if (response.success) {
        if (filters.preview) {
          return {
            data: response.data,
            total: response.total || response.data.length,
          };
        } else {
          // Generate actual report file
          generateReportFile(response.data, "4Ps Members Report", [
            { key: "full_name", label: "Full Name", type: "text" },
            { key: "age", label: "Age", type: "number" },
            { key: "gender", label: "Gender", type: "text" },
            { key: "purok", label: "Purok", type: "text" },
            { key: "household_number", label: "Household #", type: "text" },
            { key: "contact_number", label: "Contact", type: "text" },
          ]);
          addNotification(
            "success",
            "Report Generated",
            "4Ps members report has been generated successfully",
          );
        }
      }
    } catch (error) {
      addNotification(
        "error",
        "Report Failed",
        error.message || "Failed to generate 4Ps members report",
      );
      throw error;
    }
  };
  const handleGenerateTotalResidentsReport = async (filters) => {
    try {
      console.log("Frontend - Total Residents Report filters:", filters);
      const response = await reportsAPI.generateTotalResidents(filters);
      if (response.success) {
        if (filters.preview) {
          return {
            data: response.data,
            total: response.total || response.data.length,
          };
        } else {
          // Generate actual report file
          generateReportFile(response.data, "Total Residents Report", [
            { key: "full_name", label: "Full Name", type: "text" },
            { key: "age", label: "Age", type: "number" },
            { key: "gender", label: "Gender", type: "text" },
            { key: "purok", label: "Purok", type: "text" },
            { key: "civil_status", label: "Civil Status", type: "text" },
            { key: "contact_number", label: "Contact", type: "text" },
            { key: "registered_date", label: "Registered Date", type: "date" },
          ]);
          addNotification(
            "success",
            "Report Generated",
            "Total residents report has been generated successfully",
          );
        }
      }
    } catch (error) {
      addNotification(
        "error",
        "Report Failed",
        error.message || "Failed to generate total residents report",
      );
      throw error;
    }
  };
  const handleGenerateRegisteredVotersReport = async (filters) => {
    try {
      const response = await reportsAPI.generateRegisteredVoters(filters);
      if (response.success) {
        if (filters.preview) {
          return {
            data: response.data,
            total: response.total || response.data.length,
          };
        } else {
          // Generate actual report file
          generateReportFile(response.data, "Registered Voters Report", [
            { key: "full_name", label: "Full Name", type: "text" },
            { key: "age", label: "Age", type: "number" },
            { key: "gender", label: "Gender", type: "text" },
            { key: "purok", label: "Purok", type: "text" },
            { key: "civil_status", label: "Civil Status", type: "text" },
            { key: "contact_number", label: "Contact", type: "text" },
          ]);
          addNotification(
            "success",
            "Report Generated",
            "Registered voters report has been generated successfully",
          );
        }
      }
    } catch (error) {
      addNotification(
        "error",
        "Report Failed",
        error.message || "Failed to generate registered voters report",
      );
      throw error;
    }
  };
  const handleGenerateSeniorCitizensReport = async (filters) => {
    try {
      const response = await reportsAPI.generateSeniorCitizens(filters);
      if (response.success) {
        if (filters.preview) {
          return {
            data: response.data,
            total: response.total || response.data.length,
          };
        } else {
          // Generate actual report file
          generateReportFile(response.data, "Senior Citizens Report", [
            { key: "full_name", label: "Full Name", type: "text" },
            { key: "age", label: "Age", type: "number" },
            { key: "gender", label: "Gender", type: "text" },
            { key: "purok", label: "Purok", type: "text" },
            { key: "civil_status", label: "Civil Status", type: "text" },
            { key: "contact_number", label: "Contact", type: "text" },
            // { key: "is_pwd", label: "PWD", type: "text" },
          ]);
          addNotification(
            "success",
            "Report Generated",
            "Senior citizens report has been generated successfully",
          );
        }
      }
    } catch (error) {
      addNotification(
        "error",
        "Report Failed",
        error.message || "Failed to generate senior citizens report",
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
            }),
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
          "Failed to generate PDF. Please try again.",
        );
      });
  };

  const openReportGenerator = (reportType) => {
    setCurrentReportType(reportType);
    setShowReportGenerator(true);
  };

  // ADD RESTORE HANDLERS
  const handleRestore = async (residentIds) => {
    try {
      const response = await residentsAPI.restore(residentIds);
      if (response.success) {
        addNotification(
          "success",
          "Residents Restored",
          `${response.count} resident(s) have been restored successfully`,
        );
        await fetchResidents(); // Refresh the main list
        return true;
      }
    } catch (error) {
      addNotification(
        "error",
        "Restore Failed",
        error.message || "Failed to restore residents",
      );
      return false;
    }
  };

  const handleRestoreAll = async () => {
    try {
      const response = await residentsAPI.restoreAll();
      if (response.success) {
        addNotification(
          "success",
          "All Residents Restored",
          `${response.count} resident(s) have been restored successfully`,
        );
        await fetchResidents(); // Refresh the main list
        return true;
      }
    } catch (error) {
      addNotification(
        "error",
        "Restore Failed",
        error.message || "Failed to restore all residents",
      );
      return false;
    }
  };
  const confirmDelete = (resident) => {
    setResidentToDelete(resident);
  };

  // ✅ FIXED proceedDelete function
  const proceedDelete = async (newAddress) => {
    if (!residentToDelete) return;
    const id = residentToDelete.resident_id;

    try {
      // ✅ CLEAN: Uses the new softDelete method
      const result = await residentsAPI.softDelete(id, {
        new_address: newAddress,
      });
      const deleteSuccessful = result.success;

      if (deleteSuccessful) {
        await fetchResidents();
        addNotification(
          "success",
          "Resident Deactivated",
          `${residentToDelete.first_name} ${
            residentToDelete.last_name
          } has been deactivated successfully. ${
            newAddress
              ? `New address: ${newAddress}`
              : "No new address provided"
          }`,
        );
      }

      setResidentToDelete(null);
    } catch (error) {
      console.error("Error deactivating resident:", error);
      addNotification(
        "error",
        "Deactivation Failed",
        "Failed to deactivate resident. Please try again.",
      );
    }
  };

  // Add these helper functions:
  const closeEditModal = () => {
    setEditResident(null);
  };

  const closeAddModal = () => {
    setShowResidentForm(false);
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
      photo_file: null,
    });
  };

  return (
    <section className="min-h-screen p-6">
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
                <Users size={32} className="text-yellow-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                  <span className="text-cyan-200 text-sm font-medium tracking-widest">
                    RESIDENT RECORDS
                  </span>
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                </div>
                <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">
                  Resident Management
                </h2>
                <p className="text-cyan-100 text-lg">
                  Manage and maintain comprehensive resident records and
                  information
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

      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <h2 className="text-3xl font-bold text-[#0F4C81]">Resident Records</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <input
            type="text"
            placeholder="Search residents..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3] focus:border-[#58A1D3] w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={purokFilter}
            onChange={(e) => setPurokFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3] w-full sm:w-auto"
          >
            {purokOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowInactiveModal(true)}
            className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <Users size={18} />
            <span className="hidden sm:inline">Inactive Residents</span>
            <span className="sm:hidden">Inactive</span>
          </button>
          <button
            onClick={() => setShowReportGenerator(true)}
            className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <FileText size={18} />
            <span>Generate Report</span>
          </button>
          <button
            onClick={() => setShowResidentForm(true)}
            className="bg-[#0F4C81] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#58A1D3] transition-colors font-medium w-full sm:w-auto"
          >
            Add Resident
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="max-h-[85vh] overflow-y-auto overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white">
                {/* <th className="py-4 px-2 text-left font-semibold border-r border-white/20">
                ID
              </th> */}
                <th className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[100px]">
                  Last Name
                </th>
                <th className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[100px]">
                  First Name
                </th>
                <th className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[100px]">
                  Middle Name
                </th>
                <th className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[80px]">
                  Gender
                </th>
                <th className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[60px]">
                  Age
                </th>
                <th className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[80px]">
                  Purok
                </th>
                <th className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[100px]">
                  Civil Status
                </th>
                {/* <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                  Religion
                </th>
                <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                  Occupation
                </th>
                <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                  Education
                </th> */}
                <th className="py-3 px-2 text-center font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[60px]">
                  PWD
                </th>
                <th className="py-3 px-2 text-center font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[80px]">
                  4P's
                </th>
                <th className="py-3 px-2 text-center font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[60px]">
                  Voter
                </th>
                <th className="py-3 px-2 text-center font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[80px]">
                  Senior
                </th>
                <th className="py-3 px-2 text-center font-semibold min-w-[120px] sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents && filteredResidents.length > 0 ? (
                filteredResidents.map((r, index) => (
                  <tr
                    key={r.resident_id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50 hover:ring-1 hover:ring-blue-300/40 transition-colors duration-200 border-b border-gray-200`}
                  >
                    {/* <td className="py-4 px-2 border-r border-gray-200 font-medium text-[#0F4C81]">
                    {r.resident_id}
                  </td> */}
                    <td className="py-3 px-2 border-r border-gray-200 font-medium text-xs sm:text-sm whitespace-nowrap">
                      {r.last_name}
                    </td>
                    <td className="py-3 px-2 border-r border-gray-200 text-xs sm:text-sm whitespace-nowrap">
                      {r.first_name}
                    </td>
                    <td className="py-3 px-2 border-r border-gray-200 text-xs sm:text-sm whitespace-nowrap">
                      {r.middle_name || "-"}
                    </td>
                    <td className="py-3 px-2 border-r border-gray-200 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          r.gender === "Male"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-pink-100 text-pink-800"
                        }`}
                      >
                        {r.gender}
                      </span>
                    </td>
                    <td className="py-3 px-2 border-r border-gray-200 font-medium text-xs sm:text-sm whitespace-nowrap">
                      {calculateAge(r.date_of_birth)}
                    </td>
                    <td className="py-3 px-2 border-r border-gray-200 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        {r.purok}
                      </span>
                    </td>
                    <td className="py-3 px-2 border-r border-gray-200 text-xs sm:text-sm whitespace-nowrap">
                      {r.civil_status}
                    </td>
                    {/* <td className="py-4 px-2 border-r border-gray-200">
                      {r.religion || "-"}
                    </td>
                    <td className="py-4 px-2 border-r border-gray-200">
                      {r.occupation || "-"}
                    </td>
                    <td className="py-4 px-2 border-r border-gray-200">
                      {r.educational_attainment || "-"}
                    </td> */}
                    <td className="py-3 px-2 border-r border-gray-200 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${
                          r.is_pwd ? "bg-green-500" : "bg-gray-400"
                        }`}
                      >
                        {r.is_pwd ? "✓" : "✗"}
                      </span>
                    </td>
                    <td className="py-3 px-2 border-r border-gray-200 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${
                          r.is_4ps ? "bg-green-500" : "bg-gray-400"
                        }`}
                      >
                        {r.is_4ps ? "✓" : "✗"}
                      </span>
                    </td>
                    <td className="py-3 px-2 border-r border-gray-200 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${
                          r.is_registered_voter ? "bg-green-500" : "bg-gray-400"
                        }`}
                      >
                        {r.is_registered_voter ? "✓" : "✗"}
                      </span>
                    </td>
                    <td className="py-3 px-2 border-r border-gray-200 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${
                          calculateAge(r.date_of_birth) >= 60
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      >
                        {calculateAge(r.date_of_birth) >= 60 ? "✓" : "✗"}
                      </span>
                    </td>
                    <td className="py-3 px-2 min-w-[120px]">
                      <div className="flex justify-center space-x-2">
                        <button
                          className="p-2 text-[#0F4C81] hover:text-[#58A1D3] hover:bg-blue-100 rounded-lg transition-colors duration-200"
                          onClick={() => setSelectedResident(r)}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 text-[#0F4C81] hover:text-[#58A1D3] hover:bg-blue-100 rounded-lg transition-colors duration-200"
                          onClick={() => setEditResident({ ...r })}
                          title="Edit Resident"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          onClick={() => confirmDelete(r)}
                          title="Deactivate Resident"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="13"
                    className="py-12 text-center text-gray-500 bg-gray-50"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-4xl text-gray-300">📋</div>
                      <div className="text-lg font-medium">
                        {searchQuery || purokFilter
                          ? "No residents match your search criteria."
                          : "No residents found."}
                      </div>
                      <div className="text-sm text-gray-400">
                        {!searchQuery &&
                          !purokFilter &&
                          "Click 'Add Resident' to get started."}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredResidents && filteredResidents.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                Showing {filteredResidents.length} resident
                {filteredResidents.length !== 1 ? "s" : ""}
                {(searchQuery || purokFilter) && " (filtered)"}
              </span>
              <span className="text-xs">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="max-h-[85vh] overflow-y-auto">
          {filteredResidents && filteredResidents.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredResidents.map((r, index) => (
                <div
                  key={r.resident_id}
                  className="p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2 shadow-md">
                        <Users size={16} className="text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-[#0F4C81] text-base">
                          {r.first_name} {r.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {r.resident_id}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        r.gender === "Male"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-pink-100 text-pink-800 border border-pink-200"
                      }`}
                    >
                      {r.gender}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium text-gray-900">
                        {calculateAge(r.date_of_birth)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purok:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {r.purok}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Civil Status:</span>
                      <span className="font-medium text-gray-900">
                        {r.civil_status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setSelectedResident(r)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => setEditResident({ ...r })}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(r)}
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
                <Users size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-600 text-xl font-semibold mb-2">
                No residents found
              </p>
              <p className="text-gray-500 text-sm">
                {searchQuery || purokFilter
                  ? "Try adjusting your search criteria"
                  : "No residents registered yet"}
              </p>
            </div>
          )}
        </div>
      </div>

      <InactiveResidentsModal
        isOpen={showInactiveModal}
        onClose={() => setShowInactiveModal(false)}
        onRestore={handleRestore}
        onRestoreAll={handleRestoreAll}
        calculateAge={calculateAge}
      />

      {selectedResident && (
        <ViewResidentModal
          selectedResident={selectedResident}
          setSelectedResident={setSelectedResident}
          calculateAge={calculateAge}
        />
      )}

      {editResident && (
        <EditResidentModal
          editResident={editResident}
          setEditResident={setEditResident}
          handleResidentEdit={handleResidentEdit}
          purokOptions={purokOptions}
          households={households}
          residents={residents}
        />
      )}

      {showResidentForm && (
        <AddResidentModal
          residentForm={residentForm}
          setResidentForm={setResidentForm}
          handleResidentSubmit={handleResidentSubmit}
          setShowResidentForm={setShowResidentForm}
          purokOptions={purokOptions}
          households={households}
          filteredResidents={filteredResidents}
          duplicateError={duplicateError}
          setDuplicateError={setDuplicateError}
        />
      )}

      {residentToDelete && (
        <ConfirmationModal
          resident={residentToDelete}
          onConfirm={proceedDelete}
          onCancel={() => setResidentToDelete(null)}
        />
      )}

      {showReportGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Generate Reports
                  </h2>
                  <p className="text-sm text-gray-500">
                    Select a report type to generate
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReportGenerator(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setCurrentReportType("total-residents");
                    setShowReportGenerator(false);
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Total Residents Report
                      </h3>
                      <p className="text-sm text-gray-500">
                        Complete list of all residents
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCurrentReportType("age-grouping");
                    setShowReportGenerator(false);
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Age Grouping Report
                      </h3>
                      <p className="text-sm text-gray-500">
                        Categorize residents by age groups
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCurrentReportType("registered-voters");
                    setShowReportGenerator(false);
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-orange-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Registered Voters Report
                      </h3>
                      <p className="text-sm text-gray-500">
                        List of all registered voters
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCurrentReportType("senior-citizens");
                    setShowReportGenerator(false);
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-red-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Senior Citizens Report
                      </h3>
                      <p className="text-sm text-gray-500">
                        List of all senior citizens (60+)
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCurrentReportType("pwd-members");
                    setShowReportGenerator(false);
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-indigo-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        PWD Members Report
                      </h3>
                      <p className="text-sm text-gray-500">
                        List of persons with disabilities
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCurrentReportType("4ps-members");
                    setShowReportGenerator(false);
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Download className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        4P's Members Report
                      </h3>
                      <p className="text-sm text-gray-500">
                        List all 4P's program participants
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentReportType === "total-residents" && (
        <ReportGenerator
          reportType="total-residents"
          title="Total Residents Report"
          icon={Users}
          onGenerate={handleGenerateTotalResidentsReport}
          onClose={() => setCurrentReportType(null)}
          dateRange={true}
          filters={[
            {
              key: "purok",
              label: "Purok",
              type: "select",
              options: reportPurokOptions,
            },
          ]}
          columns={[
            { key: "full_name", label: "Full Name", type: "text" },
            { key: "age", label: "Age", type: "number" },
            { key: "gender", label: "Gender", type: "text" },
            { key: "purok", label: "Purok", type: "text" },
            { key: "civil_status", label: "Civil Status", type: "text" },
            { key: "contact_number", label: "Contact", type: "text" },
            { key: "registered_date", label: "Registered Date", type: "date" },
          ]}
        />
      )}

      {currentReportType === "age-grouping" && (
        <ReportGenerator
          reportType="age-grouping"
          title="Age Grouping Report"
          icon={Users}
          onGenerate={handleGenerateAgeGroupingReport}
          onClose={() => setCurrentReportType(null)}
          dateRange={true}
          filters={[
            {
              key: "purok",
              label: "Purok",
              type: "select",
              options: reportPurokOptions,
            },
          ]}
          columns={[
            { key: "age_group", label: "Age Group", type: "text" },
            { key: "male", label: "Male", type: "number" },
            { key: "female", label: "Female", type: "number" },
            { key: "total", label: "Total", type: "number" },
          ]}
        />
      )}

      {currentReportType === "registered-voters" && (
        <ReportGenerator
          reportType="registered-voters"
          title="Registered Voters Report"
          icon={Users}
          onGenerate={handleGenerateRegisteredVotersReport}
          onClose={() => setCurrentReportType(null)}
          dateRange={true}
          filters={[
            {
              key: "purok",
              label: "Purok",
              type: "select",
              options: reportPurokOptions,
            },
          ]}
          columns={[
            { key: "full_name", label: "Full Name", type: "text" },
            { key: "age", label: "Age", type: "number" },
            { key: "gender", label: "Gender", type: "text" },
            { key: "purok", label: "Purok", type: "text" },
            { key: "civil_status", label: "Civil Status", type: "text" },
            { key: "contact_number", label: "Contact", type: "text" },
          ]}
        />
      )}

      {currentReportType === "senior-citizens" && (
        <ReportGenerator
          reportType="senior-citizens"
          title="Senior Citizens Report"
          icon={Users}
          onGenerate={handleGenerateSeniorCitizensReport}
          onClose={() => setCurrentReportType(null)}
          dateRange={true}
          filters={[
            {
              key: "purok",
              label: "Purok",
              type: "select",
              options: reportPurokOptions,
            },
          ]}
          columns={[
            { key: "full_name", label: "Full Name", type: "text" },
            { key: "age", label: "Age", type: "number" },
            { key: "gender", label: "Gender", type: "text" },
            { key: "purok", label: "Purok", type: "text" },
            { key: "civil_status", label: "Civil Status", type: "text" },
            { key: "contact_number", label: "Contact", type: "text" },
            // { key: "is_pwd", label: "PWD", type: "text" },
          ]}
        />
      )}

      {currentReportType === "pwd-members" && (
        <ReportGenerator
          reportType="pwd-members"
          title="PWD Members Report"
          icon={Download}
          onGenerate={handleGeneratePWDMembersReport}
          onClose={() => setCurrentReportType(null)}
          dateRange={true}
          filters={[
            {
              key: "purok",
              label: "Purok",
              type: "select",
              options: reportPurokOptions,
            },
          ]}
          columns={[
            { key: "full_name", label: "Full Name", type: "text" },
            { key: "age", label: "Age", type: "number" },
            { key: "gender", label: "Gender", type: "text" },
            { key: "purok", label: "Purok", type: "text" },
            { key: "household_number", label: "Household #", type: "text" },
            { key: "contact_number", label: "Contact", type: "text" },
          ]}
        />
      )}

      {currentReportType === "4ps-members" && (
        <ReportGenerator
          reportType="4ps-members"
          title="4Ps Members Report"
          icon={Download}
          onGenerate={handleGenerate4PsReport}
          onClose={() => setCurrentReportType(null)}
          dateRange={true}
          filters={[
            {
              key: "purok",
              label: "Purok",
              type: "select",
              options: reportPurokOptions,
            },
          ]}
          columns={[
            { key: "full_name", label: "Full Name", type: "text" },
            { key: "age", label: "Age", type: "number" },
            { key: "gender", label: "Gender", type: "text" },
            { key: "purok", label: "Purok", type: "text" },
            { key: "household_number", label: "Household #", type: "text" },
            { key: "contact_number", label: "Contact", type: "text" },
          ]}
        />
      )}

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />
    </section>
  );
};

export default ManageResidentsPage;
export { formatDateForInput };

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
  const id = "manage-residents-float-styles";
  if (!document.getElementById(id)) {
    const styleEl = document.createElement("style");
    styleEl.id = id;
    styleEl.appendChild(document.createTextNode(styles));
    document.head.appendChild(styleEl);
  }
}
