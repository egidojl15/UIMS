// src/pages/HealthRecordsPage.jsx - FIXED VERSION
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Eye,
  Edit2,
  Trash2,
  X,
  Users,
  HeartPulse,
  FileText,
  Download,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import {
  healthAPI,
  reportsAPI,
  householdsAPI,
  logUserActivity,
} from "../services/api";
import NotificationSystem from "../components/NotificationSystem";
import ReportGenerator from "../components/ReportGenerator";

const ViewHealthRecordModal = ({
  selectedHealthRecord,
  setSelectedHealthRecord,
  residents,
}) => {
  if (!selectedHealthRecord) return null;

  const resident = residents.find(
    (r) => r.resident_id === selectedHealthRecord.resident_id
  );
  const residentName = resident
    ? `${resident.first_name} ${resident.middle_name || ""} ${
        resident.last_name
      }`.trim()
    : "N/A";
  const createdAt = new Date(
    selectedHealthRecord.created_at
  ).toLocaleDateString("en-US");
  const updatedAt = new Date(
    selectedHealthRecord.updated_at
  ).toLocaleDateString("en-US");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-4xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">
                Health Record Details
              </h2>
            </div>
            <button
              onClick={() => setSelectedHealthRecord(null)}
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
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Record ID</p>
                <p className="font-semibold">
                  {selectedHealthRecord.health_record_id}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Resident ID</p>
                <p className="font-semibold">
                  {selectedHealthRecord.resident_id}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-500">Resident Name</p>
                <p className="font-semibold">{residentName}</p>
              </div>
              <div>
                <p className="text-gray-500">PhilHealth Member</p>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold mr-2 ${
                      selectedHealthRecord.is_philhealth
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  >
                    {selectedHealthRecord.is_philhealth ? "✓" : "✗"}
                  </span>
                  <span className="font-semibold">
                    {selectedHealthRecord.is_philhealth ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-500">Blood Type</p>
                <p className="font-semibold">
                  {selectedHealthRecord.blood_type || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Height</p>
                <p className="font-semibold">
                  {selectedHealthRecord.height
                    ? `${selectedHealthRecord.height} cm`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Weight</p>
                <p className="font-semibold">
                  {selectedHealthRecord.weight
                    ? `${selectedHealthRecord.weight} kg`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Heart Rate</p>
                <p className="font-semibold">
                  {selectedHealthRecord.heart_rate
                    ? `${selectedHealthRecord.heart_rate} bpm`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Pulse Rate</p>
                <p className="font-semibold">
                  {selectedHealthRecord.pulse_rate
                    ? `${selectedHealthRecord.pulse_rate} bpm`
                    : "N/A"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-500">Medical Conditions</p>
                <p className="font-semibold">
                  {selectedHealthRecord.medical_conditions || "None"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-500">Allergies</p>
                <p className="font-semibold">
                  {selectedHealthRecord.allergies || "None"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Emergency Contact Name</p>
                <p className="font-semibold">
                  {selectedHealthRecord.emergency_contact_name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Emergency Contact Number</p>
                <p className="font-semibold">
                  {selectedHealthRecord.emergency_contact_number || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Created At</p>
                <p className="font-semibold">{createdAt}</p>
              </div>
              <div>
                <p className="text-gray-500">Updated At</p>
                <p className="font-semibold">{updatedAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditHealthRecordModal = ({
  editHealthRecord,
  setEditHealthRecord,
  handleHealthRecordEdit,
  residents,
}) => {
  const [emergencyContactType, setEmergencyContactType] = useState("manual"); // 'manual' or 'household'
  const [householdMembers, setHouseholdMembers] = useState([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState("");

  // Fetch household members when resident is selected
  useEffect(() => {
    if (editHealthRecord && editHealthRecord.resident_id) {
      const selectedResident = residents.find(
        (r) => r.resident_id == editHealthRecord.resident_id
      );
      if (selectedResident && selectedResident.household_id) {
        setSelectedHouseholdId(selectedResident.household_id);
        fetchHouseholdMembers(selectedResident.household_id);
      } else {
        setHouseholdMembers([]);
        setSelectedHouseholdId("");
      }
    }
  }, [editHealthRecord?.resident_id]);

  const fetchHouseholdMembers = async (householdId) => {
    try {
      const response = await householdsAPI.getById(householdId);
      if (
        response.success &&
        response.household &&
        response.household.members
      ) {
        setHouseholdMembers(response.household.members);
      } else if (response.members) {
        setHouseholdMembers(response.members);
      } else {
        setHouseholdMembers([]);
      }
    } catch (error) {
      console.error("Error fetching household members:", error);
      setHouseholdMembers([]);
    }
  };

  if (!editHealthRecord) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-4xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">
                Edit Health Record
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setEditHealthRecord(null)}
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
            onSubmit={(e) =>
              handleHealthRecordEdit(e, editHealthRecord.health_record_id)
            }
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Resident *
              </label>
              <select
                name="resident_id"
                value={editHealthRecord.resident_id}
                onChange={(e) => {
                  const selectedResidentId = e.target.value;
                  const selectedResident = residents.find(
                    (r) => r.resident_id == selectedResidentId
                  );
                  setEditHealthRecord({
                    ...editHealthRecord,
                    resident_id: selectedResidentId,
                    emergency_contact_name: selectedResident
                      ? `${selectedResident.first_name} ${
                          selectedResident.middle_name || ""
                        } ${selectedResident.last_name}`.trim()
                      : "",
                    emergency_contact_number: selectedResident
                      ? selectedResident.contact_number || ""
                      : "",
                  });
                  // Reset emergency contact selection when resident changes
                  setEmergencyContactType("manual");
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
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
              <label className="block text-sm font-medium text-gray-700">
                PhilHealth Member
              </label>
              <input
                type="checkbox"
                name="is_philhealth"
                checked={editHealthRecord.is_philhealth || false}
                onChange={(e) =>
                  setEditHealthRecord({
                    ...editHealthRecord,
                    is_philhealth: e.target.checked,
                  })
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#58A1D3] focus:ring-[#58A1D3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Blood Type
              </label>
              <select
                name="blood_type"
                value={editHealthRecord.blood_type || ""}
                onChange={(e) =>
                  setEditHealthRecord({
                    ...editHealthRecord,
                    blood_type: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                value={editHealthRecord.height || ""}
                onChange={(e) =>
                  setEditHealthRecord({
                    ...editHealthRecord,
                    height: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                placeholder="e.g., 170"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={editHealthRecord.weight || ""}
                onChange={(e) =>
                  setEditHealthRecord({
                    ...editHealthRecord,
                    weight: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                placeholder="e.g., 65"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                name="heart_rate"
                value={editHealthRecord.heart_rate || ""}
                onChange={(e) =>
                  setEditHealthRecord({
                    ...editHealthRecord,
                    heart_rate: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                placeholder="e.g., 72"
                min="40"
                max="200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pulse Rate (bpm)
              </label>
              <input
                type="number"
                name="pulse_rate"
                value={editHealthRecord.pulse_rate || ""}
                onChange={(e) =>
                  setEditHealthRecord({
                    ...editHealthRecord,
                    pulse_rate: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                placeholder="e.g., 70"
                min="40"
                max="200"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Medical Conditions
              </label>
              <textarea
                name="medical_conditions"
                value={editHealthRecord.medical_conditions || ""}
                onChange={(e) =>
                  setEditHealthRecord({
                    ...editHealthRecord,
                    medical_conditions: e.target.value,
                  })
                }
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                placeholder="Enter any known medical conditions"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Allergies
              </label>
              <textarea
                name="allergies"
                value={editHealthRecord.allergies || ""}
                onChange={(e) =>
                  setEditHealthRecord({
                    ...editHealthRecord,
                    allergies: e.target.value,
                  })
                }
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                placeholder="Enter any known allergies"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Selection
              </label>
              <div className="flex space-x-4 mb-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="emergencyContactType"
                    value="manual"
                    checked={emergencyContactType === "manual"}
                    onChange={(e) => setEmergencyContactType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Manual Input</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="emergencyContactType"
                    value="household"
                    checked={emergencyContactType === "household"}
                    onChange={(e) => setEmergencyContactType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Select from Household Members</span>
                </label>
              </div>
            </div>

            {emergencyContactType === "household" &&
              householdMembers.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Emergency Contact
                  </label>
                  <select
                    value={editHealthRecord.emergency_contact_name || ""}
                    onChange={(e) => {
                      const selectedMember = householdMembers.find(
                        (m) =>
                          `${m.first_name} ${m.middle_name || ""} ${
                            m.last_name
                          }`.trim() === e.target.value
                      );
                      setEditHealthRecord({
                        ...editHealthRecord,
                        emergency_contact_name: e.target.value,
                        emergency_contact_number: selectedMember
                          ? selectedMember.contact_number || ""
                          : "",
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                  >
                    <option value="">Select a household member</option>
                    {householdMembers.map((member) => (
                      <option
                        key={member.resident_id}
                        value={`${member.first_name} ${
                          member.middle_name || ""
                        } ${member.last_name}`.trim()}
                      >
                        {member.first_name} {member.middle_name || ""}{" "}
                        {member.last_name} {member.is_head ? "(Head)" : ""} -{" "}
                        {member.contact_number || "No contact"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            {emergencyContactType === "manual" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={editHealthRecord.emergency_contact_name || ""}
                    onChange={(e) =>
                      setEditHealthRecord({
                        ...editHealthRecord,
                        emergency_contact_name: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Emergency Contact Number
                  </label>
                  <input
                    type="tel"
                    name="emergency_contact_number"
                    value={editHealthRecord.emergency_contact_number || ""}
                    onChange={(e) =>
                      setEditHealthRecord({
                        ...editHealthRecord,
                        emergency_contact_number: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                    placeholder="e.g., +63 912 345 6789"
                  />
                </div>
              </>
            )}

            {emergencyContactType === "household" &&
              householdMembers.length === 0 &&
              selectedHouseholdId && (
                <div className="md:col-span-2">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800">
                      No household members found for this resident's household.
                    </p>
                  </div>
                </div>
              )}
            <div className="md:col-span-2 flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setEditHealthRecord(null)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#58A1D3] text-white rounded-lg hover:bg-[#0F4C81] transition-colors"
              >
                Update Health Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AddHealthRecordModal = ({
  healthRecordForm,
  setHealthRecordForm,
  handleHealthRecordSubmit,
  setShowHealthRecordForm,
  residents,
}) => {
  const [emergencyContactType, setEmergencyContactType] = useState("manual"); // 'manual' or 'household'
  const [householdMembers, setHouseholdMembers] = useState([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState("");

  // Fetch household members when resident is selected
  useEffect(() => {
    if (healthRecordForm.resident_id) {
      const selectedResident = residents.find(
        (r) => r.resident_id == healthRecordForm.resident_id
      );
      if (selectedResident && selectedResident.household_id) {
        setSelectedHouseholdId(selectedResident.household_id);
        fetchHouseholdMembers(selectedResident.household_id);
      } else {
        setHouseholdMembers([]);
        setSelectedHouseholdId("");
      }
    }
  }, [healthRecordForm.resident_id]);

  const fetchHouseholdMembers = async (householdId) => {
    try {
      const response = await householdsAPI.getById(householdId);
      if (
        response.success &&
        response.household &&
        response.household.members
      ) {
        setHouseholdMembers(response.household.members);
      } else if (response.members) {
        setHouseholdMembers(response.members);
      } else {
        setHouseholdMembers([]);
      }
    } catch (error) {
      console.error("Error fetching household members:", error);
      setHouseholdMembers([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleHealthRecordSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-4xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">
                Add New Health Record
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowHealthRecordForm(false)}
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
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Resident *
              </label>
              <select
                name="resident_id"
                value={healthRecordForm.resident_id}
                onChange={(e) => {
                  const selectedResidentId = e.target.value;
                  const selectedResident = residents.find(
                    (r) => r.resident_id == selectedResidentId
                  );
                  setHealthRecordForm({
                    ...healthRecordForm,
                    resident_id: selectedResidentId,
                    emergency_contact_name: selectedResident
                      ? `${selectedResident.first_name} ${
                          selectedResident.middle_name || ""
                        } ${selectedResident.last_name}`.trim()
                      : "",
                    emergency_contact_number: selectedResident
                      ? selectedResident.contact_number || ""
                      : "",
                  });
                  // Reset emergency contact selection when resident changes
                  setEmergencyContactType("manual");
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
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
              <label className="block text-sm font-medium text-gray-700">
                PhilHealth Member
              </label>
              <input
                type="checkbox"
                name="is_philhealth"
                checked={healthRecordForm.is_philhealth || false}
                onChange={(e) =>
                  setHealthRecordForm({
                    ...healthRecordForm,
                    is_philhealth: e.target.checked,
                  })
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#58A1D3] focus:ring-[#58A1D3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Blood Type
              </label>
              <select
                name="blood_type"
                value={healthRecordForm.blood_type || ""}
                onChange={(e) =>
                  setHealthRecordForm({
                    ...healthRecordForm,
                    blood_type: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                value={healthRecordForm.height || ""}
                onChange={(e) =>
                  setHealthRecordForm({
                    ...healthRecordForm,
                    height: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                placeholder="e.g., 170"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={healthRecordForm.weight || ""}
                onChange={(e) =>
                  setHealthRecordForm({
                    ...healthRecordForm,
                    weight: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                placeholder="e.g., 65"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                name="heart_rate"
                value={healthRecordForm.heart_rate || ""}
                onChange={(e) =>
                  setHealthRecordForm({
                    ...healthRecordForm,
                    heart_rate: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                placeholder="e.g., 72"
                min="40"
                max="200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pulse Rate (bpm)
              </label>
              <input
                type="number"
                name="pulse_rate"
                value={healthRecordForm.pulse_rate || ""}
                onChange={(e) =>
                  setHealthRecordForm({
                    ...healthRecordForm,
                    pulse_rate: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                placeholder="e.g., 70"
                min="40"
                max="200"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Medical Conditions
              </label>
              <textarea
                name="medical_conditions"
                value={healthRecordForm.medical_conditions || ""}
                onChange={(e) =>
                  setHealthRecordForm({
                    ...healthRecordForm,
                    medical_conditions: e.target.value,
                  })
                }
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                placeholder="Enter any known medical conditions"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Allergies
              </label>
              <textarea
                name="allergies"
                value={healthRecordForm.allergies || ""}
                onChange={(e) =>
                  setHealthRecordForm({
                    ...healthRecordForm,
                    allergies: e.target.value,
                  })
                }
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                placeholder="Enter any known allergies"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Selection
              </label>
              <div className="flex space-x-4 mb-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="emergencyContactType"
                    value="manual"
                    checked={emergencyContactType === "manual"}
                    onChange={(e) => setEmergencyContactType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Manual Input</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="emergencyContactType"
                    value="household"
                    checked={emergencyContactType === "household"}
                    onChange={(e) => setEmergencyContactType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Select from Household Members</span>
                </label>
              </div>
            </div>

            {emergencyContactType === "household" &&
              householdMembers.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Emergency Contact
                  </label>
                  <select
                    value={healthRecordForm.emergency_contact_name || ""}
                    onChange={(e) => {
                      const selectedMember = householdMembers.find(
                        (m) =>
                          `${m.first_name} ${m.middle_name || ""} ${
                            m.last_name
                          }`.trim() === e.target.value
                      );
                      setHealthRecordForm({
                        ...healthRecordForm,
                        emergency_contact_name: e.target.value,
                        emergency_contact_number: selectedMember
                          ? selectedMember.contact_number || ""
                          : "",
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                  >
                    <option value="">Select a household member</option>
                    {householdMembers.map((member) => (
                      <option
                        key={member.resident_id}
                        value={`${member.first_name} ${
                          member.middle_name || ""
                        } ${member.last_name}`.trim()}
                      >
                        {member.first_name} {member.middle_name || ""}{" "}
                        {member.last_name} {member.is_head ? "(Head)" : ""} -{" "}
                        {member.contact_number || "No contact"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            {emergencyContactType === "manual" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={healthRecordForm.emergency_contact_name || ""}
                    onChange={(e) =>
                      setHealthRecordForm({
                        ...healthRecordForm,
                        emergency_contact_name: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Emergency Contact Number
                  </label>
                  <input
                    type="tel"
                    name="emergency_contact_number"
                    value={healthRecordForm.emergency_contact_number || ""}
                    onChange={(e) =>
                      setHealthRecordForm({
                        ...healthRecordForm,
                        emergency_contact_number: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#58A1D3] focus:border-[#58A1D3]"
                    placeholder="e.g., +63 912 345 6789"
                  />
                </div>
              </>
            )}

            {emergencyContactType === "household" &&
              householdMembers.length === 0 &&
              selectedHouseholdId && (
                <div className="md:col-span-2">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800">
                      No household members found for this resident's household.
                    </p>
                  </div>
                </div>
              )}
            <div className="md:col-span-2 flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowHealthRecordForm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#58A1D3] text-white rounded-lg hover:bg-[#0F4C81] transition-colors"
              >
                Add Health Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ record, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl shadow-red-500/20 border border-white/20">
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-200 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Trash2 className="text-red-200" size={24} />
              Confirm Delete Health Record
            </h2>
          </div>
        </div>
        <div className="p-8">
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete the health record for{" "}
              {record.resident_id}? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HealthRecordsPage = () => {
  const context = useOutletContext();

  // Destructure from context
  const { residents, confirmation, setConfirmation } = context || {};

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [currentReportType, setCurrentReportType] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [purokOptions, setPurokOptions] = useState([]);
  const [healthConditionOptions, setHealthConditionOptions] = useState([]);

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
  const [filteredHealthRecords, setFilteredHealthRecords] = useState([]);
  const [healthSearch, setHealthSearch] = useState("");
  const [showHealthRecordForm, setShowHealthRecordForm] = useState(false);
  const [selectedHealthRecord, setSelectedHealthRecord] = useState(null);
  const [editHealthRecord, setEditHealthRecord] = useState(null);
  const [healthRecordForm, setHealthRecordForm] = useState({
    resident_id: "",
    blood_type: "",
    height: "",
    weight: "",
    heart_rate: "", // ADD THIS
    pulse_rate: "",
    medical_conditions: "",
    allergies: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
    is_philhealth: false,
  });

  // Define hasLoadedHealthRecordsRef
  const hasLoadedHealthRecordsRef = useRef(false);

  // Load options for reports
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadReportOptions = async () => {
      try {
        const [puroksResponse, healthConditionsResponse] = await Promise.all([
          reportsAPI.getPuroks(),
          reportsAPI.getHealthConditions(),
        ]);

        if (puroksResponse.success) {
          setPurokOptions(puroksResponse.data);
        }

        if (healthConditionsResponse.success) {
          setHealthConditionOptions(healthConditionsResponse.data);
        }
      } catch (error) {
        console.error("Error loading report options:", error);
      }
    };

    loadReportOptions();
  }, []);

  // Fetch health records on component mount
  useEffect(() => {
    const fetchHealthRecords = async () => {
      if (hasLoadedHealthRecordsRef.current) return; // Prevent re-runs
      hasLoadedHealthRecordsRef.current = true;

      try {
        setLoading(true);
        const response = await healthAPI.getAll();
        if (response.success) {
          setFilteredHealthRecords(response.data || []); // Update state with fetched records
          // Data loaded silently - no notification needed
        } else {
          addNotification(
            "error",
            "Load Failed",
            response.message || "Failed to load health records"
          );
        }
      } catch (error) {
        console.error("Failed to fetch health records:", error);
        addNotification(
          "error",
          "Load Failed",
          error.response?.data?.message || "Failed to fetch health records"
        );
      } finally {
        setLoading(false); // Ensure loading state is reset
      }
    };
    fetchHealthRecords();
  }, []);

  const handleHealthRecordSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await healthAPI.createResidentHealthRecord(
        healthRecordForm
      );
      if (response.success) {
        const newRecord = {
          ...healthRecordForm,
          health_record_id: response.data.health_record_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setFilteredHealthRecords([...filteredHealthRecords, newRecord]);
        setShowHealthRecordForm(false);
        setHealthRecordForm({
          resident_id: "",
          blood_type: "",
          height: "",
          weight: "",
          heart_rate: "", // ADD THIS
          pulse_rate: "", // ADD THIS
          medical_conditions: "",
          allergies: "",
          emergency_contact_name: "",
          emergency_contact_number: "",
          is_philhealth: false,
        });
        if (setConfirmation) {
          setConfirmation(
            `Health record created successfully. Record ID: ${response.data.health_record_id}`
          );
        }
        addNotification(
          "success",
          "Health Record Added",
          `Health record ${response.data.health_record_id} created successfully`
        );

        // Log activity
        await logUserActivity(
          "Create Health Record",
          "health_record",
          response.data.health_record_id,
          `Health Record #${response.data.health_record_id}`,
          "success",
          `Created health record for resident ${healthRecordForm.resident_id}`
        );
      }
    } catch (error) {
      console.error("Failed to add health record:", error);
      if (setConfirmation) {
        setConfirmation("Failed to add health record. Please try again.");
      }
      addNotification(
        "error",
        "Add Failed",
        error.response?.data?.message || "Failed to add health record"
      );

      // Log failed activity
      await logUserActivity(
        "Create Health Record",
        "health_record",
        null,
        "Failed",
        "failed",
        `Failed to create health record: ${error.message}`
      );
    }
  };

  const handleHealthRecordEdit = async (e, healthRecordId) => {
    e.preventDefault();
    try {
      const response = await healthAPI.updateResidentHealthRecord(
        healthRecordId,
        editHealthRecord
      );
      if (response.success) {
        const updatedRecord = {
          ...editHealthRecord,
          updated_at: new Date().toISOString(),
        };
        setFilteredHealthRecords(
          filteredHealthRecords.map((hr) =>
            hr.health_record_id === healthRecordId ? updatedRecord : hr
          )
        );
        setEditHealthRecord(null);
        if (setConfirmation) {
          setConfirmation(
            `Health record ${healthRecordId} updated successfully`
          );
        }
        addNotification(
          "success",
          "Health Record Updated",
          `Health record ${healthRecordId} updated successfully`
        );

        // Log activity
        await logUserActivity(
          "Update Health Record",
          "health_record",
          healthRecordId,
          `Health Record #${healthRecordId}`,
          "success",
          `Updated health record #${healthRecordId}`
        );
      }
    } catch (error) {
      console.error("Failed to update health record:", error);
      if (setConfirmation) {
        setConfirmation("Failed to update health record. Please try again.");
      }
      addNotification(
        "error",
        "Update Failed",
        error.response?.data?.message || "Failed to update health record"
      );

      // Log failed activity
      await logUserActivity(
        "Update Health Record",
        "health_record",
        healthRecordId,
        `Health Record #${healthRecordId}`,
        "failed",
        `Failed to update health record: ${error.message}`
      );
    }
  };

  const handleHealthRecordDelete = async (id) => {
    try {
      const response = await healthAPI.deleteResidentHealthRecord(id);
      if (response.success) {
        setFilteredHealthRecords(
          filteredHealthRecords.filter((hr) => hr.health_record_id !== id)
        );
        setRecordToDelete(null);
        if (setConfirmation) {
          setConfirmation(`Health record ${id} deleted successfully`);
        }
        addNotification(
          "success",
          "Health Record Deleted",
          `Health record ${id} deleted successfully`
        );

        // Log activity
        await logUserActivity(
          "Delete Health Record",
          "health_record",
          id,
          `Health Record #${id}`,
          "success",
          `Deleted health record #${id}`
        );
      }
    } catch (error) {
      console.error("Failed to delete health record:", error);
      if (setConfirmation) {
        setConfirmation("Failed to delete health record. Please try again.");
      }
      addNotification(
        "error",
        "Delete Failed",
        error.response?.data?.message || "Failed to delete health record"
      );

      // Log failed activity
      await logUserActivity(
        "Delete Health Record",
        "health_record",
        id,
        `Health Record #${id}`,
        "failed",
        `Failed to delete health record: ${error.message}`
      );
    }
  };

  const confirmDelete = (record) => {
    setRecordToDelete(record);
  };

  const proceedDelete = () => {
    if (recordToDelete) {
      handleHealthRecordDelete(recordToDelete.health_record_id);
    }
  };

  // Helper function to get resident name
  const getResidentName = (residentId) => {
    const resident = residents.find((r) => r.resident_id === residentId);
    return resident
      ? `${resident.first_name} ${resident.middle_name || ""} ${
          resident.last_name
        }`.trim()
      : "N/A";
  };

  // Filter health records based on search
  const searchFilteredRecords = filteredHealthRecords.filter((hr) => {
    const searchLower = healthSearch.toLowerCase();
    const residentName = getResidentName(hr.resident_id).toLowerCase();
    return (
      hr.health_record_id.toString().includes(searchLower) ||
      hr.resident_id.toString().includes(searchLower) ||
      residentName.includes(searchLower) ||
      (hr.blood_type && hr.blood_type.toLowerCase().includes(searchLower)) ||
      (hr.medical_conditions &&
        hr.medical_conditions.toLowerCase().includes(searchLower)) ||
      (hr.allergies && hr.allergies.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return <div className="text-center py-8">Loading health records...</div>;
  }

  // Report generation functions
  const handleGenerateHealthRecordsReport = async (filters) => {
    try {
      const response = await reportsAPI.generateHealthRecords(filters);
      if (response.success) {
        if (filters.preview) {
          return response.data;
        } else {
          // Generate actual report file
          generateReportFile(response.data, "Health Records Report", [
            { key: "full_name", label: "Full Name", type: "text" },
            { key: "age", label: "Age", type: "number" },
            { key: "gender", label: "Gender", type: "text" },
            { key: "purok", label: "Purok", type: "text" },
            { key: "blood_type", label: "Blood Type", type: "text" },
            { key: "philhealth", label: "PhilHealth", type: "text" },
            { key: "height", label: "Height (cm)", type: "number" },
            { key: "weight", label: "Weight (kg)", type: "number" },
            { key: "heart_rate", label: "Heart Rate", type: "number" },
            { key: "pulse_rate", label: "Pulse Rate", type: "number" },
            {
              key: "medical_conditions",
              label: "Medical Conditions",
              type: "text",
            },
            { key: "allergies", label: "Allergies", type: "text" },
            {
              key: "emergency_contact",
              label: "Emergency Contact",
              type: "text",
            },
            { key: "record_date", label: "Record Date", type: "date" },
          ]);
          addNotification(
            "success",
            "Report Generated",
            "Health records report has been generated successfully"
          );
        }
      }
    } catch (error) {
      addNotification(
        "error",
        "Report Failed",
        error.message || "Failed to generate health records report"
      );
      throw error;
    }
  };

  const generateReportFile = (data, title, columns) => {
    // Import jsPDF dynamically
    import("jspdf")
      .then(({ default: jsPDF }) => {
        import("jspdf-autotable").then(({ default: autoTable }) => {
          // Use landscape orientation for health records with many columns
          const doc = new jsPDF("landscape", "mm", "a4");

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
          doc.text(title, pageWidth / 2, 36, { align: "center" });

          // Add date and record count
          doc.setFontSize(9);
          const dateStr = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          doc.text(`Generated on: ${dateStr}`, 14, 43);
          doc.text(`Total Records: ${data.length}`, pageWidth - 14, 43, {
            align: "right",
          });

          // Prepare table data with better formatting
          const tableColumns = columns.map((col) => col.label);
          const tableRows = data.map((row) =>
            columns.map((col) => {
              const value = row[col.key];
              if (value === null || value === undefined || value === "")
                return "N/A";
              // Format dates nicely
              if (col.type === "date" && value !== "N/A") {
                try {
                  return new Date(value).toLocaleDateString("en-US");
                } catch (e) {
                  return value.toString();
                }
              }
              return value.toString();
            })
          );

          // Add table with optimized column widths
          autoTable(doc, {
            head: [tableColumns],
            body: tableRows,
            startY: 48,
            theme: "grid",
            styles: {
              fontSize: 7,
              cellPadding: 2,
              overflow: "linebreak",
              halign: "left",
              valign: "middle",
            },
            headStyles: {
              fillColor: [15, 76, 129], // #0F4C81
              textColor: [255, 255, 255],
              fontStyle: "bold",
              fontSize: 7,
              halign: "center",
              valign: "middle",
              minCellHeight: 10,
            },
            alternateRowStyles: {
              fillColor: [245, 247, 250],
            },
            margin: { left: 10, right: 10 },
            columnStyles: {
              0: { cellWidth: 30 }, // Full Name
              1: { cellWidth: 10, halign: "center" }, // Age
              2: { cellWidth: 12, halign: "center" }, // Gender
              3: { cellWidth: 15 }, // Purok
              4: { cellWidth: 12, halign: "center" }, // Blood Type
              5: { cellWidth: 15, halign: "center" }, // PhilHealth
              6: { cellWidth: 15, halign: "center" }, // Height
              7: { cellWidth: 15, halign: "center" }, // Weight
              8: { cellWidth: 15, halign: "center" }, // Heart Rate
              9: { cellWidth: 15, halign: "center" }, // Pulse Rate
              10: { cellWidth: 30 }, // Medical Conditions
              11: { cellWidth: 25 }, // Allergies
              12: { cellWidth: 35 }, // Emergency Contact
              13: { cellWidth: 20, halign: "center" }, // Record Date
            },
          });

          // Add footer with page numbers
          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont(undefined, "normal");

            // Page number
            doc.text(
              `Page ${i} of ${pageCount}`,
              pageWidth / 2,
              pageHeight - 8,
              { align: "center" }
            );

            // Footer note
            doc.setFontSize(7);
            doc.text(
              "This is a computer-generated report.",
              pageWidth / 2,
              pageHeight - 4,
              { align: "center" }
            );
          }

          // Save the PDF
          const filename = `Health_Records_Report_${
            new Date().toISOString().split("T")[0]
          }.pdf`;
          doc.save(filename);
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
                <HeartPulse size={32} className="text-yellow-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                  <span className="text-cyan-200 text-sm font-medium tracking-widest">
                    HEALTH RECORDS
                  </span>
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                </div>
                <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">
                  Health Management
                </h2>
                <p className="text-cyan-100 text-lg">
                  Monitor and manage community health records and medical
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold text-[#0F4C81]">Health Records</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search health records..."
            value={healthSearch}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3]"
            onChange={(e) => setHealthSearch(e.target.value)}
          />
          <button
            onClick={() => openReportGenerator("health-records")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 w-full sm:w-auto"
          >
            <FileText size={18} />
            <span>Generate Report</span>
          </button>
          <button
            onClick={() => setShowHealthRecordForm(true)}
            className="bg-[#58A1D3] text-white px-4 py-2 rounded-lg hover:bg-[#0F4C81] transition-colors w-full sm:w-auto"
          >
            Add Health Record
          </button>
        </div>
      </div>
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 280px)" }}
        >
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white">
                <th
                  className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] text-xs"
                  style={{ minWidth: "140px" }}
                >
                  Resident Name
                </th>
                <th
                  className="py-3 px-2 text-center font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] text-xs"
                  style={{ width: "80px" }}
                >
                  PhilHealth
                </th>
                <th
                  className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] text-xs"
                  style={{ width: "85px" }}
                >
                  Blood Type
                </th>
                <th
                  className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] text-xs"
                  style={{ width: "75px" }}
                >
                  Height
                </th>
                <th
                  className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] text-xs"
                  style={{ width: "75px" }}
                >
                  Weight
                </th>
                <th
                  className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] text-xs"
                  style={{ width: "85px" }}
                >
                  Heart Rate
                </th>
                <th
                  className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] text-xs"
                  style={{ width: "85px" }}
                >
                  Pulse Rate
                </th>
                <th
                  className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] text-xs"
                  style={{ minWidth: "120px" }}
                >
                  Medical Conditions
                </th>
                <th
                  className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] text-xs"
                  style={{ minWidth: "100px" }}
                >
                  Allergies
                </th>
                <th
                  className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] text-xs"
                  style={{ minWidth: "130px" }}
                >
                  Emergency Contact
                </th>
                <th
                  className="py-3 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] text-xs"
                  style={{ width: "110px" }}
                >
                  Contact Number
                </th>
                <th
                  className="py-3 px-2 text-center font-semibold sticky top-0 z-10 bg-[#0F4C81] text-xs"
                  style={{ width: "100px" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {searchFilteredRecords && searchFilteredRecords.length > 0 ? (
                searchFilteredRecords.map((hr) => {
                  const createdAt = new Date(hr.created_at).toLocaleDateString(
                    "en-US"
                  );
                  return (
                    <tr
                      key={hr.health_record_id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="py-2 px-2 font-medium border-r border-gray-200 text-xs">
                        {hr.resident_name || "N/A"}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-gray-200">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold ${
                            hr.is_philhealth ? "bg-green-500" : "bg-gray-400"
                          }`}
                        >
                          {hr.is_philhealth ? "✓" : "✗"}
                        </span>
                      </td>
                      <td className="py-2 px-2 border-r border-gray-200 text-xs">
                        {hr.blood_type || "N/A"}
                      </td>
                      <td className="py-2 px-2 border-r border-gray-200 whitespace-nowrap text-xs">
                        {hr.height ? `${hr.height} cm` : "N/A"}
                      </td>
                      <td className="py-2 px-2 border-r border-gray-200 whitespace-nowrap text-xs">
                        {hr.weight ? `${hr.weight} kg` : "N/A"}
                      </td>
                      <td className="py-2 px-2 border-r border-gray-200 whitespace-nowrap text-xs">
                        {hr.heart_rate ? `${hr.heart_rate} bpm` : "N/A"}
                      </td>
                      <td className="py-2 px-2 border-r border-gray-200 whitespace-nowrap text-xs">
                        {hr.pulse_rate ? `${hr.pulse_rate} bpm` : "N/A"}
                      </td>
                      <td className="py-2 px-2 border-r border-gray-200 text-xs">
                        <div className="truncate" title={hr.medical_conditions}>
                          {hr.medical_conditions || "None"}
                        </div>
                      </td>
                      <td className="py-2 px-2 border-r border-gray-200 text-xs">
                        <div className="truncate" title={hr.allergies}>
                          {hr.allergies || "None"}
                        </div>
                      </td>
                      <td className="py-2 px-2 border-r border-gray-200 text-xs">
                        <div
                          className="truncate"
                          title={hr.emergency_contact_name}
                        >
                          {hr.emergency_contact_name || "N/A"}
                        </div>
                      </td>
                      <td className="py-2 px-2 border-r border-gray-200 whitespace-nowrap text-xs">
                        {hr.emergency_contact_number || "N/A"}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex justify-center space-x-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => setSelectedHealthRecord(hr)}
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            onClick={() => setEditHealthRecord({ ...hr })}
                            title="Edit Record"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => confirmDelete(hr)}
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
                  <td colSpan="12" className="py-4 text-center text-gray-500">
                    {healthSearch
                      ? "No health records match your search criteria."
                      : "No health records found. Please add a new health record."}
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
          {searchFilteredRecords && searchFilteredRecords.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {searchFilteredRecords.map((hr) => (
                <div
                  key={hr.health_record_id}
                  className="p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2 shadow-md">
                        <HeartPulse size={16} className="text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-[#0F4C81] text-base">
                          {hr.resident_name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Record ID: {hr.health_record_id}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold ${
                        hr.is_philhealth ? "bg-green-500" : "bg-gray-400"
                      }`}
                      title="PhilHealth Member"
                    >
                      {hr.is_philhealth ? "✓" : "✗"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Type:</span>
                      <span className="font-medium text-gray-900">
                        {hr.blood_type || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Height:</span>
                      <span className="font-medium text-gray-900">
                        {hr.height ? `${hr.height} cm` : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium text-gray-900">
                        {hr.weight ? `${hr.weight} kg` : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heart Rate:</span>
                      <span className="font-medium text-gray-900">
                        {hr.heart_rate ? `${hr.heart_rate} bpm` : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emergency Contact:</span>
                      <span className="font-medium text-gray-900 truncate max-w-[180px]">
                        {hr.emergency_contact_name || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setSelectedHealthRecord(hr)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => setEditHealthRecord({ ...hr })}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(hr)}
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
                <HeartPulse size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-600 text-xl font-semibold mb-2">
                No health records found
              </p>
              <p className="text-gray-500 text-sm">
                {healthSearch
                  ? "Try adjusting your search criteria"
                  : "No health records registered yet"}
              </p>
            </div>
          )}
        </div>
      </div>

      {showHealthRecordForm && (
        <AddHealthRecordModal
          healthRecordForm={healthRecordForm}
          setHealthRecordForm={setHealthRecordForm}
          handleHealthRecordSubmit={handleHealthRecordSubmit}
          setShowHealthRecordForm={setShowHealthRecordForm}
          residents={residents}
        />
      )}

      {selectedHealthRecord && (
        <ViewHealthRecordModal
          selectedHealthRecord={selectedHealthRecord}
          setSelectedHealthRecord={setSelectedHealthRecord}
          residents={residents}
        />
      )}

      {editHealthRecord && (
        <EditHealthRecordModal
          editHealthRecord={editHealthRecord}
          setEditHealthRecord={setEditHealthRecord}
          handleHealthRecordEdit={handleHealthRecordEdit}
          residents={residents}
        />
      )}

      {recordToDelete && (
        <ConfirmationModal
          record={recordToDelete}
          onConfirm={proceedDelete}
          onCancel={() => setRecordToDelete(null)}
        />
      )}

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />

      {showReportGenerator && (
        <ReportGenerator
          reportType="health-records"
          title="Health Records Report"
          icon={HeartPulse}
          onGenerate={handleGenerateHealthRecordsReport}
          onClose={() => {
            setShowReportGenerator(false);
            setCurrentReportType(null);
          }}
          filters={[
            {
              key: "purok",
              label: "Purok",
              type: "select",
              options: purokOptions,
            },
            {
              key: "bloodType",
              label: "Blood Type",
              type: "select",
              options: [
                { value: "A+", label: "A+" },
                { value: "A-", label: "A-" },
                { value: "B+", label: "B+" },
                { value: "B-", label: "B-" },
                { value: "AB+", label: "AB+" },
                { value: "AB-", label: "AB-" },
                { value: "O+", label: "O+" },
                { value: "O-", label: "O-" },
              ],
            },
            {
              key: "isPhilhealth",
              label: "PhilHealth Member",
              type: "select",
              options: [
                { value: "1", label: "Yes" },
                { value: "0", label: "No" },
              ],
            },
          ]}
          columns={[
            { key: "full_name", label: "Full Name", type: "text" },
            { key: "age", label: "Age", type: "number" },
            { key: "gender", label: "Gender", type: "text" },
            { key: "purok", label: "Purok", type: "text" },
            { key: "blood_type", label: "Blood Type", type: "text" },
            { key: "philhealth", label: "PhilHealth", type: "text" },
            { key: "height", label: "Height (cm)", type: "number" },
            { key: "weight", label: "Weight (kg)", type: "number" },
            { key: "heart_rate", label: "Heart Rate (bpm)", type: "number" },
            { key: "pulse_rate", label: "Pulse Rate (bpm)", type: "number" },
            {
              key: "medical_conditions",
              label: "Medical Conditions",
              type: "text",
            },
            { key: "allergies", label: "Allergies", type: "text" },
            {
              key: "emergency_contact",
              label: "Emergency Contact",
              type: "text",
            },
            { key: "record_date", label: "Record Date", type: "date" },
          ]}
        />
      )}
    </section>
  );
};

export default HealthRecordsPage;

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
  const id = "health-records-float-styles";
  if (!document.getElementById(id)) {
    const styleEl = document.createElement("style");
    styleEl.id = id;
    styleEl.appendChild(document.createTextNode(styles));
    document.head.appendChild(styleEl);
  }
}
