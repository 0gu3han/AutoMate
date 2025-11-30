import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Change this to your backend URL (localhost won't work on device, use your machine's IP)
const API_BASE_URL = 'http://192.168.1.100:8000/api'; // Replace 192.168.1.100 with your machine's IP

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased from 10s to 30s for slower connections
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  } catch (error) {
    console.error('Error getting token:', error);
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      // Optionally navigate to login here
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/members/register/', userData),
  login: (credentials) => api.post('/members/login/', credentials),
  logout: () => api.post('/members/logout/'),
};

export const carsAPI = {
  getAll: () => api.get('/cars/'),
  getOne: (id) => api.get(`/cars/${id}/`),
  create: (carData) => api.post('/cars/', carData),
  update: (id, carData) => api.put(`/cars/${id}/`, carData),
  delete: (id) => api.delete(`/cars/${id}/`),
};

export const diagnosisAPI = {
  getAll: () => api.get('/ai_assistant/diagnosis-requests/'),
  create: (formData) => api.post('/ai_assistant/diagnosis-requests/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getOne: (id) => api.get(`/ai_assistant/diagnosis-requests/${id}/`),
  delete: (id) => api.delete(`/ai_assistant/diagnosis-requests/${id}/`),
};

export default api;
