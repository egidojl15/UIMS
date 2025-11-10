// import React, { useState, useEffect } from "react";
// import { barangayHistoryAPI } from "../services/api";
// import {
//   History,
//   Search,
//   Filter,
//   Calendar,
//   FileText,
//   Users,
//   Download,
//   Eye,
//   Edit3,
// } from "lucide-react";

// const History = () => {
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedRecord, setSelectedRecord] = useState(null);
//   const [historyData, setHistoryData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const recordTypes = [
//     { id: "all", name: "All Records", count: 145 },
//     { id: "certificates", name: "Certificates", count: 67 },
//     { id: "permits", name: "Business Permits", count: 32 },
//     { id: "incidents", name: "Incident Reports", count: 28 },
//     { id: "meetings", name: "Meeting Minutes", count: 18 },
//   ];

//   const records = [
//     {
//       id: "REC-2025-001",
//       type: "certificates",
//       title: "Barangay Clearance - Juan dela Cruz",
//       date: "2025-08-05",
//       time: "10:30 AM",
//       status: "completed",
//       officer: "Brgy. Secretary Maria Santos",
//       category: "Certificate Issuance",
//       description: "Barangay clearance issued for employment purposes",
//     },
//     {
//       id: "REC-2025-002",
//       type: "permits",
//       title: "Business Permit Renewal - Sari-Sari Store",
//       date: "2025-08-04",
//       time: "2:15 PM",
//       status: "pending",
//       officer: "Brgy. Treasurer Ana Lopez",
//       category: "Business Permit",
//       description: "Annual business permit renewal for retail store",
//     },
//     {
//       id: "REC-2025-003",
//       type: "incidents",
//       title: "Noise Complaint Resolution",
//       date: "2025-08-03",
//       time: "8:45 PM",
//       status: "resolved",
//       officer: "Brgy. Captain Roberto Cruz",
//       category: "Community Dispute",
//       description: "Mediation conducted for noise complaint between neighbors",
//     },
//     {
//       id: "REC-2025-004",
//       type: "meetings",
//       title: "Monthly Barangay Assembly",
//       date: "2025-08-01",
//       time: "7:00 PM",
//       status: "completed",
//       officer: "Brgy. Captain Roberto Cruz",
//       category: "Assembly Meeting",
//       description: "Regular monthly assembly with community members",
//     },
//     {
//       id: "REC-2025-005",
//       type: "certificates",
//       title: "Certificate of Indigency - Maria Gonzales",
//       date: "2025-07-30",
//       time: "11:20 AM",
//       status: "completed",
//       officer: "Brgy. Secretary Maria Santos",
//       category: "Certificate Issuance",
//       description: "Indigency certificate for medical assistance application",
//     },
//     {
//       id: "REC-2025-006",
//       type: "incidents",
//       title: "Street Light Maintenance Request",
//       date: "2025-07-28",
//       time: "3:30 PM",
//       status: "in-progress",
//       officer: "Brgy. Kagawad Jose Rivera",
//       category: "Infrastructure",
//       description: "Reported malfunctioning street lights on Main Street",
//     },
//   ];

//   const filteredRecords = records.filter((record) => {
//     const matchesFilter =
//       activeFilter === "all" || record.type === activeFilter;
//     const matchesSearch =
//       record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       record.officer.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       record.id.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesFilter && matchesSearch;
//   });

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "completed":
//         return "bg-green-100 text-green-800";
//       case "pending":
//         return "bg-yellow-100 text-yellow-800";
//       case "in-progress":
//         return "bg-blue-100 text-blue-800";
//       case "resolved":
//         return "bg-purple-100 text-purple-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getTypeIcon = (type) => {
//     switch (type) {
//       case "certificates":
//         return <FileText size={16} className="text-[#0F4C81]" />;
//       case "permits":
//         return <Edit3 size={16} className="text-[#58A1D3]" />;
//       case "incidents":
//         return <Users size={16} className="text-orange-600" />;
//       case "meetings":
//         return <Calendar size={16} className="text-purple-600" />;
//       default:
//         return <History size={16} className="text-gray-600" />;
//     }
//   };

