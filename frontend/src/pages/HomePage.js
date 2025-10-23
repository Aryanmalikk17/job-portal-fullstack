import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleFindJobs = () => {
        if (!isAuthenticated) {
            // Redirect to login page with redirect parameter to dashboard
            navigate('/login?redirect=/dashboard');
        } else {
            // If authenticated, navigate directly to dashboard
            navigate('/dashboard');
        }
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <Container>
                    <Row className="align-items-center min-vh-100">
                        <Col lg={6}>
                            <div className="hero-content">
                                <h1 className="hero-title">
                                    Find Your Dream Job with <span className="text-primary">Zpluse</span>
                                </h1>
                                <p className="hero-subtitle">
                                    Discover thousands of job opportunities from top companies. 
                                    Your next career move starts here.
                                </p>
                                
                                {/* Single Search Button */}
                                <div className="hero-action">
                                    <button 
                                        onClick={handleFindJobs}
                                        className="btn btn-primary btn-lg search-jobs-btn"
                                    >
                                        <i className="fa fa-search me-2"></i>
                                        {isAuthenticated ? 'Explore Jobs' : 'Start Job Search'}
                                    </button>
                                    <p className="search-helper-text mt-2">
                                        {isAuthenticated 
                                            ? 'Access your dashboard to find and manage jobs'
                                            : 'Sign in to access thousands of job opportunities'
                                        }
                                    </p>
                                </div>
                                
                                {/* Quick Stats */}
                                <div className="hero-stats">
                                    <div className="stat-item">
                                        <span className="stat-number">10K+</span>
                                        <span className="stat-label">Active Jobs</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-number">500+</span>
                                        <span className="stat-label">Companies</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-number">50K+</span>
                                        <span className="stat-label">Job Seekers</span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="hero-image">
                                <div className="floating-card job-card-1">
                                    <div className="card-icon">💼</div>
                                    <div className="card-content">
                                        <h6>Software Engineer</h6>
                                        <p>Tech Company</p>
                                    </div>
                                </div>
                                <div className="floating-card job-card-2">
                                    <div className="card-icon">🎯</div>
                                    <div className="card-content">
                                        <h6>Marketing Manager</h6>
                                        <p>Digital Agency</p>
                                    </div>
                                </div>
                                <div className="floating-card job-card-3">
                                    <div className="card-icon">📊</div>
                                    <div className="card-content">
                                        <h6>Data Analyst</h6>
                                        <p>Analytics Firm</p>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Section */}
            <section className="features-section py-5">
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <h2 className="section-title">Why Choose Zpluse Jobs Finder?</h2>
                            <p className="section-subtitle">We make job searching simple and effective</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={4} className="mb-4">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fa fa-search"></i>
                                </div>
                                <h5>Smart Job Search</h5>
                                <p>Advanced filters and AI-powered matching to find jobs that fit your skills and preferences.</p>
                            </div>
                        </Col>
                        <Col md={4} className="mb-4">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fa fa-users"></i>
                                </div>
                                <h5>Top Companies</h5>
                                <p>Connect with leading employers and startups across various industries and locations.</p>
                            </div>
                        </Col>
                        <Col md={4} className="mb-4">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fa fa-rocket"></i>
                                </div>
                                <h5>Quick Apply</h5>
                                <p>Apply to multiple jobs with one click using your saved profile and resume.</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Modern Footer */}
            <footer className="modern-footer">
                <Container>
                    <Row>
                        <Col lg={4} md={6} className="mb-4">
                            <div className="footer-brand">
                                <h5>Zpluse Jobs Finder</h5>
                                <p>Your trusted partner in finding the perfect job. Connect with top employers and take your career to the next level.</p>
                                <div className="social-links">
                                    <a href="#" className="social-link"><i className="fa fa-facebook"></i></a>
                                    <a href="#" className="social-link"><i className="fa fa-twitter"></i></a>
                                    <a href="#" className="social-link"><i className="fa fa-linkedin"></i></a>
                                    <a href="#" className="social-link"><i className="fa fa-instagram"></i></a>
                                </div>
                            </div>
                        </Col>
                        <Col lg={2} md={6} className="mb-4">
                            <div className="footer-links">
                                <h6>For Job Seekers</h6>
                                <ul>
                                    <li><a href="/register">Create Account</a></li>
                                    <li><a href="/login">Sign In</a></li>
                                    <li><a href="/jobs">Browse Jobs</a></li>
                                    <li><a href="#">Career Advice</a></li>
                                    <li><a href="#">Resume Builder</a></li>
                                </ul>
                            </div>
                        </Col>
                        <Col lg={2} md={6} className="mb-4">
                            <div className="footer-links">
                                <h6>For Employers</h6>
                                <ul>
                                    <li><a href="/register">Post a Job</a></li>
                                    <li><a href="#">Browse Resumes</a></li>
                                    <li><a href="/login">Recruiter Login</a></li>
                                    <li><a href="#">Pricing</a></li>
                                    <li><a href="#">Hiring Solutions</a></li>
                                </ul>
                            </div>
                        </Col>
                        <Col lg={2} md={6} className="mb-4">
                            <div className="footer-links">
                                <h6>Company</h6>
                                <ul>
                                    <li><a href="#">About Us</a></li>
                                    <li><a href="#">Contact</a></li>
                                    <li><a href="#">Careers</a></li>
                                    <li><a href="#">Press</a></li>
                                    <li><a href="#">Blog</a></li>
                                </ul>
                            </div>
                        </Col>
                        <Col lg={2} md={6} className="mb-4">
                            <div className="footer-links">
                                <h6>Support</h6>
                                <ul>
                                    <li><a href="#">Help Center</a></li>
                                    <li><a href="#">Privacy Policy</a></li>
                                    <li><a href="#">Terms of Service</a></li>
                                    <li><a href="#">Cookie Policy</a></li>
                                    <li><a href="#">Contact Support</a></li>
                                </ul>
                            </div>
                        </Col>
                    </Row>
                    <hr className="footer-divider" />
                    <Row className="align-items-center">
                        <Col md={6}>
                            <p className="footer-copyright">&copy; 2025 Zpluse Jobs Finder. All rights reserved.</p>
                        </Col>
                        <Col md={6} className="text-md-end">
                            <div className="footer-badges">
                                <span className="badge-item">🔒 SSL Secured</span>
                                <span className="badge-item">✓ Trusted Platform</span>
                                <span className="badge-item">⭐ 4.8/5 Rating</span>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </div>
    );
};

export default HomePage;