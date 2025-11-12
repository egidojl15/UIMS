import axios from "axios";

// Create axios instance with base configuration
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://uims-backend-production.up.railway.app";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");
    console.log("🔑 API Interceptor - Token found:", !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Authorization header set");
    } else {
      console.log("❌ No token found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// FIXED: Single response interceptor with better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.debug("[API] Response error:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
    });

    // Only logout on 401/403 if it's NOT during profile fetching or other non-critical operations
    if (error.response?.status === 401 || error.response?.status === 403) {
      const isTokenExpired =
        error.response?.data?.message?.toLowerCase().includes("token") ||
        error.response?.data?.message?.toLowerCase().includes("expired") ||
        error.response?.data?.message?.toLowerCase().includes("invalid");

      // Don't logout for profile fetching errors to prevent logout loops
      const isProfileFetch = error.config?.url?.includes("/users/");

      // Check if user is on a protected route (dashboard)
      const isOnProtectedRoute =
        window.location.pathname.startsWith("/dashboard");

      if (isTokenExpired && !isProfileFetch && isOnProtectedRoute) {
        console.error(
          "🚨 Token expired or invalid on protected route - logging out"
        );
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        localStorage.removeItem("user");

        // Clear browser history to prevent back navigation
        window.history.replaceState(null, "", "/login");
        window.history.pushState(null, "", "/login");

        window.location.href = "/login";
      } else if (isTokenExpired && !isOnProtectedRoute) {
        console.warn(
          "⚠️ Token expired on public page - clearing token but not redirecting"
        );
        // Clear invalid token but don't redirect on public pages
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        localStorage.removeItem("user");
      } else if (isProfileFetch) {
        console.warn(
          "⚠️ Profile fetch authorization error, not logging out to prevent loop"
        );
      } else {
        console.warn(
          "⚠️ Authorization error but not forcing logout:",
          error.response?.data?.message
        );
      }
    }

    return Promise.reject(error);
  }
);

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response?.status === 401 || error.response?.status === 403) {
//       // Handle unauthorized access
//       localStorage.removeItem("authToken");
//       localStorage.removeItem("userData");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// // Debug-friendly response interceptor (does not auto-clear token)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.debug(
//       "[API] response error",
//       error?.response?.status,
//       error?.config?.url
//     );
//     return Promise.reject(error);
//   }
// );

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  },

  // ADD: Check if token is valid
  isTokenValid: () => {
    // FIX: Standardize token retrieval to check both possible keys, matching the interceptor
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");

    if (!token) return false;

    try {
      // Decode JWT payload to check expiration time ('exp')
      const payload = JSON.parse(atob(token.split(".")[1]));
      // Return true if the expiration time (in milliseconds) is greater than the current time
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      // Return false if decoding fails (invalid token format)
      return false;
    }
  },

  // ADD: Get current user from localStorage
  getCurrentUser: () => {
    const userData = localStorage.getItem("userData");
    const user = localStorage.getItem("user");
    const actualUserData = userData || user;

    if (!actualUserData) return null;

    try {
      return JSON.parse(actualUserData);
    } catch (error) {
      return null;
    }
  },
};
export const dashboardAPI = {
  getStats: async (role) => {
    try {
      const response = await api.get(`/dashboard/stats/${role}`);
      // ✅ Return only the nested data property for frontend compatibility
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// FIXED: Residents API functions in api.js

export const residentsAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/residents");
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Check for delete or deactivate
  deactivate: async (id, data = {}) => {
    try {
      let url = `/residents/${id}`;
      if (data.new_address && data.new_address.trim()) {
        const encodedAddress = encodeURIComponent(data.new_address.trim());
        url += `?new_address=${encodedAddress}`;
      }
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // --- NEW REPORT-SPECIFIC FUNCTIONS START ---
  getCategoryCounts: async () => {
    try {
      const response = await api.get("/residents/category-counts");
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch category counts"
      );
    }
  },

  getCategoryList: async (category) => {
    try {
      const response = await api.get(`/residents/category-list/${category}`);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || `Failed to fetch ${category} list`
      );
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/residents/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getInactive: async () => {
    try {
      const response = await api.get("/residents/inactive");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  restore: async (residentIds) => {
    try {
      const response = await api.post("/residents/restore", {
        resident_ids: residentIds,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  restoreAll: async () => {
    try {
      const response = await api.post("/residents/restore-all");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // FIXED: Create resident with photo support
  create: async (residentData) => {
    try {
      console.log("=== FRONTEND CREATE RESIDENT ===");
      console.log("Resident data:", residentData);

      const formData = new FormData();

      // Add all resident fields to FormData
      Object.keys(residentData).forEach((key) => {
        if (key === "photo_file" && residentData[key]) {
          // Add the photo file
          formData.append("photo", residentData[key]);
        } else if (
          residentData[key] !== null &&
          residentData[key] !== undefined
        ) {
          // Add other fields, converting booleans to strings
          if (typeof residentData[key] === "boolean") {
            formData.append(key, residentData[key] ? "1" : "0");
          } else {
            formData.append(key, residentData[key]);
          }
        }
      });

      // Log FormData contents for debugging
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await api.post("/residents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Create resident error:", error);
      throw error.response?.data || error;
    }
  },

  // FIXED: Update resident with photo support
  update: async (id, residentData) => {
    try {
      console.log("=== FRONTEND UPDATE RESIDENT ===");
      console.log("Resident ID:", id);
      console.log("Resident data:", residentData);

      const formData = new FormData();

      // Add all resident fields to FormData
      Object.keys(residentData).forEach((key) => {
        if (key === "photo_file" && residentData[key]) {
          // Add the photo file if it exists and is a File object
          console.log("Adding photo file:", residentData[key]);
          formData.append("photo", residentData[key]);
        } else if (
          residentData[key] !== null &&
          residentData[key] !== undefined &&
          key !== "photo_file"
        ) {
          // Add other fields, converting booleans to strings
          if (typeof residentData[key] === "boolean") {
            formData.append(key, residentData[key] ? "1" : "0");
          } else {
            formData.append(key, residentData[key]);
          }
        }
      });

      // Log FormData contents for debugging
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await api.put(`/residents/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Update resident error:", error);
      throw error.response?.data || error;
    }
  },

  updateHousehold: async (id, householdId) => {
    try {
      const response = await api.put(`/residents/${id}`, {
        household_id: householdId,
      });
      return response.data;
    } catch (error) {
      console.error("Update resident household error:", error);
      throw error.response?.data || error;
    }
  },

  // Keep this method for standalone photo uploads
  updatePhoto: async (id, photoFile) => {
    try {
      const formData = new FormData();
      formData.append("photo", photoFile);

      const response = await api.put(`/residents/photo/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Health Records API
export const healthAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/health-records");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getRecords: async (residentId) => {
    try {
      const response = await api.get(`/health-records/resident/${residentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (healthData) => {
    try {
      const response = await api.post("/health-records", healthData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (recordId, healthData) => {
    try {
      const response = await api.put(`/health-records/${recordId}`, healthData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (recordId) => {
    try {
      const response = await api.delete(`/health-records/${recordId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // FIXED: Correct endpoints for resident health records
  getAllResidentHealthRecords: async () => {
    try {
      const response = await api.get("/health-records"); // Fixed: removed 'f' typo
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getResidentHealthRecordById: async (id) => {
    try {
      const response = await api.get(`/health-records/${id}`); // Fixed: removed 'f' typo
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createResidentHealthRecord: async (healthData) => {
    try {
      const response = await api.post("/health-records", healthData); // Fixed: removed 'f' typo
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateResidentHealthRecord: async (id, healthData) => {
    try {
      const response = await api.put(`/health-records/${id}`, healthData); // Fixed: removed 'f' typo
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteResidentHealthRecord: async (id) => {
    try {
      const response = await api.delete(`/health-records/${id}`); // Fixed: removed 'f' typo
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// FIXED Profile API
export const profileAPI = {
  getProfile: async (id) => {
    try {
      console.log("Fetching profile for user ID:", id);

      // Check token before making request
      if (!authAPI.isTokenValid()) {
        console.warn("Token validation failed, but continuing with API call");
        // Don't throw error here, let the API call handle it
      }

      const response = await api.get(`/users/${id}`); // FIXED: Using backticks
      console.log("Profile API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Get profile error:", error);
      // Return a more specific error that won't trigger logout
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error("Authentication required. Please log in again.");
      }
      throw error.response?.data || error;
    }
  },

  updateProfile: async (id, profileData) => {
    try {
      console.log("=== FRONTEND PROFILE UPDATE ===");
      console.log("User ID:", id);
      console.log("Profile data:", profileData);

      // Check token before making request
      if (!authAPI.isTokenValid()) {
        throw new Error("Authentication token expired. Please log in again.");
      }

      const formData = new FormData();

      // Add all required fields
      formData.append("username", profileData.username || "");
      formData.append("full_name", profileData.full_name || "");
      formData.append("email", profileData.email || "");
      formData.append("phone", profileData.phone || "");

      // Add password fields if provided
      if (profileData.current_password) {
        formData.append("current_password", profileData.current_password);
      }
      if (profileData.new_password) {
        formData.append("new_password", profileData.new_password);
      }

      // Handle profile image - only add if it's a file object
      if (profileData.photo_url && typeof profileData.photo_url !== "string") {
        console.log("Adding profile image to FormData:", profileData.photo_url);
        formData.append("photo_url", profileData.photo_url);
      }

      // Debug FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await api.put(`/users/${id}`, formData, {
        // FIXED: Using backticks
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Update profile response:", response.data);

      // Update localStorage with new user data if returned
      if (response.data.user) {
        const currentUser = authAPI.getCurrentUser();
        const updatedUser = { ...currentUser, ...response.data.user };

        // Use the same localStorage key that was originally used
        const currentStorageKey = localStorage.getItem("userData")
          ? "userData"
          : "user";
        localStorage.setItem(currentStorageKey, JSON.stringify(updatedUser));
        console.log("Updated localStorage with new user data:", updatedUser);
      }

      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error.response?.data || error;
    }
  },
};
// api.js

// Officials API
export const officialsAPI = {
  list: async () => {
    try {
      const resp = await api.get("/officials");
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ADD THIS METHOD - Get positions
  getPositions: async () => {
    try {
      const resp = await api.get("/officials/positions");
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (payload) => {
    try {
      const resp = await api.post("/officials", payload);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  update: async (id, payload) => {
    try {
      const resp = await api.put(`/officials/${id}`, payload);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  remove: async (id) => {
    try {
      const resp = await api.delete(`/officials/${id}`);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
// Announcements API
export const announcementsAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/announcements");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ADD THESE MISSING METHODS:
  create: async (payload) => {
    try {
      const resp = await api.post("/announcements", payload);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, payload) => {
    try {
      const resp = await api.put(`/announcements/${id}`, payload);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  remove: async (id) => {
    try {
      const resp = await api.delete(`/announcements/${id}`);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
// --- Add near the bottom of api.js ---
// --- Add near the bottom of api.js ---
export const eventsAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/events");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ADD THESE MISSING METHODS:
  create: async (payload) => {
    try {
      const resp = await api.post("/events", payload);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, payload) => {
    try {
      const resp = await api.put(`/events/${id}`, payload);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  remove: async (id) => {
    try {
      const resp = await api.delete(`/events/${id}`);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
// api.js fro households
export const householdsAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/households");
      return response.data;
    } catch (error) {
      console.error("Get households error:", error);
      throw error.response?.data || error;
    }
  },

  getById: async (id) => {
    try {
      // try backend route first
      try {
        const resp = await api.get(`/households/${id}`);
        return resp.data ?? resp;
      } catch (e) {
        // fallback: derive from residents
      }

      const r = await api.get("/residents");
      const data = r?.data ?? r;
      let residents = [];

      if (Array.isArray(data)) residents = data;
      else if (data && Array.isArray(data.residents))
        residents = data.residents;
      else if (data && Array.isArray(data.data)) residents = data.data;
      else residents = [];

      const members = residents.filter((x) => {
        const hid =
          x.household_id ??
          x.householdId ??
          x.household_number ??
          x.household_no ??
          x.household;
        return String(hid) === String(id);
      });

      return { household_id: id, members };
    } catch (err) {
      console.debug(
        "[householdsAPI] getById error",
        err?.response?.data || err?.message || err
      );
      return { household_id: id, members: [] };
    }
  },

  create: async (householdData) => {
    try {
      const response = await api.post("/households", householdData);
      return response.data;
    } catch (error) {
      console.error("Create household error:", error);
      throw error.response?.data || error;
    }
  },

  update: async (id, householdData) => {
    try {
      const response = await api.put(`/households/${id}`, householdData);
      return response.data;
    } catch (error) {
      console.error("Update household error:", error);
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/households/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete household error:", error);
      throw error.response?.data || error;
    }
  },

  assignHead: async (id, residentId) => {
    try {
      const response = await api.put(`/households/${id}/assign-head`, {
        resident_id: residentId,
      });
      return response.data;
    } catch (error) {
      console.error("Assign household head error:", error);
      throw error.response?.data || error;
    }
  },
};

// Users API
export const usersAPI = {
  getAll: async () => (await api.get("/users")).data,
  getById: async (id) => (await api.get(`/users/${id}`)).data,

  create: async (userData) => {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    return (
      await api.post("/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  },

  // Regular update (for profile - restricted to own profile)
  update: async (id, userData) => {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    return (
      await api.put(`/users/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  },

  // Admin update (for user management - no restrictions)
  updateAdmin: async (id, userData) => {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // Use the admin endpoint for user updates
    return (
      await api.put(`/users/admin/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  },

  delete: async (id) => (await api.delete(`/users/${id}`)).data,
};

// Referrals API
export const referralsAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/referrals");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/referrals/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (referralData) => {
    try {
      const response = await api.post("/referrals", referralData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, referralData) => {
    try {
      const response = await api.put(`/referrals/${id}`, referralData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/referrals/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Reports API
export const reportsAPI = {
  generateAgeGrouping: async (filters) => {
    try {
      const response = await api.post("/reports/age-grouping", filters);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  generate4PsMembers: async (filters) => {
    try {
      const response = await api.post("/reports/4ps-members", filters);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  generateSeniorCitizens: async (filters) => {
    try {
      const response = await api.post("/reports/senior-citizens", filters);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ADD THIS NEW FUNCTION:
  generatePWDMembers: async (filters) => {
    try {
      const response = await api.post("/reports/pwd-members", filters);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  generateHouseholdSummary: async (filters) => {
    try {
      const response = await api.post("/reports/household-summary", filters);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  generateHealthRecords: async (filters) => {
    try {
      const response = await api.post("/reports/health-records", filters);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  generateMaternalChildHealth: async (filters) => {
    try {
      const response = await api.post(
        "/reports/maternal-child-health",
        filters
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  generateTotalResidents: async (filters) => {
    try {
      const response = await api.post("/reports/total-residents", filters);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  generateRegisteredVoters: async (filters) => {
    try {
      const response = await api.post("/reports/registered-voters", filters);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  generateSeniorCitizens: async (filters) => {
    try {
      const response = await api.post("/reports/senior-citizens", filters);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getPuroks: async () => {
    try {
      const response = await api.get("/reports/puroks");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getHealthConditions: async () => {
    try {
      const response = await api.get("/reports/health-conditions");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
export const loginsAPI = {
  getAll: async () => {
    try {
      const resp = await api.get("/logins");
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  recent: async (limit = 10) => {
    try {
      // ✅ Use ONLY the correct endpoint that exists in backend
      const resp = await api.get(`/logins/recent?limit=${limit}`);
      console.log("Recent logins response:", resp.data);
      return resp.data.data || resp.data;
    } catch (error) {
      console.error("Recent logins fetch failed:", error);
      // Return empty array instead of throwing to prevent dashboard errors
      return [];
    }
  },

  // Remove the duplicate endpoint attempts to avoid 404 errors
  getByUser: async (userId) => {
    try {
      const resp = await api.get(`/logins/user/${userId}`);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Enhanced logout method that records logout in login_history
  logout: async (userId = null) => {
    try {
      // Get current user if userId not provided
      if (!userId) {
        const currentUser = authAPI.getCurrentUser();
        userId = currentUser?.user_id;
      }

      // Record logout on backend if userId is available
      if (userId) {
        try {
          await api.post("/logins/logout", { user_id: userId });
          console.log("✅ Logout recorded in login_history");
        } catch (error) {
          console.debug(
            "Backend logout endpoint not available or failed:",
            error
          );
          // Continue with frontend logout even if backend call fails
        }
      }

      // Always clear local storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("user");

      return { success: true, message: "Successfully logged out" };
    } catch (error) {
      console.error("Logout error:", error);
      throw error.response?.data || error;
    }
  },

  // Add method to update login status (for manual status updates if needed)
  updateLoginStatus: async (userId, status) => {
    try {
      const resp = await api.post("/logins/status", {
        user_id: userId,
        status: status,
      });
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
// REPLACE the logbookAPI section in your api.js with this corrected version:

export const logbookAPI = {
  create: async (formData) => {
    try {
      console.log("Creating logbook entry:", formData);
      const response = await api.post("/logbook", formData);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to create logbook entry"
        );
      }

      return response.data;
    } catch (error) {
      console.error("Logbook create error:", error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error("Authentication token required");
      } else if (error.response?.status === 403) {
        throw new Error("Your session has expired. Please log in again.");
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  },

  getAll: async () => {
    try {
      console.log("Fetching all logbook entries");
      const response = await api.get("/logbook");

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch logbook entries"
        );
      }

      return response.data.data || [];
    } catch (error) {
      console.error("Logbook getAll error:", error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error("Authentication token required");
      } else if (error.response?.status === 403) {
        throw new Error("Your session has expired. Please log in again.");
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  },

  getById: async (id) => {
    try {
      console.log("Fetching logbook entry:", id);
      const response = await api.get(`/logbook/${id}`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch logbook entry"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Logbook getById error:", error);

      if (error.response?.status === 404) {
        throw new Error("Logbook entry not found");
      } else if (error.response?.status === 401) {
        throw new Error("Authentication token required");
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  },

  // In api.js - update the usersAPI.update method
  update: async (id, userData) => {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // Use the admin endpoint for user updates
    return (
      await api.put(`/users/admin/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  },

  delete: async (id) => {
    try {
      console.log("Deleting logbook entry:", id);
      const response = await api.delete(`/logbook/${id}`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete logbook entry"
        );
      }

      return response.data;
    } catch (error) {
      console.error("Logbook delete error:", error);

      if (error.response?.status === 404) {
        throw new Error("Logbook entry not found");
      } else if (error.response?.status === 401) {
        throw new Error("Authentication token required");
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  },
};
// Activity Logs API
export const activityAPI = {
  getAll: async (params) => {
    try {
      const response = await api.get("/activity-logs", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get("/activity-logs/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  logActivity: async (activityData) => {
    try {
      const response = await api.post("/activity-logs", activityData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
// 3. Activity logging helper function
export const logUserActivity = async (
  action,
  entityType,
  entityId,
  entityIdentifier,
  status,
  remarks,
  actionTaken
) => {
  try {
    console.log("🔍 Logging activity:", {
      action,
      entityType,
      entityId,
      entityIdentifier,
      status,
      remarks,
      actionTaken,
    });

    const result = await activityAPI.logActivity({
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_identifier: entityIdentifier,
      status,
      remarks,
      action_taken: actionTaken,
    });

    console.log("✅ Activity logged successfully:", result);
  } catch (error) {
    console.error("❌ Failed to log activity:", error);
    console.error("Error details:", error.response?.data || error.message);
    // Don't throw error to prevent breaking main functionality
  }
};

// Maternal Health API
export const maternalHealthAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/maternal-health");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/maternal-health", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/maternal-health/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/maternal-health/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Child Immunization API
export const childImmunizationAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/child-immunizations");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/child-immunizations", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/child-immunizations/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/child-immunizations/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Deaths API
export const deathsAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/deaths");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (deathData) => {
    try {
      const response = await api.post("/deaths", deathData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, deathData) => {
    try {
      const response = await api.put(`/deaths/${id}`, deathData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/deaths/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Blotter API
export const blottersAPI = {
  getAll: async () => {
    const res = await api.get("/blotters");
    return res.data;
  },
  create: async (data) => {
    const res = await api.post("/blotters", data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/blotters/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/blotters/${id}`);
    return res.data;
  },
};

// Complaints API
export const complaintsAPI = {
  getAll: async () => (await api.get("/complaints")).data,
  getById: async (id) => (await api.get(`/complaints/${id}`)).data,
  create: async (complaintData) =>
    (await api.post("/complaints", complaintData)).data,
  update: async (id, complaintData) =>
    (await api.put(`/complaints/${id}`, complaintData)).data,
  delete: async (id) => (await api.delete(`/complaints/${id}`)).data,
  updateStatus: async (id, status) =>
    (await api.patch(`/complaints/${id}/status`, { status })).data,
  addNote: async (id, note) =>
    (await api.post(`/complaints/${id}/notes`, { note })).data,
  scheduleHearing: async (id, hearingData) =>
    (await api.post(`/complaints/${id}/hearings`, hearingData)).data,
};

// Complaint Categories API
export const complaintCategoriesAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/complaint-categories");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  create: async (categoryData) =>
    (await api.post("/complaint-categories", categoryData)).data,
  update: async (id, categoryData) =>
    (await api.put(`/complaint-categories/${id}`, categoryData)).data,
  delete: async (id) => (await api.delete(`/complaint-categories/${id}`)).data,
};

// Secretary Dashboard API
export const secretaryDashboardAPI = {
  getOverview: async () => {
    try {
      const resp = await api.get("/dashboard/secretary");
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Requests API
export const requestsAPI = {
  list: async () => {
    try {
      const resp = await api.get("/requests");
      return resp.data ?? resp;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  getById: async (id) => {
    try {
      const resp = await api.get(`/requests/${id}`);
      return resp.data ?? resp;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  create: async (payload) => {
    try {
      const resp = await api.post("/requests", payload);
      return resp.data ?? resp;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  updateStatus: async (id, payload) => {
    try {
      const resp = await api.put(`/requests/${id}/status`, payload);
      return resp.data ?? resp;
    } catch (err) {
      throw err.response?.data || err;
    }
  },
};

// Certificate Types API
export const certificateTypesAPI = {
  getAvailableTypes: async (requesterType) => {
    try {
      const resp = await api.get(`/certificate-types`, {
        params: { requesterType },
      });
      return resp.data;
    } catch (error) {
      console.error("Error fetching certificate types:", error);
      return []; // Return empty array as fallback
    }
  },
};

// Fixed spotmapsAPI - Replace this section in your api.js

export const spotmapsAPI = {
  // Upload spot map image
  upload: async (file, mapType) => {
    try {
      const formData = new FormData();
      formData.append("spotmap", file);
      formData.append("mapType", mapType);

      const response = await api.post("/spotmaps/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get current spot maps
  getAll: async () => {
    try {
      const response = await api.get("/spotmaps");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete spot map
  delete: async (mapType) => {
    try {
      const response = await api.delete(`/spotmaps/${mapType}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Notifications API
export const notificationsAPI = {
  getCounts: async () => {
    try {
      const response = await api.get("/notifications/counts");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch notification counts:", error);
      // Return default counts on error to prevent breaking the UI
      return {
        certificate_requests: 0,
        complaints: 0,
        blotter_records: 0,
        announcements: 0,
        events: 0,
        users: 0,
      };
    }
  },

  markViewed: async (entityType, entityId) => {
    try {
      const response = await api.post("/notifications/mark-viewed", {
        entity_type: entityType,
        entity_id: entityId,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to mark notification as viewed:", error);
      // Don't throw error to prevent breaking the UI
      return { success: false };
    }
  },

  markAllViewed: async (entityType) => {
    try {
      const response = await api.post("/notifications/mark-all-viewed", {
        entity_type: entityType,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to mark all notifications as viewed:", error);
      // Don't throw error to prevent breaking the UI
      return { success: false };
    }
  },
};

// Projects API
export const projectsAPI = {
  getAll: async (status = null) => {
    try {
      const params = status && status !== "all" ? { status } : {};
      const response = await api.get("/projects", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (projectData) => {
    try {
      const response = await api.post("/projects", projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, projectData) => {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add project update/progress
  addUpdate: async (projectId, updateData) => {
    try {
      const response = await api.post(
        `/projects/${projectId}/updates`,
        updateData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Barangay History API
export const barangayHistoryAPI = {
  getAll: async () => {
    try {
      const resp = await api.get("/barangay-history");
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  getContent: async () => {
    try {
      const resp = await api.get("/barangay-history/content");
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (payload) => {
    try {
      const formData = new FormData();

      // Add text fields
      if (payload.title) formData.append("title", payload.title);
      if (payload.year) formData.append("year", payload.year);
      if (payload.category) formData.append("category", payload.category);

      // Add file if present
      if (payload.file) {
        formData.append("file", payload.file);
      }

      const resp = await api.post("/barangay-history", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, payload) => {
    try {
      const formData = new FormData();

      // Add text fields
      if (payload.title) formData.append("title", payload.title);
      if (payload.year) formData.append("year", payload.year);
      if (payload.category) formData.append("category", payload.category);

      // Add file if present (only if it's a new file)
      if (payload.file && typeof payload.file !== "string") {
        formData.append("file", payload.file);
      }

      const resp = await api.put(`/barangay-history/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  remove: async (id) => {
    try {
      const resp = await api.delete(`/barangay-history/${id}`);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default api;
