// import React, { useState, useEffect, useCallback } from "react";
// import jsPDF from "jspdf";
// import { applyPlugin } from "jspdf-autotable";
// import {
//   residentsAPI,
//   healthAPI,
//   referralsAPI,
//   deathsAPI,
// } from "../services/api";
// import { calculateAge } from "../dashboard/BhwDashboard";
// import { X } from "lucide-react";
// import NotificationSystem from "../components/NotificationSystem";

// applyPlugin(jsPDF);

// // Icons (keeping existing icons)
// const UsersIcon = () => (
//   <svg
//     className="w-8 h-8"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
//     />
//   </svg>
// );

// const HeartIcon = () => (
//   <svg
//     className="w-8 h-8"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
//     />
//   </svg>
// );

// const DocumentIcon = () => (
//   <svg
//     className="w-8 h-8"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//     />
//   </svg>
// );

// // Simple inline icons for quick stats
// const VoteIcon = () => (
//   <svg
//     className="w-6 h-6"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M9 12l2 2 4-4"
//     />
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//     />
//   </svg>
// );

// const GroupIcon = () => (
//   <svg
//     className="w-6 h-6"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m0 0a4 4 0 100-8 4 4 0 000 8zm8-4a4 4 0 100-8 4 4 0 000 8z"
//     />
//   </svg>
// );

// const SeniorIcon = () => (
//   <svg
//     className="w-6 h-6"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//     />
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2"
//     />
//   </svg>
// );

// const DownloadIcon = () => (
//   <svg
//     className="w-5 h-5"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//     />
//   </svg>
// );

// const ChartIcon = () => (
//   <svg
//     className="w-6 h-6"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
//     />
//   </svg>
// );

// const SkullIcon = () => (
//   <svg
//     className="w-8 h-8"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//     />
//   </svg>
// );

// // New modal component for selecting export options
// const ExportOptionsModal = ({ title, options, onExport, onClose }) => {
//   const [selectedOptions, setSelectedOptions] = useState(() =>
//     options.reduce((acc, option) => ({ ...acc, [option.key]: true }), {})
//   );

//   const handleCheckboxChange = (key) => {
//     setSelectedOptions((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   const handleExportClick = () => {
//     onExport(selectedOptions);
//     onClose();
//   };

