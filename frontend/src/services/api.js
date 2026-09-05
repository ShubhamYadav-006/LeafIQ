import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to inject Authorization Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('leafiq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorPayload = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to LeafIQ backend service. Please check your internet connection.',
    };
    return Promise.reject(errorPayload);
  }
);

// Authentication API methods
export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  getProfile: () => api.get('/auth/me'),
};

// Scan Workflow API methods
export const scanApi = {
  uploadScan: (imageFile, parentScanId = null) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (parentScanId) {
      formData.append('parent_scan_id', parentScanId);
    }
    return api.post('/scans/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  analyzeScan: (scanId) => api.post(`/scans/${scanId}/analyze`),
  getQuestions: (scanId) => api.get(`/scans/${scanId}/questions`),
  submitAnswers: (scanId, answers) => api.post(`/scans/${scanId}/answers`, { answers }),
  finalizeScan: (scanId) => api.post(`/scans/${scanId}/finalize`),
  getScanDetails: (scanId) => api.get(`/scans/${scanId}`),
  claimScan: (scanId) => api.post(`/scans/${scanId}/claim`),
  listScans: () => api.get('/scans'),
  compareScans: (baselineScanId, followupScanId) =>
    api.post(`/scans/${baselineScanId}/compare`, { followup_scan_id: followupScanId }),
};

export default api;
