import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:5004/',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Important for cookies
});

// Add request interceptor for authentication
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

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth Routes
export const auth = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
};

// Provider Routes
export const provider = {
    // Authentication
    register: (formData) => {
        return api.post('/provider/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    login: (credentials) => {
        return api.post('/provider/login', credentials, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    logout: () => api.get('/provider/logout'),

    // Food Supply
    supplyFood: (foodData, photo) => {
        const formData = new FormData();
        formData.append('photo', photo);
        Object.keys(foodData).forEach(key => {
            formData.append(key, foodData[key]);
        });
        return api.post('/provider/supply-food', formData);
    },

    // Recipients
    showRecipients: (supplyId) => api.post('/provider/recepients', { supplyId }),
    chooseDistributor: (data) => api.post('/provider/choose-distributor', data),
    giveRating: (data) => api.post('/provider/give-rating', data)
};

// Distributor Routes
export const distributor = {
    // Authentication
    register: (userData, avatar) => {
        const formData = new FormData();
        formData.append('avatar', avatar);
        Object.keys(userData).forEach(key => {
            formData.append(key, userData[key]);
        });
        return api.post('/distributor/register', formData);
    },
    login: (credentials) => api.post('/distributor/login', credentials),
    logout: () => api.get('/distributor/logout'),

    // Food Management
    getSuppliesNearMe: (coordinates) => api.get('/distributor/supplies-near-me', { params: coordinates }),
    selectSupply: (supplyId) => api.post(`/distributor/select-supply/${supplyId}`),
    givePhotoForSupply: (supplyId, photo) => {
        const formData = new FormData();
        formData.append('supplyId', supplyId);
        formData.append('photo', photo);
        return api.post('/distributor/give-photo', formData);
    },
    giveRating: (data) => api.post('/distributor/give-rating', data)
};

// Admin Routes
export const admin = {
    login: (credentials) => api.post('/admin/login', credentials),
    logout: () => api.post('/admin/logout'),
    verifyDistributor: (distributorId) => api.post(`/admin/verify-distributor/${distributorId}`),
    rejectDistributor: (distributorId) => api.post(`/admin/reject-distributor/${distributorId}`),
    getUnverifiedDistributors: () => api.get('/admin/unverified-distributors')
};

// Common Routes
export const common = {
    // Location Services
    getNearbyLocations: (coordinates) => 
        api.get('/locations/nearby', { params: coordinates }),
    
    // Statistics
    getDashboardStats: () => api.get('/stats/dashboard'),
};

export default api; 