//   const RecordDetailModal = ({ record, onClose }) => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
//         <div className="flex justify-between items-center p-6 border-b border-gray-200">
//           <h2 className="text-2xl font-bold text-[#0F4C81]">Record Details</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 transition-colors"
//           >
//             ✕
//           </button>
//         </div>
//         <div className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Record ID
//               </label>
//               <p className="text-lg font-semibold text-[#0F4C81]">
//                 {record.id}
//               </p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Status
//               </label>
//               <span
//                 className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
//                   record.status
//                 )}`}
//               >
//                 {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
//               </span>
//             </div>
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Title
//               </label>
//               <p className="text-lg text-[#06172E]">{record.title}</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Date & Time
//               </label>
//               <p className="text-gray-900">
//                 {record.date} at {record.time}
//               </p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Handling Officer
//               </label>
//               <p className="text-gray-900">{record.officer}</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Category
//               </label>
//               <p className="text-gray-900">{record.category}</p>
//             </div>
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Description
//               </label>
//               <p className="text-gray-700 leading-relaxed">
//                 {record.description}
//               </p>
//             </div>
//           </div>
//           <div className="mt-6 flex gap-3">
//             <button className="flex items-center space-x-2 px-4 py-2 bg-[#58A1D3] text-white rounded-lg hover:bg-[#0F4C81] transition-colors">
//               <Download size={16} />
//               <span>Download PDF</span>
//             </button>
//             <button className="flex items-center space-x-2 px-4 py-2 border border-[#B3DEF8] text-[#0F4C81] rounded-lg hover:bg-[#B3DEF8] transition-colors">
//               <Edit3 size={16} />
//               <span>Edit Record</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] to-[#58A1D3]">
//       {/* Header Section */}
//       <div className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] py-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="flex justify-center items-center space-x-3 mb-4">
//               <History className="text-white" size={48} />
//             </div>
//             <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
//               Barangay Records
//             {/* </h1> */}
//             <p className="text-xl text-[#B3DEF8] max-w-2xl mx-auto">
//               Complete history and documentation of all barangay activities,
//               certificates, and administrative records
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         {/* Search and Filter Section */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1 relative">
//               <Search
//                 className="absolute left-3 top-3 text-gray-400"
//                 size={20}
//               />
//               <input
//                 type="text"
//                 placeholder="Search records by ID, title, or officer..."
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#58A1D3] focus:border-transparent"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             <div className="flex items-center space-x-2">
//               <Filter className="text-[#0F4C81]" size={20} />
//               <span className="text-sm font-medium text-gray-700">
//                 Filter by:
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Filter Sidebar */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <h3 className="text-lg font-bold text-[#0F4C81] mb-4">
//                 Record Types
//               </h3>
//               <div className="space-y-2">
//                 {recordTypes.map((type) => (
//                   <button
//                     key={type.id}
//                     onClick={() => setActiveFilter(type.id)}
//                     className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-colors text-left ${
//                       activeFilter === type.id
//                         ? "bg-[#58A1D3] text-white"
//                         : "bg-gray-50 hover:bg-[#B3DEF8] text-gray-700"
//                     }`}
//                   >
//                     <span className="font-medium">{type.name}</span>
//                     <span
//                       className={`text-sm px-2 py-1 rounded-full ${
//                         activeFilter === type.id
//                           ? "bg-white bg-opacity-20"
//                           : "bg-gray-200"
//                       }`}
//                     >
//                       {type.count}
//                     </span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Records List */}
//           <div className="lg:col-span-3">
//             <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//               <div className="px-6 py-4 bg-[#0F4C81] text-white">
//                 <h3 className="text-xl font-bold">
//                   {activeFilter === "all"
//                     ? "All Records"
//                     : recordTypes.find((t) => t.id === activeFilter)?.name}
//                 </h3>
//                 <p className="text-[#B3DEF8]">
//                   {filteredRecords.length} records found
//                 </p>
//               </div>

//               <div className="divide-y divide-gray-200">
//                 {filteredRecords.map((record) => (
//                   <div
//                     key={record.id}
//                     className="p-6 hover:bg-gray-50 transition-colors"
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center space-x-3 mb-2">
//                           {getTypeIcon(record.type)}
//                           <h4 className="text-lg font-semibold text-[#06172E]">
//                             {record.title}
//                           </h4>
//                           <span
//                             className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                               record.status
//                             )}`}
//                           >
//                             {record.status.charAt(0).toUpperCase() +
//                               record.status.slice(1)}
//                           </span>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-2">
//                           {record.description}
//                         </p>
//                         <div className="flex items-center space-x-6 text-sm text-gray-500">
//                           <span className="flex items-center space-x-1">
//                             <Calendar size={14} />
//                             <span>
//                               {record.date} at {record.time}
//                             </span>
//                           </span>
//                           <span className="flex items-center space-x-1">
//                             <Users size={14} />
//                             <span>{record.officer}</span>
//                           </span>
//                         </div>
//                       </div>
//                       <div className="ml-4 flex flex-col space-y-2">
//                         <button
//                           onClick={() => setSelectedRecord(record)}
//                           className="flex items-center space-x-1 px-3 py-1 text-sm border border-[#B3DEF8] text-[#0F4C81] rounded-lg hover:bg-[#B3DEF8] transition-colors"
//                         >
//                           <Eye size={14} />
//                           <span>View</span>
//                         </button>
//                         <span className="text-xs text-gray-500 font-mono">
//                           {record.id}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Summary Statistics */}
//         <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
//           <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//             <div className="text-3xl font-bold text-[#0F4C81] mb-2">145</div>
//             <div className="text-sm text-gray-600">Total Records</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//             <div className="text-3xl font-bold text-green-600 mb-2">89</div>
//             <div className="text-sm text-gray-600">Completed</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//             <div className="text-3xl font-bold text-yellow-600 mb-2">32</div>
//             <div className="text-sm text-gray-600">Pending</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//             <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
//             <div className="text-sm text-gray-600">In Progress</div>
//           </div>
//         </div>
//       </div>

//       {/* Record Detail Modal */}
//       {selectedRecord && (
//         <RecordDetailModal
//           record={selectedRecord}
//           onClose={() => setSelectedRecord(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default History;
