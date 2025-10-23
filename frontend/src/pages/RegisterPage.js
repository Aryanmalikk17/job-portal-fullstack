import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        userTypeId: 2, // Default to Job Seeker
        agreeTerms: false
    });
    const [userType, setUserType] = useState('jobseeker'); // 'jobseeker' or 'recruiter'
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear field-specific errors
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Real-time email validation
        if (name === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                setErrors(prev => ({
                    ...prev,
                    email: 'Please enter a valid email address'
                }));
            }
        }

        // Password strength validation
        if (name === 'password') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        setPasswordStrength(strength);
    };

    const getPasswordStrengthClass = () => {
        if (passwordStrength <= 2) return 'strength-weak';
        if (passwordStrength <= 3) return 'strength-fair';
        if (passwordStrength <= 4) return 'strength-good';
        return 'strength-strong';
    };

    const getPasswordStrengthText = () => {
        if (!formData.password) return 'Password must be 6-100 characters long';
        if (passwordStrength <= 2) return 'Weak password';
        if (passwordStrength <= 3) return 'Fair password';
        if (passwordStrength <= 4) return 'Good password';
        return 'Strong password';
    };

    const handleUserTypeSelect = (type) => {
        setUserType(type);
        setFormData(prev => ({
            ...prev,
            userTypeId: type === 'jobseeker' ? 2 : 1
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        // First Name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters long';
        }

        // Last Name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters long';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'Please enter a valid email address';
            }
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
        } else if (formData.password.length > 100) {
            newErrors.password = 'Password must be less than 100 characters';
        }

        // Terms validation
        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'You must agree to the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('Form submitted with data:', formData); // Debug log
        
        if (!validateForm()) {
            console.log('Form validation failed:', errors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const registrationData = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                password: formData.password,
                userTypeId: formData.userTypeId
            };

            console.log('Sending registration data:', registrationData); // Debug log

            const response = await authService.register(registrationData);
            
            console.log('Registration successful:', response); // Debug log
            
            setSuccessMessage('Account created successfully! Please sign in to continue.');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            
            if (error.response && error.response.data) {
                if (error.response.data.validationErrors) {
                    setErrors(error.response.data.validationErrors);
                } else if (error.response.data.message) {
                    setErrors({ general: error.response.data.message });
                } else {
                    setErrors({ general: 'Registration failed. Please try again.' });
                }
            } else if (error.message) {
                setErrors({ general: error.message });
            } else {
                setErrors({ general: 'Network error. Please check your connection and try again.' });
            }
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
                                        Join Thousands of Professionals Finding Their Dream Jobs
                                    </p>
                                </div>
                                
                                <div className="auth-features">
                                    <div className="feature-item">
                                        <div className="feature-icon">
                                            <i className="fa fa-user-plus"></i>
                                        </div>
                                        <div className="feature-text">
                                            <h6>Quick Registration</h6>
                                            <p>Create your account in less than 2 minutes</p>
                                        </div>
                                    </div>
                                    <div className="feature-item">
                                        <div className="feature-icon">
                                            <i className="fa fa-shield"></i>
                                        </div>
                                        <div className="feature-text">
                                            <h6>Secure & Private</h6>
                                            <p>Your data is protected with enterprise-grade security</p>
                                        </div>
                                    </div>
                                    <div className="feature-item">
                                        <div className="feature-icon">
                                            <i className="fa fa-star"></i>
                                        </div>
                                        <div className="feature-text">
                                            <h6>Premium Experience</h6>
                                            <p>Access exclusive features and priority support</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                    
                    {/* Right Side - Register Form */}
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
                                    <h2 className="auth-title">Create Your Account</h2>
                                    <p className="auth-subtitle">Start your journey to find the perfect job today</p>
                                </div>
                                
                                {/* Success Message */}
                                {successMessage && (
                                    <Alert variant="success" className="alert-custom alert-success">
                                        <i className="fa fa-check-circle me-2"></i>
                                        {successMessage}
                                    </Alert>
                                )}
                                
                                {/* General Error Message */}
                                {errors.general && (
                                    <Alert variant="danger" className="alert-custom alert-error">
                                        <i className="fa fa-exclamation-triangle me-2"></i>
                                        {errors.general}
                                    </Alert>
                                )}
                                
                                {/* Validation Errors Summary */}
                                {Object.keys(errors).length > 1 && (
                                    <Alert variant="danger" className="alert-custom alert-error">
                                        <h6>
                                            <i className="fa fa-exclamation-triangle me-2"></i>
                                            Please correct the following errors:
                                        </h6>
                                        <ul className="mb-0 mt-2">
                                            {Object.entries(errors).map(([key, value]) => 
                                                key !== 'general' && (
                                                    <li key={key}>{value}</li>
                                                )
                                            )}
                                        </ul>
                                    </Alert>
                                )}
                                
                                {/* User Type Selection */}
                                <div className="user-type-selection">
                                    <Form.Label>I want to:</Form.Label>
                                    <div className="user-type-cards">
                                        <div 
                                            className={`user-type-card ${userType === 'jobseeker' ? 'active' : ''}`}
                                            onClick={() => handleUserTypeSelect('jobseeker')}
                                        >
                                            <div className="card-icon">👨‍💼</div>
                                            <h6>Find Jobs</h6>
                                            <p>Job Seeker</p>
                                        </div>
                                        <div 
                                            className={`user-type-card ${userType === 'recruiter' ? 'active' : ''}`}
                                            onClick={() => handleUserTypeSelect('recruiter')}
                                        >
                                            <div className="card-icon">🏢</div>
                                            <h6>Hire Talent</h6>
                                            <p>Recruiter</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <Form onSubmit={handleSubmit} className="auth-form" noValidate>
                                    {/* First Name Field */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>First Name</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="fa fa-user"></i>
                                            </span>
                                            <Form.Control
                                                type="text"
                                                name="firstName"
                                                placeholder="Enter your first name"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                isInvalid={!!errors.firstName}
                                                isValid={formData.firstName && !errors.firstName && formData.firstName.length >= 2}
                                                className="modern-input"
                                                required
                                                maxLength={50}
                                            />
                                        </div>
                                        {errors.firstName && (
                                            <div className="invalid-feedback d-block">
                                                {errors.firstName}
                                            </div>
                                        )}
                                    </Form.Group>

                                    {/* Last Name Field */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Last Name</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="fa fa-user"></i>
                                            </span>
                                            <Form.Control
                                                type="text"
                                                name="lastName"
                                                placeholder="Enter your last name"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                isInvalid={!!errors.lastName}
                                                isValid={formData.lastName && !errors.lastName && formData.lastName.length >= 2}
                                                className="modern-input"
                                                required
                                                maxLength={50}
                                            />
                                        </div>
                                        {errors.lastName && (
                                            <div className="invalid-feedback d-block">
                                                {errors.lastName}
                                            </div>
                                        )}
                                    </Form.Group>
                                    
                                    {/* Email Field */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email Address</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="fa fa-envelope"></i>
                                            </span>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                placeholder="Enter your email address"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                isInvalid={!!errors.email}
                                                isValid={formData.email && !errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)}
                                                className="modern-input"
                                                required
                                                maxLength={100}
                                            />
                                        </div>
                                        {errors.email && (
                                            <div className="invalid-feedback d-block">
                                                {errors.email}
                                            </div>
                                        )}
                                        {formData.email && !errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                                            <div className="valid-feedback d-block">
                                                Email format is valid
                                            </div>
                                        )}
                                    </Form.Group>
                                    
                                    {/* Password Field */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Password</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="fa fa-lock"></i>
                                            </span>
                                            <Form.Control
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                placeholder="Create a strong password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                isInvalid={!!errors.password}
                                                isValid={formData.password && passwordStrength >= 3}
                                                className="modern-input"
                                                required
                                                minLength={6}
                                                maxLength={100}
                                            />
                                            <Button 
                                                variant="outline-secondary" 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                            </Button>
                                        </div>
                                        
                                        {/* Password Strength Indicator */}
                                        {formData.password && (
                                            <div className="password-strength">
                                                <div className={`password-strength-bar ${getPasswordStrengthClass()}`}></div>
                                            </div>
                                        )}
                                        
                                        <small className={`text-muted ${passwordStrength <= 2 ? 'text-danger' : passwordStrength <= 3 ? 'text-warning' : 'text-success'}`}>
                                            {getPasswordStrengthText()}
                                        </small>
                                        
                                        {errors.password && (
                                            <div className="invalid-feedback d-block">
                                                {errors.password}
                                            </div>
                                        )}
                                    </Form.Group>
                                    
                                    {/* Terms Checkbox */}
                                    <Form.Group className="mb-4">
                                        <Form.Check
                                            type="checkbox"
                                            name="agreeTerms"
                                            checked={formData.agreeTerms}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.agreeTerms}
                                            label={
                                                <>
                                                    I agree to the{' '}
                                                    <Link to="#" className="text-primary">Terms of Service</Link>
                                                    {' '}and{' '}
                                                    <Link to="#" className="text-primary">Privacy Policy</Link>
                                                </>
                                            }
                                            required
                                        />
                                        {errors.agreeTerms && (
                                            <div className="invalid-feedback d-block">
                                                {errors.agreeTerms}
                                            </div>
                                        )}
                                    </Form.Group>
                                    
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
                                        {!isLoading && <i className="fa fa-user-plus me-2"></i>}
                                        {isLoading ? 'Creating Account...' : 'Create Account'}
                                    </Button>
                                    
                                    <div className="auth-divider">
                                        <span>Already have an account?</span>
                                    </div>
                                    
                                    <div className="auth-footer text-center">
                                        <p className="mb-0">
                                            <Link to="/login" className="register-link">
                                                Sign In Instead
                                            </Link>
                                        </p>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default RegisterPage;