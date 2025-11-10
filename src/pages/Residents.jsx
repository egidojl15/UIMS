"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  UserCheck,
  CheckCircle,
  Search,
  Download,
  Filter,
  Printer,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { residentsAPI } from "../services/api";
import jsPDF from "jspdf";
import "jspdf-autotable";

// ────────────────────────────────────────────────────────────────
// Helper: calculate age
// ────────────────────────────────────────────────────────────────
function calculateAge(birthdate) {
  if (!birthdate) return "";
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age < 0 ? 0 : age;
}

// ────────────────────────────────────────────────────────────────
// StatCard
// ────────────────────────────────────────────────────────────────
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  onClick,
  hovered,
  onMouseEnter,
  onMouseLeave,
}) => (
  <div
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-500 border border-white/20 cursor-pointer ${
      hovered
        ? "transform scale-105 shadow-2xl shadow-blue-500/20 bg-white/95"
        : "hover:shadow-xl hover:shadow-blue-500/10"
    }`}
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

// ────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────────
const Residents = () => {
  const [stats, setStats] = useState({ total: 0, seniors: 0, voters: 0 });
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurok, setSelectedPurok] = useState("all");
  const [purokList, setPurokList] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  // ────── Fetch Data ──────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await residentsAPI.getAll();

        if (res.success) {
          let data = [];
          if (Array.isArray(res.data)) data = res.data;
          else if (res.data?.data && Array.isArray(res.data.data))
            data = res.data.data;

          const active = data.filter((r) => r.is_active !== 0);
          const puroks = [
            ...new Set(active.map((r) => r.purok).filter(Boolean)),
          ].sort();
          setPurokList(puroks);

          const total = active.length;
          const seniors = active.filter(
            (r) => calculateAge(r.date_of_birth) >= 60
          ).length;
          const voters = active.filter(
            (r) => r.is_registered_voter === 1
          ).length;

          setStats({ total, seniors, voters });
          setResidents(active);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ────── Filtering ──────
  const getFilteredData = () => {
    let data = residents;

    if (activeTab === "seniors")
      data = data.filter((r) => calculateAge(r.date_of_birth) >= 60);
    else if (activeTab === "voters")
      data = data.filter((r) => r.is_registered_voter === 1);

    if (selectedPurok !== "all")
      data = data.filter((r) => r.purok === selectedPurok);

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase().trim();
      data = data.filter(
        (r) =>
          `${r.first_name || ""} ${r.last_name || ""}`
            .toLowerCase()
            .includes(s) ||
          (r.gender || "").toLowerCase().includes(s) ||
          (r.purok || "").toLowerCase().includes(s) ||
          (r.resident_id?.toString() || "").includes(s) ||
          (r.contact_number || "").includes(s)
      );
    }

    return data;
  };

  const filtered = getFilteredData();
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // ────── PDF & Print (unchanged) ──────
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const title = `Resident Report - ${getReportTitle()}`;
      const date = new Date().toLocaleDateString();

      doc.setFontSize(16).setTextColor(40).text(title, 14, 15);
      doc
        .setFontSize(10)
        .setTextColor(100)
        .text(`Generated on: ${date}`, 14, 22);
      doc
        .setFontSize(12)
        .setTextColor(40)
        .text(`Total Records: ${filtered.length}`, 14, 32);

      const tableData = filtered.map((r) => [
        r.resident_id || "N/A",
        `${r.first_name || ""} ${r.last_name || ""}`.trim(),
        r.gender || "N/A",
        r.date_of_birth
          ? new Date(r.date_of_birth).toLocaleDateString("en-US")
          : "N/A",
        r.purok || "N/A",
        r.contact_number || "N/A",
        calculateAge(r.date_of_birth) >= 60 ? "Yes" : "No",
        r.is_registered_voter ? "Yes" : "No",
      ]);

      doc.autoTable({
        startY: 40,
        head: [
          [
            "Name",
            "Gender",
            "Birthdate",
            "Purok",
            "Contact",
            "Senior",
            "Voter",
          ],
        ],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [15, 76, 129],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 30 },
          2: { cellWidth: 15 },
          3: { cellWidth: 25 },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 },
          6: { cellWidth: 15 },
        },
        margin: { top: 40 },
      });

      const filename = `Resident_Report_${getReportTitle().replace(
        /\s+/g,
        "_"
      )}_${date.replace(/\//g, "-")}.pdf`;
      doc.save(filename);
    } catch (e) {
      alert("PDF generation failed.");
    }
  };

  const handlePrint = () => {
    const printWin = window.open("", "_blank");
    const title = getReportTitle();
    const date = new Date().toLocaleDateString();

    printWin.document.write(`
      <!DOCTYPE html>
      <html><head><title>Resident Report - ${title}</title>
      <style>
        body{font-family:Arial,sans-serif;margin:20px;color:#333}
        .header{text-align:center;margin-bottom:30px;border-bottom:2px solid #0F4C81;padding-bottom:10px}
        .title{font-size:24px;font-weight:bold;color:#0F4C81;margin:0}
        .subtitle{font-size:14px;color:#666;margin:5px 0}
        .stats{font-size:14px;margin:15px 0}
        table{width:100%;border-collapse:collapse;margin-top:10px}
        th{background:#0F4C81;color:white;padding:10px;text-align:left;border:1px solid #ddd;font-weight:bold}
        td{padding:8px 10px;border:1px solid #ddd}
        tr:nth-child(even){background:#f9f9f9}
        .badge{padding:2px 8px;border-radius:12px;font-size:12px;font-weight:bold}
        .badge-yes{background:#d1fae5;color:#065f46}
        .badge-no{background:#f3f4f6;color:#374151}
        @media print{body{margin:0}}
      </style></head><body>
      <div class="header"><h1 class="title">Resident Report - ${title}</h1>
      <div class="subtitle">Generated on: ${date}</div><div class="stats">Total Records: ${
      filtered.length
    }</div></div>
      <table><thead><tr>
        <th>No.</th><th>Name</th><th>Gender</th><th>Birthdate</th><th>Purok</th><th>Contact</th><th>Senior</th><th>Voter</th>
      </tr></thead><tbody>
      ${filtered
        .map(
          (r, i) => `<tr>
          <td>${i + 1}</td>
          <td>${`${r.first_name || ""} ${r.last_name || ""}`.trim()}${
            r.suffix ? ` ${r.suffix}` : ""
          }</td>
          <td>${r.gender || "N/A"}</td>
          <td>${
            r.date_of_birth
              ? new Date(r.date_of_birth).toLocaleDateString("en-US")
              : "N/A"
          }</td>
          <td>${r.purok || "N/A"}</td>
          <td>${r.contact_number || "N/A"}</td>
          <td><span class="badge ${
            calculateAge(r.date_of_birth) >= 60 ? "badge-yes" : "badge-no"
          }">${calculateAge(r.date_of_birth) >= 60 ? "Yes" : "No"}</span></td>
          <td><span class="badge ${
            r.is_registered_voter ? "badge-yes" : "badge-no"
          }">${r.is_registered_voter ? "Yes" : "No"}</span></td>
        </tr>`
        )
        .join("")}
      </tbody></table>
      <script>window.onload=()=>{window.print();setTimeout(()=>{window.close()},100)}</script>
      </body></html>
    `);
    printWin.document.close();
  };

  const getReportTitle = () => {
    let t =
      activeTab === "all"
        ? "All Residents"
        : activeTab === "seniors"
        ? "Senior Citizens"
        : "Active Voters";
    if (selectedPurok !== "all") t += ` - Purok ${selectedPurok}`;
    return t;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3] relative overflow-hidden">
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

      <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero & Stats (unchanged) */}
          <section className="relative mb-12">
            <div className="bg-gradient-to-br from-[#0F4C81] via-[#58A1D3] to-[#B3DEF8] rounded-3xl p-8 text-white relative overflow-hidden">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText size={32} className="text-yellow-300" />
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
                        Overview of all resident information and records
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3">
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
          </section>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-[#0F4C81] rounded-full animate-pulse"></div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] bg-clip-text text-transparent">
                Resident Overview
              </h2>
              <div className="w-2 h-2 bg-[#58A1D3] rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Monitor and manage all resident information with real-time
              statistics and management tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <StatCard
              title="Total Residents"
              value={loading ? "..." : stats.total}
              icon={Users}
              color="bg-gradient-to-br from-[#0F4C81] to-[#58A1D3]"
              onClick={() => setActiveTab("all")}
              hovered={hoveredCard === "total"}
              onMouseEnter={() => setHoveredCard("total")}
              onMouseLeave={() => setHoveredCard(null)}
            />
            <StatCard
              title="Senior Citizens"
              value={loading ? "..." : stats.seniors}
              icon={UserCheck}
              color="bg-gradient-to-br from-emerald-500 to-teal-500"
              onClick={() => setActiveTab("seniors")}
              hovered={hoveredCard === "seniors"}
              onMouseEnter={() => setHoveredCard("seniors")}
              onMouseLeave={() => setHoveredCard(null)}
            />
            <StatCard
              title="Active Voters"
              value={loading ? "..." : stats.voters}
              icon={CheckCircle}
              color="bg-gradient-to-br from-purple-500 to-pink-500"
              onClick={() => setActiveTab("voters")}
              hovered={hoveredCard === "voters"}
              onMouseEnter={() => setHoveredCard("voters")}
              onMouseLeave={() => setHoveredCard(null)}
            />
          </div>

          {/* Table Container */}
          <div
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/20"
            style={{ minHeight: "600px" }}
          >
            <div className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                <h3 className="text-2xl font-bold text-white capitalize">
                  {activeTab === "all"
                    ? "All Residents"
                    : activeTab === "seniors"
                    ? "Senior Citizens"
                    : "Active Voters"}
                  {` (${filtered.length})`}
                </h3>
                <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 flex-shrink-0 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center bg-white/70 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg mr-3">
                    <Filter className="text-white" size={16} />
                  </div>
                  <select
                    value={selectedPurok}
                    onChange={(e) => {
                      setSelectedPurok(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent outline-none text-sm text-gray-700"
                  >
                    <option value="all">All Puroks</option>
                    {purokList.map((p) => (
                      <option key={p} value={p}>
                        Purok {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center bg-white/70 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#0F4C81] to-[#58A1D3] rounded-xl flex items-center justify-center shadow-lg mr-3">
                    <Search className="text-white" size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, purok, or ID..."
                    className="bg-transparent outline-none text-sm text-gray-700 w-48"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  disabled={filtered.length === 0}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/30 disabled:bg-gray-400 text-white px-6 py-3 rounded-2xl transition-all duration-300 font-medium"
                >
                  <Printer size={18} /> Print
                </button>
                <button
                  onClick={generatePDF}
                  disabled={filtered.length === 0}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/30 disabled:bg-gray-400 text-white px-6 py-3 rounded-2xl transition-all duration-300 font-medium"
                >
                  <Download size={18} /> Export PDF
                </button>
              </div>
            </div>

            {/* ────── Responsive Views ────── */}
            <div className="flex-1 overflow-auto">
              {/* Desktop: Your Original Table */}
              <div className="hidden md:block">
                <table className="w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] sticky top-0 z-10">
                    <tr>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
                        style={{ width: "8%" }}
                      >
                        ID
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
                        style={{ width: "25%" }}
                      >
                        Name
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
                        style={{ width: "10%" }}
                      >
                        Gender
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
                        style={{ width: "12%" }}
                      >
                        Birthdate
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
                        style={{ width: "12%" }}
                      >
                        Purok
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
                        style={{ width: "15%" }}
                      >
                        Contact
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
                        style={{ width: "9%" }}
                      >
                        Senior
                      </th>
                      <th
                        className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
                        style={{ width: "9%" }}
                      >
                        Voter
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-16">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-[#0F4C81] text-lg font-medium">
                              Loading residents...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : paginated.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-16">
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Search size={32} className="text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-xl font-semibold mb-2">
                              No residents found
                            </p>
                            <p className="text-gray-500 text-sm">
                              {searchTerm || selectedPurok !== "all"
                                ? "Try adjusting your filters"
                                : "No residents registered yet"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginated.map((item) => (
                        <tr
                          key={item.resident_id}
                          className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300 border-b border-gray-100 group"
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-[#0F4C81] group-hover:text-[#58A1D3] transition-colors duration-300">
                              {item.resident_id || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              Resident ID
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
                              {`${item.first_name || ""} ${
                                item.last_name || ""
                              }`.trim() || "N/A"}
                              {item.suffix ? ` ${item.suffix}` : ""}
                            </div>
                            <div className="text-xs text-gray-500">
                              Full Name
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200">
                              {item.gender || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
                              {item.date_of_birth
                                ? new Date(
                                    item.date_of_birth
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                  })
                                : "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              Birthdate
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
                              {item.purok || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">Purok</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-[#06172E] group-hover:text-[#0F4C81] transition-colors duration-300">
                              {item.contact_number || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">Contact</div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                calculateAge(item.date_of_birth) >= 60
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              } shadow-sm`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full mr-2 ${
                                  calculateAge(item.date_of_birth) >= 60
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                                }`}
                              ></div>
                              {calculateAge(item.date_of_birth) >= 60
                                ? "Yes"
                                : "No"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                item.is_registered_voter
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              } shadow-sm`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full mr-2 ${
                                  item.is_registered_voter
                                    ? "bg-blue-500"
                                    : "bg-gray-500"
                                }`}
                              ></div>
                              {item.is_registered_voter ? "Yes" : "No"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Your ORIGINAL Design (100% unchanged) */}
              <div className="md:hidden p-4 space-y-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#0F4C81] text-lg font-medium">
                      Loading...
                    </p>
                  </div>
                ) : paginated.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-lg font-semibold mb-2">
                      No residents found
                    </p>
                    <p className="text-gray-500 text-sm">
                      {searchTerm || selectedPurok !== "all"
                        ? "Try adjusting your filters"
                        : "No residents registered yet"}
                    </p>
                  </div>
                ) : (
                  paginated.map((item) => (
                    <div
                      key={item.resident_id}
                      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-5 border border-white/30"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-2">
                          <Users size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-[#0F4C81]">
                            #{item.resident_id || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Resident ID
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-sm font-semibold text-[#06172E]">
                          {`${item.first_name || ""} ${
                            item.last_name || ""
                          }`.trim() || "N/A"}
                          {item.suffix ? ` ${item.suffix}` : ""}
                        </div>
                        <div className="text-xs text-gray-500">Full Name</div>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200">
                          {item.gender || "N/A"}
                        </span>
                        <span className="text-sm text-[#06172E]">
                          {item.date_of_birth
                            ? new Date(item.date_of_birth).toLocaleDateString(
                                "en-US"
                              )
                            : "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">Birthdate</span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm text-[#06172E]">
                          {item.purok || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">Purok</span>
                        <span className="text-sm text-[#06172E]">
                          {item.contact_number || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">Contact</span>
                      </div>

                      <div className="flex gap-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            calculateAge(item.date_of_birth) >= 60
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {calculateAge(item.date_of_birth) >= 60
                            ? "Yes"
                            : "No"}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.is_registered_voter
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.is_registered_voter ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 bg-white/80 backdrop-blur-sm border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {(currentPage - 1) * perPage + 1} to{" "}
                  {Math.min(currentPage * perPage, filtered.length)} of{" "}
                  {filtered.length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(120deg);
          }
          66% {
            transform: translateY(5px) rotate(240deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Residents;
