import React, { useState, useEffect, useCallback } from "react";
import {
  Eye,
  Edit2,
  Trash2,
  X,
  Plus,
  Search,
  Filter,
  HeartPulse,
  Baby,
  Syringe,
  FileText,
  Download,
  Calendar,
  User, // Add this
  Weight,
  Droplets,
  Shield,
  Pill,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Save,
  AlertTriangle,
  RefreshCw,
  Info,
  Activity, // Add this for blood pressure icon
  Users,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import {
  maternalHealthAPI,
  childImmunizationAPI,
  residentsAPI,
  reportsAPI,
  logUserActivity,
} from "../services/api";
import { formatDateForInput } from "./ManageResidentPage";
import NotificationSystem from "../components/NotificationSystem";
import ReportGenerator from "../components/ReportGenerator";

const ReportSelectionModal = ({ onSelectReport, onClose }) => {
  const reportTypes = [
    {
      id: "maternal",
      title: "Maternal Records Report",
      description: "Complete list of maternal health records",
      icon: HeartPulse,
      color: "from-pink-500 to-pink-600",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
    },
    {
      id: "child-immunization",
      title: "Child Immunization Report",
      description: "List of child immunization records",
      icon: Syringe,
      color: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: "combined",
      title: "Combined Report",
      description: "Both maternal and child health records",
      icon: Baby,
      color: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  // Add this function inside MaternalChildHealthPage component,
  // after other helper functions like handleEditImmunization:

  const calculateAgeFromDOB = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Add this vaccine options array (after calculateAgeFromDOB):
  const vaccineOptions = [
    "BCG",
    "Hepatitis B",
    "Pentavalent (DPT-HepB-Hib)",
    "Oral Polio Vaccine (OPV)",
    "Inactivated Polio Vaccine (IPV)",
    "Pneumococcal Conjugate Vaccine (PCV)",
    "Measles, Mumps, Rubella (MMR)",
    "Rotavirus",
    "Influenza",
    "Varicella (Chickenpox)",
    "Tetanus Toxoid (TT)",
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-3xl shadow-2xl border border-white/20">
        <div className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <FileText className="text-white" size={28} />
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Generate Reports
                </h2>
                <p className="text-white/80 text-sm">
                  Select a report type to generate
                </p>
              </div>
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
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => onSelectReport(report.id)}
                  className="group relative bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#58A1D3] hover:shadow-xl transition-all duration-300 text-left"
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`${report.iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={report.iconColor} size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-[#0F4C81] transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {report.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-[#58A1D3] rounded-full animate-pulse"></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ record, onConfirm, onCancel, type }) => (
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
          Are you sure you want to delete this {type} record for{" "}
          <span className="font-semibold text-gray-900">
            {record.resident_name || record.mother_name || "the resident"}
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

const ViewMaternalRecordModal = ({
  selectedRecord,
  setSelectedRecord,
  calculateAge,
}) => {
  if (!selectedRecord) return null;

  const residentAge = calculateAge(
    selectedRecord.dob || selectedRecord.date_of_birth
  );

  const status = selectedRecord.delivery_date ? "Delivered" : "Ongoing";
  const statusColor = selectedRecord.delivery_date
    ? "bg-green-100 text-green-800 border-green-200"
    : "bg-yellow-100 text-yellow-800 border-yellow-200";

  const getStatusIcon = () => {
    if (selectedRecord.delivery_date) {
      return <CheckCircle className="w-4 h-4" />;
    }
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-4xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <HeartPulse className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Maternal Health Details
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}
                  >
                    {getStatusIcon()}
                    {status}
                  </span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                  <p className="text-white/80 text-sm">
                    Click outside or press ESC to close
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedRecord(null)}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300 group backdrop-blur-sm"
              aria-label="Close modal"
            >
              <X
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Patient Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedRecord.resident_name}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      Age: <strong>{residentAge}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      Last Updated:{" "}
                      <strong>
                        {new Date(
                          selectedRecord.updated_at
                        ).toLocaleDateString()}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200">
                  <Baby className="w-5 h-5 text-[#58A1D3]" />
                  <span className="font-medium text-gray-800">
                    Maternal Record
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pregnancy Information */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Pregnancy Details
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    LMP Date
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDateForInput(selectedRecord.lmp_date) ||
                      "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">EDD</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDateForInput(selectedRecord.edd) || "Not calculated"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Prenatal Visits
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#0F4C81]">
                      {selectedRecord.prenatal_visits || "0"}
                    </span>
                    <span className="text-sm text-gray-500">
                      visits completed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Metrics */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <Weight className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Health Metrics
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Blood Pressure
                  </p>
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                      selectedRecord.blood_pressure
                        ? "bg-white border border-gray-200"
                        : "bg-gray-100"
                    }`}
                  >
                    <span
                      className={`font-bold ${
                        selectedRecord.blood_pressure
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {selectedRecord.blood_pressure || "Not measured"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Weight
                  </p>
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                      selectedRecord.weight
                        ? "bg-white border border-gray-200"
                        : "bg-gray-100"
                    }`}
                  >
                    <span
                      className={`font-bold ${
                        selectedRecord.weight
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {selectedRecord.weight
                        ? `${selectedRecord.weight} kg`
                        : "Not recorded"}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Hemoglobin
                  </p>
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                      selectedRecord.hemoglobin
                        ? "bg-white border border-gray-200"
                        : "bg-gray-100"
                    }`}
                  >
                    <Droplets
                      className={`w-4 h-4 ${
                        selectedRecord.hemoglobin
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`font-bold ${
                        selectedRecord.hemoglobin
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {selectedRecord.hemoglobin
                        ? `${selectedRecord.hemoglobin} g/dL`
                        : "Not tested"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medications & Vaccinations */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Medications & Vaccinations
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Syringe className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-800">
                      Tetanus Vaccination
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedRecord.tetanus_vaccination
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedRecord.tetanus_vaccination
                      ? "Completed"
                      : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Pill className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-800">
                      Iron Supplement
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedRecord.iron_supplement
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedRecord.iron_supplement ? "Taking" : "Not Taking"}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Information (Conditional) */}
            {selectedRecord.delivery_date && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
                <div className="flex items-center gap-3 mb-4">
                  <Baby className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delivery Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Delivery Date
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDateForInput(selectedRecord.delivery_date)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Type
                      </p>
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                        <span className="font-medium text-gray-900">
                          {selectedRecord.delivery_type || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Baby Weight
                      </p>
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                        <Weight className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {selectedRecord.baby_weight
                            ? `${selectedRecord.baby_weight} kg`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Complications & Notes */}
            <div className="md:col-span-2 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Complications & Notes
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Complications
                  </p>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 min-h-[100px]">
                    <p className="text-gray-900 leading-relaxed">
                      {selectedRecord.complications ||
                        "No complications reported"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Additional Notes
                  </p>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 min-h-[100px]">
                    <p className="text-gray-900 leading-relaxed">
                      {selectedRecord.notes || "No additional notes"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Info className="w-4 h-4" />
                <span>
                  Record created on{" "}
                  {new Date(
                    selectedRecord.created_at || selectedRecord.updated_at
                  ).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#58A1D3] to-[#0F4C81] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewImmunizationRecordModal = ({
  selectedRecord,
  setSelectedRecord,
  calculateAge,
}) => {
  if (!selectedRecord) return null;

  const childAge = calculateAge(
    selectedRecord.dob || selectedRecord.date_of_birth
  );

  // Get vaccination status
  const getVaccinationStatus = () => {
    if (!selectedRecord.date_given) return "Scheduled";
    const givenDate = new Date(selectedRecord.date_given);
    const today = new Date();

    if (selectedRecord.next_dose_date) {
      const nextDoseDate = new Date(selectedRecord.next_dose_date);
      if (nextDoseDate <= today) return "Due for Next Dose";
    }

    return "Vaccinated";
  };

  const status = getVaccinationStatus();
  const statusColor =
    {
      Vaccinated: "bg-green-100 text-green-800 border-green-200",
      Scheduled: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Due for Next Dose": "bg-red-100 text-red-800 border-red-200",
    }[status] || "bg-gray-100 text-gray-800 border-gray-200";

  const getStatusIcon = () => {
    if (status === "Vaccinated") return <CheckCircle className="w-4 h-4" />;
    if (status === "Due for Next Dose")
      return <AlertTriangle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-4xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Syringe className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Child Immunization Details
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}
                  >
                    {getStatusIcon()}
                    {status}
                  </span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                  <p className="text-white/80 text-sm">
                    Click outside or press ESC to close
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedRecord(null)}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300 group backdrop-blur-sm"
              aria-label="Close modal"
            >
              <X
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Child Information Card */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedRecord.child_name}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      Age: <strong>{childAge}</strong>
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200">
                  <Syringe className="w-5 h-5 text-[#58A1D3]" />
                  <span className="font-medium text-gray-800">
                    Immunization Record
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vaccine Information */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <Syringe className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Vaccine Details
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Vaccine Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedRecord.vaccine_name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Batch Number
                    </p>
                    <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                      <span className="font-medium text-gray-900">
                        {selectedRecord.batch_no || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Administered By
                    </p>
                    <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {selectedRecord.given_by || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates Information */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Dates & Schedule
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Date Given
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedRecord.date_given
                      ? formatDateForInput(selectedRecord.date_given)
                      : "Not administered yet"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Next Dose Date
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedRecord.next_dose_date
                      ? formatDateForInput(selectedRecord.next_dose_date)
                      : "No next dose scheduled"}
                  </p>
                </div>
                {selectedRecord.next_dose_date && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Days until next dose:
                      </span>
                      <span
                        className={`font-medium ${
                          new Date(selectedRecord.next_dose_date) <= new Date()
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {Math.ceil(
                          (new Date(selectedRecord.next_dose_date) -
                            new Date()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Parent Information Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Parent/Guardian Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother's Name
                  </label>
                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="font-medium text-gray-900">
                      {selectedRecord.mother_name || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Name
                  </label>
                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="font-medium text-gray-900">
                      {selectedRecord.father_name || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent/Guardian
                  </label>
                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="font-medium text-gray-900">
                      {selectedRecord.parent_name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Adverse Reactions & Notes */}
            <div className="md:col-span-2 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Adverse Reactions
                    </h3>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 min-h-[120px]">
                    <p className="text-gray-900 leading-relaxed">
                      {selectedRecord.adverse_reactions ||
                        "No adverse reactions reported"}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Additional Notes
                    </h3>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 min-h-[120px]">
                    <p className="text-gray-900 leading-relaxed">
                      {selectedRecord.notes || "No additional notes"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Record Metadata */}
            <div className="md:col-span-2 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Record Information
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Record ID</p>
                  <p className="font-medium text-gray-900">
                    {selectedRecord.id}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">
                    {selectedRecord.created_at
                      ? formatDateForInput(selectedRecord.created_at)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedRecord.updated_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Child Resident ID</p>
                  <p className="font-medium text-gray-900">
                    {selectedRecord.child_resident_id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Info className="w-4 h-4" />
                <span>
                  Record created on{" "}
                  {selectedRecord.created_at
                    ? new Date(selectedRecord.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#58A1D3] to-[#0F4C81] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateMaternalRecordModal = ({
  setShowCreateModal,
  handleCreateMaternal,
  residents,
  addNotification,
  existingRecords,
}) => {
  const [formData, setFormData] = useState({
    resident_id: "",
    lmp_date: "",
    edd: "",
    prenatal_visits: "",
    blood_pressure: "",
    weight: "",
    hemoglobin: "",
    tetanus_vaccination: false,
    iron_supplement: false,
    complications: "",
    delivery_date: "",
    delivery_type: "",
    baby_weight: "",
    notes: "",
  });

  // Helper to check if resident has an active record
  const getResidentStatus = useCallback(
    (residentId) => {
      if (!residentId) return null;

      // Find if this resident has any maternal records
      const residentRecords = existingRecords.filter(
        (r) => String(r.resident_id) === String(residentId)
      );

      if (residentRecords.length === 0) {
        return null; // No records at all
      }

      // Check if any of those records are "active" (no delivery date yet)
      const hasActivePregnancy = residentRecords.some((r) => !r.delivery_date);

      return hasActivePregnancy ? "Active Pregnancy Record" : "Existing Record";
    },
    [existingRecords]
  );

  // Helper to get resident name from ID
  const getResidentName = (residentId) => {
    const resident = residents.find(
      (r) => String(r.resident_id) === String(residentId)
    );
    return resident
      ? `${resident.first_name} ${resident.last_name}`
      : "Unknown Resident";
  };

  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.resident_id) {
      addNotification("error", "Validation Error", "Please select a resident");
      return;
    }

    setIsSubmitting(true);
    try {
      await handleCreateMaternal(formData);
      setShowCreateModal(false);
    } catch (error) {
      // Error handling is done in handleCreateMaternal
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEDD = (lmpDate) => {
    if (!lmpDate) return "";
    const lmp = new Date(lmpDate);
    const edd = new Date(lmp);
    edd.setDate(edd.getDate() + 280); // 40 weeks from LMP
    return edd.toISOString().split("T")[0];
  };

  const handleLMPChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      lmp_date: date,
      edd: calculateEDD(date),
    }));
  };

  const isFormValid = () => {
    return formData.resident_id && formData.lmp_date;
  };

  // Helper function to calculate age from date string
  const calculateAgeFromDOB = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: User, required: true },
    { id: "pregnancy", label: "Pregnancy", icon: Calendar, required: true },
    { id: "health", label: "Health Metrics", icon: HeartPulse },
    { id: "delivery", label: "Delivery", icon: Baby },
    { id: "notes", label: "Notes", icon: FileText },
  ];

  const getCurrentResident = () => {
    return residents.find(
      (r) =>
        r.resident_id === parseInt(formData.resident_id) ||
        r.resident_id === formData.resident_id
    );
  };

  const currentResident = getCurrentResident();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-6xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <HeartPulse className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Add Maternal Health Record
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                  <p className="text-white/80 text-sm">
                    Create a new maternal health record
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300 group backdrop-blur-sm"
              aria-label="Close modal"
            >
              <X
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar Navigation */}
          <div className="w-64 border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white p-6">
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Record Sections
              </h3>
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const isComplete =
                    tab.id === "basic"
                      ? formData.resident_id
                      : tab.id === "pregnancy"
                      ? formData.lmp_date
                      : true;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-white shadow-md border border-[#58A1D3]/20"
                          : "hover:bg-white/50 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg transition-colors ${
                            isActive
                              ? "bg-[#58A1D3] text-white"
                              : isComplete && !isActive
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600 group-hover:bg-[#58A1D3]/10"
                          }`}
                        >
                          {isComplete && !isActive ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Icon size={18} />
                          )}
                        </div>
                        <div className="text-left">
                          <span
                            className={`font-medium ${
                              isActive ? "text-[#0F4C81]" : "text-gray-700"
                            }`}
                          >
                            {tab.label}
                          </span>
                          {tab.required && (
                            <span className="text-xs text-red-500 ml-2">*</span>
                          )}
                        </div>
                      </div>
                      {isActive ? (
                        <ChevronRight className="text-[#58A1D3]" size={18} />
                      ) : isComplete ? (
                        <CheckCircle className="text-green-500" size={16} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Resident Info */}
            {currentResident && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <User className="text-blue-600 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      Selected Resident
                    </p>
                    <p className="text-xs text-blue-700">
                      {currentResident.first_name} {currentResident.last_name}
                    </p>
                    <p className="text-xs text-blue-600">
                      Age: {calculateAgeFromDOB(currentResident.date_of_birth)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
              <div className="flex items-start gap-3">
                <Info
                  className="text-amber-600 mt-0.5 flex-shrink-0"
                  size={16}
                />
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    Quick Tips
                  </p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li className="flex items-start gap-1">
                      <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Fields marked with * are required</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>LMP date will auto-calculate EDD</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>
                        Delivery info is optional for ongoing pregnancies
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-8">
              <form onSubmit={handleSubmit} id="maternal-form">
                {/* Basic Information Tab */}
                {activeTab === "basic" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <User className="w-6 h-6 text-[#0F4C81]" />
                        <h3 className="text-xl font-bold text-gray-900">
                          Select Resident
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Choose the pregnant resident to create a maternal health
                        record.
                      </p>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Resident <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                              value={formData.resident_id}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  resident_id: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200 bg-white appearance-none"
                              required
                            >
                              <option value="">
                                Select a resident from the list...
                              </option>
                              {residents.map((r) => {
                                // Check if this resident has an active record
                                const residentStatus = getResidentStatus(
                                  r.resident_id
                                );
                                const hasActiveRecord = !!residentStatus;

                                return (
                                  <option
                                    key={r.resident_id}
                                    value={r.resident_id}
                                    disabled={hasActiveRecord}
                                    className={
                                      hasActiveRecord
                                        ? "text-gray-400 bg-gray-100"
                                        : ""
                                    }
                                  >
                                    {r.first_name} {r.last_name}
                                    {hasActiveRecord
                                      ? ` (Has ${residentStatus})`
                                      : ` • Age: ${calculateAgeFromDOB(
                                          r.date_of_birth
                                        )} • ID: ${r.resident_id}`}
                                  </option>
                                );
                              })}
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 rotate-90 pointer-events-none" />
                          </div>
                          {formData.resident_id && (
                            <>
                              {getResidentStatus(formData.resident_id) ? (
                                <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100 animate-fadeIn">
                                  <div className="flex items-center gap-3">
                                    <AlertTriangle
                                      className="text-yellow-600 flex-shrink-0"
                                      size={20}
                                    />
                                    <div>
                                      <p className="text-sm font-medium text-yellow-800 mb-1">
                                        Resident has existing record
                                      </p>
                                      <p className="text-xs text-yellow-600">
                                        {getResidentName(formData.resident_id)}{" "}
                                        already has an active pregnancy record.
                                        Please select a different resident or
                                        edit the existing record.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100 animate-fadeIn">
                                  <div className="flex items-center gap-3">
                                    <CheckCircle
                                      className="text-green-600 flex-shrink-0"
                                      size={20}
                                    />
                                    <p className="text-sm text-green-800">
                                      Resident selected. You can proceed to the
                                      next section.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {currentResident && (
                          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              Resident Information
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Full Name</p>
                                <p className="font-medium text-gray-900">
                                  {currentResident.first_name}{" "}
                                  {currentResident.last_name}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Age</p>
                                <p className="font-medium text-gray-900">
                                  {calculateAgeFromDOB(
                                    currentResident.date_of_birth
                                  )}{" "}
                                  years
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Date of Birth</p>
                                <p className="font-medium text-gray-900">
                                  {formatDateForInput(
                                    currentResident.date_of_birth
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Gender</p>
                                <p className="font-medium text-gray-900">
                                  {currentResident.gender || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pregnancy Information Tab */}
                {activeTab === "pregnancy" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-6 h-6 text-[#0F4C81]" />
                        <h3 className="text-xl font-bold text-gray-900">
                          Pregnancy Details
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Enter pregnancy-related information.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            LMP Date (Last Menstrual Period){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="date"
                              value={formData.lmp_date}
                              onChange={(e) => handleLMPChange(e.target.value)}
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200"
                              required
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Date of last menstrual period
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            EDD (Estimated Delivery Date)
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="date"
                              value={formData.edd}
                              readOnly
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 bg-gray-50 rounded-xl text-gray-600"
                            />
                            {formData.edd && (
                              <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
                                Based on LMP (40 weeks)
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Prenatal Visits
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                              #
                            </div>
                            <input
                              type="number"
                              value={formData.prenatal_visits}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  prenatal_visits: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200"
                              min="0"
                              placeholder="Number of prenatal visits completed"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Number of prenatal checkups attended
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Health Metrics Tab */}
                {activeTab === "health" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <HeartPulse className="w-6 h-6 text-[#0F4C81]" />
                        <h3 className="text-xl font-bold text-gray-900">
                          Health Metrics
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Record current health measurements and medications.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Blood Pressure
                          </label>
                          <div className="relative">
                            <Activity className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="text"
                              value={formData.blood_pressure}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  blood_pressure: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200"
                              placeholder="e.g., 120/80 mmHg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Weight (kg)
                          </label>
                          <div className="relative">
                            <Weight className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="number"
                              value={formData.weight}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  weight: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200"
                              step="0.1"
                              min="0"
                              placeholder="Current weight in kilograms"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Hemoglobin (g/dL)
                          </label>
                          <div className="relative">
                            <Droplets className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="number"
                              value={formData.hemoglobin}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  hemoglobin: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200"
                              step="0.1"
                              min="0"
                              placeholder="Hemoglobin level"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-6 pt-4">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[#58A1D3]" />
                            Medications & Vaccinations
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#58A1D3]/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    formData.tetanus_vaccination
                                      ? "bg-green-100 text-green-600"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  <Syringe size={18} />
                                </div>
                                <div>
                                  <span className="font-medium text-gray-800 block">
                                    Tetanus Vaccination
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Protects against tetanus infection
                                  </span>
                                </div>
                              </div>
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={formData.tetanus_vaccination}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      tetanus_vaccination: e.target.checked,
                                    })
                                  }
                                  className="sr-only"
                                  id="tetanus"
                                />
                                <label
                                  htmlFor="tetanus"
                                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-200 ${
                                    formData.tetanus_vaccination
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                >
                                  <div
                                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                                      formData.tetanus_vaccination
                                        ? "translate-x-6"
                                        : "translate-x-0"
                                    }`}
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#58A1D3]/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    formData.iron_supplement
                                      ? "bg-green-100 text-green-600"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  <Pill size={18} />
                                </div>
                                <div>
                                  <span className="font-medium text-gray-800 block">
                                    Iron Supplement
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Prevents anemia during pregnancy
                                  </span>
                                </div>
                              </div>
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={formData.iron_supplement}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      iron_supplement: e.target.checked,
                                    })
                                  }
                                  className="sr-only"
                                  id="iron"
                                />
                                <label
                                  htmlFor="iron"
                                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-200 ${
                                    formData.iron_supplement
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                >
                                  <div
                                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                                      formData.iron_supplement
                                        ? "translate-x-6"
                                        : "translate-x-0"
                                    }`}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery Tab */}
                {activeTab === "delivery" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <Baby className="w-6 h-6 text-[#0F4C81]" />
                        <h3 className="text-xl font-bold text-gray-900">
                          Delivery Information
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Enter delivery details (optional for ongoing
                        pregnancies).
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Delivery Date
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="date"
                              value={formData.delivery_date}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  delivery_date: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Leave empty if pregnancy is ongoing
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Delivery Type
                          </label>
                          <div className="relative">
                            <select
                              value={formData.delivery_type}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  delivery_type: e.target.value,
                                })
                              }
                              className="w-full pl-4 pr-10 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200 appearance-none bg-white"
                            >
                              <option value="">Select delivery type...</option>
                              <option value="Normal">
                                Normal Vaginal Delivery
                              </option>
                              <option value="Cesarean">
                                Cesarean Section (C-section)
                              </option>
                              <option value="Assisted">
                                Assisted Vaginal Delivery
                              </option>
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 rotate-90 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Baby Weight (kg)
                          </label>
                          <div className="relative">
                            <Weight className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="number"
                              value={formData.baby_weight}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  baby_weight: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200"
                              step="0.1"
                              min="0"
                              placeholder="Baby's birth weight"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Complications
                          </label>
                          <div className="relative">
                            <AlertCircle className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                            <textarea
                              value={formData.complications}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  complications: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200 resize-none"
                              rows="4"
                              placeholder="Any complications during pregnancy or delivery. Leave empty if none."
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Document any complications or concerns
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === "notes" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-6 h-6 text-[#0F4C81]" />
                        <h3 className="text-xl font-bold text-gray-900">
                          Additional Notes
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Add any additional information, observations, or special
                        instructions.
                      </p>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Notes
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                          <textarea
                            value={formData.notes}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                notes: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200 resize-none"
                            rows="8"
                            placeholder="Enter any additional notes, observations, recommendations, or special instructions..."
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          This information will be included in the maternal
                          health record for future reference.
                        </p>
                      </div>
                    </div>

                    {/* Summary Preview */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-gray-600" />
                        Summary Preview
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Resident</p>
                          <p className="font-medium text-gray-900">
                            {currentResident
                              ? `${currentResident.first_name} ${currentResident.last_name}`
                              : "Not selected"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pregnancy Status</p>
                          <p className="font-medium text-gray-900">
                            {formData.delivery_date ? "Delivered" : "Ongoing"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">LMP Date</p>
                          <p className="font-medium text-gray-900">
                            {formData.lmp_date || "Not entered"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">EDD</p>
                          <p className="font-medium text-gray-900">
                            {formData.edd || "Not calculated"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer Navigation */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Progress:</span>
                    <div className="flex gap-1">
                      {tabs.map((tab) => (
                        <div
                          key={tab.id}
                          className={`w-2 h-2 rounded-full ${
                            tab.id === "basic" && formData.resident_id
                              ? "bg-green-500"
                              : tab.id === "pregnancy" && formData.lmp_date
                              ? "bg-green-500"
                              : tab.id === "health"
                              ? "bg-blue-500"
                              : tab.id === "delivery"
                              ? "bg-blue-500"
                              : tab.id === "notes"
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                          title={`${tab.label}: ${
                            tab.id === "basic" && formData.resident_id
                              ? "Complete"
                              : tab.id === "pregnancy" && formData.lmp_date
                              ? "Complete"
                              : "Pending"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {tabs.map((tab, index) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          activeTab === tab.id
                            ? "bg-[#58A1D3] scale-125"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                        aria-label={`Go to ${tab.label}`}
                      />
                    ))}
                  </div>

                  {activeTab !== "notes" ? (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = tabs.findIndex(
                          (t) => t.id === activeTab
                        );
                        if (currentIndex < tabs.length - 1) {
                          setActiveTab(tabs[currentIndex + 1].id);
                        }
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#58A1D3] to-[#0F4C81] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      form="maternal-form"
                      disabled={!isFormValid() || isSubmitting}
                      className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 ${
                        isFormValid()
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Maternal Record
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditMaternalRecordModal = ({
  setShowEditModal,
  handleEditMaternal,
  residents,
  addNotification,
  record,
}) => {
  const [formData, setFormData] = useState({
    resident_id: record.resident_id || "",
    lmp_date: formatDateForInput(record.lmp_date) || "",
    edd: formatDateForInput(record.edd) || "",
    prenatal_visits: record.prenatal_visits || "",
    blood_pressure: record.blood_pressure || "",
    weight: record.weight || "",
    hemoglobin: record.hemoglobin || "",
    tetanus_vaccination: record.tetanus_vaccination || false,
    iron_supplement: record.iron_supplement || false,
    complications: record.complications || "",
    delivery_date: formatDateForInput(record.delivery_date) || "",
    delivery_type: record.delivery_type || "",
    baby_weight: record.baby_weight || "",
    notes: record.notes || "",
  });

  // ADD THIS FUNCTION RIGHT HERE:
  const getResidentName = (residentId) => {
    const resident = residents.find(
      (r) =>
        r.resident_id === parseInt(residentId) || r.resident_id === residentId
    );
    return resident
      ? `${resident.first_name} ${resident.last_name}`
      : "Unknown Resident";
  };

  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.resident_id) {
      addNotification("error", "Validation Error", "Please select a resident");
      return;
    }

    setIsSubmitting(true);
    try {
      await handleEditMaternal(record.id, formData);
      setShowEditModal(false);
    } catch (error) {
      // Error handling is done in handleEditMaternal
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEDD = (lmpDate) => {
    if (!lmpDate) return "";
    const lmp = new Date(lmpDate);
    const edd = new Date(lmp);
    edd.setDate(edd.getDate() + 280); // 40 weeks from LMP
    return edd.toISOString().split("T")[0];
  };

  const handleLMPChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      lmp_date: date,
      edd: calculateEDD(date),
    }));
  };

  const isFormValid = () => {
    return formData.resident_id && formData.lmp_date;
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: User, required: true },
    { id: "pregnancy", label: "Pregnancy", icon: Calendar },
    { id: "health", label: "Health Metrics", icon: HeartPulse },
    { id: "delivery", label: "Delivery", icon: Baby },
    { id: "notes", label: "Notes", icon: FileText },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-6xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Edit2 className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Edit Maternal Health Record
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                  <p className="text-white/80 text-sm">
                    Editing record for {getResidentName(formData.resident_id)}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEditModal(false)}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300 group backdrop-blur-sm"
              aria-label="Close modal"
            >
              <X
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar Navigation */}
          <div className="w-64 border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white p-6">
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Edit Sections
              </h3>
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-white shadow-md border border-[#58A1D3]/20"
                          : "hover:bg-white/50 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg transition-colors ${
                            isActive
                              ? "bg-[#58A1D3] text-white"
                              : "bg-gray-100 text-gray-600 group-hover:bg-[#58A1D3]/10"
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="text-left">
                          <span
                            className={`font-medium ${
                              isActive ? "text-[#0F4C81]" : "text-gray-700"
                            }`}
                          >
                            {tab.label}
                          </span>
                          {tab.required && (
                            <span className="text-xs text-red-500 ml-2">*</span>
                          )}
                        </div>
                      </div>
                      {isActive && (
                        <ChevronRight className="text-[#58A1D3]" size={18} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <Info
                  className="text-blue-600 mt-0.5 flex-shrink-0"
                  size={16}
                />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Quick Tips
                  </p>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li className="flex items-start gap-1">
                      <div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>LMP date will auto-calculate EDD</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <div className="w-1 h-1 bg-blue-400 rounded-full mt=1.5 flex-shrink-0"></div>
                      <span>
                        Changes are saved immediately when you click Update
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Record Status */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-gray-600 w-4 h-4" />
                <span className="text-sm font-medium text-gray-700">
                  Record Status
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Created:</span>
                  <span className="text-xs font-medium text-gray-700">
                    {record.created_at
                      ? new Date(record.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Last Updated:</span>
                  <span className="text-xs font-medium text-gray-700">
                    {new Date(record.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-8">
              <form onSubmit={handleSubmit} id="edit-maternal-form">
                {/* Basic Information Tab */}
                {activeTab === "basic" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <User className="w-6 h-6 text-[#0F4C81]" />
                        <h3 className="text-xl font-bold text-gray-900">
                          Resident Information
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Update the resident for this maternal health record.
                      </p>

                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Resident <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <select
                            value={formData.resident_id}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                resident_id: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200 bg-white appearance-none"
                            required
                          >
                            <option value="">Select a resident...</option>
                            {residents.map((r) => (
                              <option key={r.resident_id} value={r.resident_id}>
                                {r.first_name} {r.last_name} • ID:{" "}
                                {r.resident_id}
                              </option>
                            ))}
                          </select>
                          <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>
                        {formData.resident_id && (
                          <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100 animate-fadeIn">
                            <div className="flex items-center gap-3">
                              <CheckCircle
                                className="text-green-600 flex-shrink-0"
                                size={20}
                              />
                              <div>
                                <p className="text-sm font-medium text-green-800 mb-1">
                                  Currently assigned to{" "}
                                  {getResidentName(formData.resident_id)}
                                </p>
                                <p className="text-xs text-green-600">
                                  Select a different resident if needed
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pregnancy Information Tab */}
                {activeTab === "pregnancy" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-6 h-6 text-[#0F4C81]" />
                        <h3 className="text-xl font-bold text-gray-900">
                          Pregnancy Details
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Update pregnancy-related information.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            LMP Date (Last Menstrual Period){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="date"
                              value={formData.lmp_date}
                              onChange={(e) => handleLMPChange(e.target.value)}
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            EDD (Estimated Delivery Date)
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="date"
                              value={formData.edd}
                              readOnly
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 bg-gray-50 rounded-xl text-gray-600"
                            />
                            {formData.edd && (
                              <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
                                Auto-calculated based on LMP
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Prenatal Visits
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                              #
                            </div>
                            <input
                              type="number"
                              value={formData.prenatal_visits}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  prenatal_visits: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200"
                              min="0"
                              placeholder="Number of visits"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Health Metrics Tab */}
                {activeTab === "health" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <HeartPulse className="w-6 h-6 text-[#0F4C81]" />
                        <h3 className="text-xl font-bold text-gray-900">
                          Health Metrics
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Update health measurements and medication status.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Blood Pressure
                          </label>
                          <div className="relative">
                            <Activity className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="text"
                              value={formData.blood_pressure}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  blood_pressure: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200"
                              placeholder="e.g., 120/80 mmHg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Weight
                          </label>
                          <div className="relative">
                            <Weight className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="number"
                              value={formData.weight}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  weight: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200"
                              step="0.1"
                              min="0"
                              placeholder="Weight in kilograms"
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                              kg
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Hemoglobin
                          </label>
                          <div className="relative">
                            <Droplets className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="number"
                              value={formData.hemoglobin}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  hemoglobin: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200"
                              step="0.1"
                              min="0"
                              placeholder="Hemoglobin level"
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                              g/dL
                            </span>
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-4 pt-4">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[#58A1D3]" />
                            Medications & Vaccinations
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#58A1D3]/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <Syringe className="w-5 h-5 text-gray-600" />
                                <span className="font-medium text-gray-800">
                                  Tetanus Vaccination
                                </span>
                              </div>
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={formData.tetanus_vaccination}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      tetanus_vaccination: e.target.checked,
                                    })
                                  }
                                  className="sr-only"
                                  id="edit-tetanus"
                                />
                                <label
                                  htmlFor="edit-tetanus"
                                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-200 ${
                                    formData.tetanus_vaccination
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                >
                                  <div
                                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                                      formData.tetanus_vaccination
                                        ? "translate-x-6"
                                        : "translate-x-0"
                                    }`}
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-[#58A1D3]/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <Pill className="w-5 h-5 text-gray-600" />
                                <span className="font-medium text-gray-800">
                                  Iron Supplement
                                </span>
                              </div>
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={formData.iron_supplement}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      iron_supplement: e.target.checked,
                                    })
                                  }
                                  className="sr-only"
                                  id="edit-iron"
                                />
                                <label
                                  htmlFor="edit-iron"
                                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-200 ${
                                    formData.iron_supplement
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                >
                                  <div
                                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                                      formData.iron_supplement
                                        ? "translate-x-6"
                                        : "translate-x-0"
                                    }`}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery Tab */}
                {activeTab === "delivery" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <Baby className="w-6 h-6 text-[#0F4C81]" />
                        <h3 className="text-xl font-bold text-gray-900">
                          Delivery Information
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Update delivery details (if applicable).
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Delivery Date
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="date"
                              value={formData.delivery_date}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  delivery_date: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Delivery Type
                          </label>
                          <div className="relative">
                            <select
                              value={formData.delivery_type}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  delivery_type: e.target.value,
                                })
                              }
                              className="w-full pl-4 pr-10 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200 appearance-none bg-white"
                            >
                              <option value="">Select type...</option>
                              <option value="Normal">Normal Delivery</option>
                              <option value="Cesarean">Cesarean Section</option>
                              <option value="Assisted">
                                Assisted Delivery
                              </option>
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 rotate-90 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Baby Weight
                          </label>
                          <div className="relative">
                            <Weight className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="number"
                              value={formData.baby_weight}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  baby_weight: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200"
                              step="0.1"
                              min="0"
                              placeholder="Baby's birth weight"
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                              kg
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Complications
                        </label>
                        <div className="relative">
                          <AlertCircle className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                          <textarea
                            value={formData.complications}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                complications: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200 resize-none"
                            rows="4"
                            placeholder="Any complications during pregnancy or delivery..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === "notes" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-6 h-6 text-[#0F4C81]" />
                        <h3 className="text-xl font-bold text-gray-900">
                          Additional Notes
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Update any additional information or observations.
                      </p>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Notes
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                          <textarea
                            value={formData.notes}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                notes: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-2 focus:ring-[#58A1D3]/20 transition-all duration-200 resize-none"
                            rows="6"
                            placeholder="Enter any additional notes, observations, or recommendations..."
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          This information will be updated in the maternal
                          health record.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer Navigation */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      Required fields:
                    </span>
                    <div className="flex gap-1">
                      {tabs.map((tab) => (
                        <div
                          key={tab.id}
                          className={`w-2 h-2 rounded-full ${
                            tab.required
                              ? formData.resident_id
                                ? "bg-green-500"
                                : "bg-red-500"
                              : "bg-gray-300"
                          }`}
                          title={tab.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {tabs.map((tab, index) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          activeTab === tab.id
                            ? "bg-[#58A1D3] scale-125"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                        aria-label={`Go to ${tab.label}`}
                      />
                    ))}
                  </div>

                  {activeTab !== "notes" ? (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = tabs.findIndex(
                          (t) => t.id === activeTab
                        );
                        if (currentIndex < tabs.length - 1) {
                          setActiveTab(tabs[currentIndex + 1].id);
                        }
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#58A1D3] to-[#0F4C81] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      form="edit-maternal-form"
                      disabled={!isFormValid() || isSubmitting}
                      className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 ${
                        isFormValid()
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Update Record
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Replace the entire function with this simplified version:

const CreateImmunizationRecordModal = ({
  setShowCreateModal,
  handleCreateImmunization,
  residents,
  addNotification,
  calculateAgeFromDOB, // ADD THIS
  vaccineOptions, // ADD THIS
  existingRecords, // <--- Receive this prop
}) => {
  const [formData, setFormData] = useState({
    child_resident_id: "",
    mother_resident_id: "",
    parent_name: "",
    father_name: "",
    mother_name: "",
    vaccine_name: "",
    date_given: "",
    batch_no: "",
    next_dose_date: "",
    given_by: "",
    adverse_reactions: "",
    notes: "",
  });

  // NEW HELPER: Get list of vaccines this child already has
  const getTakenVaccines = () => {
    if (!formData.child_resident_id) return [];

    return existingRecords
      .filter(
        (r) =>
          r.child_resident_id == formData.child_resident_id && // Match child
          r.vaccine_name // Ensure vaccine name exists
      )
      .map((r) => r.vaccine_name.toLowerCase()); // Return array of vaccine names
  };

  const takenVaccines = getTakenVaccines();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedMother, setSelectedMother] = useState(null);

  // Filter for children 5 years old and below (standard for immunization tracking)
  const childResidents = residents.filter((r) => {
    if (!r.date_of_birth) return true; // Include if DOB is missing
    const age = calculateAgeFromDOB(r.date_of_birth);
    return typeof age === "number" ? age <= 5 : true; // Changed to 5 years and below
  });

  // Filter for potential mothers (18+ years old, Female)
  const motherResidents = residents.filter((r) => {
    if (!r.date_of_birth) return r.gender === "Female";
    const age = calculateAgeFromDOB(r.date_of_birth);
    return typeof age === "number" ? age >= 18 && r.gender === "Female" : false;
  });

  // REPLACE the existing handleChildChange function with this:
  const handleChildChange = (childId) => {
    const child = residents.find((r) => r.resident_id == childId);
    setSelectedChild(child);

    if (child) {
      // Find parents using the new function
      const { father, mother, guardian } = findParentsForChild(child);

      // Update form data with found parents
      setFormData((prev) => ({
        ...prev,
        child_resident_id: childId,
        father_name: father ? `${father.first_name} ${father.last_name}` : "",
        mother_name: mother ? `${mother.first_name} ${mother.last_name}` : "",
        mother_resident_id: mother ? mother.resident_id : "",
        parent_name: guardian
          ? `${guardian.first_name} ${guardian.last_name}`
          : "",
      }));

      // If mother found, pre-select her
      if (mother) {
        setSelectedMother(mother);
      }
    } else {
      // Reset form if no child selected
      setFormData((prev) => ({
        ...prev,
        child_resident_id: childId,
        father_name: "",
        mother_name: "",
        mother_resident_id: "",
        parent_name: "",
      }));
      setSelectedMother(null);
    }
  };

  // Add this function after handleChildChange:
  const handleMotherChange = (motherId) => {
    const mother = residents.find((r) => r.resident_id == motherId);
    setSelectedMother(mother);

    if (mother) {
      setFormData((prev) => ({
        ...prev,
        mother_resident_id: motherId,
        mother_name: `${mother.first_name} ${mother.last_name}`,
        // Update parent/guardian name if not already set
        parent_name:
          prev.parent_name || `${mother.first_name} ${mother.last_name}`,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.child_resident_id) {
      newErrors.child_resident_id = "Please select a child";
    }

    // Modified logic for vaccine validation
    if (!formData.vaccine_name?.trim()) {
      newErrors.vaccine_name = "Vaccine name is required";
    } else if (
      formData.vaccine_name === "other" &&
      !formData.custom_vaccine?.trim()
    ) {
      newErrors.custom_vaccine = "Please specify the vaccine name";
    }

    if (formData.date_given) {
      const givenDate = new Date(formData.date_given);
      if (givenDate > new Date()) {
        newErrors.date_given = "Date given cannot be in the future";
      }
    }

    if (formData.next_dose_date && formData.date_given) {
      const givenDate = new Date(formData.date_given);
      const nextDoseDate = new Date(formData.next_dose_date);
      if (nextDoseDate <= givenDate) {
        newErrors.next_dose_date =
          "Next dose date must be after the given date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      addNotification(
        "error",
        "Validation Error",
        "Please check the form for errors"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a copy of the data to submit
      const submissionData = { ...formData };

      // If "other" is selected, use the custom input value
      if (submissionData.vaccine_name === "other") {
        submissionData.vaccine_name = submissionData.custom_vaccine;
      }

      // Remove the temporary custom_vaccine field before sending
      delete submissionData.custom_vaccine;

      await handleCreateImmunization(submissionData);
      setShowCreateModal(false);
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.child_resident_id && formData.vaccine_name?.trim();
  };

  // Add this function inside CreateImmunizationRecordModal, after the state declarations:
  const findParentsForChild = (child) => {
    if (!child || !child.household_id) {
      return { father: null, mother: null, guardian: null };
    }

    // Get all residents in the same household
    const householdMembers = residents.filter(
      (r) => r.household_id === child.household_id
    );

    let father = null;
    let mother = null;
    let guardian = null;

    // Try to find parents using relationship field if it exists
    householdMembers.forEach((member) => {
      if (member.relationship) {
        const relationship = member.relationship.toLowerCase();
        if (relationship.includes("father") || relationship.includes("dad")) {
          father = member;
        }
        if (relationship.includes("mother") || relationship.includes("mom")) {
          mother = member;
        }
        if (
          relationship.includes("guardian") ||
          relationship.includes("parent")
        ) {
          guardian = member;
        }
      }
    });

    // Fallback: If no relationship field, use age and gender
    if (!father) {
      const adultMales = householdMembers.filter((m) => {
        if (m.resident_id === child.resident_id) return false; // Exclude child
        if (m.gender !== "Male") return false;
        if (!m.date_of_birth) return true;
        const age = calculateAgeFromDOB(m.date_of_birth);
        return typeof age === "number" && age >= 18;
      });
      father = adultMales[0] || null;
    }

    if (!mother) {
      const adultFemales = householdMembers.filter((m) => {
        if (m.resident_id === child.resident_id) return false; // Exclude child
        if (m.gender !== "Female") return false;
        if (!m.date_of_birth) return true;
        const age = calculateAgeFromDOB(m.date_of_birth);
        return typeof age === "number" && age >= 18;
      });
      mother = adultFemales[0] || null;
    }

    // Set guardian as mother by default, or father if no mother
    guardian = mother || father || null;

    return { father, mother, guardian };
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-5xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Syringe className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Add Child Immunization Record
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                  <p className="text-white/80 text-sm">
                    Record vaccination details for a child
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300 group backdrop-blur-sm"
              aria-label="Close modal"
            >
              <X
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(90vh-120px)]">
          <div className="flex-1 overflow-y-auto p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Child Selection Section */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Child Information
                  </h3>
                  <span className="text-sm text-red-500">* Required</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Child <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={formData.child_resident_id}
                        onChange={(e) => handleChildChange(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                          errors.child_resident_id
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-[#58A1D3] focus:ring-[#58A1D3]/20"
                        } rounded-xl transition-all duration-200 bg-white appearance-none`}
                        required
                      >
                        <option value="">Select a child...</option>
                        {childResidents.map((r) => {
                          // Check if child already has this specific vaccine (you already have this logic)
                          // Also check if they have ANY immunization record
                          const hasAnyImmunization = existingRecords.some(
                            (record) =>
                              String(record.child_resident_id) ===
                              String(r.resident_id)
                          );

                          return (
                            <option
                              key={r.resident_id}
                              value={r.resident_id}
                              disabled={hasAnyImmunization} // Optional: disable if they have any record
                              className={
                                hasAnyImmunization
                                  ? "text-gray-400 bg-gray-50"
                                  : ""
                              }
                            >
                              {r.first_name} {r.last_name} • Age:{" "}
                              {calculateAgeFromDOB(r.date_of_birth)} • ID:{" "}
                              {r.resident_id}
                              {hasAnyImmunization
                                ? " (Has existing immunization)"
                                : ""}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 rotate-90 pointer-events-none" />
                    </div>
                    {errors.child_resident_id && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.child_resident_id}
                      </p>
                    )}
                  </div>

                  {selectedChild && (
                    <div className="md:col-span-2">
                      <div className="p-4 bg-white rounded-xl border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Selected Child Details
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Name</p>
                            <p className="font-medium text-gray-900">
                              {selectedChild.first_name}{" "}
                              {selectedChild.last_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Age</p>
                            <p className="font-medium text-gray-900">
                              {calculateAgeFromDOB(selectedChild.date_of_birth)}{" "}
                              years
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Date of Birth</p>
                            <p className="font-medium text-gray-900">
                              {formatDateForInput(selectedChild.date_of_birth)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Gender</p>
                            <p className="font-medium text-gray-900">
                              {selectedChild.gender || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Parent Information Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Parent/Guardian Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mother
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={formData.mother_resident_id}
                        onChange={(e) => {
                          const mother = residents.find(
                            (r) => r.resident_id == e.target.value
                          );
                          setSelectedMother(mother);
                          setFormData((prev) => ({
                            ...prev,
                            mother_resident_id: e.target.value,
                            mother_name: mother
                              ? `${mother.first_name} ${mother.last_name}`
                              : "",
                          }));
                        }}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-[#58A1D3]/20 transition-all duration-200 bg-white appearance-none"
                      >
                        <option value="">Select mother (optional)...</option>
                        {motherResidents.map((r) => (
                          <option key={r.resident_id} value={r.resident_id}>
                            {r.first_name} {r.last_name} • Age:{" "}
                            {calculateAgeFromDOB(r.date_of_birth)}
                          </option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.father_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            father_name: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-[#58A1D3]/20 transition-all duration-200"
                        placeholder="Father's name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent/Guardian
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.parent_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            parent_name: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-[#58A1D3]/20 transition-all duration-200"
                        placeholder="Primary parent/guardian name"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vaccine Details Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <Syringe className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Vaccine Details
                  </h3>
                  <span className="text-sm text-red-500">* Required</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vaccine Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Syringe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={formData.vaccine_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vaccine_name: e.target.value,
                          }))
                        }
                        className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                          errors.vaccine_name
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-[#58A1D3] focus:ring-[#58A1D3]/20"
                        } rounded-xl transition-all duration-200 bg-white appearance-none`}
                        required
                        disabled={!formData.child_resident_id} // Optional: Disable if no child selected
                      >
                        <option value="">Select vaccine...</option>
                        {vaccineOptions.map((vaccine, index) => {
                          // Check if child already has this specific vaccine
                          const isTaken = takenVaccines.includes(
                            vaccine.toLowerCase()
                          );

                          return (
                            <option
                              key={index}
                              value={vaccine}
                              disabled={isTaken}
                              className={
                                isTaken ? "text-gray-400 bg-gray-50" : ""
                              }
                            >
                              {vaccine} {isTaken ? "(Already Received)" : ""}
                            </option>
                          );
                        })}
                        <option value="other">Other (Specify Below)</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 rotate-90 pointer-events-none" />
                    </div>
                    {errors.vaccine_name && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.vaccine_name}
                      </p>
                    )}

                    {/* NEW: Conditional Input for "Other" */}
                    {formData.vaccine_name === "other" && (
                      <div className="mt-3 animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specify Vaccine Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Syringe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={formData.custom_vaccine || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                custom_vaccine: e.target.value,
                              }))
                            }
                            className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                              errors.custom_vaccine
                                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:border-[#58A1D3] focus:ring-[#58A1D3]/20"
                            } rounded-xl transition-all duration-200`}
                            placeholder="Enter specific vaccine name"
                          />
                        </div>
                        {errors.custom_vaccine && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.custom_vaccine}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Number
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.batch_no}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            batch_no: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-[#58A1D3]/20 transition-all duration-200"
                        placeholder="e.g., BATCH-12345"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Given
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={formData.date_given}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            date_given: e.target.value,
                          }))
                        }
                        max={new Date().toISOString().split("T")[0]}
                        className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                          errors.date_given
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-[#58A1D3] focus:ring-[#58A1D3]/20"
                        } rounded-xl transition-all duration-200`}
                      />
                      {errors.date_given && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.date_given}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Next Dose Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={formData.next_dose_date}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            next_dose_date: e.target.value,
                          }))
                        }
                        min={
                          formData.date_given ||
                          new Date().toISOString().split("T")[0]
                        }
                        className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                          errors.next_dose_date
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-[#58A1D3] focus:ring-[#58A1D3]/20"
                        } rounded-xl transition-all duration-200`}
                      />
                      {errors.next_dose_date && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.next_dose_date}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Administered By
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.given_by}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            given_by: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-[#58A1D3]/20 transition-all duration-200"
                        placeholder="Healthcare provider name"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Additional Information
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adverse Reactions
                    </label>
                    <div className="relative">
                      <AlertCircle className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                      <textarea
                        value={formData.adverse_reactions}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            adverse_reactions: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-[#58A1D3]/20 transition-all duration-200 resize-none"
                        rows="3"
                        placeholder="Any adverse reactions or side effects observed. Leave empty if none."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-[#58A1D3]/20 transition-all duration-200 resize-none"
                        rows="3"
                        placeholder="Additional notes, observations, or special instructions..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Preview */}
              {selectedChild && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Info className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Summary Preview
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Child</p>
                      <p className="font-medium text-gray-900">
                        {selectedChild.first_name} {selectedChild.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Age</p>
                      <p className="font-medium text-gray-900">
                        {calculateAgeFromDOB(selectedChild.date_of_birth)} years
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Vaccine</p>
                      <p className="font-medium text-gray-900">
                        {formData.vaccine_name || "Not selected"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date Given</p>
                      <p className="font-medium text-gray-900">
                        {formData.date_given || "Not scheduled"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">
                            Form Status:
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isFormValid()
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {isFormValid() ? "Ready to Save" : "Incomplete"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Required fields:
                  </span>
                  <div className="flex gap-1">
                    {["child_resident_id", "vaccine_name"].map((field) => (
                      <div
                        key={field}
                        className={`w-2 h-2 rounded-full ${
                          field === "child_resident_id" && formData[field]
                            ? "bg-green-500"
                            : field === "vaccine_name" &&
                              formData[field]?.trim()
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                        title={
                          field === "child_resident_id"
                            ? "Child selected"
                            : "Vaccine name entered"
                        }
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isSubmitting}
                  className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 ${
                    isFormValid() && !isSubmitting
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Immunization Record
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditImmunizationRecordModal = ({
  setShowEditModal,
  handleEditImmunization,
  residents,
  addNotification,
  record,
  calculateAgeFromDOB, // ADD THIS
  vaccineOptions, // ADD THIS
}) => {
  const [formData, setFormData] = useState({
    child_resident_id: record.child_resident_id || "",
    mother_resident_id: record.mother_resident_id || "",
    parent_name: record.parent_name || "",
    father_name: record.father_name || "",
    mother_name: record.mother_name || "",
    vaccine_name: record.vaccine_name || "",
    date_given: formatDateForInput(record.date_given) || "",
    batch_no: record.batch_no || "",
    next_dose_date: formatDateForInput(record.next_dose_date) || "",
    given_by: record.given_by || "",
    adverse_reactions: record.adverse_reactions || "",
    notes: record.notes || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Filter for children 5 years old and below (standard for immunization tracking)
  const childResidents = residents.filter((r) => {
    if (!r.date_of_birth) return true; // Include if DOB is missing
    const age = calculateAgeFromDOB(r.date_of_birth);
    return typeof age === "number" ? age <= 5 : true; // Changed to 5 years and below
  });

  // Filter for potential mothers (18+ years old, Female)
  const motherResidents = residents.filter((r) => {
    if (!r.date_of_birth) return r.gender === "Female";
    const age = calculateAgeFromDOB(r.date_of_birth);
    return typeof age === "number" ? age >= 18 && r.gender === "Female" : false;
  });

  const selectedChild = residents.find(
    (r) => r.resident_id == formData.child_resident_id
  );
  const selectedMother = residents.find(
    (r) => r.resident_id == formData.mother_resident_id
  );

  const handleChildChange = (childId) => {
    const child = residents.find((r) => r.resident_id == childId);

    if (child) {
      // Find household members
      const householdMembers = residents.filter(
        (r) => r.household_id === child.household_id
      );

      // Find parents
      const father = householdMembers.find((r) => r.gender === "Male");
      const mother = householdMembers.find((r) => r.gender === "Female");

      setFormData((prev) => ({
        ...prev,
        child_resident_id: childId,
        parent_name: mother
          ? `${mother.first_name} ${mother.last_name}`
          : prev.parent_name,
        father_name: father
          ? `${father.first_name} ${father.last_name}`
          : prev.father_name,
        mother_name: mother
          ? `${mother.first_name} ${mother.last_name}`
          : prev.mother_name,
        mother_resident_id: mother
          ? mother.resident_id
          : prev.mother_resident_id,
      }));
    }
  };

  // Add this function after handleChildChange:
  const handleMotherChange = (motherId) => {
    const mother = residents.find((r) => r.resident_id == motherId);

    if (mother) {
      setFormData((prev) => ({
        ...prev,
        mother_resident_id: motherId,
        mother_name: `${mother.first_name} ${mother.last_name}`,
        // Update parent/guardian name if not already set
        parent_name:
          prev.parent_name || `${mother.first_name} ${mother.last_name}`,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.child_resident_id) {
      newErrors.child_resident_id = "Please select a child";
    }

    if (!formData.vaccine_name?.trim()) {
      newErrors.vaccine_name = "Vaccine name is required";
    }

    if (formData.date_given && new Date(formData.date_given) > new Date()) {
      newErrors.date_given = "Date given cannot be in the future";
    }

    if (formData.next_dose_date && formData.date_given) {
      const givenDate = new Date(formData.date_given);
      const nextDoseDate = new Date(formData.next_dose_date);
      if (nextDoseDate <= givenDate) {
        newErrors.next_dose_date =
          "Next dose date must be after the given date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      addNotification(
        "error",
        "Validation Error",
        "Please check the form for errors"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await handleEditImmunization(record.id, formData);
      setShowEditModal(false);
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.child_resident_id && formData.vaccine_name?.trim();
  };

  // Helper to get resident name from ID
  const getResidentName = (residentId) => {
    const resident = residents.find((r) => r.resident_id == residentId);
    return resident
      ? `${resident.first_name} ${resident.last_name}`
      : "Unknown";
  };

  // Add this helper function inside EditImmunizationRecordModal, after state declarations:
  const findParentsForChild = (child) => {
    if (!child || !child.household_id) {
      return { father: null, mother: null, guardian: null };
    }

    // Get all residents in the same household
    const householdMembers = residents.filter(
      (r) => r.household_id === child.household_id
    );

    let father = null;
    let mother = null;
    let guardian = null;

    // Try to find parents using relationship field if it exists
    householdMembers.forEach((member) => {
      if (member.relationship) {
        const relationship = member.relationship.toLowerCase();
        if (relationship.includes("father") || relationship.includes("dad")) {
          father = member;
        }
        if (relationship.includes("mother") || relationship.includes("mom")) {
          mother = member;
        }
        if (
          relationship.includes("guardian") ||
          relationship.includes("parent")
        ) {
          guardian = member;
        }
      }
    });

    // Fallback: If no relationship field, use age and gender
    if (!father) {
      const adultMales = householdMembers.filter((m) => {
        if (m.resident_id === child.resident_id) return false; // Exclude child
        if (m.gender !== "Male") return false;
        if (!m.date_of_birth) return true;
        const age = calculateAgeFromDOB(m.date_of_birth);
        return typeof age === "number" && age >= 18;
      });
      father = adultMales[0] || null;
    }

    if (!mother) {
      const adultFemales = householdMembers.filter((m) => {
        if (m.resident_id === child.resident_id) return false; // Exclude child
        if (m.gender !== "Female") return false;
        if (!m.date_of_birth) return true;
        const age = calculateAgeFromDOB(m.date_of_birth);
        return typeof age === "number" && age >= 18;
      });
      mother = adultFemales[0] || null;
    }

    // Set guardian as mother by default, or father if no mother
    guardian = mother || father || null;

    return { father, mother, guardian };
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-5xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Edit2 className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Edit Child Immunization Record
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                  <p className="text-white/80 text-sm">
                    Editing immunization record for {record.child_name}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEditModal(false)}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300 group backdrop-blur-sm"
              aria-label="Close modal"
            >
              <X
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(90vh-120px)]">
          <div className="flex-1 overflow-y-auto p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Record Info Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      Editing Record
                    </p>
                    <p className="text-xs text-blue-700">
                      Original record created on{" "}
                      {formatDateForInput(record.created_at)} • Last updated on{" "}
                      {formatDateForInput(record.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-700">
                      Record ID: {record.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Child Selection Section */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Child Information
                  </h3>
                  <span className="text-sm text-red-500">* Required</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Child <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={formData.child_resident_id}
                        onChange={(e) => handleChildChange(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                          errors.child_resident_id
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-[#58A1D3] focus:ring-[#58A1D3]/20"
                        } rounded-xl transition-all duration-200 bg-white appearance-none`}
                        required
                      >
                        <option value="">Select a child...</option>
                        {childResidents.map((r) => (
                          <option key={r.resident_id} value={r.resident_id}>
                            {r.first_name} {r.last_name} • Age:{" "}
                            {calculateAgeFromDOB(r.date_of_birth)} • ID:{" "}
                            {r.resident_id}
                          </option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 rotate-90 pointer-events-none" />
                    </div>
                    {errors.child_resident_id && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.child_resident_id}
                      </p>
                    )}
                  </div>

                  {selectedChild && (
                    <div className="md:col-span-2">
                      <div className="p-4 bg-white rounded-xl border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Selected Child Details
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Name</p>
                            <p className="font-medium text-gray-900">
                              {selectedChild.first_name}{" "}
                              {selectedChild.last_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Age</p>
                            <p className="font-medium text-gray-900">
                              {calculateAgeFromDOB(selectedChild.date_of_birth)}{" "}
                              years
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Date of Birth</p>
                            <p className="font-medium text-gray-900">
                              {formatDateForInput(selectedChild.date_of_birth)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Gender</p>
                            <p className="font-medium text-gray-900">
                              {selectedChild.gender || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Parent Information Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Parent/Guardian Information
                  </h3>
                  <span className="text-xs text-gray-500">(Auto-filled)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mother
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.mother_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            mother_name: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-[#58A1D3]/20 transition-all duration-200 bg-gray-50"
                        placeholder="Mother's name"
                        readOnly
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-filled based on household
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.father_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            father_name: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-[#58A1D3]/20 transition-all duration-200 bg-gray-50"
                        placeholder="Father's name"
                        readOnly
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-filled based on household
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent/Guardian
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.parent_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            parent_name: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-[#58A1D3]/20 transition-all duration-200"
                        placeholder="Primary parent/guardian name"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Primary contact person (editable)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Different Mother (Optional)
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={formData.mother_resident_id}
                        onChange={(e) => handleMotherChange(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-[#58A1D3]/20 transition-all duration-200 bg-white appearance-none"
                      >
                        <option value="">
                          Select different mother (optional)...
                        </option>
                        {motherResidents.map((r) => (
                          <option key={r.resident_id} value={r.resident_id}>
                            {r.first_name} {r.last_name} • Age:{" "}
                            {calculateAgeFromDOB(r.date_of_birth)}
                          </option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 rotate-90 pointer-events-none" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Use this if the auto-filled mother is incorrect
                    </p>
                  </div>
                </div>
              </div>

              {/* Vaccine Details Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <Syringe className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Vaccine Details
                  </h3>
                  <span className="text-sm text-red-500">* Required</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vaccine Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Syringe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={formData.vaccine_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vaccine_name: e.target.value,
                          }))
                        }
                        className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                          errors.vaccine_name
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-[#58A1D3] focus:ring-[#58A1D3]/20"
                        } rounded-xl transition-all duration-200 bg-white appearance-none`}
                        required
                      >
                        <option value="">Select vaccine...</option>
                        {vaccineOptions.map((vaccine, index) => (
                          <option key={index} value={vaccine}>
                            {vaccine}
                          </option>
                        ))}
                        <option value="other">Other (specify below)</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 rotate-90 pointer-events-none" />
                    </div>
                    {errors.vaccine_name && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.vaccine_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Number
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.batch_no}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            batch_no: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-[#58A1D3]/20 transition-all duration-200"
                        placeholder="e.g., BATCH-12345"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Given
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={formData.date_given}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            date_given: e.target.value,
                          }))
                        }
                        max={new Date().toISOString().split("T")[0]}
                        className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                          errors.date_given
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-[#58A1D3] focus:ring-[#58A1D3]/20"
                        } rounded-xl transition-all duration-200`}
                      />
                      {errors.date_given && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.date_given}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Next Dose Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={formData.next_dose_date}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            next_dose_date: e.target.value,
                          }))
                        }
                        min={
                          formData.date_given ||
                          new Date().toISOString().split("T")[0]
                        }
                        className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                          errors.next_dose_date
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-[#58A1D3] focus:ring-[#58A1D3]/20"
                        } rounded-xl transition-all duration-200`}
                      />
                      {errors.next_dose_date && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.next_dose_date}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Administered By
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.given_by}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            given_by: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-[#58A1D3]/20 transition-all duration-200"
                        placeholder="Healthcare provider name"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adverse Reactions
                    </label>
                    <div className="relative">
                      <AlertCircle className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                      <textarea
                        value={formData.adverse_reactions}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            adverse_reactions: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-[#58A1D3]/20 transition-all duration-200 resize-none"
                        rows="3"
                        placeholder="Any adverse reactions or side effects observed. Leave empty if none."
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:border-[#58A1D3] focus:ring-[#58A1D3]/20 transition-all duration-200 resize-none"
                        rows="3"
                        placeholder="Additional notes, observations, or special instructions..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Preview */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Update Summary
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Child</p>
                    <p className="font-medium text-gray-900">
                      {getResidentName(formData.child_resident_id)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Vaccine</p>
                    <p className="font-medium text-gray-900">
                      {formData.vaccine_name || "Not selected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-medium text-gray-900">
                      {formData.date_given ? "Vaccinated" : "Scheduled"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Next Dose</p>
                    <p className="font-medium text-gray-900">
                      {formData.next_dose_date || "No next dose scheduled"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">
                          Form Status:
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isFormValid()
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {isFormValid() ? "Ready to Update" : "Incomplete"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Validation:</span>
                  <div className="flex gap-1">
                    {Object.keys(errors).length === 0 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-xs text-gray-600">
                      {Object.keys(errors).length === 0
                        ? "All valid"
                        : `${Object.keys(errors).length} error(s)`}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isSubmitting}
                  className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 ${
                    isFormValid() && !isSubmitting
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Update Immunization Record
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MaternalChildHealthPage = () => {
  const { residents, calculateAge } = useOutletContext();
  const [maternalRecords, setMaternalRecords] = useState([]);
  const [immunizationRecords, setImmunizationRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [showReportSelection, setShowReportSelection] = useState(false);
  const [currentReportType, setCurrentReportType] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [purokOptions, setPurokOptions] = useState([]);

  // ADD THESE HELPER FUNCTIONS HERE (inside the component)
  const calculateAgeFromDOB = (dob) => {
    if (!dob) return "N/A";
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age;
    } catch (error) {
      return "N/A";
    }
  };

  const vaccineOptions = [
    "BCG",
    "Hepatitis B",
    "Pentavalent (DPT-HepB-Hib)",
    "Oral Polio Vaccine (OPV)",
    "Inactivated Polio Vaccine (IPV)",
    "Pneumococcal Conjugate Vaccine (PCV)",
    "Measles, Mumps, Rubella (MMR)",
    "Rotavirus",
    "Influenza",
    "Varicella (Chickenpox)",
    "Tetanus Toxoid (TT)",
    "COVID-19 Vaccine",
    "Other",
  ];

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
  const [selectedMaternalRecord, setSelectedMaternalRecord] = useState(null);
  const [selectedImmunizationRecord, setSelectedImmunizationRecord] =
    useState(null);
  const [showMaternalCreate, setShowMaternalCreate] = useState(false);
  const [showImmunizationCreate, setShowImmunizationCreate] = useState(false);
  const [showMaternalEdit, setShowMaternalEdit] = useState(false);
  const [showImmunizationEdit, setShowImmunizationEdit] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [editMaternalRecord, setEditMaternalRecord] = useState(null);
  const [editImmunizationRecord, setEditImmunizationRecord] = useState(null);

  // Load purok options for reports
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
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
    loadPurokOptions();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const maternalRes = await maternalHealthAPI.getAll();
        const immunizationRes = await childImmunizationAPI.getAll();
        if (maternalRes.success) {
          setMaternalRecords(maternalRes.data || []);
        }
        if (immunizationRes.success) {
          setImmunizationRecords(immunizationRes.data || []);
        }
      } catch (error) {
        addNotification(
          "error",
          "Load Failed",
          "Failed to fetch health records"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const filteredMaternalRecords = maternalRecords.filter(
    (record) =>
      record.resident_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.lmp_date && record.lmp_date.includes(searchQuery)) ||
      (record.edd && record.edd.includes(searchQuery))
  );

  const filteredImmunizationRecords = immunizationRecords.filter(
    (record) =>
      record.child_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.vaccine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.date_given && record.date_given.includes(searchQuery))
  );

  // Report generation functions
  const handleGenerateMaternalChildHealthReport = async (filters) => {
    try {
      const response = await reportsAPI.generateMaternalChildHealth(filters);
      if (response.success) {
        if (filters.preview) {
          return response.data;
        } else {
          // Generate actual report file
          generateReportFile(response.data, "Maternal & Child Health Report", [
            { key: "record_type", label: "Record Type", type: "text" },
            { key: "full_name", label: "Full Name", type: "text" },
            { key: "age", label: "Age", type: "number" },
            { key: "gender", label: "Gender", type: "text" },
            { key: "purok", label: "Purok", type: "text" },
            { key: "pregnancy_status", label: "Status/Vaccine", type: "text" },
            {
              key: "expected_delivery_date",
              label: "Date/Expected Date",
              type: "date",
            },
            { key: "antenatal_visits", label: "Visits/Dose", type: "number" },
            { key: "record_date", label: "Record Date", type: "date" },
          ]);
          addNotification(
            "success",
            "Report Generated",
            "Maternal & child health report has been generated successfully"
          );
        }
      }
    } catch (error) {
      addNotification(
        "error",
        "Report Failed",
        error.message || "Failed to generate maternal & child health report"
      );
      throw error;
    }
  };

  const generateReportFile = (data, title, columns) => {
    // Import jsPDF dynamically
    import("jspdf")
      .then(({ default: jsPDF }) => {
        import("jspdf-autotable").then(({ default: autoTable }) => {
          // Use landscape orientation for better column display
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
          doc.text("Municipality of Macrohon", pageWidth / 2, 22, {
            align: "center",
          });

          // Add barangay header
          doc.setFontSize(14);
          doc.setFont(undefined, "bold");
          doc.text(
            "BARANGAY MATERNAL & CHILD HEALTH RECORDS",
            pageWidth / 2,
            30,
            { align: "center" }
          );

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
            margin: { left: 14, right: 14 },
            tableWidth: "auto",
            columnStyles: {
              0: { halign: "center" }, // Record Type or Resident Name
              1: { halign: "center" }, // LMP Date or other
              2: { halign: "center" }, // EDD or Age
              3: { halign: "center" }, // Prenatal Visits or Gender
              4: { halign: "center" }, // Weight or Purok
              5: { halign: "center" }, // Blood Pressure or Status
              6: { halign: "center" }, // Status or Date
              7: { halign: "center" }, // Record Date
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
          const filename = `${title.replace(/\s+/g, "_")}_${
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

  const openReportGenerator = () => {
    setShowReportSelection(true);
  };

  const handleReportSelection = (reportId) => {
    setSelectedReportId(reportId);
    setShowReportSelection(false);

    // Determine the report type based on selection
    if (reportId === "maternal") {
      setCurrentReportType("maternal");
    } else if (reportId === "child-immunization") {
      setCurrentReportType("child-immunization");
    } else if (reportId === "combined") {
      setCurrentReportType("combined");
    }

    setShowReportGenerator(true);
  };

  const handleCreateMaternal = async (data) => {
    try {
      console.log("📤 Sending maternal data to API:", data);
      console.log("📤 Data types:", {
        resident_id: typeof data.resident_id,
        tetanus_vaccination: typeof data.tetanus_vaccination,
        iron_supplement: typeof data.iron_supplement,
      });

      const res = await maternalHealthAPI.create(data);
      console.log("✅ API Response:", res);

      if (res.success) {
        // Try to find resident for the name
        const resident = residents.find(
          (r) => r.resident_id === Number(data.resident_id)
        );

        // If we can't find the resident, use data from response
        const newRecord = res.data || {
          ...data,
          id: res.data?.id,
          resident_name: resident
            ? `${resident.first_name} ${resident.last_name}`
            : `Resident ID: ${data.resident_id}`,
          updated_at: new Date().toISOString(),
        };

        setMaternalRecords((prev) => [...prev, newRecord]);
        addNotification("success", "Success", "Maternal health record created");
      }
    } catch (error) {
      console.error("❌ Create Failed - Full error:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);

      addNotification(
        "error",
        "Create Failed",
        error.response?.data?.message ||
          error.message ||
          "Failed to create record"
      );
    }
  };

  const handleEditMaternal = async (id, data) => {
    try {
      const res = await maternalHealthAPI.update(id, data);
      if (res.success) {
        const resident = residents.find(
          (r) => r.resident_id === data.resident_id
        );
        const updatedRecord = {
          ...data,
          id,
          resident_name: `${resident.first_name} ${resident.last_name}`,
          updated_at: new Date().toISOString(),
        };
        setMaternalRecords((prev) =>
          prev.map((record) => (record.id === id ? updatedRecord : record))
        );
        addNotification("success", "Success", "Maternal health record updated");
      }
    } catch (error) {
      addNotification(
        "error",
        "Update Failed",
        error.message || "Failed to update record"
      );
    }
  };

  const handleCreateImmunization = async (data) => {
    try {
      console.log("Creating immunization with data:", data);
      const res = await childImmunizationAPI.create(data);
      console.log("API response:", res);
      if (res.success) {
        const child = residents.find(
          (r) => r.resident_id === Number(data.child_resident_id)
        );
        const mother = residents.find(
          (r) => r.resident_id === Number(data.mother_resident_id)
        );
        if (!child) {
          console.error(
            "Child resident not found for ID:",
            data.child_resident_id
          );
          addNotification(
            "error",
            "Create Failed",
            "Selected child resident not found"
          );
          return;
        }
        const newRecord = {
          ...data,
          id: res.data.id,
          child_name: `${child.first_name} ${child.last_name}`,
          mother_name: mother
            ? `${mother.first_name} ${mother.last_name}`
            : "N/A",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setImmunizationRecords((prev) => [...prev, newRecord]);
        addNotification("success", "Success", "Immunization record created");
      }
    } catch (error) {
      console.error("Create immunization error:", error);
      addNotification(
        "error",
        "Create Failed",
        error.message || "Failed to create record"
      );
    }
  };

  const handleEditImmunization = async (id, data) => {
    try {
      const res = await childImmunizationAPI.update(id, data);
      if (res.success) {
        const child = residents.find(
          (r) => r.resident_id === Number(data.child_resident_id)
        );
        const mother = residents.find(
          (r) => r.resident_id === Number(data.mother_resident_id)
        );
        if (!child) {
          console.error(
            "Child resident not found for ID:",
            data.child_resident_id
          );
          addNotification(
            "error",
            "Update Failed",
            "Selected child resident not found"
          );
          return;
        }
        const updatedRecord = {
          ...data,
          id,
          child_name: `${child.first_name} ${child.last_name}`,
          mother_name: mother
            ? `${mother.first_name} ${mother.last_name}`
            : "N/A",
          updated_at: new Date().toISOString(),
        };
        setImmunizationRecords((prev) =>
          prev.map((record) => (record.id === id ? updatedRecord : record))
        );
        addNotification("success", "Success", "Immunization record updated");
      }
    } catch (error) {
      console.error("Update immunization error:", error);
      addNotification(
        "error",
        "Update Failed",
        error.message || "Failed to update record"
      );
    }
  };

  const handleDeleteMaternal = async (id) => {
    try {
      const res = await maternalHealthAPI.delete(id);
      if (res.success) {
        setMaternalRecords((prev) => prev.filter((r) => r.id !== id));
        addNotification("success", "Success", "Maternal health record deleted");
      }
    } catch (error) {
      addNotification(
        "error",
        "Delete Failed",
        error.message || "Failed to delete record"
      );
    }
    setRecordToDelete(null);
  };

  const handleDeleteImmunization = async (id) => {
    try {
      const res = await childImmunizationAPI.delete(id);
      if (res.success) {
        setImmunizationRecords((prev) => prev.filter((r) => r.id !== id));
        addNotification("success", "Success", "Immunization record deleted");
      }
    } catch (error) {
      addNotification(
        "error",
        "Delete Failed",
        error.message || "Failed to delete record"
      );
    }
    setRecordToDelete(null);
  };

  const proceedDelete = () => {
    if (deleteType === "maternal") {
      handleDeleteMaternal(recordToDelete.id);
    } else {
      handleDeleteImmunization(recordToDelete.id);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Loading records...</div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Hero Section (matching Captain Dashboard style) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F4C81] via-[#58A1D3] to-[#B3DEF8] p-8 text-white shadow-2xl">
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
                <Baby size={32} className="text-yellow-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                  <span className="text-cyan-200 text-sm font-medium tracking-widest">
                    MATERNAL & CHILD HEALTH
                  </span>
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                </div>
                <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">
                  Maternal & Child Care
                </h2>
                <p className="text-cyan-100 text-lg">
                  Comprehensive healthcare management for mothers and children
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#0F4C81]">
          Maternal & Child Health
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3]"
            />
          </div>
          <button
            onClick={() => openReportGenerator("maternal-child-health")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 w-full sm:w-auto"
          >
            <FileText size={16} />
            <span>Generate Report</span>
          </button>
          <button
            onClick={() => setShowMaternalCreate(true)}
            className="px-4 py-2 bg-[#58A1D3] text-white rounded-lg hover:bg-[#0F4C81] flex items-center space-x-2 w-full sm:w-auto"
          >
            <Plus size={16} />
            <span>Add Maternal Record</span>
          </button>
          <button
            onClick={() => setShowImmunizationCreate(true)}
            className="px-4 py-2 bg-[#58A1D3] text-white rounded-lg hover:bg-[#0F4C81] flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Immunization Record</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Baby className="text-[#58A1D3]" size={20} />
          <span>Maternal Health Records</span>
        </h3>
        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-[85vh] overflow-y-auto overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse table-auto md:table-fixed">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white">
                  <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm">
                    Resident Name
                  </th>
                  <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                    LMP Date
                  </th>
                  <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                    EDD
                  </th>
                  <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                    Prenatal Visits
                  </th>
                  <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                    Weight(kg)
                  </th>
                  <th className="py-4 px-2 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81]">
                    Blood Pressure
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
                {filteredMaternalRecords.length > 0 ? (
                  filteredMaternalRecords.map((record) => (
                    <tr key={record.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        {record.resident_name}
                      </td>
                      <td className="py-3 px-4">
                        {formatDateForInput(record.lmp_date || "N/A")}
                      </td>
                      <td className="py-3 px-4">
                        {formatDateForInput(record.edd || "N/A")}
                      </td>
                      <td className="py-3 px-4">
                        {record.prenatal_visits || "N/A"}
                      </td>
                      <td className="py-3 px-4">{record.weight}</td>
                      <td className="py-3 px-4">{record.blood_pressure}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            record.delivery_date
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {record.delivery_date ? "Delivered" : "Ongoing"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => setSelectedMaternalRecord(record)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setEditMaternalRecord(record);
                              setShowMaternalEdit(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => {
                              setRecordToDelete(record);
                              setDeleteType("maternal");
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No maternal health records found.{" "}
                      {searchQuery && "Try adjusting your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card Layout - Maternal Health */}
        <div className="lg:hidden bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-[85vh] overflow-y-auto">
            {filteredMaternalRecords.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredMaternalRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2 shadow-md">
                          <Baby size={16} className="text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-[#0F4C81] text-base">
                            {record.resident_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Maternal Record
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          record.delivery_date
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        }`}
                      >
                        {record.delivery_date ? "Delivered" : "Ongoing"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">LMP Date:</span>
                        <span className="font-medium text-gray-900">
                          {formatDateForInput(record.lmp_date || "N/A")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">EDD:</span>
                        <span className="font-medium text-gray-900">
                          {formatDateForInput(record.edd || "N/A")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prenatal Visits:</span>
                        <span className="font-medium text-gray-900">
                          {record.prenatal_visits || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight:</span>
                        <span className="font-medium text-gray-900">
                          {record.weight}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Blood Pressure:</span>
                        <span className="font-medium text-gray-900">
                          {record.blood_pressure}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setSelectedMaternalRecord(record)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => {
                          setEditMaternalRecord(record);
                          setShowMaternalEdit(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setRecordToDelete(record);
                          setDeleteType("maternal");
                        }}
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
                  <Baby size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-600 text-xl font-semibold mb-2">
                  No maternal health records found
                </p>
                <p className="text-gray-500 text-sm">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "No records available"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Syringe className="text-[#58A1D3]" size={20} />
          <span>Child Immunization Records</span>
        </h3>
        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-[85vh] overflow-y-auto overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white">
                  <th className="py-3 px-3 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[120px]">
                    Child Name
                  </th>
                  <th className="py-3 px-3 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[100px]">
                    Vaccine
                  </th>
                  <th className="py-3 px-3 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[100px]">
                    Date Given
                  </th>
                  <th className="py-3 px-3 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[100px]">
                    Next Dose
                  </th>
                  <th className="py-3 px-3 text-left font-semibold border-r border-white/20 sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[100px]">
                    Given By
                  </th>
                  <th className="py-3 px-3 text-center font-semibold sticky top-0 z-10 bg-[#0F4C81] whitespace-nowrap text-xs sm:text-sm min-w-[100px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredImmunizationRecords.length > 0 ? (
                  filteredImmunizationRecords.map((record) => (
                    <tr key={record.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium text-xs sm:text-sm whitespace-nowrap">
                        {record.child_name}
                      </td>
                      <td className="py-3 px-3 text-xs sm:text-sm whitespace-nowrap">
                        {record.vaccine_name}
                      </td>
                      <td className="py-3 px-3 text-xs sm:text-sm whitespace-nowrap">
                        {formatDateForInput(record.date_given || "N/A")}
                      </td>
                      <td className="py-3 px-3 text-xs sm:text-sm whitespace-nowrap">
                        {formatDateForInput(record.next_dose_date || "N/A")}
                      </td>
                      <td className="py-3 px-3 text-xs sm:text-sm whitespace-nowrap">
                        {record.given_by || "N/A"}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() =>
                              setSelectedImmunizationRecord(record)
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setEditImmunizationRecord(record);
                              setShowImmunizationEdit(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => {
                              setRecordToDelete(record);
                              setDeleteType("immunization");
                            }}
                            title="Delete"
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
                      colSpan={6}
                      className="py-8 text-center text-gray-500 text-xs sm:text-sm"
                    >
                      No child immunization records found.{" "}
                      {searchQuery && "Try adjusting your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card Layout - Child Immunization */}
        <div className="lg:hidden bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-[85vh] overflow-y-auto">
            {filteredImmunizationRecords.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredImmunizationRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2 shadow-md">
                          <Syringe size={16} className="text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-[#0F4C81] text-base">
                            {record.child_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Immunization Record
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vaccine:</span>
                        <span className="font-medium text-gray-900">
                          {record.vaccine_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date Given:</span>
                        <span className="font-medium text-gray-900">
                          {formatDateForInput(record.date_given || "N/A")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Dose:</span>
                        <span className="font-medium text-gray-900">
                          {formatDateForInput(record.next_dose_date || "N/A")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Given By:</span>
                        <span className="font-medium text-gray-900">
                          {record.given_by || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setSelectedImmunizationRecord(record)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => {
                          setEditImmunizationRecord(record);
                          setShowImmunizationEdit(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setRecordToDelete(record);
                          setDeleteType("immunization");
                        }}
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
                  <Syringe size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-600 text-xl font-semibold mb-2">
                  No immunization records found
                </p>
                <p className="text-gray-500 text-sm">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "No records available"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedMaternalRecord && (
        <ViewMaternalRecordModal
          selectedRecord={selectedMaternalRecord}
          setSelectedRecord={setSelectedMaternalRecord}
          calculateAge={calculateAge}
        />
      )}
      {selectedImmunizationRecord && (
        <ViewImmunizationRecordModal
          selectedRecord={selectedImmunizationRecord}
          setSelectedRecord={setSelectedImmunizationRecord}
          calculateAge={calculateAge}
        />
      )}
      {showMaternalCreate && (
        <CreateMaternalRecordModal
          setShowCreateModal={setShowMaternalCreate}
          handleCreateMaternal={handleCreateMaternal}
          residents={residents}
          addNotification={addNotification}
          existingRecords={maternalRecords}
        />
      )}
      {showMaternalEdit && editMaternalRecord && (
        <EditMaternalRecordModal
          setShowEditModal={setShowMaternalEdit}
          handleEditMaternal={handleEditMaternal}
          residents={residents}
          addNotification={addNotification}
          record={editMaternalRecord}
        />
      )}
      {showImmunizationCreate && (
        <CreateImmunizationRecordModal
          setShowCreateModal={setShowImmunizationCreate}
          handleCreateImmunization={handleCreateImmunization}
          residents={residents}
          addNotification={addNotification}
          calculateAgeFromDOB={calculateAgeFromDOB} // ADD THIS
          vaccineOptions={vaccineOptions} // ADD THIS
          existingRecords={immunizationRecords}
        />
      )}
      {showImmunizationEdit && editImmunizationRecord && (
        <EditImmunizationRecordModal
          setShowEditModal={setShowImmunizationEdit}
          handleEditImmunization={handleEditImmunization}
          residents={residents}
          addNotification={addNotification}
          record={editImmunizationRecord}
          calculateAgeFromDOB={calculateAgeFromDOB} // ADD THIS
          vaccineOptions={vaccineOptions} // ADD THIS
        />
      )}
      {recordToDelete && (
        <ConfirmationModal
          record={recordToDelete}
          onConfirm={proceedDelete}
          onCancel={() => setRecordToDelete(null)}
          type={deleteType === "maternal" ? "maternal health" : "immunization"}
        />
      )}

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />

      {/* Report Selection Modal */}
      {showReportSelection && (
        <ReportSelectionModal
          onSelectReport={handleReportSelection}
          onClose={() => setShowReportSelection(false)}
        />
      )}

      {/* Maternal Records Report */}
      {showReportGenerator && currentReportType === "maternal" && (
        <ReportGenerator
          reportType="maternal"
          title="Maternal Records Report"
          icon={HeartPulse}
          onGenerate={(filters) =>
            handleGenerateMaternalChildHealthReport({
              ...filters,
              recordType: "Maternal",
            })
          }
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
          ]}
          columns={[
            { key: "full_name", label: "Mother Name", type: "text" },
            { key: "age", label: "Age", type: "number" },
            { key: "purok", label: "Purok", type: "text" },
            {
              key: "pregnancy_status",
              label: "Pregnancy Status",
              type: "text",
            },
            {
              key: "expected_delivery_date",
              label: "Expected Delivery Date",
              type: "date",
            },
            {
              key: "antenatal_visits",
              label: "Prenatal Visits",
              type: "number",
            },
            { key: "record_date", label: "Record Date", type: "date" },
          ]}
        />
      )}

      {/* Child Immunization Report */}
      {showReportGenerator && currentReportType === "child-immunization" && (
        <ReportGenerator
          reportType="child-immunization"
          title="Child Immunization Report"
          icon={Syringe}
          onGenerate={(filters) =>
            handleGenerateMaternalChildHealthReport({
              ...filters,
              recordType: "Child Immunization",
            })
          }
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
          ]}
          columns={[
            { key: "full_name", label: "Child Name", type: "text" },
            { key: "mother_name", label: "Mother's Name", type: "text" },
            { key: "age", label: "Age", type: "number" },
            { key: "vaccine_name", label: "Vaccine Name", type: "text" },
            { key: "date_given", label: "Date Given", type: "date" },
            { key: "batch_no", label: "Batch Number", type: "text" },
            { key: "next_dose_date", label: "Next Dose Date", type: "date" },
            { key: "given_by", label: "Given By", type: "text" },
            {
              key: "adverse_reactions",
              label: "Adverse Reactions",
              type: "text",
            },
            { key: "record_date", label: "Record Date", type: "date" },
          ]}
        />
      )}

      {/* Combined Report */}
      {showReportGenerator && currentReportType === "combined" && (
        <ReportGenerator
          reportType="combined"
          title="Combined Maternal & Child Health Report"
          icon={Baby}
          onGenerate={(filters) =>
            handleGenerateMaternalChildHealthReport({
              ...filters,
              recordType: "",
            })
          }
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
          ]}
          columns={[
            { key: "record_type", label: "Record Type", type: "text" },
            { key: "full_name", label: "Full Name", type: "text" },
            { key: "age", label: "Age", type: "number" },
            { key: "gender", label: "Gender", type: "text" },
            { key: "purok", label: "Purok", type: "text" },
            { key: "pregnancy_status", label: "Status/Vaccine", type: "text" },
            {
              key: "expected_delivery_date",
              label: "EDD/Vaccination Date",
              type: "date",
            },
            { key: "antenatal_visits", label: "Visits/Dose", type: "number" },
            { key: "record_date", label: "Record Date", type: "date" },
          ]}
        />
      )}
    </div>
  );
};

export default MaternalChildHealthPage;

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
  const id = "maternal-child-float-styles";
  if (!document.getElementById(id)) {
    const styleEl = document.createElement("style");
    styleEl.id = id;
    styleEl.appendChild(document.createTextNode(styles));
    document.head.appendChild(styleEl);
  }
}
