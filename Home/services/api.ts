import axios from 'axios';
import config from '../config';

const api = axios.create({
    baseURL: config.apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authAPI = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
};

export const userAPI = {
    getProfessionals: (category?: string) => {
        const url = category ? `/users/professionals/${category}` : '/users/professionals';
        return api.get(url);
    },
    getUser: (userId: string) => api.get(`/users/${userId}`),
    toggleAvailability: (userId: string) => api.put(`/users/${userId}/availability`),
    updateProfile: (userId: string, data: { name?: string; phone?: string; address?: string; email?: string }) =>
        api.put(`/users/${userId}/profile`, data),
};

export const orderAPI = {
    create: (data: any) => api.post('/orders', data),
    // role is either 'customer' or 'professional'
    getByUser: (userId: string, role: string) => api.get(`/orders?userId=${userId}&role=${role}`),
    updateStatus: (orderId: string, data: { status?: string; price?: number }) => api.put(`/orders/${orderId}/status`, data),
};

export const serviceAPI = {
    getAll: () => api.get('/services'),
};

export const reviewAPI = {
    create: (data: { orderId: string; customerId: string; rating: number; comment?: string }) =>
        api.post('/reviews', data),
    getForProfessional: (professionalId: string) => api.get(`/reviews/professional/${professionalId}`),
    checkOrderReview: (orderId: string) => api.get(`/reviews/order/${orderId}`),
};

export const uploadAPI = {
    uploadImage: (base64Image: string) => api.post('/upload/image', { image: base64Image }),
};

export const settingsAPI = {
    get: (key: string) => api.get(`/settings/${key}`),
};

export const notificationAPI = {
    getAll: (userId: string) => api.get(`/notifications?userId=${userId}`),
    markRead: (id: string) => api.put(`/notifications/${id}/read`),
    markAllRead: (userId: string) => api.put('/notifications/read-all', { userId }),
};

export default api;
