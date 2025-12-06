import React, { useState, useEffect } from "react";
import {
  Users,
  HeartPulse,
  FileText,
  TrendingUp,
  Baby,
  Syringe,
  Skull,
  AlertCircle,
  Plus,
  Calendar,
  Activity,
  RefreshCw,
} from "lucide-react";
import {
  residentsAPI,
  healthAPI,
  referralsAPI,
  deathsAPI,
  maternalHealthAPI,
  childImmunizationAPI,
  authAPI,
} from "../services/api";

// Helper function to calculate age
function calculateAge(birthdate) {
  if (!birthdate) return "";
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age < 0 ? 0 : age; // Prevent negative ages
}

const BhwMainDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    residents: { total: 0, voters: 0, fourPs: 0, seniors: 0, pwd: 0 },
    health: { total: 0, withConditions: 0, philHealth: 0 },
    referrals: { total: 0, pending: 0, completed: 0 },
    maternal: { total: 0, pregnant: 0, delivered: 0 },
    immunization: { total: 0, thisMonth: 0 },
    deaths: { total: 0, thisYear: 0 },
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [quickStats, setQuickStats] = useState({
    avgAge: 0,
    maleCount: 0,
    femaleCount: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Verify token before fetching data
    if (!authAPI.isTokenValid()) {
      console.error("❌ Invalid token detected in BhwMainDashboard");
      setError("Your session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Starting dashboard data fetch...");

      // Fetch all data in parallel with error handling for each
      const results = await Promise.allSettled([
        residentsAPI.getAll().catch((err) => {
          console.warn("Residents API failed:", err);
          return { success: false, data: [] };
        }),
        healthAPI.getAll().catch((err) => {
          console.warn("Health API failed:", err);
          return { success: false, data: [] };
        }),
        referralsAPI.getAll().catch((err) => {
          console.warn("Referrals API failed:", err);
          return { success: false, data: [] };
        }),
        maternalHealthAPI.getAll().catch((err) => {
          console.warn("Maternal health API failed:", err);
          return { success: false, data: [] };
        }),
        childImmunizationAPI.getAll().catch((err) => {
          console.warn("Immunizations API failed:", err);
          return { success: false, data: [] };
        }),
        deathsAPI.getAll().catch((err) => {
          console.warn("Deaths API failed:", err);
          return { success: false, data: [] };
        }),
      ]);

      // Extract successful responses
      const [
        residentsRes,
        healthRes,
        referralsRes,
        maternalRes,
        immunizationRes,
        deathsRes,
      ] = results;

      // Process residents data
      if (residentsRes.status === "fulfilled" && residentsRes.value?.success) {
        const residents = residentsRes.value.data || [];
        const currentYear = new Date().getFullYear();

        const ages = residents
          .map((r) => {
            const birthDate = new Date(r.date_of_birth);
            return currentYear - birthDate.getFullYear();
          })
          .filter((age) => !isNaN(age) && age >= 0);

        const avgAge =
          ages.length > 0
            ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length)
            : 0;

        const maleCount = residents.filter((r) => r.gender === "Male").length;
        const femaleCount = residents.filter(
          (r) => r.gender === "Female"
        ).length;

        setDashboardData((prev) => ({
          ...prev,
          residents: {
            total: residents.length,
            voters: residents.filter((r) => r.is_registered_voter).length,
            fourPs: residents.filter((r) => r.is_4ps).length,
            seniors: residents.filter(
              (r) => calculateAge(r.date_of_birth) >= 60
            ).length,
            pwd: residents.filter((r) => r.is_pwd).length,
          },
        }));

        setQuickStats({ avgAge, maleCount, femaleCount });
        console.log("✅ Residents data processed:", residents.length);
      } else {
        console.warn("⚠️ Residents API failed:", residentsRes.reason);
      }

      // Process health records
      if (healthRes.status === "fulfilled" && healthRes.value?.success) {
        const health = healthRes.value.data || [];
        setDashboardData((prev) => ({
          ...prev,
          health: {
            total: health.length,
            withConditions: health.filter(
              (h) => h.medical_conditions && h.medical_conditions.trim() !== ""
            ).length,
            philHealth: health.filter((h) => h.is_philhealth).length,
          },
        }));
        console.log("✅ Health records processed:", health.length);
      } else {
        console.warn("⚠️ Health API failed:", healthRes.reason);
      }

      // Process referrals
      if (referralsRes.status === "fulfilled" && referralsRes.value?.success) {
        const referrals = referralsRes.value.data || [];
        setDashboardData((prev) => ({
          ...prev,
          referrals: {
            total: referrals.length,
            pending: referrals.filter((r) => r.status === "Pending").length,
            completed: referrals.filter((r) => r.status === "Completed").length,
          },
        }));
        console.log("✅ Referrals processed:", referrals.length);
      } else {
        console.warn("⚠️ Referrals API failed:", referralsRes.reason);
      }

      // Process maternal health
      if (maternalRes.status === "fulfilled" && maternalRes.value?.success) {
        const maternal = maternalRes.value.data || [];
        setDashboardData((prev) => ({
          ...prev,
          maternal: {
            total: maternal.length,
            pregnant: maternal.filter((m) => !m.delivery_date).length,
            delivered: maternal.filter((m) => m.delivery_date).length,
          },
        }));
        console.log("✅ Maternal health processed:", maternal.length);
      } else {
        console.warn("⚠️ Maternal health API failed:", maternalRes.reason);
      }

      // Process immunizations
      if (
        immunizationRes.status === "fulfilled" &&
        immunizationRes.value?.success
      ) {
        const immunizations = immunizationRes.value.data || [];
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();

        setDashboardData((prev) => ({
          ...prev,
          immunization: {
            total: immunizations.length,
            thisMonth: immunizations.filter((i) => {
              const date = new Date(i.date_given);
              return (
                date.getMonth() === thisMonth && date.getFullYear() === thisYear
              );
            }).length,
          },
        }));
        console.log("✅ Immunizations processed:", immunizations.length);
      } else {
        console.warn("⚠️ Immunizations API failed:", immunizationRes.reason);
      }

      // Process death records
      if (deathsRes.status === "fulfilled" && deathsRes.value?.success) {
        const deaths = deathsRes.value.data || [];
        const thisYear = new Date().getFullYear();

        setDashboardData((prev) => ({
          ...prev,
          deaths: {
            total: deaths.length,
            thisYear: deaths.filter((d) => {
              const date = new Date(d.date_of_death);
              return date.getFullYear() === thisYear;
            }).length,
          },
        }));
        console.log("✅ Death records processed:", deaths.length);
      } else {
        console.warn("⚠️ Deaths API failed:", deathsRes.reason);
      }

      // Generate recent activities
      generateRecentActivities(
        residentsRes.status === "fulfilled" ? residentsRes.value?.data : [],
        healthRes.status === "fulfilled" ? healthRes.value?.data : [],
        referralsRes.status === "fulfilled" ? referralsRes.value?.data : []
      );

      console.log("✅ Dashboard data fetch complete");
    } catch (error) {
      console.error("❌ Dashboard data fetch error:", error);
      setError(
        "Failed to load dashboard data. Please try refreshing the page."
      );
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivities = (residents, health, referrals, deaths) => {
    const activities = [];

    // Recent residents (last 3) - Use registered_date instead of created_at
    if (residents && residents.length > 0) {
      const recent = residents
        .sort((a, b) => {
          // Use registered_date first, fall back to created_at if not available
          const dateA = a.registered_date
            ? new Date(a.registered_date)
            : new Date(a.created_at || a.updated_at);
          const dateB = b.registered_date
            ? new Date(b.registered_date)
            : new Date(b.created_at || b.updated_at);
          return dateB - dateA;
        })
        .slice(0, 3);

      recent.forEach((r) => {
        // Use registered_date if available, otherwise use created_at/updated_at
        const activityDate = r.registered_date || r.created_at || r.updated_at;

        activities.push({
          type: "resident",
          icon: Users,
          color: "text-blue-600",
          bg: "bg-blue-50",
          title: "New Resident Added",
          description: `${r.first_name} ${r.last_name}`,
          time: formatTimeAgo(activityDate),
          rawDate: activityDate, // Add this for debugging
        });
      });
    }

    // Recent health records (last 2)
    if (health && health.length > 0) {
      const recent = health
        .sort((a, b) => {
          // Use updated_at for health records (when they were last updated)
          const dateA = new Date(a.updated_at || a.created_at);
          const dateB = new Date(b.updated_at || b.created_at);
          return dateB - dateA;
        })
        .slice(0, 2);

      recent.forEach((h) => {
        const activityDate = h.updated_at || h.created_at;

        activities.push({
          type: "health",
          icon: HeartPulse,
          color: "text-red-600",
          bg: "bg-red-50",
          title: "Health Record Updated",
          description: `Blood Type: ${h.blood_type || "N/A"}`,
          time: formatTimeAgo(activityDate),
          rawDate: activityDate,
        });
      });
    }

    // Recent referrals (last 2)
    if (referrals && referrals.length > 0) {
      const recent = referrals
        .sort((a, b) => {
          // Use referral_date for sorting
          const dateA = new Date(a.referral_date);
          const dateB = new Date(b.referral_date);
          return dateB - dateA;
        })
        .slice(0, 2);

      recent.forEach((r) => {
        activities.push({
          type: "referral",
          icon: FileText,
          color: "text-green-600",
          bg: "bg-green-50",
          title: "New Referral",
          description: r.referral_reason,
          time: formatTimeAgo(r.referral_date),
          rawDate: r.referral_date,
        });
      });
    }

    if (deaths && deaths.length > 0) {
      const recent = deaths
        .sort((a, b) => {
          // Use registered_date first, fall back to created_at if not available
          const dateA = d.registered_date
            ? new Date(d.registered_date)
            : new Date(d.created_at || a.updated_at);
          const dateB = d.registered_date
            ? new Date(d.registered_date)
            : new Date(d.created_at || b.updated_at);
          return dateB - dateA;
        })
        .slice(0, 3);

      recent.forEach((r) => {
        // Use registered_date if available, otherwise use created_at/updated_at
        const activityDate = d.registered_date || d.created_at || d.updated_at;

        activities.push({
          type: "resident",
          icon: Skull,
          color: "text-blue-600",
          bg: "bg-blue-50",
          title: "New Death Record Added",
          description: `${r.first_name} ${r.last_name}`,
          time: formatTimeAgo(activityDate),
          rawDate: activityDate, // Add this for debugging
        });
      });
    }

    // Sort all activities by date (newest first)
    const sortedActivities = activities
      .sort((a, b) => {
        const dateA = new Date(a.rawDate || 0);
        const dateB = new Date(b.rawDate || 0);
        return dateB - dateA;
      })
      .slice(0, 7);

    setRecentActivities(sortedActivities);
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Recently";

      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Recently";
    }
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color,
    bgColor,
    trend,
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className={`${color} w-6 h-6`} />
        </div>
        {trend && (
          <div className="flex items-center text-green-600 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm text-gray-600 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );

  const QuickAction = ({ icon: Icon, label, onClick, color }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed ${color} hover:bg-opacity-10 transition-all duration-200 w-full`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3]">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Failed to Load Dashboard
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 min-h-screen">
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
                <HeartPulse size={32} className="text-yellow-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                  <span className="text-cyan-200 text-sm font-medium tracking-widest">
                    BHW DASHBOARD
                  </span>
                  <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                </div>
                <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">
                  Welcome, Health Worker!
                </h2>
                <p className="text-cyan-100 text-lg">
                  Monitor and manage community health services
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time barangay health statistics
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Activity className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Quick Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Age</p>
              <p className="text-2xl font-bold text-gray-900">
                {quickStats.avgAge} yrs
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Male Residents</p>
              <p className="text-2xl font-bold text-blue-600">
                {quickStats.maleCount}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Female Residents</p>
              <p className="text-2xl font-bold text-pink-600">
                {quickStats.femaleCount}
              </p>
            </div>
            <Users className="w-8 h-8 text-pink-500" />
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Residents"
          value={dashboardData.residents.total}
          subtitle={`${dashboardData.residents.voters} registered voters`}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={HeartPulse}
          title="Health Records"
          value={dashboardData.health.total}
          subtitle={`${dashboardData.health.philHealth} PhilHealth members`}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatCard
          icon={FileText}
          title="Medical Referrals"
          value={dashboardData.referrals.total}
          subtitle={`${dashboardData.referrals.pending} pending`}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          icon={Baby}
          title="Maternal Cases"
          value={dashboardData.maternal.total}
          subtitle={`${dashboardData.maternal.pregnant} ongoing pregnancies`}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Syringe}
          title="Immunizations"
          value={dashboardData.immunization.total}
          subtitle={`${dashboardData.immunization.thisMonth} this month`}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <StatCard
          icon={Skull}
          title="Death Records"
          value={dashboardData.deaths.total}
          subtitle={`${dashboardData.deaths.thisYear} this year`}
          color="text-gray-600"
          bgColor="bg-gray-50"
        />
        <StatCard
          icon={AlertCircle}
          title="Special Groups"
          value={
            dashboardData.residents.fourPs +
            dashboardData.residents.seniors +
            dashboardData.residents.pwd
          }
          subtitle={`4P's: ${dashboardData.residents.fourPs}, Seniors: ${dashboardData.residents.seniors}, PWD: ${dashboardData.residents.pwd}`}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-6 py-4">
            <h2 className="text-lg font-bold text-white flex items-center">
              <Plus className="w-5 h-5 mr-2 text-yellow-300" />
              Quick Actions
            </h2>
          </div>
          <div className="p-6 space-y-3">
            <QuickAction
              icon={Users}
              label="Add Resident"
              onClick={() =>
                (window.location.href = "/dashboard/bhw/manage-residents")
              }
              color="border-blue-300 text-blue-600 hover:bg-blue-50"
            />
            <QuickAction
              icon={HeartPulse}
              label="New Health Record"
              onClick={() =>
                (window.location.href = "/dashboard/bhw/health-records")
              }
              color="border-red-300 text-red-600 hover:bg-red-50"
            />
            <QuickAction
              icon={FileText}
              label="Create Referral"
              onClick={() =>
                (window.location.href = "/dashboard/bhw/medical-referral")
              }
              color="border-green-300 text-green-600 hover:bg-green-50"
            />
            <QuickAction
              icon={Baby}
              label="Maternal Record"
              onClick={() =>
                (window.location.href = "/dashboard/bhw/maternal-child-health")
              }
              color="border-purple-300 text-purple-600 hover:bg-purple-50"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-6 py-4">
            <h2 className="text-lg font-bold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-yellow-300" />
              Recent Activity
            </h2>
          </div>
          <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`${activity.bg} p-2 rounded-lg`}>
                    <activity.icon className={`${activity.color} w-4 h-4`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BhwMainDashboard;

// Add CSS animations (injected at runtime) — borrowed from the Captain dashboard
const styles = `
  @keyframes float {
    0%, 100% {
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
`;

if (typeof document !== "undefined") {
  const id = "bhw-dashboard-float-styles";
  if (!document.getElementById(id)) {
    const styleEl = document.createElement("style");
    styleEl.id = id;
    styleEl.appendChild(document.createTextNode(styles));
    document.head.appendChild(styleEl);
  }
}
