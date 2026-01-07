import axios from 'axios';

// API base URL - automatically switches between dev and production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - redirect to login
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const adminAPI = {
    // Users
    getAllUsers: () => api.get('/users'),
    updateUser: (id, data) => api.put(`/users/${id}/admin`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),

    // Professionals
    getProfessionals: () => api.get('/users/admin/professionals'),
    updateUserStatus: (id, status) => api.put(`/users/${id}/status`, { verificationStatus: status }),

    // Orders
    getAllOrders: () => api.get('/orders/all'),
    updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
    deleteOrder: (id) => api.delete(`/orders/${id}`),

    // Reviews
    getAllReviews: () => api.get('/reviews'),
    deleteReview: (id) => api.delete(`/reviews/${id}`),

    // Services
    getServices: () => api.get('/services'),
    createService: (data) => api.post('/services', data),
    updateService: (id, data) => api.put(`/services/${id}`, data),
    deleteService: (id) => api.delete(`/services/${id}`),
};

export default api;
