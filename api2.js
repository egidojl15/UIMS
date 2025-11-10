import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage (support both keys)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Debug-friendly response interceptor (does not auto-clear token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.debug('[API] response error', error?.response?.status, error?.config?.url);
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (payload) => {
    try {
      const resp = await api.post('/auth/login', payload);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  logout: async () => {
    try {
      const resp = await api.post('/auth/logout');
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Profile API
export const profileAPI = {
  getProfile: async () => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  changePassword: async (payload) => {
    try {
      const response = await api.post('/profile/change-password', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Secretary Dashboard API
export const secretaryDashboardAPI = {
  getOverview: async () => {
    try {
      const resp = await api.get('/dashboard/secretary');
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
      const resp = await api.get('/requests');
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
      const resp = await api.post('/requests', payload);
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

// Announcements API
export const announcementsAPI = {
  list: async () => {
    try {
      const resp = await api.get('/announcements');
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  create: async (payload) => {
    try {
      const resp = await api.post('/announcements', payload);
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

// Events API
export const eventsAPI = {
  list: async () => {
    try {
      const resp = await api.get('/events');
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  create: async (payload) => {
    try {
      const resp = await api.post('/events', payload);
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

// Officials API
export const officialsAPI = {
  list: async () => {
    try {
      const resp = await api.get('/officials');
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  // ADD THIS METHOD - Get positions
  getPositions: async () => {
    try {
      const resp = await api.get('/officials/positions');
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  create: async (payload) => {
    try {
      const resp = await api.post('/officials', payload);
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


// Users API (basic)
export const usersAPI = {
  list: async () => {
    try {
      const resp = await api.get('/users');
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  create: async (payload) => {
    try {
      const resp = await api.post('/users', payload);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// New: Residents API (used by BhwDashboard and other pages)
export const residentsAPI = {
  getAll: async () => {
    try {
      const resp = await api.get('/residents');
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  list: async () => {
    return residentsAPI.getAll();
  },
  getById: async (id) => {
    try {
      const resp = await api.get(`/residents/${id}`);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  create: async (payload) => {
    try {
      const resp = await api.post('/residents', payload);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  update: async (id, payload) => {
    try {
      const resp = await api.put(`/residents/${id}`, payload);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  remove: async (id) => {
    try {
      const resp = await api.delete(`/residents/${id}`);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  // upload photo (multipart/form-data)
  updatePhoto: async (id, file) => {
    try {
      const form = new FormData();
      form.append('photo', file);
      const resp = await api.post(`/residents/${id}/photo`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// New: Households API (derive from residents if backend has no /households route)
export const householdsAPI = {
  // keep a consistent return shape: { households: [...] }
  getAll: async () => {
    try {
      // call /residents and accept multiple shapes
      const resp = await api.get('/residents');
      const data = resp?.data ?? resp;
      let residents = [];

      if (Array.isArray(data)) {
        residents = data;
      } else if (data && Array.isArray(data.residents)) {
        residents = data.residents;
      } else if (data && Array.isArray(data.data)) {
        residents = data.data;
      } else {
        console.debug('[householdsAPI] fallback empty - unexpected residents payload', data);
        return { households: [] };
      }

      // build unique households map
      const map = new Map();
      residents.forEach((r) => {
        const hid = r.household_id ?? r.householdId ?? r.household_number ?? r.household_no ?? r.household;
        if (!hid) return;
        if (!map.has(hid)) {
          map.set(hid, {
            household_id: hid,
            household_head: r.household_head ?? r.head_of_household ?? r.full_name ?? r.name ?? null,
            members_count: 1,
            members: [r],
          });
        } else {
          const item = map.get(hid);
          item.members_count += 1;
          item.members.push(r);
        }
      });

      const households = Array.from(map.values());
      return { households };
    } catch (error) {
      console.debug('[householdsAPI] error/fallback', error?.response?.data || error?.message || error);
      return { households: [] };
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

      const r = await api.get('/residents');
      const data = r?.data ?? r;
      let residents = [];

      if (Array.isArray(data)) residents = data;
      else if (data && Array.isArray(data.residents)) residents = data.residents;
      else if (data && Array.isArray(data.data)) residents = data.data;
      else residents = [];

      const members = residents.filter(x => {
        const hid = x.household_id ?? x.householdId ?? x.household_number ?? x.household_no ?? x.household;
        return String(hid) === String(id);
      });

      return { household_id: id, members };
    } catch (err) {
      console.debug('[householdsAPI] getById error', err?.response?.data || err?.message || err);
      return { household_id: id, members: [] };
    }
  },
};

// Complaints API (add getAll alias used by some components)
export const complaintsAPI = {
  list: async () => {
    try {
      const resp = await api.get('/complaints');
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  // alias expected by older components
  getAll: async () => {
    const res = await complaintsAPI.list();
    // normalize shape: prefer { complaints: [...] } or array
    if (Array.isArray(res)) return { complaints: res };
    return res;
  },

  getById: async (id) => {
    try {
      const resp = await api.get(`/complaints/${id}`);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  create: async (payload) => {
    try {
      const resp = await api.post('/complaints', payload);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  update: async (id, payload) => {
    try {
      const resp = await api.put(`/complaints/${id}`, payload);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  remove: async (id) => {
    try {
      const resp = await api.delete(`/complaints/${id}`);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Blotter API (add getAll alias)
export const blotterAPI = {
  list: async () => {
    try {
      const resp = await api.get('/blotter-records');
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  getAll: async () => {
    const res = await blotterAPI.list();
    if (Array.isArray(res)) return { blotters: res };
    return res;
  },
  getById: async (id) => {
    try {
      const resp = await api.get(`/blotter-records/${id}`);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  create: async (payload) => {
    try {
      const resp = await api.post('/blotter-records', payload);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  update: async (id, payload) => {
    try {
      const resp = await api.put(`/blotter-records/${id}`, payload);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  remove: async (id) => {
    try {
      const resp = await api.delete(`/blotter-records/${id}`);
      return resp.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// New: Logins API (for monitoring login history and activities)
export const loginsAPI = {
  // general list (backend may expose /login_history or /login-activity)
  list: async () => {
    try {
      const resp = await api.get('/login_history');
      return resp.data;
    } catch (error) {
      // try alternate path if backend uses different route name
      try {
        const resp = await api.get('/login-activity');
        return resp.data;
      } catch (err) {
        throw error.response?.data || error;
      }
    }
  },

  // recent entries
  recent: async (limit = 10) => {
    try {
      const resp = await api.get(`/login_history?limit=${limit}`);
      return resp.data;
    } catch (error) {
      try {
        const resp = await api.get(`/login-activity?limit=${limit}`);
        return resp.data;
      } catch (err) {
        throw error.response?.data || error;
      }
    }
  },

  // by user id
  getByUser: async (userId) => {
    try {
      const resp = await api.get(`/login_history/user/${userId}`);
      return resp.data;
    } catch (error) {
      try {
        const resp = await api.get(`/login-activity/user/${userId}`);
        return resp.data;
      } catch (err) {
        throw error.response?.data || error;
      }
    }
  },
};

// Certificate Types API
export const certificateTypesAPI = {
  getAvailableTypes: async (requesterType) => {
    try {
      const resp = await api.get(`/certificate-types`, {
        params: { requesterType }
      });
      return resp.data;
    } catch (error) {
      console.error('Error fetching certificate types:', error);
      return []; // Return empty array as fallback
    }
  }
};

export default api;