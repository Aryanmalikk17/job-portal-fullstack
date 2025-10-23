import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

// Initial state
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// Action types
const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    SET_LOADING: 'SET_LOADING',
    CLEAR_ERROR: 'CLEAR_ERROR',
    SET_USER: 'SET_USER',
};

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case AUTH_ACTIONS.LOGIN_FAILURE:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload,
            };
        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };
        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload,
            };
        case AUTH_ACTIONS.SET_USER:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: !!action.payload,
                isLoading: false,
            };
        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Initialize auth state
    useEffect(() => {
        const initializeAuth = async () => {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
            
            if (authService.isAuthenticated()) {
                try {
                    // FIXED: First try to get stored user data to avoid API call delay
                    const storedUser = authService.getStoredUser();
                    if (storedUser) {
                        // Use stored user data immediately
                        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: storedUser });
                    } else {
                        // If no stored data, try API call
                        const user = await authService.getCurrentUser();
                        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
                    }
                } catch (error) {
                    console.error('Auth initialization failed:', error);
                    // Token might be invalid, clear it
                    await authService.logout();
                    dispatch({ type: AUTH_ACTIONS.LOGOUT });
                }
            } else {
                dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            }
        };

        initializeAuth();
    }, []); // Empty dependency array - only run on mount

    // Login function - memoized to prevent re-renders
    const login = useCallback(async (credentials) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START });
        try {
            const response = await authService.login(credentials);
            const user = {
                userId: response.userId,
                email: response.email,
                firstName: response.firstName,
                lastName: response.lastName,
                userType: response.userType,
            };
            dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
            return { success: true, user };
        } catch (error) {
            dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: error.message });
            return { success: false, error: error.message };
        }
    }, []);

    // Logout function - memoized to prevent re-renders
    const logout = useCallback(async () => {
        await authService.logout();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }, []);

    // Clear error function - memoized to prevent re-renders
    const clearError = useCallback(() => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    }, []);

    const value = {
        ...state,
        login,
        logout,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};