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
  User,
  Home,
  Settings,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  Check,
  Droplet,
  Scale,
  Activity,
  Droplets,
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

  const formatPregnancyDuration = (lmpDate) => {
    if (!lmpDate) return "N/A";
    const lmp = new Date(lmpDate);
    const today = new Date();
    const diffMs = today - lmp;
    const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
    const days = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24)
    );
    return `${weeks} weeks ${days} days`;
  };

  const getStatusColor = (status) => {
    if (selectedRecord.delivery_date) {
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        icon: "✓",
        label: "Delivered",
      };
    } else if (
      selectedRecord.edd &&
      new Date(selectedRecord.edd) < new Date()
    ) {
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
        icon: "⚠",
        label: "Past Due",
      };
    } else {
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        icon: "🤰",
        label: "Pregnant",
      };
    }
  };

  const status = getStatusColor(selectedRecord.delivery_date);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-6xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] via-[#3A7BC0] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-cyan-400/30 rounded-full blur-sm"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <HeartPulse size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Maternal Health Record
                </h2>
                <p className="text-cyan-100/80 text-sm">
                  Complete medical details and history
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`px-4 py-2 ${status.bg} ${status.text} ${status.border} rounded-full flex items-center gap-2 font-medium`}
              >
                <span>{status.icon}</span>
                {status.label}
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300 group"
              >
                <X
                  size={24}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Patient Summary Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <User size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedRecord.resident_name}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span className="font-medium">
                        {residentAge} years old
                      </span>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Home size={16} />
                      <span className="font-medium">
                        Resident ID: {selectedRecord.resident_id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/80 rounded-xl p-4 border border-blue-100 text-center">
                  <p className="text-sm text-gray-600 mb-1">Pregnancy Weeks</p>
                  <p className="text-xl font-bold text-[#0F4C81]">
                    {formatPregnancyDuration(selectedRecord.lmp_date)}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border border-blue-100 text-center">
                  <p className="text-sm text-gray-600 mb-1">Prenatal Visits</p>
                  <p className="text-xl font-bold text-[#0F4C81]">
                    {selectedRecord.prenatal_visits || "0"}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border border-blue-100 text-center">
                  <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                  <p className="text-sm font-bold text-gray-800">
                    {new Date(selectedRecord.updated_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Pregnancy Information */}
            <div className="space-y-8">
              {/* Pregnancy Timeline */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-purple-800">
                    Pregnancy Timeline
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-md">
                      <Calendar className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">
                        Last Menstrual Period (LMP)
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatDateForInput(selectedRecord.lmp_date) ||
                          "Not recorded"}
                      </p>
                    </div>
                  </div>

                  <div className="relative ml-6">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 to-pink-400"></div>
                    <div className="flex items-center mb-8 ml-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center z-10 shadow-md">
                        <Calendar className="text-white" size={18} />
                      </div>
                      <div className="flex-1 ml-4">
                        <p className="text-sm text-gray-600 mb-1">
                          Expected Delivery Date (EDD)
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatDateForInput(selectedRecord.edd) ||
                            "Not calculated"}
                        </p>
                      </div>
                    </div>

                    {selectedRecord.delivery_date && (
                      <div className="flex items-center ml-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center z-10 shadow-md">
                          <Calendar className="text-white" size={18} />
                        </div>
                        <div className="flex-1 ml-4">
                          <p className="text-sm text-gray-600 mb-1">
                            Actual Delivery Date
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatDateForInput(selectedRecord.delivery_date)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Health Metrics */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-emerald-600 to-green-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-emerald-800">
                    Health Metrics
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/80 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-400 rounded-lg flex items-center justify-center">
                        <Scale size={16} className="text-white" />
                      </div>
                      <p className="text-sm text-gray-600">Weight</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedRecord.weight
                        ? `${selectedRecord.weight} kg`
                        : "Not recorded"}
                    </p>
                  </div>

                  <div className="bg-white/80 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-400 rounded-lg flex items-center justify-center">
                        <Droplet size={16} className="text-white" />
                      </div>
                      <p className="text-sm text-gray-600">Blood Pressure</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedRecord.blood_pressure || "Not recorded"}
                    </p>
                  </div>

                  <div className="bg-white/80 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-400 rounded-lg flex items-center justify-center">
                        <Activity size={16} className="text-white" />
                      </div>
                      <p className="text-sm text-gray-600">Hemoglobin</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedRecord.hemoglobin
                        ? `${selectedRecord.hemoglobin} g/dL`
                        : "Not recorded"}
                    </p>
                  </div>

                  <div className="bg-white/80 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-400 rounded-lg flex items-center justify-center">
                        <Activity size={16} className="text-white" />
                      </div>
                      <p className="text-sm text-gray-600">Prenatal Visits</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedRecord.prenatal_visits || "0"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Medical Details */}
            <div className="space-y-8">
              {/* Vaccinations & Supplements */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-amber-600 to-orange-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-amber-800">
                    Vaccinations & Supplements
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${
                          selectedRecord.tetanus_vaccination
                            ? "bg-gradient-to-br from-emerald-400 to-green-400"
                            : "bg-gradient-to-br from-gray-300 to-gray-400"
                        } rounded-xl flex items-center justify-center`}
                      >
                        {selectedRecord.tetanus_vaccination ? (
                          <Check size={20} className="text-white" />
                        ) : (
                          <X size={20} className="text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Tetanus Vaccination
                        </p>
                        <p className="text-sm text-gray-600">
                          Recommended for all pregnant women
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedRecord.tetanus_vaccination
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedRecord.tetanus_vaccination
                        ? "Completed"
                        : "Not Given"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${
                          selectedRecord.iron_supplement
                            ? "bg-gradient-to-br from-emerald-400 to-green-400"
                            : "bg-gradient-to-br from-gray-300 to-gray-400"
                        } rounded-xl flex items-center justify-center`}
                      >
                        {selectedRecord.iron_supplement ? (
                          <Check size={20} className="text-white" />
                        ) : (
                          <X size={20} className="text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Iron Supplement
                        </p>
                        <p className="text-sm text-gray-600">
                          Prevents anemia during pregnancy
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedRecord.iron_supplement
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedRecord.iron_supplement ? "Taking" : "Not Taking"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Information (Conditional) */}
              {selectedRecord.delivery_date && (
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-gradient-to-b from-cyan-600 to-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-bold text-cyan-800">
                      Delivery Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/80 rounded-xl p-4 border border-cyan-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-cyan-600" />
                        <p className="text-sm text-gray-600">Delivery Date</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {formatDateForInput(selectedRecord.delivery_date)}
                      </p>
                    </div>

                    <div className="bg-white/80 rounded-xl p-4 border border-cyan-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity size={16} className="text-cyan-600" />
                        <p className="text-sm text-gray-600">Delivery Type</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedRecord.delivery_type}
                      </p>
                    </div>

                    <div className="bg-white/80 rounded-xl p-4 border border-cyan-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale size={16} className="text-cyan-600" />
                        <p className="text-sm text-gray-600">Baby Weight</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedRecord.baby_weight
                          ? `${selectedRecord.baby_weight} kg`
                          : "Not recorded"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Complications & Notes */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-gray-600 to-slate-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Medical Notes
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle size={18} className="text-gray-600" />
                      <p className="font-medium text-gray-900">Complications</p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 border border-gray-200 min-h-[100px]">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedRecord.complications ||
                          "No complications reported"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText size={18} className="text-gray-600" />
                      <p className="font-medium text-gray-900">
                        Additional Notes
                      </p>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 border border-gray-200 min-h-[100px]">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedRecord.notes || "No additional notes"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Record Metadata */}
              <div className="bg-gradient-to-r from-slate-50 to-zinc-50 rounded-2xl p-6 border border-slate-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-500" />
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium text-gray-800 ml-auto">
                      {new Date(selectedRecord.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw size={14} className="text-gray-500" />
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium text-gray-800 ml-auto">
                      {new Date(selectedRecord.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-8 mt-8 border-t border-gray-200">
            <button
              onClick={() => setSelectedRecord(null)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                // This would be handled by parent component
                setSelectedRecord(null);
                // Navigate to edit mode
              }}
              className="px-6 py-3 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 font-medium"
            >
              <div className="flex items-center gap-2">
                <Edit2 size={18} />
                Edit Record
              </div>
            </button>
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-4xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[80vh] overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">
                Child Immunization Details
              </h2>
            </div>
            <button
              onClick={() => setSelectedRecord(null)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 font-medium">Child Name</p>
              <p className="font-semibold">{selectedRecord.child_name}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Age</p>
              <p className="font-semibold">{childAge}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Mother's Name</p>
              <p className="font-semibold">
                {selectedRecord.mother_name || "N/A"}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-500 font-medium">Vaccine Name</p>
              <p className="font-semibold">{selectedRecord.vaccine_name}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Date Given</p>
              <p className="font-semibold">
                {formatDateForInput(selectedRecord.date_given || "N/A")}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Batch Number</p>
              <p className="font-semibold">
                {selectedRecord.batch_no || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Next Dose Date</p>
              <p className="font-semibold">
                {formatDateForInput(selectedRecord.next_dose_date || "N/A")}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Given By</p>
              <p className="font-semibold">
                {selectedRecord.given_by || "N/A"}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-500 font-medium">Adverse Reactions</p>
              <p className="font-semibold">
                {selectedRecord.adverse_reactions || "None"}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-500 font-medium">Notes</p>
              <p className="font-semibold">{selectedRecord.notes || "N/A"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-500 font-medium">Created at</p>
              <p className="font-semibold">
                {formatDateForInput(selectedRecord.created_at || "N/A")}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-500 font-medium">Last Updated</p>
              <p className="font-semibold">
                {new Date(selectedRecord.updated_at).toLocaleDateString()}
              </p>
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.resident_id) {
      newErrors.resident_id = "Please select a resident";
    }

    if (
      formData.blood_pressure &&
      !/^\d{2,3}\/\d{2,3}$/.test(formData.blood_pressure)
    ) {
      newErrors.blood_pressure = "Use format: 120/80";
    }

    if (formData.weight && (formData.weight < 30 || formData.weight > 200)) {
      newErrors.weight = "Weight must be between 30-200 kg";
    }

    if (
      formData.hemoglobin &&
      (formData.hemoglobin < 7 || formData.hemoglobin > 20)
    ) {
      newErrors.hemoglobin = "Hemoglobin must be between 7-20 g/dL";
    }

    if (formData.lmp_date && formData.edd) {
      const lmp = new Date(formData.lmp_date);
      const edd = new Date(formData.edd);
      if (edd <= lmp) {
        newErrors.edd = "EDD must be after LMP date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      addNotification("error", "Validation Error", "Please correct the errors");
      return;
    }

    setIsSubmitting(true);
    try {
      await handleCreateMaternal(formData);
      setShowCreateModal(false);
      // Reset form
      setFormData({
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-5xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] via-[#3A7BC0] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-cyan-400/30 rounded-full blur-sm"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Add Maternal Health Record
                </h2>
                <p className="text-cyan-100/80 text-sm">
                  Fill in the maternal health information
                </p>
              </div>
            </div>
            <button
              onClick={() => !isSubmitting && setShowCreateModal(false)}
              disabled={isSubmitting}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="flex-1 overflow-y-auto px-1">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-[#0F4C81] to-[#58A1D3] rounded-full"></div>
                  <h3 className="text-lg font-bold text-[#0F4C81]">
                    Personal Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Resident *
                    </label>
                    <select
                      value={formData.resident_id}
                      onChange={(e) =>
                        handleInputChange("resident_id", e.target.value)
                      }
                      className={`w-full p-3 border ${
                        errors.resident_id
                          ? "border-red-300 ring-2 ring-red-100"
                          : "border-gray-300"
                      } rounded-xl focus:ring-2 focus:ring-[#58A1D3] focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200`}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select Resident</option>
                      {residents.map((r) => (
                        <option key={r.resident_id} value={r.resident_id}>
                          {r.first_name} {r.last_name} • ID: {r.resident_id} •{" "}
                          {r.gender} • {calculateAge(r.date_of_birth)}y
                        </option>
                      ))}
                    </select>
                    {errors.resident_id && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                        <X size={14} />
                        {errors.resident_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pregnancy Information Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-purple-800">
                    Pregnancy Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      LMP Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.lmp_date}
                        onChange={(e) =>
                          handleInputChange("lmp_date", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                        disabled={isSubmitting}
                      />
                      <div className="absolute right-3 top-3">
                        <Calendar className="text-gray-400" size={18} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      EDD
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.edd}
                        onChange={(e) =>
                          handleInputChange("edd", e.target.value)
                        }
                        className={`w-full p-3 border ${
                          errors.edd
                            ? "border-red-300 ring-2 ring-red-100"
                            : "border-gray-300"
                        } rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm`}
                        disabled={isSubmitting}
                      />
                      <div className="absolute right-3 top-3">
                        <Calendar className="text-gray-400" size={18} />
                      </div>
                    </div>
                    {errors.edd && (
                      <p className="mt-2 text-sm text-red-600">{errors.edd}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prenatal Visits
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.prenatal_visits}
                        onChange={(e) =>
                          handleInputChange("prenatal_visits", e.target.value)
                        }
                        className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                        min="0"
                        max="20"
                        placeholder="0"
                        disabled={isSubmitting}
                      />
                      <div className="absolute left-3 top-3">
                        <Activity className="text-gray-400" size={18} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Blood Pressure
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.blood_pressure}
                        onChange={(e) =>
                          handleInputChange("blood_pressure", e.target.value)
                        }
                        className={`w-full p-3 pl-10 border ${
                          errors.blood_pressure
                            ? "border-red-300 ring-2 ring-red-100"
                            : "border-gray-300"
                        } rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm`}
                        placeholder="120/80"
                        disabled={isSubmitting}
                      />
                      <div className="absolute left-3 top-3">
                        <Droplets className="text-gray-400" size={18} />
                      </div>
                    </div>
                    {errors.blood_pressure && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.blood_pressure}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Health Metrics Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-green-600 to-emerald-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-emerald-800">
                    Health Metrics
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) =>
                          handleInputChange("weight", e.target.value)
                        }
                        className={`w-full p-3 pl-10 border ${
                          errors.weight
                            ? "border-red-300 ring-2 ring-red-100"
                            : "border-gray-300"
                        } rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm`}
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        disabled={isSubmitting}
                      />
                      <div className="absolute left-3 top-3">
                        <Scale className="text-gray-400" size={18} />
                      </div>
                    </div>
                    {errors.weight && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.weight}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hemoglobin (g/dL)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.hemoglobin}
                        onChange={(e) =>
                          handleInputChange("hemoglobin", e.target.value)
                        }
                        className={`w-full p-3 pl-10 border ${
                          errors.hemoglobin
                            ? "border-red-300 ring-2 ring-red-100"
                            : "border-gray-300"
                        } rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm`}
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        disabled={isSubmitting}
                      />
                      <div className="absolute left-3 top-3">
                        <Droplet className="text-gray-400" size={18} />
                      </div>
                    </div>
                    {errors.hemoglobin && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.hemoglobin}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Tetanus Vaccination
                      </label>
                      <div className="flex items-center gap-3">
                        <div
                          className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                            formData.tetanus_vaccination
                              ? "bg-emerald-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                              formData.tetanus_vaccination ? "left-7" : "left-1"
                            }`}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {formData.tetanus_vaccination ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Iron Supplement
                      </label>
                      <div className="flex items-center gap-3">
                        <div
                          className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                            formData.iron_supplement
                              ? "bg-emerald-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                              formData.iron_supplement ? "left-7" : "left-1"
                            }`}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {formData.iron_supplement ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information Section (Conditional) */}
              {(formData.delivery_date ||
                formData.delivery_type ||
                formData.baby_weight) && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-gradient-to-b from-amber-600 to-orange-500 rounded-full"></div>
                    <h3 className="text-lg font-bold text-amber-800">
                      Delivery Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Date
                      </label>
                      <input
                        type="date"
                        value={formData.delivery_date}
                        onChange={(e) =>
                          handleInputChange("delivery_date", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Type
                      </label>
                      <select
                        value={formData.delivery_type}
                        onChange={(e) =>
                          handleInputChange("delivery_type", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                        disabled={isSubmitting}
                      >
                        <option value="">Select Type</option>
                        <option value="Normal">Normal</option>
                        <option value="Cesarean">Cesarean</option>
                        <option value="Assisted">Assisted</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Baby Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={formData.baby_weight}
                        onChange={(e) =>
                          handleInputChange("baby_weight", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Information Section */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-gray-600 to-slate-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Additional Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Complications
                    </label>
                    <textarea
                      value={formData.complications}
                      onChange={(e) =>
                        handleInputChange("complications", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white/80 backdrop-blur-sm min-h-[100px] resize-y"
                      placeholder="Any complications or health concerns..."
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white/80 backdrop-blur-sm min-h-[100px] resize-y"
                      placeholder="Additional notes or observations..."
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => !isSubmitting && setShowCreateModal(false)}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-4">
                  {isSubmitting && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-[#0F4C81] rounded-full animate-spin"></div>
                      <span className="text-sm">Saving...</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? "Saving..." : "Save Maternal Record"}
                  </button>
                </div>
              </div>
            </form>
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.resident_id) {
      newErrors.resident_id = "Please select a resident";
    }

    if (
      formData.blood_pressure &&
      !/^\d{2,3}\/\d{2,3}$/.test(formData.blood_pressure)
    ) {
      newErrors.blood_pressure = "Use format: 120/80";
    }

    if (formData.weight && (formData.weight < 30 || formData.weight > 200)) {
      newErrors.weight = "Weight must be between 30-200 kg";
    }

    if (
      formData.hemoglobin &&
      (formData.hemoglobin < 7 || formData.hemoglobin > 20)
    ) {
      newErrors.hemoglobin = "Hemoglobin must be between 7-20 g/dL";
    }

    if (formData.lmp_date && formData.edd) {
      const lmp = new Date(formData.lmp_date);
      const edd = new Date(formData.edd);
      if (edd <= lmp) {
        newErrors.edd = "EDD must be after LMP date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      addNotification("error", "Validation Error", "Please correct the errors");
      return;
    }

    setIsSubmitting(true);
    try {
      await handleEditMaternal(record.id, formData);
      setShowEditModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
    const days = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24)
    );
    return `${weeks}w ${days}d`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-5xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-emerald-400/30 rounded-full blur-sm"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Edit2 size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Edit Maternal Health Record
                </h2>
                <p className="text-emerald-100/80 text-sm">
                  Update maternal health information
                </p>
              </div>
            </div>
            <button
              onClick={() => !isSubmitting && setShowEditModal(false)}
              disabled={isSubmitting}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="flex-1 overflow-y-auto px-1">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Quick Stats Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white/80 rounded-xl border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">
                      Current Resident
                    </p>
                    <p className="text-lg font-bold text-[#0F4C81]">
                      {record.resident_name}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white/80 rounded-xl border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">
                      Pregnancy Status
                    </p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        record.delivery_date
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {record.delivery_date ? "Delivered" : "Pregnant"}
                    </span>
                  </div>
                  <div className="text-center p-4 bg-white/80 rounded-xl border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">
                      Prenatal Visits
                    </p>
                    <p className="text-lg font-bold text-[#0F4C81]">
                      {record.prenatal_visits || "0"}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white/80 rounded-xl border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(record.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pregnancy Information - Main Section */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></div>
                      <h3 className="text-lg font-bold text-purple-800">
                        Pregnancy Timeline
                      </h3>
                    </div>
                    <div className="text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-full font-medium">
                      {formData.lmp_date && formData.edd
                        ? formatDuration(formData.lmp_date, formData.edd)
                        : "Enter dates"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar size={16} className="text-purple-600" />
                        LMP Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.lmp_date}
                          onChange={(e) =>
                            handleInputChange("lmp_date", e.target.value)
                          }
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar size={16} className="text-purple-600" />
                        EDD (Expected Delivery)
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={formData.edd}
                          onChange={(e) =>
                            handleInputChange("edd", e.target.value)
                          }
                          className={`w-full p-3 border ${
                            errors.edd
                              ? "border-red-300 ring-2 ring-red-100"
                              : "border-gray-300"
                          } rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm`}
                          disabled={isSubmitting}
                        />
                        {errors.edd && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.edd}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Health Metrics in Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <Activity size={20} className="text-white" />
                      </div>
                      <h4 className="font-bold text-gray-800">Prenatal Care</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Visits Count
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.prenatal_visits}
                            onChange={(e) =>
                              handleInputChange(
                                "prenatal_visits",
                                e.target.value
                              )
                            }
                            className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                            max="20"
                            placeholder="0"
                            disabled={isSubmitting}
                          />
                          <div className="absolute left-3 top-3">
                            <Activity className="text-gray-400" size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                        <Scale size={20} className="text-white" />
                      </div>
                      <h4 className="font-bold text-gray-800">Vital Signs</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          value={formData.weight}
                          onChange={(e) =>
                            handleInputChange("weight", e.target.value)
                          }
                          className={`w-full p-3 border ${
                            errors.weight
                              ? "border-red-300 ring-2 ring-red-100"
                              : "border-gray-300"
                          } rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                          step="0.1"
                          min="0"
                          placeholder="0.0"
                          disabled={isSubmitting}
                        />
                        {errors.weight && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.weight}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Blood Pressure
                        </label>
                        <input
                          type="text"
                          value={formData.blood_pressure}
                          onChange={(e) =>
                            handleInputChange("blood_pressure", e.target.value)
                          }
                          className={`w-full p-3 border ${
                            errors.blood_pressure
                              ? "border-red-300 ring-2 ring-red-100"
                              : "border-gray-300"
                          } rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                          placeholder="120/80"
                          disabled={isSubmitting}
                        />
                        {errors.blood_pressure && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.blood_pressure}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Droplet size={20} className="text-white" />
                      </div>
                      <h4 className="font-bold text-gray-800">
                        Blood & Supplements
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Hemoglobin (g/dL)
                        </label>
                        <input
                          type="number"
                          value={formData.hemoglobin}
                          onChange={(e) =>
                            handleInputChange("hemoglobin", e.target.value)
                          }
                          className={`w-full p-3 border ${
                            errors.hemoglobin
                              ? "border-red-300 ring-2 ring-red-100"
                              : "border-gray-300"
                          } rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                          step="0.1"
                          min="0"
                          placeholder="0.0"
                          disabled={isSubmitting}
                        />
                        {errors.hemoglobin && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.hemoglobin}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tetanus
                          </label>
                          <div className="flex items-center gap-2">
                            <div
                              onClick={() =>
                                !isSubmitting &&
                                handleInputChange(
                                  "tetanus_vaccination",
                                  !formData.tetanus_vaccination
                                )
                              }
                              className={`relative w-10 h-6 rounded-full transition-all duration-300 cursor-pointer ${
                                formData.tetanus_vaccination
                                  ? "bg-emerald-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <div
                                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                                  formData.tetanus_vaccination
                                    ? "left-5"
                                    : "left-1"
                                }`}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {formData.tetanus_vaccination ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Iron
                          </label>
                          <div className="flex items-center gap-2">
                            <div
                              onClick={() =>
                                !isSubmitting &&
                                handleInputChange(
                                  "iron_supplement",
                                  !formData.iron_supplement
                                )
                              }
                              className={`relative w-10 h-6 rounded-full transition-all duration-300 cursor-pointer ${
                                formData.iron_supplement
                                  ? "bg-emerald-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <div
                                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                                  formData.iron_supplement ? "left-5" : "left-1"
                                }`}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {formData.iron_supplement ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Options Toggle */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-slate-500 rounded-lg flex items-center justify-center">
                        <Settings size={18} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">
                          Delivery & Additional Information
                        </h4>
                        <p className="text-sm text-gray-600">
                          Click to {showAdvanced ? "hide" : "show"} advanced
                          options
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-500 transition-transform duration-300 ${
                        showAdvanced ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showAdvanced && (
                    <div className="mt-6 space-y-6 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Delivery Date
                          </label>
                          <input
                            type="date"
                            value={formData.delivery_date}
                            onChange={(e) =>
                              handleInputChange("delivery_date", e.target.value)
                            }
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Delivery Type
                          </label>
                          <select
                            value={formData.delivery_type}
                            onChange={(e) =>
                              handleInputChange("delivery_type", e.target.value)
                            }
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            disabled={isSubmitting}
                          >
                            <option value="">Select Type</option>
                            <option value="Normal">Normal</option>
                            <option value="Cesarean">Cesarean</option>
                            <option value="Assisted">Assisted</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Baby Weight (kg)
                          </label>
                          <input
                            type="number"
                            value={formData.baby_weight}
                            onChange={(e) =>
                              handleInputChange("baby_weight", e.target.value)
                            }
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            step="0.1"
                            min="0"
                            placeholder="0.0"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Complications
                          </label>
                          <textarea
                            value={formData.complications}
                            onChange={(e) =>
                              handleInputChange("complications", e.target.value)
                            }
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent min-h-[100px] resize-y"
                            placeholder="Any complications or health concerns..."
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Notes
                          </label>
                          <textarea
                            value={formData.notes}
                            onChange={(e) =>
                              handleInputChange("notes", e.target.value)
                            }
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent min-h-[100px] resize-y"
                            placeholder="Additional notes or observations..."
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => !isSubmitting && setShowEditModal(false)}
                    disabled={isSubmitting}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        resident_id: record.resident_id || "",
                        lmp_date: formatDateForInput(record.lmp_date) || "",
                        edd: formatDateForInput(record.edd) || "",
                        prenatal_visits: record.prenatal_visits || "",
                        blood_pressure: record.blood_pressure || "",
                        weight: record.weight || "",
                        hemoglobin: record.hemoglobin || "",
                        tetanus_vaccination:
                          record.tetanus_vaccination || false,
                        iron_supplement: record.iron_supplement || false,
                        complications: record.complications || "",
                        delivery_date:
                          formatDateForInput(record.delivery_date) || "",
                        delivery_type: record.delivery_type || "",
                        baby_weight: record.baby_weight || "",
                        notes: record.notes || "",
                      });
                      setErrors({});
                    }}
                    disabled={isSubmitting}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reset Changes
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  {isSubmitting && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin"></div>
                      <span className="text-sm">Updating...</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? "Updating..." : "Update Record"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateImmunizationRecordModal = ({
  setShowCreateModal,
  handleCreateImmunization,
  residents,
  addNotification,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.child_resident_id || !formData.vaccine_name) {
      addNotification(
        "error",
        "Validation Error",
        "Child and vaccine name are required"
      );
      return;
    }
    handleCreateImmunization(formData);
    setShowCreateModal(false);
    setFormData({
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
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-4xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">
                Add Child Immunization Record
              </h2>
            </div>
            <button
              onClick={() => setShowCreateModal(false)}
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
          <div className="flex-1 overflow-y-auto px-2">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Child *
                </label>
                <select
                  value={formData.child_resident_id}
                  onChange={(e) => {
                    const selectedChild = residents.find(
                      (r) => r.resident_id == e.target.value
                    );
                    if (selectedChild) {
                      // Find parents from household
                      const householdMembers = residents.filter(
                        (r) => r.household_id === selectedChild.household_id
                      );
                      const parents = householdMembers.filter(
                        (r) =>
                          r.resident_id !== selectedChild.resident_id &&
                          (r.civil_status === "Married" ||
                            r.gender === "Male" ||
                            r.gender === "Female")
                      );

                      const father = parents.find((r) => r.gender === "Male");
                      const mother = parents.find((r) => r.gender === "Female");

                      setFormData({
                        ...formData,
                        child_resident_id: e.target.value,
                        parent_name:
                          parents.length > 0
                            ? parents[0].first_name + " " + parents[0].last_name
                            : "",
                        father_name: father
                          ? `${father.first_name} ${father.last_name}`
                          : "",
                        mother_name: mother
                          ? `${mother.first_name} ${mother.last_name}`
                          : "",
                      });
                    } else {
                      setFormData({
                        ...formData,
                        child_resident_id: e.target.value,
                        parent_name: "",
                        father_name: "",
                        mother_name: "",
                      });
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                  required
                >
                  <option value="">Select Child</option>
                  {residents.map((r) => (
                    <option key={r.resident_id} value={r.resident_id}>
                      {r.first_name} {r.last_name} (ID: {r.resident_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mother
                </label>
                <select
                  value={formData.mother_resident_id}
                  onChange={(e) => {
                    const selectedMother = residents.find(
                      (r) => r.resident_id == e.target.value
                    );
                    setFormData({
                      ...formData,
                      mother_resident_id: e.target.value,
                      mother_name: selectedMother
                        ? `${selectedMother.first_name} ${selectedMother.last_name}`
                        : "",
                    });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                >
                  <option value="">Select Mother (Optional)</option>
                  {residents.map((r) => (
                    <option key={r.resident_id} value={r.resident_id}>
                      {r.first_name} {r.last_name} (ID: {r.resident_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent/Guardian Name
                  {formData.parent_name && (
                    <span className="ml-2 text-xs text-green-600 font-normal">
                      (Auto-filled)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.parent_name}
                  onChange={(e) =>
                    setFormData({ ...formData, parent_name: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                  placeholder="Primary parent/guardian name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father Name
                  {formData.father_name && (
                    <span className="ml-2 text-xs text-green-600 font-normal">
                      (Auto-filled)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.father_name}
                  onChange={(e) =>
                    setFormData({ ...formData, father_name: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                  placeholder="Father's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mother Name
                  {formData.mother_name && (
                    <span className="ml-2 text-xs text-green-600 font-normal">
                      (Auto-filled)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.mother_name}
                  onChange={(e) =>
                    setFormData({ ...formData, mother_name: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                  placeholder="Mother's name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vaccine Name *
                </label>
                <input
                  type="text"
                  value={formData.vaccine_name}
                  onChange={(e) =>
                    setFormData({ ...formData, vaccine_name: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Given
                </label>
                <input
                  type="date"
                  value={formData.date_given}
                  onChange={(e) =>
                    setFormData({ ...formData, date_given: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={formData.batch_no}
                  onChange={(e) =>
                    setFormData({ ...formData, batch_no: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Dose Date
                </label>
                <input
                  type="date"
                  value={formData.next_dose_date}
                  onChange={(e) =>
                    setFormData({ ...formData, next_dose_date: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Given By
                </label>
                <input
                  type="text"
                  value={formData.given_by}
                  onChange={(e) =>
                    setFormData({ ...formData, given_by: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                  placeholder="Healthcare provider name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adverse Reactions
                </label>
                <textarea
                  value={formData.adverse_reactions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      adverse_reactions: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                  rows="3"
                  placeholder="Any adverse reactions or side effects"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                  rows="3"
                  placeholder="Additional notes or comments"
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0a3a6b] transition-colors"
                >
                  Add Immunization Record
                </button>
              </div>
            </form>
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
}) => {
  const [formData, setFormData] = useState({
    child_resident_id: record.child_resident_id || "",
    mother_resident_id: record.mother_resident_id || "",
    vaccine_name: record.vaccine_name || "",
    date_given: formatDateForInput(record.date_given) || "",
    batch_no: record.batch_no || "",
    next_dose_date: formatDateForInput(record.next_dose_date) || "",
    given_by: record.given_by || "",
    adverse_reactions: record.adverse_reactions || "",
    notes: record.notes || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.child_resident_id || !formData.vaccine_name) {
      addNotification(
        "error",
        "Validation Error",
        "Child and vaccine name are required"
      );
      return;
    }
    handleEditImmunization(record.id, formData);
    setShowEditModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-4xl shadow-2xl shadow-cyan-500/20 border border-white/20 max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-white">
                Edit Child Immunization Record
              </h2>
            </div>
            <button
              onClick={() => setShowEditModal(false)}
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
          <div className="flex-1 overflow-y-auto px-2">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Child *
                </label>
                <select
                  value={formData.child_resident_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      child_resident_id: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                  required
                >
                  <option value="">Select Child</option>
                  {residents.map((r) => (
                    <option key={r.resident_id} value={r.resident_id}>
                      {r.first_name} {r.last_name} (ID: {r.resident_id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mother
                </label>
                <select
                  value={formData.mother_resident_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mother_resident_id: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                >
                  <option value="">Select Mother (Optional)</option>
                  {residents.map((r) => (
                    <option key={r.resident_id} value={r.resident_id}>
                      {r.first_name} {r.last_name} (ID: {r.resident_id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vaccine Name *
                </label>
                <input
                  type="text"
                  value={formData.vaccine_name}
                  onChange={(e) =>
                    setFormData({ ...formData, vaccine_name: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Given
                </label>
                <input
                  type="date"
                  value={formData.date_given}
                  onChange={(e) =>
                    setFormData({ ...formData, date_given: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={formData.batch_no}
                  onChange={(e) =>
                    setFormData({ ...formData, batch_no: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Dose Date
                </label>
                <input
                  type="date"
                  value={formData.next_dose_date}
                  onChange={(e) =>
                    setFormData({ ...formData, next_dose_date: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Given By
                </label>
                <input
                  type="text"
                  value={formData.given_by}
                  onChange={(e) =>
                    setFormData({ ...formData, given_by: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adverse Reactions
                </label>
                <textarea
                  value={formData.adverse_reactions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      adverse_reactions: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                  rows="3"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#58A1D3]"
                  rows="3"
                />
              </div>
              <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#58A1D3] text-white rounded-lg hover:bg-[#0F4C81]"
                >
                  Update Record
                </button>
              </div>
            </form>
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
      const res = await maternalHealthAPI.create(data);
      if (res.success) {
        const resident = residents.find(
          (r) => r.resident_id === data.resident_id
        );
        const newRecord = {
          ...data,
          id: res.data.id,
          resident_name: `${resident.first_name} ${resident.last_name}`,
          updated_at: new Date().toISOString(),
        };
        setMaternalRecords((prev) => [...prev, newRecord]);
        addNotification("success", "Success", "Maternal health record created");
      }
    } catch (error) {
      addNotification(
        "error",
        "Create Failed",
        error.message || "Failed to create record"
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
                    Weight
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
        />
      )}
      {showImmunizationEdit && editImmunizationRecord && (
        <EditImmunizationRecordModal
          setShowEditModal={setShowImmunizationEdit}
          handleEditImmunization={handleEditImmunization}
          residents={residents}
          addNotification={addNotification}
          record={editImmunizationRecord}
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
