import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Eye,
  X,
  Calendar,
  Users,
  Home,
  Heart,
  Baby,
} from "lucide-react";

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
    // Don't set default date range - let users choose their own range
    // This allows showing all data by default
    setDateFrom("");
    setDateTo("");

    // Auto-preview on component mount to show data immediately
    setTimeout(() => {
      generatePreview();
    }, 500);
  }, []);

  const handleFilterChange = (filterKey, value) => {
    console.log("Filter changed:", filterKey, "=", value);
    setFiltersApplied((prev) => ({
      ...prev,
      [filterKey]: value,
    }));

    // Auto-preview when filters change (with a small delay to avoid too many requests)
    setTimeout(() => {
      generatePreview();
    }, 300);
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
      console.log("Sending filters to backend:", filtersToSend);

      const result = await onGenerate(filtersToSend);

      // Handle both array and object responses
      if (Array.isArray(result)) {
        // Show all records in preview for better user experience
        setPreviewData(result);
        setTotalCount(result.length);
      } else if (result && result.data) {
        // Show all records in preview for better user experience
        setPreviewData(result.data);
        setTotalCount(result.total || result.data.length);
      } else {
        setPreviewData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error generating preview:", error);
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
        return new Date(value).toLocaleDateString();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">
                Generate and preview {reportType} report
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Filters and Controls */}
          <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Report Settings
            </h3>

            {/* Date Range */}
            {dateRange && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        // Auto-preview when date changes
                        setTimeout(() => {
                          generatePreview();
                        }, 300);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        // Auto-preview when date changes
                        setTimeout(() => {
                          generatePreview();
                        }, 300);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            {filters.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={generatePreview}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>{loading ? "Loading..." : "Refresh Preview"}</span>
              </button>

              <button
                onClick={handleGenerateReport}
                disabled={loading || previewData.length === 0}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>{loading ? "Generating..." : "Generate Report"}</span>
              </button>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Report Preview
                </h3>
                <p className="text-xs text-gray-500">
                  Updates automatically when filters change
                </p>
              </div>
              {previewData.length > 0 && (
                <span className="text-sm text-gray-500">
                  {previewData.length === totalCount
                    ? `Showing all ${totalCount} records`
                    : `Showing ${previewData.length} of ${totalCount} records`}
                </span>
              )}
            </div>

            {previewData.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {columns.map((column) => (
                          <th
                            key={column.key}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          {columns.map((column) => (
                            <td
                              key={column.key}
                              className={`px-6 py-4 text-sm text-gray-900 ${
                                column.key === "member_names"
                                  ? "max-w-md"
                                  : "whitespace-nowrap"
                              }`}
                            >
                              {formatValue(row[column.key], column.type)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">No preview available</p>
                <p className="text-sm">
                  Click "Preview Report" to generate a preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
