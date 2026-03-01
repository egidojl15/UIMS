import React, { useState, useEffect } from "react";
import { FileText, Download, Eye, X, Users } from "lucide-react";

// ─── Philippine Barangay Report Header (shown in preview) ───────────────────
const BarangayReportHeader = ({ title, reportType, filters, totalCount }) => {
  const today = new Date().toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const purokLabel = filters?.purok ? `Purok ${filters.purok}` : "All Puroks";
  const dateLabel =
    filters?.dateFrom && filters?.dateTo
      ? `${new Date(filters.dateFrom).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })} – ${new Date(filters.dateTo).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}`
      : "As of " + today;

  return (
    <div
      className="bg-white border border-gray-300 rounded-md mb-4 print:border-0"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      {/* Top stripe */}
      <div
        style={{
          background: "#0038A8",
          height: 8,
          borderRadius: "4px 4px 0 0",
        }}
      />

      {/* Header Body */}
      <div className="px-6 py-4">
        {/* Logo row */}
        <div className="flex items-center justify-between">
          {/* Left: Philippine Seal placeholder */}
          <div className="flex flex-col items-center" style={{ width: 70 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "3px solid #0038A8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#EFF6FF",
                overflow: "hidden",
              }}
            >
              {/* Philippine Sun & Stars SVG emblem */}
              <svg viewBox="0 0 64 64" width="56" height="56">
                <circle
                  cx="32"
                  cy="32"
                  r="30"
                  fill="#FCD116"
                  stroke="#0038A8"
                  strokeWidth="2"
                />
                <polygon points="32,8 34,26 32,24 30,26" fill="#0038A8" />
                <polygon points="32,56 34,38 32,40 30,38" fill="#0038A8" />
                <polygon points="8,32 26,34 24,32 26,30" fill="#0038A8" />
                <polygon points="56,32 38,34 40,32 38,30" fill="#0038A8" />
                <circle
                  cx="32"
                  cy="32"
                  r="10"
                  fill="white"
                  stroke="#0038A8"
                  strokeWidth="1.5"
                />
                <circle cx="32" cy="32" r="5" fill="#CE1126" />
                {/* Stars */}
                <text
                  x="14"
                  y="22"
                  fontSize="8"
                  fill="#0038A8"
                  textAnchor="middle"
                >
                  ★
                </text>
                <text
                  x="50"
                  y="22"
                  fontSize="8"
                  fill="#0038A8"
                  textAnchor="middle"
                >
                  ★
                </text>
                <text
                  x="32"
                  y="54"
                  fontSize="8"
                  fill="#0038A8"
                  textAnchor="middle"
                >
                  ★
                </text>
              </svg>
            </div>
            <span
              style={{
                fontSize: 9,
                color: "#374151",
                textAlign: "center",
                marginTop: 2,
              }}
            >
              Republic of
              <br />
              the Philippines
            </span>
          </div>

          {/* Center: Text header */}
          <div className="flex-1 text-center px-4">
            <p style={{ fontSize: 11, margin: 0, color: "#374151" }}>
              Republic of the Philippines
            </p>
            <p style={{ fontSize: 11, margin: 0, color: "#374151" }}>
              Province of Southern Leyte
            </p>
            <p style={{ fontSize: 11, margin: 0, color: "#374151" }}>
              Municipality of Macrohon
            </p>
            <div
              style={{ margin: "4px 0", borderBottom: "1.5px solid #0038A8" }}
            />
            <p
              style={{
                fontSize: 14,
                fontWeight: "bold",
                color: "#0038A8",
                margin: "4px 0 2px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              BARANGAY OFFICE
            </p>
            <p
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1a1a1a",
                margin: "2px 0",
                textTransform: "uppercase",
              }}
            >
              {title}
            </p>
            <p style={{ fontSize: 10, color: "#6B7280", margin: 0 }}>
              {dateLabel}
            </p>
          </div>

          {/* Right: Barangay seal placeholder */}
          <div className="flex flex-col items-center" style={{ width: 70 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "3px solid #CE1126",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#FFF5F5",
                overflow: "hidden",
                flexDirection: "column",
              }}
            >
              <Users style={{ width: 28, height: 28, color: "#CE1126" }} />
            </div>
            <span
              style={{
                fontSize: 9,
                color: "#374151",
                textAlign: "center",
                marginTop: 2,
              }}
            >
              Barangay
              <br />
              Seal
            </span>
          </div>
        </div>

        {/* Sub-info strip */}
        <div
          style={{
            marginTop: 10,
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: 4,
            padding: "6px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 10,
            color: "#1e3a5f",
          }}
        >
          <span>
            <strong>Coverage:</strong> {purokLabel}
          </span>
          <span>
            <strong>Total Records:</strong> {totalCount ?? "—"}
          </span>
          <span>
            <strong>Date Generated:</strong> {today}
          </span>
        </div>
      </div>

      {/* Bottom stripe */}
      <div
        style={{
          background: "#CE1126",
          height: 6,
          borderRadius: "0 0 4px 4px",
        }}
      />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ReportGenerator = ({
  reportType,
  title,
  icon: Icon = FileText,
  onGenerate,
  onClose,
  data = [],
  columns = [],
  filters = [],
  dateRange = true,
}) => {
  const [previewData, setPreviewData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState({});
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    setDateFrom("");
    setDateTo("");
    setTimeout(() => generatePreview(), 500);
  }, []);

  useEffect(() => {
    if (typeof onGenerate !== "function") {
      console.error("❌ [ReportGenerator] onGenerate is not a function!");
    }
  }, [reportType, onGenerate, filters, columns, dateRange]);

  const handleFilterChange = (filterKey, value) => {
    setFiltersApplied((prev) => ({ ...prev, [filterKey]: value }));
    setTimeout(() => generatePreview(), 300);
  };

  const generatePreview = async () => {
    setLoading(true);
    try {
      const filtersToSend = {
        ...filtersApplied,
        dateFrom: dateRange ? dateFrom : null,
        dateTo: dateRange ? dateTo : null,
        preview: true,
      };
      const result = await onGenerate(filtersToSend);

      let previewData = [];
      let totalCount = 0;

      if (Array.isArray(result)) {
        previewData = result;
        totalCount = result.length;
      } else if (result && result.success && Array.isArray(result.data)) {
        previewData = result.data;
        totalCount = result.total || result.data.length;
      } else if (result && Array.isArray(result.data)) {
        previewData = result.data;
        totalCount = result.total || result.data.length;
      } else if (result && result.data) {
        previewData = [result.data];
        totalCount = 1;
      }

      setPreviewData(previewData);
      setTotalCount(totalCount);
    } catch (error) {
      console.error("❌ [ReportGenerator] Error:", error);
      setPreviewData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      await onGenerate({
        ...filtersApplied,
        dateFrom: dateRange ? dateFrom : null,
        dateTo: dateRange ? dateTo : null,
        preview: false,
      });
      onClose();
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value, type) => {
    if (value === null || value === undefined) return "N/A";
    switch (type) {
      case "date":
        return new Date(value).toLocaleDateString("en-PH");
      case "currency":
        return new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(value);
      case "number":
        return new Intl.NumberFormat().format(value);
      default:
        return value.toString();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        {/* ── Modal Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-gray-200"
          style={{
            background: "linear-gradient(135deg, #0038A8 0%, #1d4ed8 100%)",
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-sm text-blue-100">
                Barangay Management Information System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Filters */}
          <div
            className="w-72 border-r border-gray-200 p-5 overflow-y-auto flex-shrink-0"
            style={{ background: "#F8FAFC" }}
          >
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Report Settings
            </h3>

            {dateRange && (
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Date Range
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        setTimeout(() => generatePreview(), 300);
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        setTimeout(() => generatePreview(), 300);
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {filters.length > 0 && (
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Filters
                </label>
                <div className="space-y-3">
                  {filters.map((filter) => (
                    <div key={filter.key}>
                      <label className="block text-xs text-gray-500 mb-1">
                        {filter.label}
                      </label>
                      {filter.type === "select" ? (
                        <select
                          value={filtersApplied[filter.key] || ""}
                          onChange={(e) =>
                            handleFilterChange(filter.key, e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">All</option>
                          {filter.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={filter.type}
                          value={filtersApplied[filter.key] || ""}
                          onChange={(e) =>
                            handleFilterChange(filter.key, e.target.value)
                          }
                          placeholder={filter.placeholder}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 mt-4">
              <button
                onClick={generatePreview}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>{loading ? "Loading..." : "Refresh Preview"}</span>
              </button>

              <button
                onClick={handleGenerateReport}
                disabled={loading || previewData.length === 0}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition-colors"
                style={{
                  background:
                    loading || previewData.length === 0 ? "#9CA3AF" : "#0038A8",
                }}
              >
                <Download className="h-4 w-4" />
                <span>{loading ? "Generating..." : "Download PDF"}</span>
              </button>
            </div>

            {/* Legend */}
            <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-700 font-semibold mb-1">
                📋 About this report
              </p>
              <p className="text-xs text-blue-600">
                The downloaded PDF will include the official Barangay letterhead
                with seals, ready for submission or filing.
              </p>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            {/* Barangay Report Header */}
            <BarangayReportHeader
              title={title}
              reportType={reportType}
              filters={{ ...filtersApplied, dateFrom, dateTo }}
              totalCount={totalCount}
            />

            {/* Status bar */}
            {previewData.length > 0 && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Preview Table
                </span>
                <span className="text-xs text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full">
                  {previewData.length === totalCount
                    ? `${totalCount} records`
                    : `${previewData.length} of ${totalCount} records`}
                </span>
              </div>
            )}

            {previewData.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table
                    className="min-w-full"
                    style={{
                      fontFamily: "'Times New Roman', serif",
                      fontSize: 13,
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#0038A8" }}>
                        <th
                          style={{
                            padding: "8px 12px",
                            color: "white",
                            fontSize: 11,
                            fontWeight: "bold",
                            textAlign: "center",
                            borderRight: "1px solid #1d4ed8",
                            whiteSpace: "nowrap",
                          }}
                        >
                          #
                        </th>
                        {columns.map((column) => (
                          <th
                            key={column.key}
                            style={{
                              padding: "8px 12px",
                              color: "white",
                              fontSize: 11,
                              fontWeight: "bold",
                              textAlign: "left",
                              borderRight: "1px solid #1d4ed8",
                              whiteSpace: "nowrap",
                              textTransform: "uppercase",
                              letterSpacing: "0.3px",
                            }}
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr
                          key={index}
                          style={{
                            background: index % 2 === 0 ? "white" : "#F0F5FF",
                            borderBottom: "1px solid #E5E7EB",
                          }}
                        >
                          <td
                            style={{
                              padding: "6px 12px",
                              fontSize: 12,
                              color: "#6B7280",
                              textAlign: "center",
                              fontWeight: "bold",
                              borderRight: "1px solid #E5E7EB",
                            }}
                          >
                            {index + 1}
                          </td>
                          {columns.map((column) => (
                            <td
                              key={column.key}
                              style={{
                                padding: "6px 12px",
                                fontSize: 12,
                                color: "#111827",
                                borderRight: "1px solid #E5E7EB",
                                maxWidth:
                                  column.key === "member_names"
                                    ? 240
                                    : undefined,
                                whiteSpace:
                                  column.key === "member_names"
                                    ? "normal"
                                    : "nowrap",
                              }}
                            >
                              {formatValue(row[column.key], column.type)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer note */}
                <div
                  style={{
                    padding: "8px 16px",
                    background: "#F8FAFC",
                    borderTop: "1px solid #E5E7EB",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    fontFamily: "'Times New Roman', serif",
                    color: "#6B7280",
                  }}
                >
                  <span>Barangay Management Information System</span>
                  <span>Total: {totalCount} records</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white border border-gray-200 rounded-lg">
                {loading ? (
                  <>
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm">Loading report data...</p>
                  </>
                ) : (
                  <>
                    <FileText className="h-12 w-12 mb-3 text-gray-300" />
                    <p className="font-medium text-gray-500">
                      No data to preview
                    </p>
                    <p className="text-sm mt-1">
                      Adjust filters and click Refresh Preview
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
