import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const response = await api.post('/auth/refresh');
                const { token } = response.data;
                localStorage.setItem('token', token);
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const auth = {
    login: (address) => api.post('/auth/flow', { address }),
    verify: () => api.get('/auth/verify'),
    getAccount: () => api.get('/auth/account'),
    logout: () => api.post('/auth/logout')
};

// Listing endpoints
export const listings = {
    create: (formData) => api.post('/listings', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),
    getAll: (params) => api.get('/listings', { params }),
    getById: (id) => api.get(`/listings/${id}`),
    getUserListings: (address) => api.get(`/listings/user/${address}`),
    update: (id, data) => api.put(`/listings/${id}`, data),
    delete: (id) => api.delete(`/listings/${id}`)
};

// Purchase endpoints
export const purchases = {
    create: (listingId) => api.post(`/purchases/${listingId}`),
    complete: (purchaseId) => api.post(`/purchases/${purchaseId}/complete`),
    getById: (purchaseId) => api.get(`/purchases/${purchaseId}`),
    getUserPurchases: (address) => api.get(`/purchases/user/${address}`),
    getCode: (purchaseId) => api.get(`/purchases/${purchaseId}/code`),
    submitReview: (purchaseId, data) => api.post(`/purchases/${purchaseId}/review`, data)
};

// Flow blockchain interactions
export const flow = {
    getBalance: async (address) => {
        const response = await api.get(`/auth/verify`);
        return response.data.flowTokenBalance;
    },
    getAccountDetails: async () => {
        const response = await api.get('/auth/account');
        return response.data;
    }
};

export default api; 