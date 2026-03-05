import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleFindJobs = () => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/dashboard');
        } else {
            navigate('/dashboard');
        }
    };

    const timelineSteps = [
        {
            icon: 'fa-user-plus',
            title: 'Create Account',
            desc: 'Sign up as a Job Seeker or Recruiter in under 60 seconds.',
        },
        {
            icon: 'fa-id-card',
            title: 'Build Your Profile',
            desc: 'Add your skills, experience, resume, and work preferences.',
        },
        {
            icon: 'fa-magnifying-glass',
            title: 'Discover Jobs',
            desc: 'Browse thousands of listings filtered to your skills and location.',
        },
        {
            icon: 'fa-paper-plane',
            title: 'One-Click Apply',
            desc: 'Apply instantly using your saved profile — no cover letter needed.',
        },
        {
            icon: 'fa-handshake',
            title: 'Get Hired',
            desc: 'Receive interview invitations and land your dream role.',
        },
    ];

    return (
        <div className="home-page">
            {/* ── Hero Section ── */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <Container>
                    <Row className="align-items-center min-vh-100">
                        <Col lg={6} className="fade-in-up">
                            <div className="hero-content">
                                <div className="mb-3">
                                    <span style={{
                                        background: 'rgba(16,185,129,.2)',
                                        color: '#4fd1e8',
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        fontSize: '.85rem',
                                        fontWeight: 600,
                                        border: '1px solid rgba(52,211,153,.3)',
                                        backdropFilter: 'blur(10px)',
                                    }}>
                                        ✨ India&apos;s Fastest Growing Job Portal
                                    </span>
                                </div>
                                <h1 className="hero-title">
                                    Find Your <span className="text-primary">Dream Job</span><br />
                                    with <span className="text-primary">Zpluse</span>
                                </h1>
                                <p className="hero-subtitle">
                                    Discover thousands of employment opportunities from top companies.
                                    Apply for jobs online and get hired faster — remote or on-site.
                                </p>

                                {/* CTA */}
                                <div className="hero-action mb-4">
                                    <button
                                        onClick={handleFindJobs}
                                        className="btn search-jobs-btn me-3"
                                        id="hero-cta-btn"
                                    >
                                        <i className="fa fa-search me-2"></i>
                                        {isAuthenticated ? 'Explore Jobs →' : 'Start Job Search'}
                                    </button>
                                    {!isAuthenticated && (
                                        <button
                                            onClick={() => navigate('/register')}
                                            className="btn btn-outline-light"
                                            style={{ borderRadius: 12, padding: '1rem 1.75rem', fontWeight: 600 }}
                                        >
                                            Post a Job
                                        </button>
                                    )}
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
                        <Col lg={6} className="d-none d-lg-block fade-in-up delay-2">
                            <div className="hero-image">
                                <div className="floating-card job-card-1">
                                    <div className="card-icon">💼</div>
                                    <div className="card-content">
                                        <h6>Software Engineer</h6>
                                        <p>Tech Company · Remote</p>
                                    </div>
                                </div>
                                <div className="floating-card job-card-2">
                                    <div className="card-icon">🎯</div>
                                    <div className="card-content">
                                        <h6>Marketing Manager</h6>
                                        <p>Digital Agency · Hybrid</p>
                                    </div>
                                </div>
                                <div className="floating-card job-card-3">
                                    <div className="card-icon">📊</div>
                                    <div className="card-content">
                                        <h6>Data Analyst</h6>
                                        <p>Analytics Firm · On-site</p>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* ── Features Section ── */}
            <section className="features-section py-5">
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <h2 className="section-title">Why Choose Zpluse Jobs Finder?</h2>
                            <p className="section-subtitle">We make job searching simple, fast, and effective</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={4} className="mb-4 fade-in-up delay-1">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fa fa-magnifying-glass"></i>
                                </div>
                                <h5>Smart Job Search</h5>
                                <p>Advanced filters and smart matching to surface jobs aligned with your skills, salary expectations, and location.</p>
                            </div>
                        </Col>
                        <Col md={4} className="mb-4 fade-in-up delay-2">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fa fa-users"></i>
                                </div>
                                <h5>Top Companies Hiring</h5>
                                <p>Connect with verified employers and startups across tech, finance, healthcare, and more.</p>
                            </div>
                        </Col>
                        <Col md={4} className="mb-4 fade-in-up delay-3">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fa fa-rocket"></i>
                                </div>
                                <h5>Quick Apply</h5>
                                <p>Apply to multiple jobs with a single click using your saved profile. No redundant forms, ever.</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* ── How It Works Timeline ── */}
            <section className="how-it-works-section" id="how-it-works">
                <Container>
                    <Row className="text-center mb-2">
                        <Col>
                            <h2 className="how-it-works-title">How It Works</h2>
                            <p className="how-it-works-subtitle">
                                From sign-up to hired — your entire job application journey in 5 steps
                            </p>
                        </Col>
                    </Row>

                    {/* Desktop horizontal timeline */}
                    <div className="timeline-container">
                        {/* Connecting line */}
                        <div className="timeline-line d-none d-md-block"></div>
                        <Row className="justify-content-center">
                            {timelineSteps.map((step, i) => (
                                <Col key={i} md={2} sm={6} xs={12} className="mb-4 mb-md-0">
                                    <div className={`timeline-step fade-in-up delay-${i + 1}`}>
                                        <div className="timeline-icon-wrap" style={{ position: 'relative' }}>
                                            <span className="timeline-step-num">{i + 1}</span>
                                            <i className={`fas ${step.icon}`}></i>
                                        </div>
                                        <h6>{step.title}</h6>
                                        <p>{step.desc}</p>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    {/* CTA below timeline */}
                    <Row className="mt-4 text-center">
                        <Col>
                            <button
                                onClick={handleFindJobs}
                                className="btn btn-brand btn-lg px-5 py-3"
                                style={{ borderRadius: 14, fontSize: '1.05rem' }}
                            >
                                <i className="fa fa-briefcase me-2"></i>
                                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                            </button>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* ── Social Proof Strip ── */}
            <section style={{ background: 'white', padding: '3.5rem 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <Container>
                    <Row className="text-center align-items-center g-4">
                        {[
                            { icon: '🏆', label: '#1 Job Portal 2025' },
                            { icon: '⚡', label: 'Under 2 min to Apply' },
                            { icon: '🔒', label: 'SSL Secured Platform' },
                            { icon: '🌍', label: 'Remote-First Ready' },
                            { icon: '⭐', label: '4.8 / 5 User Rating' },
                        ].map((item, i) => (
                            <Col key={i} md={2} xs={6} className="mb-3 mb-md-0">
                                <div style={{ fontSize: '2rem', marginBottom: '.4rem' }}>{item.icon}</div>
                                <div style={{ fontWeight: 600, fontSize: '.88rem', color: '#475569' }}>{item.label}</div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

        </div>
    );
};

export default HomePage;