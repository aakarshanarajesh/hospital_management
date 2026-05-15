import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getUsers: (role) => api.get('/auth/users', { params: { role } }),
};

// Patient API
export const patientAPI = {
  getAll: (status) => api.get('/patients', { params: { status } }),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  discharge: (id) => api.put(`/patients/${id}/discharge`),
  delete: (id) => api.delete(`/patients/${id}`),
};

// Bed API
export const bedAPI = {
  getAll: (wardType, status) =>
    api.get('/beds', { params: { wardType, status } }),
  getById: (id) => api.get(`/beds/${id}`),
  create: (data) => api.post('/beds', data),
  assign: (data) => api.post('/beds/assign', data),
  free: (data) => api.post('/beds/free', data),
  getStats: () => api.get('/beds/stats/overview'),
};

// Doctor Schedule API
export const scheduleAPI = {
  getAll: (filters) => api.get('/schedules', { params: filters }),
  getById: (id) => api.get(`/schedules/${id}`),
  getByDoctor: (doctorId, date) =>
    api.get(`/schedules/doctor/${doctorId}`, { params: { date } }),
  create: (data) => api.post('/schedules', data),
  assignPatient: (data) => api.post('/schedules/assign', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
};

// Resource API
export const resourceAPI = {
  getAll: (ward) => api.get('/resources', { params: { ward } }),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  updateQuantity: (id, data) => api.put(`/resources/${id}/use`, data),
  restock: (id, data) => api.put(`/resources/${id}/restock`, data),
  getLowStock: () => api.get('/resources/alerts/low-stock'),
  getStats: () => api.get('/resources/stats/overview'),
};

// AI API
export const aiAPI = {
  predictRisk: (data) => api.post('/ai/predict-risk', data),
  getHighRiskPatients: () => api.get('/ai/high-risk-patients'),
  getDashboardStats: () => api.get('/ai/dashboard-stats'),
  askAssistant: (question) => api.post('/ai/ask-assistant', { question }),
  getHospitalStats: () => api.get('/ai/hospital-stats'),
  getServiceHealth: () => api.get('/ai/service-health'),
};

export default api;
