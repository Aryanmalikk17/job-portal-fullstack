import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const { login, isAuthenticated, error, clearError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location.state?.from?.pathname]);

    // Clear errors when component mounts - FIXED: Remove clearError from dependencies
    useEffect(() => {
        clearError();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsLoading(true);
        clearError();
        
        try {
            const result = await login({
                email: formData.email,
                password: formData.password,
                rememberMe: formData.rememberMe
            });
            
            if (result.success) {
                const from = location.state?.from?.pathname || '/dashboard';
                navigate(from, { replace: true });
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-body">
            <div className="auth-container">
                <Row className="min-vh-100 g-0">
                    {/* Left Side - Branding */}
                    <Col lg={6} className="d-none d-lg-flex">
                        <div className="auth-brand-section">
                            <div className="auth-brand-overlay"></div>
                            <div className="auth-brand-content">
                                <div className="brand-logo-large">
                                    <h1>
                                        <span className="brand-name">Zpluse</span>{' '}
                                        <span className="brand-suffix">Jobs Finder</span>
                                    </h1>
                                    <p className="brand-tagline">
                                        Welcome back! Continue your journey to find amazing opportunities
                                    </p>
                                </div>
                                
                                <div className="auth-features">
                                    <div className="feature-item">
                                        <div className="feature-icon">
                                            <i className="fa fa-rocket"></i>
                                        </div>
                                        <div className="feature-text">
                                            <h6>Quick Access</h6>
                                            <p>Jump right back into your personalized job dashboard</p>
                                        </div>
                                    </div>
                                    <div className="feature-item">
                                        <div className="feature-icon">
                                            <i className="fa fa-heart"></i>
                                        </div>
                                        <div className="feature-text">
                                            <h6>Saved Jobs</h6>
                                            <p>Access your saved jobs and track your applications</p>
                                        </div>
                                    </div>
                                    <div className="feature-item">
                                        <div className="feature-icon">
                                            <i className="fa fa-bell"></i>
                                        </div>
                                        <div className="feature-text">
                                            <h6>Smart Alerts</h6>
                                            <p>Get notified about new opportunities that match your profile</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                    
                    {/* Right Side - Login Form */}
                    <Col lg={6}>
                        <div className="auth-form-section">
                            <div className="auth-form-container">
                                {/* Mobile Brand Logo */}
                                <div className="mobile-brand d-lg-none text-center mb-4">
                                    <h3>
                                        <span className="brand-name">Zpluse</span>{' '}
                                        <span className="brand-suffix">Jobs Finder</span>
                                    </h3>
                                </div>
                                
                                <div className="auth-form-header">
                                    <div className="text-center mb-4">
                                        <div className="login-avatar mb-3">
                                            <i className="fa fa-user-circle fa-4x text-primary"></i>
                                        </div>
                                    </div>
                                    <h2 className="auth-title">Welcome Back</h2>
                                    <p className="auth-subtitle">Sign in to your account to continue</p>
                                </div>
                                
                                {/* Global Error Alert */}
                                {error && (
                                    <Alert variant="danger" className="alert-custom alert-error">
                                        <i className="fa fa-exclamation-triangle me-2"></i>
                                        {error}
                                    </Alert>
                                )}
                                
                                <Form onSubmit={handleSubmit} className="auth-form" noValidate>
                                    {/* Email Field */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email Address</Form.Label>
                                        <InputGroup>
                                            <span className="input-group-text">
                                                <i className="fa fa-envelope"></i>
                                            </span>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                placeholder="Enter your email address"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                isInvalid={!!validationErrors.email}
                                                isValid={formData.email && !validationErrors.email && /\S+@\S+\.\S+/.test(formData.email)}
                                                className="modern-input"
                                                required
                                            />
                                        </InputGroup>
                                        {validationErrors.email && (
                                            <div className="invalid-feedback d-block">
                                                {validationErrors.email}
                                            </div>
                                        )}
                                        {formData.email && !validationErrors.email && /\S+@\S+\.\S+/.test(formData.email) && (
                                            <div className="valid-feedback d-block">
                                                Email format is valid
                                            </div>
                                        )}
                                    </Form.Group>
                                    
                                    {/* Password Field */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Password</Form.Label>
                                        <InputGroup>
                                            <span className="input-group-text">
                                                <i className="fa fa-lock"></i>
                                            </span>
                                            <Form.Control
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                placeholder="Enter your password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                isInvalid={!!validationErrors.password}
                                                isValid={formData.password && formData.password.length >= 6}
                                                className="modern-input"
                                                required
                                            />
                                            <Button 
                                                variant="outline-secondary" 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                            </Button>
                                        </InputGroup>
                                        {validationErrors.password && (
                                            <div className="invalid-feedback d-block">
                                                {validationErrors.password}
                                            </div>
                                        )}
                                    </Form.Group>

                                    {/* Remember Me & Forgot Password Row */}
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <Form.Check
                                            type="checkbox"
                                            name="rememberMe"
                                            checked={formData.rememberMe}
                                            onChange={handleInputChange}
                                            label="Remember me"
                                            className="remember-me-check"
                                        />
                                        <Link to="/forgot-password" className="forgot-password-link">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    
                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="auth-btn w-100 mb-3"
                                        disabled={isLoading}
                                    >
                                        {isLoading && (
                                            <div className="loading-spinner me-2" style={{ display: 'inline-block' }}></div>
                                        )}
                                        {!isLoading && <i className="fa fa-sign-in-alt me-2"></i>}
                                        {isLoading ? 'Signing In...' : 'Sign In'}
                                    </Button>
                                    
                                    <div className="auth-divider">
                                        <span>Don't have an account?</span>
                                    </div>
                                    
                                    <div className="auth-footer text-center">
                                        <p className="mb-0">
                                            <Link to="/register" className="register-link">
                                                Create Your Account
                                            </Link>
                                        </p>
                                    </div>
                                </Form>
                                
                                {/* Back to Home Link */}
                                <div className="text-center mt-4">
                                    <Link 
                                        to="/" 
                                        className="back-to-home-link"
                                    >
                                        <i className="fa fa-arrow-left me-2"></i>
                                        Back to Home
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default LoginPage;