// src/pages/MedicalReferralPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Eye, Edit2, Trash2, X, FileText, Download } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import {
  referralsAPI,
  residentsAPI,
  usersAPI,
  logUserActivity,
} from "../services/api";
import NotificationSystem from "../components/NotificationSystem";
import ReportGenerator from "../components/ReportGenerator";
import { formatDateForInput } from "./ManageResidentPage";

const ConfirmationModal = ({ record, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl shadow-red-500/20 border border-white/20">
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 rounded-t-3xl">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-200 rounded-full animate-pulse"></div>
          <h2 className="text-xl font-bold text-white">Confirm Deletion</h2>
        </div>
      </div>
      <div className="p-8">
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete referral{" "}
          <span className="font-semibold text-gray-900">
            {record.referral_id}
          </span>
          ?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ViewReferralModal = ({
  selectedReferral,
  setSelectedReferral,
  residents,
}) => {
  if (!selectedReferral) return null;

  const resident = residents.find(
    (r) => r.resident_id === selectedReferral.resident_id
  );
  const residentName = resident
    ? `${resident.first_name} ${resident.middle_name || ""} ${
        resident.last_name
      }`.trim()
    : "N/A";

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ongoing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-800">
                Referral Details
              </h2>
            </div>
            <button
              onClick={() => setSelectedReferral(null)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Referral ID:{" "}
              <span className="font-medium text-gray-700">
                {selectedReferral.referral_id}
              </span>
            </p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                selectedReferral.status
              )}`}
            >
              {selectedReferral.status}
            </span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resident Information */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-700 mb-3">
                  Resident Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Resident Name</p>
                    <p className="font-medium text-gray-900">{residentName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Resident ID</p>
                    <p className="font-medium text-gray-900">
                      {selectedReferral.resident_id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Referral Details */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-purple-700 mb-3">
                  Referral Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">BHW ID</p>
                    <p className="font-medium text-gray-900">
                      {selectedReferral.bhw_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Referred To</p>
                    <p className="font-medium text-gray-900">
                      {selectedReferral.referred_to}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Referral Date</p>
                    <p className="font-medium text-gray-900">
                      {selectedReferral.referral_date}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              {/* Referral Reason */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-700 mb-3">
                  Referral Reason
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {selectedReferral.referral_reason}
                </p>
              </div>

              {/* Notes */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Additional Notes
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {selectedReferral.notes || "No additional notes provided"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditReferralModal = ({
  editReferral,
  setEditReferral,
  handleReferralEdit,
  residents,
  bhws,
}) => {
  if (!editReferral) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-800">
                Edit Referral
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setEditReferral(null)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Referral ID:{" "}
              <span className="font-medium text-gray-700">
                {editReferral.referral_id}
              </span>
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleReferralEdit(editReferral.referral_id, editReferral);
            }}
            className="space-y-6"
          >
            {/* Referral Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-700 mb-3">
                Referral Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resident *
                  </label>
                  <select
                    value={editReferral.resident_id}
                    onChange={(e) =>
                      setEditReferral({
                        ...editReferral,
                        resident_id: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Select Resident</option>
                    {residents.map((r) => (
                      <option key={r.resident_id} value={r.resident_id}>
                        {r.first_name} {r.middle_name || ""} {r.last_name} (ID:{" "}
                        {r.resident_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BHW *
                  </label>
                  <select
                    value={editReferral.bhw_id}
                    onChange={(e) =>
                      setEditReferral({
                        ...editReferral,
                        bhw_id: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Select BHW</option>
                    {bhws.map((bhw) => (
                      <option key={bhw.user_id} value={bhw.user_id}>
                        {bhw.full_name} (ID: {bhw.user_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referred To *
                  </label>
                  <input
                    type="text"
                    value={editReferral.referred_to}
                    onChange={(e) =>
                      setEditReferral({
                        ...editReferral,
                        referred_to: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referral Date *
                  </label>
                  <input
                    type="date"
                    value={editReferral.referral_date}
                    onChange={(e) =>
                      setEditReferral({
                        ...editReferral,
                        referral_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editReferral.status}
                    onChange={(e) =>
                      setEditReferral({
                        ...editReferral,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option>Pending</option>
                    <option>Ongoing</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Referral Details */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-700 mb-3">
                Referral Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason *
                  </label>
                  <textarea
                    value={editReferral.referral_reason}
                    onChange={(e) =>
                      setEditReferral({
                        ...editReferral,
                        referral_reason: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    required
                    placeholder="Enter the reason for referral..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={editReferral.notes}
                    onChange={(e) =>
                      setEditReferral({
                        ...editReferral,
                        notes: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    placeholder="Enter any additional notes..."
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setEditReferral(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const CreateReferralModal = ({
  setShowCreateModal,
  handleReferralCreate,
  bhwUser,
  residents,
  bhws,
}) => {
  const [newReferral, setNewReferral] = useState({
    resident_id: "",
    bhw_id: bhwUser?.user_id ? String(bhwUser.user_id) : "",
    referred_to: "",
    referral_reason: "",
    referral_date: new Date().toISOString().split("T")[0],
    status: "Pending",
    notes: "",
  });
  const [error, setError] = useState(null);

  const validateForm = () => {
    if (!newReferral.resident_id) return "Please select a resident.";
    if (!newReferral.bhw_id) return "Please select a BHW.";
    if (!newReferral.referred_to.trim()) return "Referred To is required.";
    if (!newReferral.referral_reason.trim())
      return "Referral Reason is required.";
    if (!newReferral.referral_date) return "Referral Date is required.";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    handleReferralCreate(newReferral, setError);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-800">
                Create New Referral
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Fill in the referral information for a resident
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <p className="font-medium">Validation Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {residents.length === 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg">
              <p className="font-medium">No Active Residents</p>
              <p className="text-sm">
                Please add residents to create referrals.
              </p>
            </div>
          )}

          {bhws.length === 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg">
              <p className="font-medium">No Active BHWs</p>
              <p className="text-sm">Please add BHWs to create referrals.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Referral Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-700 mb-3">
                Referral Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resident *
                  </label>
                  <select
                    value={newReferral.resident_id}
                    onChange={(e) =>
                      setNewReferral({
                        ...newReferral,
                        resident_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    disabled={residents.length === 0}
                  >
                    <option value="">Select Resident</option>
                    {residents.map((r) => (
                      <option key={r.resident_id} value={r.resident_id}>
                        {r.first_name} {r.middle_name || ""} {r.last_name} (ID:{" "}
                        {r.resident_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BHW *
                  </label>
                  <select
                    value={newReferral.bhw_id}
                    onChange={(e) =>
                      setNewReferral({ ...newReferral, bhw_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    disabled={bhws.length === 0}
                  >
                    <option value="">Select BHW</option>
                    {bhws.map((bhw) => (
                      <option key={bhw.user_id} value={bhw.user_id}>
                        {bhw.full_name} (ID: {bhw.user_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referred To *
                  </label>
                  <input
                    type="text"
                    value={newReferral.referred_to}
                    onChange={(e) =>
                      setNewReferral({
                        ...newReferral,
                        referred_to: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    placeholder="e.g., Municipal Hospital"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referral Date *
                  </label>
                  <input
                    type="date"
                    value={newReferral.referral_date}
                    onChange={(e) =>
                      setNewReferral({
                        ...newReferral,
                        referral_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newReferral.status}
                    onChange={(e) =>
                      setNewReferral({ ...newReferral, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option>Pending</option>
                    <option>Ongoing</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Referral Details */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-700 mb-3">
                Referral Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason *
                  </label>
                  <textarea
                    value={newReferral.referral_reason}
                    onChange={(e) =>
                      setNewReferral({
                        ...newReferral,
                        referral_reason: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    required
                    placeholder="Enter the reason for referral..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={newReferral.notes}
                    onChange={(e) =>
                      setNewReferral({ ...newReferral, notes: e.target.value })
                    }
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    placeholder="Enter any additional notes..."
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  !!validateForm() ||
                  residents.length === 0 ||
                  bhws.length === 0
                }
                className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${
                  !!validateForm() ||
                  residents.length === 0 ||
                  bhws.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Create Referral
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const MedicalReferralPage = () => {
  const { referralSearch, setReferralSearch, bhwUser } = useOutletContext();
  const [referrals, setReferrals] = useState([]);
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [currentReportType, setCurrentReportType] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

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
  const [editReferral, setEditReferral] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [residents, setResidents] = useState([]);
  const [bhws, setBhws] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [referralsRes, residentsRes, bhwsRes] = await Promise.all([
          referralsAPI.getAll(),
          residentsAPI.getAll(),
          usersAPI.getBHWs(),
        ]);
        if (referralsRes.success) {
          setReferrals(referralsRes.data);
          setFilteredReferrals(referralsRes.data);
        }
        if (residentsRes.success) {
          setResidents(residentsRes.data.filter((r) => r.is_active === 1));
        }
        if (bhwsRes.success) {
          setBhws(
            bhwsRes.data.filter(
              (u) =>
                u.is_active === 1 &&
                (u.position?.toLowerCase().includes("health") ||
                  u.role_name?.toLowerCase().includes("health") ||
                  u.position?.toLowerCase() === "bhw" ||
                  u.position?.toLowerCase() === "barangay health worker")
            )
          );
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        addNotification(
          "error",
          "Load Failed",
          "Failed to fetch referrals, residents, or BHWs. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredReferrals(
      referrals.filter((ref) => {
        const searchLower = referralSearch.toLowerCase();
        const resident = residents.find(
          (r) => r.resident_id === ref.resident_id
        );
        const residentName = resident
          ? `${resident.first_name} ${resident.middle_name || ""} ${
              resident.last_name
            }`
              .trim()
              .toLowerCase()
          : "";
        return (
          ref.referral_id.toString().includes(searchLower) ||
          ref.resident_id.toString().includes(searchLower) ||
          residentName.includes(searchLower) ||
          ref.referral_reason.toLowerCase().includes(searchLower)
        );
      })
    );
  }, [referralSearch, referrals, residents]);

  const handleReferralCreate = async (newData, setError) => {
    try {
      console.log("Sending payload:", newData);
      const payload = {
        ...newData,
        resident_id: Number(newData.resident_id),
        bhw_id: Number(newData.bhw_id),
        referred_to: newData.referred_to.trim(),
        referral_reason: newData.referral_reason.trim(),
        notes: newData.notes ? newData.notes.trim() : null,
      };
      const res = await referralsAPI.create(payload);
      if (res.success) {
        setReferrals((prev) => [
          ...prev,
          { ...payload, referral_id: res.data.referral_id },
        ]);
        setShowCreateModal(false);
        addNotification(
          "success",
          "Referral Created",
          `Referral created successfully. Referral ID: ${res.data.referral_id}`
        );
      }
    } catch (error) {
      console.error(
        "Failed to create referral:",
        error.response?.data || error
      );
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create referral. Please check your input and try again.";
      setError(errorMessage);
      addNotification("error", "Create Failed", errorMessage);
    }
  };

  const handleReferralEdit = async (id, updatedData) => {
    try {
      const payload = {
        ...updatedData,
        resident_id: Number(updatedData.resident_id),
        bhw_id: Number(updatedData.bhw_id),
        referred_to: updatedData.referred_to.trim(),
        referral_reason: updatedData.referral_reason.trim(),
        notes: updatedData.notes ? updatedData.notes.trim() : null,
      };
      const res = await referralsAPI.update(id, payload);
      if (res.success) {
        setReferrals((prev) =>
          prev.map((ref) =>
            ref.referral_id === id ? { ...ref, ...payload } : ref
          )
        );
        setEditReferral(null);
        addNotification(
          "success",
          "Referral Updated",
          `Referral ${id} updated successfully`
        );
      }
    } catch (error) {
      console.error(
        "Failed to update referral:",
        error.response?.data || error
      );
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update referral. Please try again.";
      addNotification("error", "Update Failed", errorMessage);
    }
  };

  const handleReferralDelete = async (id) => {
    try {
      const res = await referralsAPI.delete(id);
      if (res.success) {
        setReferrals((prev) => prev.filter((ref) => ref.referral_id !== id));
        setRecordToDelete(null);
        addNotification(
          "success",
          "Referral Deleted",
          `Referral ${id} deleted successfully`
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete referral:",
        error.response?.data || error
      );
      const errorMessage =
        error.response?.data?.message ||
        "Failed to delete referral. Please try again.";
      addNotification("error", "Delete Failed", errorMessage);
    }
  };

  const proceedDelete = () => {
    if (recordToDelete) {
      handleReferralDelete(recordToDelete.referral_id);
    }
  };

  const getResidentName = (residentId) => {
    const resident = residents.find((r) => r.resident_id === residentId);
    return resident
      ? `${resident.first_name} ${resident.middle_name || ""} ${
          resident.last_name
        }`.trim()
      : "N/A";
  };

  // Report generation functions
  const handleGenerateReferralsReport = async (filters = {}) => {
    try {
      console.log("=== REPORT GENERATION START ===");
      console.log("Filters received:", filters);
      console.log("Total referrals in state:", referrals.length);
      console.log("Referrals data:", referrals);

      // Filter referrals based on provided filters
      let filteredData = [...referrals];
      console.log("Initial filtered data count:", filteredData.length);

      if (filters.status && filters.status !== "all") {
        filteredData = filteredData.filter(
          (ref) => ref.status === filters.status
        );
        console.log("After status filter:", filteredData.length);
      }

      if (filters.dateFrom) {
        filteredData = filteredData.filter(
          (ref) => new Date(ref.referral_date) >= new Date(filters.dateFrom)
        );
        console.log("After dateFrom filter:", filteredData.length);
      }

      if (filters.dateTo) {
        filteredData = filteredData.filter(
          (ref) => new Date(ref.referral_date) <= new Date(filters.dateTo)
        );
        console.log("After dateTo filter:", filteredData.length);
      }

      // If preview mode, return the filtered data
      if (filters.preview) {
        console.log("Preview mode - mapping data...");
        const previewData = filteredData.map((ref) => {
          const mappedData = {
            referral_id: ref.referral_id,
            resident_id: ref.resident_id,
            resident_name: getResidentName(ref.resident_id),
            referred_to: ref.referred_to,
            referral_reason: ref.referral_reason,
            referral_date: ref.referral_date,
            status: ref.status,
            notes: ref.notes || "N/A",
          };
          console.log("Mapped record:", mappedData);
          return mappedData;
        });
        console.log("Preview data being returned:", previewData);
        console.log("Number of records:", previewData.length);
        console.log("=== REPORT GENERATION END ===");
        return previewData;
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
      doc.text("Medical Referrals Report", pageWidth / 2, 36, {
        align: "center",
      });

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

      // Add status filter if applied
      if (filters.status && filters.status !== "all") {
        doc.text(
          `Status: ${filters.status}`,
          14,
          filters.dateFrom || filters.dateTo ? 56 : 50
        );
      }

      // Prepare table data
      const tableData = filteredData.map((ref) => [
        ref.referral_id,
        ref.resident_id,
        getResidentName(ref.resident_id),
        ref.referred_to,
        ref.referral_reason,
        formatDateForInput(ref.referral_date),
        ref.status,
        ref.notes || "N/A",
      ]);

      // Add table
      autoTable(doc, {
        head: [
          [
            "Referral ID",
            "Resident ID",
            "Resident Name",
            "Referred To",
            "Reason",
            "Date",
            "Status",
            "Notes",
          ],
        ],
        body: tableData,
        startY:
          filters.dateFrom ||
          filters.dateTo ||
          (filters.status && filters.status !== "all")
            ? 62
            : 48,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [15, 76, 129] },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        margin: { top: 35 },
      });

      // Save the PDF
      doc.save(
        `Medical_Referrals_Report_${new Date().toISOString().split("T")[0]}.pdf`
      );

      addNotification(
        "success",
        "Report Generated",
        "Medical referrals report has been generated successfully."
      );
    } catch (error) {
      console.error("Error generating referrals report:", error);
      addNotification(
        "error",
        "Report Error",
        "Failed to generate report. Please try again."
      );
      throw error;
    }
  };

  const openReportGenerator = (reportType) => {
    setCurrentReportType(reportType);
    setShowReportGenerator(true);
  };

  if (loading)
    return <div className="text-center py-8">Loading referrals...</div>;

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
                <FileText size={32} className="text-yellow-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                  <span className="text-cyan-200 text-sm font-medium tracking-widest">
                    MEDICAL REFERRALS
                  </span>
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                </div>
                <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">
                  Referral Management
                </h2>
                <p className="text-cyan-100 text-lg">
                  Manage and track medical referrals for community residents
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold text-[#0F4C81]">Medical Referrals</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search referrals..."
            value={referralSearch}
            onChange={(e) => setReferralSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3]"
          />
          <button
            onClick={() => openReportGenerator("medical-referrals")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 w-full sm:w-auto"
          >
            <FileText size={18} />
            <span>Generate Report</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={residents.length === 0 || bhws.length === 0}
            className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-lg ${
              residents.length === 0 || bhws.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#58A1D3] hover:bg-[#0F4C81]"
            }`}
          >
            Create Referral
          </button>
        </div>
      </div>
      {residents.length === 0 && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-700 rounded">
          No active residents available. Please add residents to create
          referrals.
        </div>
      )}
      {bhws.length === 0 && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-700 rounded">
          No active BHWs available. Please add BHWs to create referrals.
        </div>
      )}
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="max-h-[85vh] overflow-y-auto overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse table-auto md:table-fixed">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white">
                <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm">
                  Referral ID
                </th>
                <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                  Resident ID
                </th>
                <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                  Resident Name
                </th>
                <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                  BHW ID
                </th>
                <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                  Referred To
                </th>
                <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                  Reason
                </th>
                <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                  Date
                </th>
                <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                  Status
                </th>
                <th className="py-4 px-2 text-center font-semibold sticky top-0 z-10 bg-[#0F4C81]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.length > 0 ? (
                filteredReferrals.map((ref) => (
                  <tr key={ref.referral_id} className="border-t">
                    <td className="py-2 px-3">{ref.referral_id}</td>
                    <td className="py-2 px-3">{ref.resident_id}</td>
                    <td className="py-2 px-3">
                      {getResidentName(ref.resident_id)}
                    </td>
                    <td className="py-2 px-3">{ref.bhw_id}</td>
                    <td className="py-2 px-3">{ref.referred_to}</td>
                    <td className="py-2 px-3">{ref.referral_reason}</td>
                    <td className="py-2 px-3">
                      {formatDateForInput(ref.referral_date)}
                    </td>
                    <td className="py-2 px-3">{ref.status}</td>
                    <td className="py-2 px-3">
                      <div className="flex justify-center space-x-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => setSelectedReferral(ref)}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          onClick={() => setEditReferral({ ...ref })}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => setRecordToDelete(ref)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-4 text-center text-gray-500">
                    {referralSearch
                      ? "No referrals match your search criteria."
                      : "No referrals found. Please create a new referral."}
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
          {filteredReferrals.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredReferrals.map((ref) => (
                <div
                  key={ref.referral_id}
                  className="p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2 shadow-md">
                        <FileText size={16} className="text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-[#0F4C81] text-base">
                          {getResidentName(ref.resident_id)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Referral ID: {ref.referral_id}
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {ref.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Referred To:</span>
                      <span className="font-medium text-gray-900 truncate max-w-[180px]">
                        {ref.referred_to}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium text-gray-900 truncate max-w-[180px]">
                        {ref.referral_reason}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium text-gray-900">
                        {formatDateForInput(ref.referral_date)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">BHW ID:</span>
                      <span className="font-medium text-gray-900">
                        {ref.bhw_id}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setSelectedReferral(ref)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => setEditReferral({ ...ref })}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => setRecordToDelete(ref)}
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
                <FileText size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-600 text-xl font-semibold mb-2">
                No referrals found
              </p>
              <p className="text-gray-500 text-sm">
                {referralSearch
                  ? "Try adjusting your search criteria"
                  : "No referrals available"}
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedReferral && (
        <ViewReferralModal
          selectedReferral={selectedReferral}
          setSelectedReferral={setSelectedReferral}
          residents={residents}
        />
      )}
      {editReferral && (
        <EditReferralModal
          editReferral={editReferral}
          setEditReferral={setEditReferral}
          handleReferralEdit={handleReferralEdit}
          residents={residents}
          bhws={bhws}
        />
      )}
      {recordToDelete && (
        <ConfirmationModal
          record={recordToDelete}
          onConfirm={proceedDelete}
          onCancel={() => setRecordToDelete(null)}
        />
      )}
      {showCreateModal && (
        <CreateReferralModal
          setShowCreateModal={setShowCreateModal}
          handleReferralCreate={handleReferralCreate}
          bhwUser={bhwUser}
          residents={residents}
          bhws={bhws}
        />
      )}

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />

      {showReportGenerator && currentReportType === "medical-referrals" && (
        <ReportGenerator
          reportType="medical-referrals"
          title="Medical Referrals Report"
          icon={FileText}
          onGenerate={handleGenerateReferralsReport}
          onClose={() => setShowReportGenerator(false)}
          filters={[
            {
              key: "status",
              label: "Status",
              type: "select",
              options: [
                { value: "all", label: "All Status" },
                { value: "pending", label: "Pending" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
              ],
            },
          ]}
          columns={[
            { key: "referral_id", label: "Referral ID", type: "text" },
            { key: "resident_id", label: "Resident ID", type: "text" },
            { key: "resident_name", label: "Resident Name", type: "text" },
            { key: "referred_to", label: "Referred To", type: "text" },
            { key: "referral_reason", label: "Reason", type: "text" },
            { key: "referral_date", label: "Date", type: "date" },
            { key: "status", label: "Status", type: "text" },
            { key: "notes", label: "Notes", type: "text" },
          ]}
        />
      )}
    </section>
  );
};

export default MedicalReferralPage;

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
  const id = "medical-referral-float-styles";
  if (!document.getElementById(id)) {
    const styleEl = document.createElement("style");
    styleEl.id = id;
    styleEl.appendChild(document.createTextNode(styles));
    document.head.appendChild(styleEl);
  }
}
