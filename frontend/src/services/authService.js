import api from './api';

const AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register', // FIXED: Changed from '/register/new' to '/auth/register'
    VERIFY: '/auth/verify',     // FIXED: Matches backend GET and POST /api/auth/verify
    USER: '/auth/user',         // FIXED: Matches backend GET /api/auth/user
};

export const authService = {
    // Register new user
    register: async (userData) => {
        try {
            const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
            
            // Handle successful registration - store token if provided
            if (response.data.token) {
                localStorage.setItem(
                    process.env.REACT_APP_JWT_STORAGE_KEY || 'jwt-token', 
                    response.data.token
                );
                localStorage.setItem(
                    process.env.REACT_APP_USER_STORAGE_KEY || 'user-info', 
                    JSON.stringify({
                        userId: response.data.userId,
                        email: response.data.email,
                        firstName: response.data.firstName,
                        lastName: response.data.lastName,
                        userType: response.data.userType,
                    })
                );
            }
            
            return response.data;
        } catch (error) {
            // Handle different error formats
            if (error.response?.data) {
                throw error.response.data;
            }
            throw { message: 'Registration failed. Please try again.' };
        }
    },

    // Login user
    login: async (credentials) => {
        try {
            const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
            
            if (response.data.token) {
                // Store token and user info
                localStorage.setItem(
                    process.env.REACT_APP_JWT_STORAGE_KEY || 'jwt-token', 
                    response.data.token
                );
                localStorage.setItem(
                    process.env.REACT_APP_USER_STORAGE_KEY || 'user-info', 
                    JSON.stringify({
                        userId: response.data.userId,
                        email: response.data.email,
                        firstName: response.data.firstName,
                        lastName: response.data.lastName,
                        userType: response.data.userType,
                    })
                );
            }
            
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Login failed' };
        }
    },

    // Logout user
    logout: async () => {
        try {
            await api.post(AUTH_ENDPOINTS.LOGOUT);
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            // Always clear local storage
            localStorage.removeItem(process.env.REACT_APP_JWT_STORAGE_KEY || 'jwt-token');
            localStorage.removeItem(process.env.REACT_APP_USER_STORAGE_KEY || 'user-info');
        }
    },

    // Verify token - FIXED: Uses correct backend endpoint
    verifyToken: async () => {
        try {
            const response = await api.get(AUTH_ENDPOINTS.VERIFY);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Token verification failed' };
        }
    },

    // Get current user - FIXED: Uses correct backend endpoint
    getCurrentUser: async () => {
        try {
            const response = await api.get(AUTH_ENDPOINTS.USER);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to get user info' };
        }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem(process.env.REACT_APP_JWT_STORAGE_KEY || 'jwt-token');
        return !!token;
    },

    // Get stored user info
    getStoredUser: () => {
        const userInfo = localStorage.getItem(process.env.REACT_APP_USER_STORAGE_KEY || 'user-info');
        return userInfo ? JSON.parse(userInfo) : null;
    },
};