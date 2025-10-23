import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(process.env.REACT_APP_JWT_STORAGE_KEY || 'jwt-token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Don't redirect to login if we're already on login page or making a login request
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        const isOnLoginPage = window.location.pathname === '/login';
        
        if (error.response?.status === 401 && !isLoginRequest && !isOnLoginPage) {
            // Token expired or invalid - only redirect if not already logging in
            localStorage.removeItem(process.env.REACT_APP_JWT_STORAGE_KEY || 'jwt-token');
            localStorage.removeItem(process.env.REACT_APP_USER_STORAGE_KEY || 'user-info');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;