//   const isExportDisabled = Object.values(selectedOptions).every(
//     (value) => !value
//   );

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
//       <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
//         <div className="flex justify-between items-center mb-4 border-b pb-4">
//           <h2 className="text-xl font-bold">Export {title}</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-800"
//           >
//             <X size={24} />
//           </button>
//         </div>
//         <p className="text-gray-600 mb-4">
//           Select the data you want to include in the report:
//         </p>
//         <div className="space-y-3 mb-6">
//           {options.map((option) => (
//             <label
//               key={option.key}
//               className="flex items-center space-x-3 text-lg font-medium text-gray-800"
//             >
//               <input
//                 type="checkbox"
//                 checked={selectedOptions[option.key]}
//                 onChange={() => handleCheckboxChange(option.key)}
//                 className="form-checkbox h-5 w-5 text-blue-600 rounded"
//                 aria-label={`Include ${option.label} in report`}
//               />
//               <span>{option.label}</span>
//             </label>
//           ))}
//         </div>
//         <div className="flex justify-end space-x-4">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleExportClick}
//             disabled={isExportDisabled}
//             className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Export Report
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const GenerateReportsPage = () => {
//   const [reportsData, setReportsData] = useState({
//     residents: null,
//     health: null,
//     referrals: null,
//     deaths: null,
//   });
//   const [residentsRawData, setResidentsRawData] = useState([]); // Store raw residents data
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [exportModal, setExportModal] = useState(null);
//   const [notifications, setNotifications] = useState([]);

//   // Notification handlers
//   const removeNotification = (id) => {
//     setNotifications((prev) => prev.filter((notif) => notif.id !== id));
//   };

//   const addNotification = useCallback((type, title, message = "", autoDismiss = true) => {
//     const newNotification = {
//       id: Date.now() + Math.random(),
//       type,
//       title,
//       message,
//       autoDismiss,
//       timestamp: new Date(),
//     };
//     setNotifications((prev) => [...prev, newNotification]);
//   }, []);

//   useEffect(() => {
//     async function fetchAllData() {
//       setLoading(true);
//       setReportsData({
//         residents: null,
//         health: null,
//         referrals: null,
//         deaths: null,
//       });
//       setError(null);

//       try {
//         const newReportsData = {};
//         const errors = [];

//         // Fetch residents data
//         try {
//           const residentsRes = await residentsAPI.getAll();
//           if (
//             residentsRes.success &&
//             residentsRes.data &&
//             Array.isArray(residentsRes.data)
//           ) {
//             // Store raw data for detailed age grouping
//             setResidentsRawData(residentsRes.data);

//             const purokCounts = residentsRes.data.reduce((acc, r) => {
//               acc[r.purok] = (acc[r.purok] || 0) + 1;
//               return acc;
//             }, {});
//             const ageGroups = residentsRes.data.reduce((acc, r) => {
//               const age = calculateAge(r.date_of_birth);
//               let group = age < 18 ? "0-17" : age < 60 ? "18-59" : "60+";
//               acc[group] = (acc[group] || 0) + 1;
//               return acc;
//             }, {});
//             const votersCount = residentsRes.data.filter(
//               (r) =>
//                 Number(r.is_registered_voter) === 1 ||
//                 r.is_registered_voter === true
//             ).length;
//             const fourPsCount = residentsRes.data.filter(
//               (r) => Number(r.is_4ps) === 1 || r.is_4ps === true
//             ).length;
//             const seniorsCount = residentsRes.data.filter(
//               (r) => calculateAge(r.date_of_birth) >= 60
//             ).length;
//             newReportsData.residents = {
//               purokCounts,
//               ageGroups,
//               total: residentsRes.data.length,
//               votersCount,
//               fourPsCount,
//               seniorsCount,
//             };
//           }
//         } catch (error) {
//           console.error("Error fetching residents data:", error);
//           errors.push("Failed to load residents data");
//         }

//         // Fetch health data (keeping existing logic)
//         try {
//           const healthRes = await healthAPI.getAll();
//           if (
//             healthRes.success &&
//             healthRes.data &&
//             Array.isArray(healthRes.data)
//           ) {
//             const bloodTypes =
//               healthRes.data.reduce((acc, hr) => {
//                 if (hr.blood_type)
//                   acc[hr.blood_type] = (acc[hr.blood_type] || 0) + 1;
//                 return acc;
//               }, {}) || {};
//             const hasConditions =
//               healthRes.data.filter(
//                 (hr) =>
//                   hr.medical_conditions && hr.medical_conditions.trim() !== ""
//               ).length || 0;
//             const hasAllergies =
//               healthRes.data.filter(
//                 (hr) => hr.allergies && hr.allergies.trim() !== ""
//               ).length || 0;
//             newReportsData.health = {
//               bloodTypes,
//               hasConditions,
//               hasAllergies,
//               total: healthRes.data.length,
//             };
//           }
//         } catch (error) {
//           console.error("Error fetching health data:", error);
//           errors.push("Failed to load health records data");
//         }

//         // Fetch referrals data (keeping existing logic)
//         try {
//           const referralsRes = await referralsAPI.getAll();
//           if (
//             referralsRes.success &&
//             referralsRes.data &&
//             Array.isArray(referralsRes.data)
//           ) {
//             const statusCounts =
//               referralsRes.data.reduce((acc, ref) => {
//                 acc[ref.status] = (acc[ref.status] || 0) + 1;
//                 return acc;
//               }, {}) || {};
//             const reasonCounts =
//               referralsRes.data.reduce((acc, ref) => {
//                 acc[ref.referral_reason] = (acc[ref.referral_reason] || 0) + 1;
//                 return acc;
//               }, {}) || {};
//             newReportsData.referrals = {
//               statusCounts,
//               reasonCounts,
//               total: referralsRes.data.length,
//             };
//           }
//         } catch (error) {
//           console.error("Error fetching referrals data:", error);
//           errors.push(
//             "Failed to load referrals data - referrals table may not be set up yet"
//           );
//         }

//         // Fetch death data
//         try {
//           const deathsRes = await deathsAPI.getAll();
//           if (
//             deathsRes.success &&
//             deathsRes.data &&
//             Array.isArray(deathsRes.data)
//           ) {
//             const causeCounts = deathsRes.data.reduce((acc, d) => {
//               acc[d.cause_of_death || "Unknown"] =
//                 (acc[d.cause_of_death || "Unknown"] || 0) + 1;
//               return acc;
//             }, {});
//             const placeCounts = deathsRes.data.reduce((acc, d) => {
//               acc[d.place_of_death || "Unknown"] =
//                 (acc[d.place_of_death || "Unknown"] || 0) + 1;
//               return acc;
//             }, {});
//             newReportsData.deaths = {
//               causeCounts,
//               placeCounts,
//               total: deathsRes.data.length,
//             };
//           }
//         } catch (error) {
//           console.error("Error fetching death data:", error);
//           errors.push("Failed to load death records data");
//         }

//         setReportsData(newReportsData);

//         // Data loaded silently - no notification needed for successful loads

//         if (errors.length === 4) {
//           addNotification(
//             "error",
//             "Data Load Failed",
//             "Failed to load all data sources. Please check your database connection and table setup."
//           );
//         } else if (errors.length > 0) {
//           addNotification(
//             "warning",
//             "Partial Data Load",
//             `Some data sources failed to load. ${errors.length} out of 4 data sources are unavailable.`
//           );
//         }
//       } catch (error) {
//         console.error("Unexpected error fetching report data:", error);
//         addNotification(
//           "error",
//           "Unexpected Error",
//           "An unexpected error occurred while fetching data. Check console for details."
//         );
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchAllData();
//   }, []);

//   // Age grouping function for purok-based report
//   const generateAgeGroupingByPurok = (residentsData) => {
//     const ageGroups = {};

//     residentsData.forEach((resident) => {
//       const birthDate = new Date(resident.date_of_birth);
//       const today = new Date();
//       const ageInYears = today.getFullYear() - birthDate.getFullYear();
//       const purok = resident.purok || 'Unknown';

//       let ageGroup = '';
      
//       // Determine age group based on years (matching the image format)
//       if (ageInYears < 1) {
//         ageGroup = 'Infant (0-11 months)';
//       } else if (ageInYears >= 1 && ageInYears <= 4) {
//         ageGroup = 'Toddler (1-4 years)';
//       } else if (ageInYears >= 5 && ageInYears <= 9) {
//         ageGroup = 'Child (5-9 years)';
//       } else if (ageInYears >= 10 && ageInYears <= 14) {
//         ageGroup = 'Adolescent (10-14 years)';
//       } else if (ageInYears >= 15 && ageInYears <= 19) {
//         ageGroup = 'Youth (15-19 years)';
//       } else if (ageInYears >= 20 && ageInYears <= 39) {
//         ageGroup = 'Adult (20-39 years)';
//       } else if (ageInYears >= 40 && ageInYears <= 59) {
//         ageGroup = 'Middle-aged (40-59 years)';
//       } else if (ageInYears >= 60) {
//         ageGroup = 'Senior (60+ years)';
//       }

//       if (ageGroup) {
//         if (!ageGroups[ageGroup]) {
//           ageGroups[ageGroup] = {};
//         }
//         if (!ageGroups[ageGroup][purok]) {
//           ageGroups[ageGroup][purok] = 0;
//         }
//         ageGroups[ageGroup][purok]++;
//       }
//     });

//     return ageGroups;
//   };

//   //Common header for all PDF reports
//   const addReportHeader = (doc, title) => {
//     const pageWidth = doc.internal.pageSize.width;
//     const margin = 15;

//     // Header background
//     doc.setFillColor(220, 220, 220);
//     doc.rect(0, 0, pageWidth, 40, "F");

//     // Logo placeholder (text-based, as images are not supported)
//     doc.setFontSize(12);
//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(0, 0, 0);
//     doc.text("[Barangay Logo]", margin, 20);

//     // Barangay Information
//     doc.setFontSize(14);
//     doc.setFont("helvetica", "bold");
//     doc.text("Barangay Upper Ichon", pageWidth / 2, 15, { align: "center" });
//     doc.setFontSize(10);
//     doc.setFont("helvetica", "normal");
//     doc.text(
//       "Municipality of Example, Province of Example",
//       pageWidth / 2,
//       22,
//       {
//         align: "center",
//       }
//     );
//     doc.text(
//       "Contact: (123) 456-7890 | upperichon@example.com",
//       pageWidth / 2,
//       29,
//       {
//         align: "center",
//       }
//     );

//     // Report Title
//     doc.setFontSize(16);
//     doc.setFont("helvetica", "bold");
//     doc.text(title, pageWidth / 2, 50, { align: "center" });

//     // Date and Page Number
//     doc.setFontSize(10);
//     doc.setFont("helvetica", "normal");
//     doc.text(
//       `Date: ${new Date().toLocaleDateString()}`,
//       pageWidth - margin,
//       35,
//       {
//         align: "right",
//       }
//     );
//     doc.text(
//       `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
//       pageWidth - margin,
//       42,
//       {
//         align: "right",
//       }
//     );

//     return 60; // Starting Y position after header
//   };

//   // Resident Demographics PDF export with autoTable
//   const exportResidentsToPDF = (selectedOptions, residentsData) => {
//     const doc = new jsPDF("portrait");
//     const pageWidth = doc.internal.pageSize.width;
//     const margin = 15;

//     let currentY = addReportHeader(doc, "Resident Demographics Report");

//     if (selectedOptions.total) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text(
//         `Total Residents: ${reportsData.residents.total || 0}`,
//         margin,
//         currentY
//       );
//       currentY += 10;
//     }

//     if (selectedOptions.purokCounts && reportsData.residents?.purokCounts) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text("Purok Distribution", margin, currentY);
//       currentY += 10;

//       const purokTable = Object.entries(reportsData.residents.purokCounts).map(
//         ([purok, count]) => [purok || "N/A", count.toString()]
//       );
//       const totalPurokCount = purokTable.reduce(
//         (sum, [, count]) => sum + parseInt(count),
//         0
//       );

//       doc.autoTable({
//         startY: currentY,
//         head: [["Purok", "Count"]],
//         body: [...purokTable, ["Total", totalPurokCount.toString()]],
//         theme: "grid",
//         headStyles: {
//           fillColor: [0, 102, 204],
//           textColor: [255, 255, 255],
//           fontSize: 11,
//         },
//         bodyStyles: { fontSize: 10 },
//         alternateRowStyles: { fillColor: [240, 240, 240] },
//         margin: { left: margin, right: margin },
//         columnStyles: {
//           0: { cellWidth: 120 },
//           1: { cellWidth: 50, halign: "right" },
//         },
//         styles: { cellPadding: 3, lineWidth: 0.2, lineColor: [100, 100, 100] },
//       });
//       currentY = doc.lastAutoTable.finalY + 10;
//     }

//     if (selectedOptions.ageGroups && reportsData.residents?.ageGroups) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text("Age Group Distribution", margin, currentY);
//       currentY += 10;

//       const ageTable = Object.entries(reportsData.residents.ageGroups).map(
//         ([group, count]) => [`${group} years`, count.toString()]
//       );
//       const totalAgeCount = ageTable.reduce(
//         (sum, [, count]) => sum + parseInt(count),
//         0
//       );

//       doc.autoTable({
//         startY: currentY,
//         head: [["Age Group", "Count"]],
//         body: [...ageTable, ["Total", totalAgeCount.toString()]],
//         theme: "grid",
//         headStyles: {
//           fillColor: [0, 102, 204],
//           textColor: [255, 255, 255],
//           fontSize: 11,
//         },
//         bodyStyles: { fontSize: 10 },
//         alternateRowStyles: { fillColor: [240, 240, 240] },
//         margin: { left: margin, right: margin },
//         columnStyles: {
//           0: { cellWidth: 120 },
//           1: { cellWidth: 50, halign: "right" },
//         },
//         styles: { cellPadding: 3, lineWidth: 0.2, lineColor: [100, 100, 100] },
//       });
//       currentY = doc.lastAutoTable.finalY + 10;
//     }

//     if (selectedOptions.detailedAge && residentsData) {
//       doc.setFontSize(14);
//       doc.setFont("helvetica", "bold");
//       doc.setTextColor(0, 0, 0); // Black color for title
//       doc.text("Age Grouping Report", pageWidth / 2, currentY, { align: "center" });
//       currentY += 10;
      
//       // Add date
//       doc.setFontSize(10);
//       doc.setFont("helvetica", "normal");
//       const currentDate = new Date().toLocaleDateString();
//       doc.text(`Generated on ${currentDate}`, pageWidth / 2, currentY, { align: "center" });
//       currentY += 15;

//       const ageGroups = generateAgeGroupingByPurok(residentsData);
      
//       // Define the age group order as shown in the image
//       const ageGroupOrder = [
//         'Infant (0-11 months)',
//         'Toddler (1-4 years)',
//         'Child (5-9 years)',
//         'Adolescent (10-14 years)',
//         'Youth (15-19 years)',
//         'Adult (20-39 years)',
//         'Middle-aged (40-59 years)',
//         'Senior (60+ years)'
//       ];

//       // Prepare table data - flatten the nested structure
//       const tableData = [];
//       ageGroupOrder.forEach(ageGroup => {
//         const puroks = ageGroups[ageGroup] || {};
//         const purokNames = Object.keys(puroks).sort();
        
//         if (purokNames.length === 0) {
//           // If no data for this age group, still show it with 0 count
//           tableData.push([ageGroup, 'No data', '0']);
//         } else {
//           purokNames.forEach(purok => {
//             tableData.push([ageGroup, purok, puroks[purok].toString()]);
//           });
//         }
//       });

//       // Create the table with the format from the image
//       doc.autoTable({
//         startY: currentY,
//         head: [
//           [
//             { content: 'Age Group', colSpan: 1, rowSpan: 1 },
//             { content: 'Purok', colSpan: 1, rowSpan: 1 },
//             { content: 'Count', colSpan: 1, rowSpan: 1 }
//           ]
//         ],
//         body: tableData,
//         theme: "grid",
//         headStyles: {
//           fillColor: [0, 102, 204],
//           textColor: [255, 255, 255],
//           fontSize: 11,
//           halign: 'center',
//           fontStyle: 'bold'
//         },
//         bodyStyles: { 
//           fontSize: 10,
//           halign: 'left'
//         },
//         alternateRowStyles: { fillColor: [248, 248, 248] },
//         margin: { left: margin, right: margin },
//         columnStyles: {
//           0: { cellWidth: 80, halign: 'left' },
//           1: { cellWidth: 60, halign: 'left' },
//           2: { cellWidth: 40, halign: 'center' },
//         },
//         styles: { 
//           cellPadding: 4, 
//           lineWidth: 0.5, 
//           lineColor: [0, 0, 0],
//           fontSize: 10
//         },
//         didDrawPage: function (data) {
//           // Add page number if needed
//           const pageNumber = doc.internal.getNumberOfPages();
//           if (pageNumber > 1) {
//             doc.setFontSize(8);
//             doc.text(`Page ${pageNumber}`, pageWidth - 30, doc.internal.pageSize.height - 10);
//           }
//         }
//       });
//       currentY = doc.lastAutoTable.finalY + 15;
//     }

//     if (selectedOptions.votersCount) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text(
//         `Registered Voters: ${reportsData.residents.votersCount || 0}`,
//         margin,
//         currentY
//       );
//       currentY += 10;
//     }

//     if (selectedOptions.fourPsCount) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text(
//         `4Ps Beneficiaries: ${reportsData.residents.fourPsCount || 0}`,
//         margin,
//         currentY
//       );
//       currentY += 10;
//     }

//     if (selectedOptions.seniorsCount) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text(
//         `Senior Citizens: ${reportsData.residents.seniorsCount || 0}`,
//         margin,
//         currentY
//       );
//     }

//     // Footer
//     doc.setFontSize(8);
//     doc.setFont("helvetica", "italic");
//     doc.setTextColor(100, 100, 100);
//     doc.text(
//       "Generated by Barangay Upper Ichon Health Information System",
//       pageWidth / 2,
//       doc.internal.pageSize.height - 10,
//       { align: "center" }
//     );

//     doc.save("Resident_Demographics_Report.pdf");
//   };

//   // Health Records PDF export with autoTable
//   const exportHealthToPDF = (selectedOptions) => {
//     const doc = new jsPDF("portrait");
//     const pageWidth = doc.internal.pageSize.width;
//     const margin = 15;

//     let currentY = addReportHeader(doc, "Health Records Report");

//     if (selectedOptions.total) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text(
//         `Total Health Records: ${reportsData.health.total || 0}`,
//         margin,
//         currentY
//       );
//       currentY += 10;
//     }

//     if (selectedOptions.bloodTypes && reportsData.health?.bloodTypes) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text("Blood Type Distribution", margin, currentY);
//       currentY += 10;

//       const bloodTypeTable = Object.entries(reportsData.health.bloodTypes).map(
//         ([type, count]) => [type, count.toString()]
//       );
//       const totalBloodTypeCount = bloodTypeTable.reduce(
//         (sum, [, count]) => sum + parseInt(count),
//         0
//       );

//       doc.autoTable({
//         startY: currentY,
//         head: [["Blood Type", "Count"]],
//         body: [...bloodTypeTable, ["Total", totalBloodTypeCount.toString()]],
//         theme: "grid",
//         headStyles: {
//           fillColor: [204, 0, 0],
//           textColor: [255, 255, 255],
//           fontSize: 11,
//         },
//         bodyStyles: { fontSize: 10 },
//         alternateRowStyles: { fillColor: [240, 240, 240] },
//         margin: { left: margin, right: margin },
//         columnStyles: {
//           0: { cellWidth: 120 },
//           1: { cellWidth: 50, halign: "right" },
//         },
//         styles: { cellPadding: 3, lineWidth: 0.2, lineColor: [100, 100, 100] },
//       });
//       currentY = doc.lastAutoTable.finalY + 10;
//     }

//     if (selectedOptions.hasConditions) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text(
//         `Residents with Medical Conditions: ${
//           reportsData.health.hasConditions || 0
//         }`,
//         margin,
//         currentY
//       );
//       currentY += 10;
//     }

//     if (selectedOptions.hasAllergies) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text(
//         `Residents with Allergies: ${reportsData.health.hasAllergies || 0}`,
//         margin,
//         currentY
//       );
//     }

//     // Footer
//     doc.setFontSize(8);
//     doc.setFont("helvetica", "italic");
//     doc.setTextColor(100, 100, 100);
//     doc.text(
//       "Generated by Barangay Upper Ichon Health Information System",
//       pageWidth / 2,
//       doc.internal.pageSize.height - 10,
//       { align: "center" }
//     );

//     doc.save("Health_Records_Report.pdf");
//   };

//   // Referrals PDF export with autoTable
//   const exportReferralsToPDF = (selectedOptions) => {
//     const doc = new jsPDF("portrait");
//     const pageWidth = doc.internal.pageSize.width;
//     const margin = 15;

//     let currentY = addReportHeader(doc, "Referral Summary Report");

//     if (selectedOptions.total) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text(
//         `Total Referrals: ${reportsData.referrals.total || 0}`,
//         margin,
//         currentY
//       );
//       currentY += 10;
//     }

//     if (selectedOptions.statusCounts && reportsData.referrals?.statusCounts) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text("Status Distribution", margin, currentY);
//       currentY += 10;

//       const statusTable = Object.entries(
//         reportsData.referrals.statusCounts
//       ).map(([status, count]) => [
//         status.charAt(0).toUpperCase() + status.slice(1),
//         count.toString(),
//       ]);
//       const totalStatusCount = statusTable.reduce(
//         (sum, [, count]) => sum + parseInt(count),
//         0
//       );

//       doc.autoTable({
//         startY: currentY,
//         head: [["Status", "Count"]],
//         body: [...statusTable, ["Total", totalStatusCount.toString()]],
//         theme: "grid",
//         headStyles: {
//           fillColor: [0, 153, 0],
//           textColor: [255, 255, 255],
//           fontSize: 11,
//         },
//         bodyStyles: { fontSize: 10 },
//         alternateRowStyles: { fillColor: [240, 240, 240] },
//         margin: { left: margin, right: margin },
//         columnStyles: {
//           0: { cellWidth: 120 },
//           1: { cellWidth: 50, halign: "right" },
//         },
//         styles: { cellPadding: 3, lineWidth: 0.2, lineColor: [100, 100, 100] },
//       });
//       currentY = doc.lastAutoTable.finalY + 10;
//     }

//     if (selectedOptions.reasonCounts && reportsData.referrals?.reasonCounts) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text("Reason Distribution", margin, currentY);
//       currentY += 10;

//       const reasonTable = Object.entries(
//         reportsData.referrals.reasonCounts
//       ).map(([reason, count]) => [reason, count.toString()]);
//       const totalReasonCount = reasonTable.reduce(
//         (sum, [, count]) => sum + parseInt(count),
//         0
//       );

//       doc.autoTable({
//         startY: currentY,
//         head: [["Reason", "Count"]],
//         body: [...reasonTable, ["Total", totalReasonCount.toString()]],
//         theme: "grid",
//         headStyles: {
//           fillColor: [0, 153, 0],
//           textColor: [255, 255, 255],
//           fontSize: 11,
//         },
//         bodyStyles: { fontSize: 10 },
//         alternateRowStyles: { fillColor: [240, 240, 240] },
//         margin: { left: margin, right: margin },
//         columnStyles: {
//           0: { cellWidth: 120 },
//           1: { cellWidth: 50, halign: "right" },
//         },
//         styles: { cellPadding: 3, lineWidth: 0.2, lineColor: [100, 100, 100] },
//       });
//     }

//     // Footer
//     doc.setFontSize(8);
//     doc.setFont("helvetica", "italic");
//     doc.setTextColor(100, 100, 100);
//     doc.text(
//       "Generated by Barangay Upper Ichon Health Information System",
//       pageWidth / 2,
//       doc.internal.pageSize.height - 10,
//       { align: "center" }
//     );

//     doc.save("Referral_Summary_Report.pdf");
//   };

//   // Death Records PDF export with autoTable
//   const exportDeathsToPDF = (selectedOptions) => {
//     const doc = new jsPDF("portrait");
//     const pageWidth = doc.internal.pageSize.width;
//     const margin = 15;

//     let currentY = addReportHeader(doc, "Death Records Report");

//     if (selectedOptions.total) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text(
//         `Total Deaths: ${reportsData.deaths.total || 0}`,
//         margin,
//         currentY
//       );
//       currentY += 10;
//     }

//     if (selectedOptions.causeCounts && reportsData.deaths?.causeCounts) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text("Cause of Death Distribution", margin, currentY);
//       currentY += 10;

//       const causeTable = Object.entries(reportsData.deaths.causeCounts).map(
//         ([cause, count]) => [cause, count.toString()]
//       );
//       const totalCauseCount = causeTable.reduce(
//         (sum, [, count]) => sum + parseInt(count),
//         0
//       );

//       doc.autoTable({
//         startY: currentY,
//         head: [["Cause of Death", "Count"]],
//         body: [...causeTable, ["Total", totalCauseCount.toString()]],
//         theme: "grid",
//         headStyles: {
//           fillColor: [100, 100, 100],
//           textColor: [255, 255, 255],
//           fontSize: 11,
//         },
//         bodyStyles: { fontSize: 10 },
//         alternateRowStyles: { fillColor: [240, 240, 240] },
//         margin: { left: margin, right: margin },
//         columnStyles: {
//           0: { cellWidth: 120 },
//           1: { cellWidth: 50, halign: "right" },
//         },
//         styles: { cellPadding: 3, lineWidth: 0.2, lineColor: [100, 100, 100] },
//       });
//       currentY = doc.lastAutoTable.finalY + 10;
//     }

//     if (selectedOptions.placeCounts && reportsData.deaths?.placeCounts) {
//       doc.setFontSize(12);
//       doc.setFont("helvetica", "bold");
//       doc.text("Place of Death Distribution", margin, currentY);
//       currentY += 10;

//       const placeTable = Object.entries(reportsData.deaths.placeCounts).map(
//         ([place, count]) => [place, count.toString()]
//       );
//       const totalPlaceCount = placeTable.reduce(
//         (sum, [, count]) => sum + parseInt(count),
//         0
//       );

//       doc.autoTable({
//         startY: currentY,
//         head: [["Place of Death", "Count"]],
//         body: [...placeTable, ["Total", totalPlaceCount.toString()]],
//         theme: "grid",
//         headStyles: {
//           fillColor: [100, 100, 100],
//           textColor: [255, 255, 255],
//           fontSize: 11,
//         },
//         bodyStyles: { fontSize: 10 },
//         alternateRowStyles: { fillColor: [240, 240, 240] },
//         margin: { left: margin, right: margin },
//         columnStyles: {
//           0: { cellWidth: 120 },
//           1: { cellWidth: 50, halign: "right" },
//         },
//         styles: { cellPadding: 3, lineWidth: 0.2, lineColor: [100, 100, 100] },
//       });
//     }

//     // Footer
//     doc.setFontSize(8);
//     doc.setFont("helvetica", "italic");
//     doc.setTextColor(100, 100, 100);
//     doc.text(
//       "Generated by Barangay Upper Ichon Health Information System",
//       pageWidth / 2,
//       doc.internal.pageSize.height - 10,
//       { align: "center" }
//     );

//     doc.save("Death_Records_Report.pdf");
//   };

//   const openExportModal = (reportType) => {
//     const modalConfigs = {
//       residents: {
//         title: "Resident Demographics",
//         options: [
//           { key: "total", label: "Total Residents" },
//           { key: "purokCounts", label: "Purok Distribution" },
//           { key: "ageGroups", label: "Age Groups" },
//           { key: "detailedAge", label: "Detailed Age Grouping" },
//           { key: "votersCount", label: "Registered Voters" },
//           { key: "fourPsCount", label: "4Ps Beneficiaries" },
//           { key: "seniorsCount", label: "Senior Citizens" },
//         ],
//       },
//       health: {
//         title: "Health Records",
//         options: [
//           { key: "total", label: "Total Health Records" },
//           { key: "bloodTypes", label: "Blood Type Distribution" },
//           { key: "hasConditions", label: "Medical Conditions" },
//           { key: "hasAllergies", label: "Allergies" },
//         ],
//       },
//       referrals: {
//         title: "Referral Summary",
//         options: [
//           { key: "total", label: "Total Referrals" },
//           { key: "statusCounts", label: "Status Distribution" },
//           { key: "reasonCounts", label: "Reason Distribution" },
//         ],
//       },
//       deaths: {
//         title: "Death Records",
//         options: [
//           { key: "total", label: "Total Deaths" },
//           { key: "causeCounts", label: "Cause of Death Distribution" },
//           { key: "placeCounts", label: "Place of Death Distribution" },
//         ],
//       },
//     };

//     setExportModal(modalConfigs[reportType]);
//   };

//   const handleExport = (selectedOptions) => {
//     if (exportModal.title === "Resident Demographics") {
//       exportResidentsToPDF(selectedOptions, residentsRawData);
//     } else if (exportModal.title === "Health Records") {
//       exportHealthToPDF(selectedOptions);
//     } else if (exportModal.title === "Referral Summary") {
//       exportReferralsToPDF(selectedOptions);
//     } else if (exportModal.title === "Death Records") {
//       exportDeathsToPDF(selectedOptions);
//     }
//   };

//   return (
//     <section className="min-h-screen p-6 max-w-7xl mx-auto">
//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
//         </div>
//       ) : error ? (
//         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
//           <p className="font-semibold">Error</p>
//           <p>{error}</p>
//         </div>
//       ) : (
//         <>
//           {reportsData.residents && (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//               <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center justify-between border border-gray-100 hover:shadow-2xl transition-all duration-300">
//                 <div>
//                   <div className="text-xs uppercase tracking-wide text-gray-500">
//                     Total Residents
//                   </div>
//                   <div className="text-3xl font-bold text-blue-600 mt-1">
//                     {reportsData.residents.total || 0}
//                   </div>
//                 </div>
//                 <div className="rounded-full p-3 bg-blue-50 text-blue-600">
//                   <GroupIcon />
//                 </div>
//               </div>
//               <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center justify-between border border-gray-100 hover:shadow-2xl transition-all duration-300">
//                 <div>
//                   <div className="text-xs uppercase tracking-wide text-gray-500">
//                     Registered Voters
//                   </div>
//                   <div className="text-3xl font-bold text-green-600 mt-1">
//                     {reportsData.residents.votersCount || 0}
//                   </div>
//                 </div>
//                 <div className="rounded-full p-3 bg-green-50 text-green-600">
//                   <VoteIcon />
//                 </div>
//               </div>
//               <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center justify-between border border-gray-100 hover:shadow-2xl transition-all duration-300">
//                 <div>
//                   <div className="text-xs uppercase tracking-wide text-gray-500">
//                     4Ps Beneficiaries
//                   </div>
//                   <div className="text-3xl font-bold text-purple-600 mt-1">
//                     {reportsData.residents.fourPsCount || 0}
//                   </div>
//                 </div>
//                 <div className="rounded-full p-3 bg-purple-50 text-purple-600">
//                   <GroupIcon />
//                 </div>
//               </div>
//               <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center justify-between border border-gray-100 hover:shadow-2xl transition-all duration-300">
//                 <div>
//                   <div className="text-xs uppercase tracking-wide text-gray-500">
//                     Senior Citizens
//                   </div>
//                   <div className="text-3xl font-bold text-amber-600 mt-1">
//                     {reportsData.residents.seniorsCount || 0}
//                   </div>
//                 </div>
//                 <div className="rounded-full p-3 bg-amber-50 text-amber-600">
//                   <SeniorIcon />
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Residents Report Card */}
//             <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
//               <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-xl font-bold">Resident Demographics</h3>
//                     <p className="text-blue-100 mt-1">Population Overview</p>
//                   </div>
//                   <div className="bg-white/20 p-3 rounded-xl">
//                     <UsersIcon />
//                   </div>
//                 </div>
//               </div>
//               <div className="p-6">
//                 {reportsData.residents ? (
//                   <div className="space-y-6">
//                     <div className="text-center">
//                       <div className="text-4xl font-bold text-[#0F4C81]">
//                         {reportsData.residents.total || 0}
//                       </div>
//                       <div className="text-gray-600">Total Residents</div>
//                     </div>

