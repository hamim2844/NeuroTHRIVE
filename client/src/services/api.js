import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle 403 errors (forbidden)
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  verifyPhone: (phoneNumber, code) => api.post('/auth/verify-phone', { phoneNumber, code }),
  resendVerification: () => api.post('/auth/resend-verification'),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updateSettings: (data) => api.put('/users/settings', data),
  getTransactions: (page = 1, limit = 20) => 
    api.get(`/users/transactions?page=${page}&limit=${limit}`),
  getEarnings: (startDate, endDate) => 
    api.get(`/users/earnings?startDate=${startDate}&endDate=${endDate}`),
  getReferrals: (page = 1, limit = 20) => 
    api.get(`/users/referrals?page=${page}&limit=${limit}`),
  getReferralStats: () => api.get('/users/referral-stats'),
};

// Offers API
export const offersAPI = {
  getAll: (filters = {}) => api.get('/offers', { params: filters }),
  getByCategory: (category, country) => 
    api.get(`/offers/category/${category}?country=${country}`),
  getFeatured: (country) => api.get(`/offers/featured?country=${country}`),
  getPremium: (country) => api.get(`/offers/premium?country=${country}`),
  getById: (id) => api.get(`/offers/${id}`),
  clickOffer: (id) => api.post(`/offers/${id}/click`),
  completeOffer: (id, data) => api.post(`/offers/${id}/complete`, data),
  getOfferwall: (provider) => api.get(`/offers/offerwall/${provider}`),
};

// Earnings API
export const earningsAPI = {
  getStats: () => api.get('/earnings/stats'),
  getDailyBonus: () => api.post('/earnings/daily-bonus'),
  getQuiz: () => api.get('/earnings/quiz'),
  submitQuiz: (answers) => api.post('/earnings/quiz', { answers }),
  watchVideo: () => api.post('/earnings/watch-video'),
  getLeaderboard: (period = 'weekly') => 
    api.get(`/earnings/leaderboard?period=${period}`),
};

// Payouts API
export const payoutsAPI = {
  requestPayout: (data) => api.post('/payouts/request', data),
  getPayouts: (page = 1, limit = 20) => 
    api.get(`/payouts?page=${page}&limit=${limit}`),
  getPayoutById: (id) => api.get(`/payouts/${id}`),
  cancelPayout: (id) => api.post(`/payouts/${id}/cancel`),
  getPayoutMethods: () => api.get('/payouts/methods'),
  addPayoutMethod: (data) => api.post('/payouts/methods', data),
  removePayoutMethod: (id) => api.delete(`/payouts/methods/${id}`),
};

// Admin API
export const adminAPI = {
  // Users management
  getUsers: (filters = {}) => api.get('/admin/users', { params: filters }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  banUser: (id, reason) => api.post(`/admin/users/${id}/ban`, { reason }),
  unbanUser: (id) => api.post(`/admin/users/${id}/unban`),
  
  // Offers management
  createOffer: (data) => api.post('/admin/offers', data),
  updateOffer: (id, data) => api.put(`/admin/offers/${id}`, data),
  deleteOffer: (id) => api.delete(`/admin/offers/${id}`),
  toggleOfferStatus: (id) => api.post(`/admin/offers/${id}/toggle`),
  
  // Payouts management
  getPendingPayouts: () => api.get('/admin/payouts/pending'),
  approvePayout: (id, data) => api.post(`/admin/payouts/${id}/approve`, data),
  rejectPayout: (id, reason) => api.post(`/admin/payouts/${id}/reject`, { reason }),
  processPayout: (id, data) => api.post(`/admin/payouts/${id}/process`, data),
  
  // Statistics
  getDashboardStats: () => api.get('/admin/stats/dashboard'),
  getEarningsReport: (filters = {}) => 
    api.get('/admin/stats/earnings', { params: filters }),
  getPayoutReport: (filters = {}) => 
    api.get('/admin/stats/payouts', { params: filters }),
  
  // Notifications
  sendNotification: (data) => api.post('/admin/notifications/send', data),
  getNotifications: () => api.get('/admin/notifications'),
};

// Webhooks API
export const webhooksAPI = {
  adgatemedia: (data) => api.post('/webhooks/adgatemedia', data),
  cpalead: (data) => api.post('/webhooks/cpalead', data),
  ogads: (data) => api.post('/webhooks/ogads', data),
};

// Utility functions
export const apiUtils = {
  // Upload file
  uploadFile: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
  
  // Download file
  downloadFile: (url, filename) => {
    return api.get(url, {
      responseType: 'blob',
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  },
};

export default api;
