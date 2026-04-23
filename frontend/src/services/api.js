import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
    // Hardening: Ensure baseURL always ends with a slash so that service calls 
    // using relative paths (no leading slash) resolve correctly to the /api/ context.
    baseURL: API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT, 10) || 10000,
    withCredentials: true, // Required for CORS with credentials
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
        // Don't redirect to login if we're on auth-related pages or making auth requests
        const isAuthRequest = error.config?.url?.includes('/auth/login') ||
                              error.config?.url?.includes('/auth/register');
        const isOnAuthPage = window.location.pathname === '/login' ||
                             window.location.pathname === '/register';
        
        if (error.response?.status === 500) {
            alert("Database Sync Error: Please refresh your profile data");
        }

        if (error.response?.status === 401 && !isAuthRequest && !isOnAuthPage) {
            // Token expired or invalid — only redirect if not already on auth flow
            localStorage.removeItem(process.env.REACT_APP_JWT_STORAGE_KEY || 'jwt-token');
            localStorage.removeItem(process.env.REACT_APP_USER_STORAGE_KEY || 'user-info');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;