import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses
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

// Cars API
export const carsAPI = {
  getAll: () => api.get('/cars/'),
  getById: (id) => api.get(`/cars/${id}/`),
  create: (data) => api.post('/cars/', data),
  update: (id, data) => api.put(`/cars/${id}/`, data),
  delete: (id) => api.delete(`/cars/${id}/`),
};

// Maintenance API
export const maintenanceAPI = {
  getAll: () => api.get('/maintenance/'),
  getById: (id) => api.get(`/maintenance/${id}/`),
  create: (data) => api.post('/maintenance/', data),
  update: (id, data) => api.put(`/maintenance/${id}/`, data),
  delete: (id) => api.delete(`/maintenance/${id}/`),
  getByCar: (carId) => api.get(`/maintenance/car/${carId}/`),
};

// AI Assistant API
export const aiAssistantAPI = {
  getAll: () => api.get('/ai-assistant/'),
  getById: (id) => api.get(`/ai-assistant/${id}/`),
  create: (formData) => {
    return api.post('/ai-assistant/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, data) => api.put(`/ai-assistant/${id}/`, data),
  delete: (id) => api.delete(`/ai-assistant/${id}/`),
  getByCar: (carId) => api.get(`/ai-assistant/car/${carId}/`),
};

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  getProfile: () => api.get('/auth/profile/'),
};

export default api; 