//                     <div>
//                       <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                         <ChartIcon />
//                         Purok Distribution
//                       </h4>
//                       <div className="space-y-2">
//                         {Object.entries(
//                           reportsData.residents.purokCounts || {}
//                         ).map(([purok, count]) => (
//                           <div
//                             key={purok}
//                             className="flex justify-between items-center bg-gray-50 p-2 rounded-lg"
//                           >
//                             <span className="font-medium">
//                               {purok || "N/A"}
//                             </span>
//                             <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
//                               {count}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     <div>
//                       <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                         <ChartIcon />
//                         Age Groups
//                       </h4>
//                       <div className="space-y-2">
//                         {Object.entries(
//                           reportsData.residents.ageGroups || {}
//                         ).map(([group, count]) => (
//                           <div
//                             key={group}
//                             className="flex justify-between items-center bg-gray-50 p-2 rounded-lg"
//                           >
//                             <span className="font-medium">{group} years</span>
//                             <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
//                               {count}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     <button
//                       onClick={() => openExportModal("residents")}
//                       className="w-full flex items-center justify-center gap-2 bg-[#58A1D3] text-white px-4 py-2 rounded-md hover:bg-[#0F4C81] transition-colors"
//                     >
//                       <DownloadIcon /> Export This Report
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="text-center py-8 text-gray-500">
//                     <UsersIcon />
//                     <p className="mt-2">No resident data available</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Health Report Card */}
//             <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
//               <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-xl font-bold">Health Records</h3>
//                     <p className="text-red-100 mt-1">Medical Overview</p>
//                   </div>
//                   <div className="bg-white/20 p-3 rounded-xl">
//                     <HeartIcon />
//                   </div>
//                 </div>
//               </div>
//               <div className="p-6">
//                 {reportsData.health ? (
//                   <div className="space-y-6">
//                     <div className="text-center">
//                       <div className="text-4xl font-bold text-red-600">
//                         {reportsData.health.total || 0}
//                       </div>
//                       <div className="text-gray-600">Total Health Records</div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="text-center bg-orange-50 p-4 rounded-xl">
//                         <div className="text-2xl font-bold text-orange-600">
//                           {reportsData.health.hasConditions || 0}
//                         </div>
//                         <div className="text-sm text-gray-600">
//                           With Conditions
//                         </div>
//                       </div>
//                       <div className="text-center bg-yellow-50 p-4 rounded-xl">
//                         <div className="text-2xl font-bold text-yellow-600">
//                           {reportsData.health.hasAllergies || 0}
//                         </div>
//                         <div className="text-sm text-gray-600">
//                           With Allergies
//                         </div>
//                       </div>
//                     </div>

