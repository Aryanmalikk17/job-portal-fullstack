import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="modern-footer">
            <Container>
                <Row className="mb-4">
                    {/* Brand */}
                    <Col lg={4} md={6} className="mb-4">
                        <div className="footer-brand">
                            <h5>⚡ Zpluse Jobs Finder</h5>
                            <p>
                                Your trusted partner for finding employment opportunities — remote and on-site.
                                Connecting talent with top employers across India and worldwide since 2024.
                            </p>
                            <div className="social-links">
                                {[
                                    { cls: 'fa-youtube', href: 'https://www.youtube.com/@zplusejobs' },
                                    { cls: 'fa-instagram', href: 'https://www.instagram.com/zplusejobs' },
                                    { cls: 'fa-linkedin-in', href: 'https://www.linkedin.com/in/zpluse-jobs-4093b1390/' },
                                    { cls: 'fa-facebook-f', href: 'https://www.facebook.com/share/1FEMiyULr2/' },
                                    { cls: 'fa-twitter', href: 'https://x.com/Zplusejobs?t=8TezLAW9zB5i0yEZGVOkwA&s=09' },
                                ].map((s, i) => (
                                    <a key={i} href={s.href} className="social-link" aria-label={s.cls} target="_blank" rel="noopener noreferrer">
                                        <i className={`fab ${s.cls}`}></i>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </Col>

                    {/* Platform */}
                    <Col lg={2} md={6} className="mb-4">
                        <div className="footer-links">
                            <h6>Platform</h6>
                            <ul>
                                <li><Link to="/register">Create Account</Link></li>
                                <li><Link to="/login">Sign In</Link></li>
                                <li><Link to="/dashboard">Browse Jobs</Link></li>
                                <li><Link to="/jobs/create">Post a Job</Link></li>
                            </ul>
                        </div>
                    </Col>

                    {/* Resources */}
                    <Col lg={2} md={6} className="mb-4">
                        <div className="footer-links">
                            <h6>Resources</h6>
                            <ul>
                                <li><Link to="/#how-it-works">How It Works</Link></li>
                                <li><Link to="#">Resume Tips</Link></li>
                                <li><Link to="#">Interview Guide</Link></li>
                                <li><Link to="#">Career Blog</Link></li>
                            </ul>
                        </div>
                    </Col>

                    {/* For Recruiters */}
                    <Col lg={2} md={6} className="mb-4">
                        <div className="footer-links">
                            <h6>For Recruiters</h6>
                            <ul>
                                <li><Link to="/register">Post Jobs Free</Link></li>
                                <li><Link to="#">Browse Resumes</Link></li>
                                <li><Link to="#">Hiring Solutions</Link></li>
                                <li><Link to="/login">Recruiter Login</Link></li>
                            </ul>
                        </div>
                    </Col>

                    {/* Legal */}
                    <Col lg={2} md={6} className="mb-4">
                        <div className="footer-links">
                            <h6>Legal</h6>
                            <ul>
                                <li><Link to="#">Privacy Policy</Link></li>
                                <li><Link to="#">Terms of Service</Link></li>
                                <li><Link to="#">Cookie Policy</Link></li>
                                <li><Link to="#">Contact Support</Link></li>
                            </ul>
                        </div>
                    </Col>
                </Row>

                <hr className="footer-divider" />

                <Row className="align-items-center">
                    <Col md={5}>
                        <p className="footer-copyright mb-2 mb-md-0">
                            &copy; {new Date().getFullYear()} Zpluse Jobs Finder. All rights reserved.
                        </p>
                    </Col>
                    <Col md={4} className="text-md-center mb-2 mb-md-0">
                        {/* Built by Aadi credit */}
                        <span className="built-by-credit">
                            <i className="fas fa-code" style={{ color: '#34C1D9' }}></i>
                            Built &amp; maintained by{' '}
                            <a
                                href="https://github.com/Aryanmalikk17"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Aryan malik 
                            </a>
                        </span>
                    </Col>
                    <Col md={3} className="text-md-end">
                        <div className="footer-badges">
                            <span className="badge-item">🔒 SSL Secured</span>
                            <span className="badge-item">⭐ 4.8 Rating</span>
                        </div>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;