//                     <div>
//                       <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                         <ChartIcon />
//                         Blood Type Distribution
//                       </h4>
//                       <div className="space-y-2">
//                         {Object.entries(
//                           reportsData.health.bloodTypes || {}
//                         ).map(([type, count]) => (
//                           <div
//                             key={type}
//                             className="flex justify-between items-center bg-gray-50 p-2 rounded-lg"
//                           >
//                             <span className="font-medium">{type}</span>
//                             <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-semibold">
//                               {count}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => openExportModal("health")}
//                       className="w-full flex items-center justify-center gap-2 bg-[#58A1D3] text-white px-4 py-2 rounded-md hover:bg-[#0F4C81] transition-colors"
//                     >
//                       <DownloadIcon /> Export This Report
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="text-center py-8 text-gray-500">
//                     <HeartIcon />
//                     <p className="mt-2">No health data available</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Referrals Report Card */}
//             <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
//               <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-xl font-bold">Referral Summary</h3>
//                     <p className="text-green-100 mt-1">Service Tracking</p>
//                   </div>
//                   <div className="bg-white/20 p-3 rounded-xl">
//                     <DocumentIcon />
//                   </div>
//                 </div>
//               </div>
//               <div className="p-6">
//                 {reportsData.referrals ? (
//                   <div className="space-y-6">
//                     <div className="text-center">
//                       <div className="text-4xl font-bold text-green-600">
//                         {reportsData.referrals.total || 0}
//                       </div>
//                       <div className="text-gray-600">Total Referrals</div>
//                     </div>

//                     <div>
//                       <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                         <ChartIcon />
//                         Status Distribution
//                       </h4>
//                       <div className="space-y-2">
//                         {Object.entries(
//                           reportsData.referrals.statusCounts || {}
//                         ).map(([status, count]) => (
//                           <div
//                             key={status}
//                             className="flex justify-between items-center bg-gray-50 p-2 rounded-lg"
//                           >
//                             <span className="font-medium capitalize">
//                               {status}
//                             </span>
//                             <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
//                               {count}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     <div>
//                       <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                         <ChartIcon />
//                         Reason Distribution
//                       </h4>
//                       <div className="space-y-2">
//                         {Object.entries(
//                           reportsData.referrals.reasonCounts || {}
//                         ).map(([reason, count]) => (
//                           <div
//                             key={reason}
//                             className="flex justify-between items-center bg-gray-50 p-2 rounded-lg"
//                           >
//                             <span className="font-medium text-sm">
//                               {reason}
//                             </span>
//                             <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
//                               {count}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => openExportModal("referrals")}
//                       className="w-full flex items-center justify-center gap-2 bg-[#58A1D3] text-white px-4 py-2 rounded-md hover:bg-[#0F4C81] transition-colors"
//                     >
//                       <DownloadIcon /> Export This Report
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="text-center py-8 text-gray-500">
//                     <DocumentIcon />
//                     <p className="mt-2">No referral data available</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Death Report Card */}
//             <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
//               <div className="bg-gradient-to-r from-gray-500 to-gray-700 p-6 text-white">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-xl font-bold">Death Records</h3>
//                     <p className="text-gray-200 mt-1">Mortality Overview</p>
//                   </div>
//                   <div className="bg-white/20 p-3 rounded-xl">
//                     <SkullIcon />
//                   </div>
//                 </div>
//               </div>
//               <div className="p-6">
//                 {reportsData.deaths ? (
//                   <div className="space-y-6">
//                     <div className="text-center">
//                       <div className="text-4xl font-bold text-gray-600">
//                         {reportsData.deaths.total || 0}
//                       </div>
//                       <div className="text-gray-600">Total Deaths</div>
//                     </div>
//                     <div>
//                       <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                         <ChartIcon />
//                         Cause of Death Distribution
//                       </h4>
//                       <div className="space-y-2">
//                         {Object.entries(
//                           reportsData.deaths.causeCounts || {}
//                         ).map(([cause, count]) => (
//                           <div
//                             key={cause}
//                             className="flex justify-between items-center bg-gray-50 p-2 rounded-lg"
//                           >
//                             <span className="font-medium">{cause}</span>
//                             <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-semibold">
//                               {count}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                     <div>
//                       <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                         <ChartIcon />
//                         Place of Death Distribution
//                       </h4>
//                       <div className="space-y-2">
//                         {Object.entries(
//                           reportsData.deaths.placeCounts || {}
//                         ).map(([place, count]) => (
//                           <div
//                             key={place}
//                             className="flex justify-between items-center bg-gray-50 p-2 rounded-lg"
//                           >
//                             <span className="font-medium">{place}</span>
//                             <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-semibold">
//                               {count}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => openExportModal("deaths")}
//                       className="w-full flex items-center justify-center gap-2 bg-[#58A1D3] text-white px-4 py-2 rounded-md hover:bg-[#0F4C81] transition-colors"
//                     >
//                       <DownloadIcon /> Export This Report
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="text-center py-8 text-gray-500">
//                     <SkullIcon />
//                     <p className="mt-2">No death data available</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {exportModal && (
//         <ExportOptionsModal
//           title={exportModal.title}
//           options={exportModal.options}
//           onExport={handleExport}
//           onClose={() => setExportModal(null)}
//         />
//       )}

//       {/* Notification System */}
//       <NotificationSystem
//         notifications={notifications}
//         onRemove={removeNotification}
//       />
//     </section>
//   );
// };

// export default GenerateReportsPage;
