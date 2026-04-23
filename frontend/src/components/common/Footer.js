import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { 
    Facebook, 
    Twitter, 
    Linkedin, 
    Instagram, 
    Mail, 
    Phone, 
    MapPin, 
    ExternalLink,
    Heart
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-main">
            <Container>
                <Row className="footer-top py-5">
                    <Col lg={4} md={12} className="footer-brand-col mb-4 mb-lg-0">
                        <Link to="/" className="footer-logo">
                            Zpluse<span>Jobs</span>
                        </Link>
                        <p className="footer-description mt-3">
                            Connecting talent with opportunity across the globe. Our platform 
                            makes job seeking and recruitment simple, fast, and effective.
                        </p>
                        <div className="social-links mt-4">
                            <a href="#" className="social-icon"><Facebook size={18} /></a>
                            <a href="#" className="social-icon"><Twitter size={18} /></a>
                            <a href="#" className="social-icon"><Linkedin size={18} /></a>
                            <a href="#" className="social-icon"><Instagram size={18} /></a>
                        </div>
                    </Col>

                    <Col lg={2} md={4} className="footer-links-col mb-4 mb-md-0">
                        <h5>For Job Seekers</h5>
                        <ul className="footer-links">
                            <li><Link to="/jobs">Browse Jobs</Link></li>
                            <li><Link to="/profile">My Profile</Link></li>
                            <li><Link to="/applications">My Applications</Link></li>
                            <li><Link to="/saved-jobs">Saved Jobs</Link></li>
                        </ul>
                    </Col>

                    <Col lg={2} md={4} className="footer-links-col mb-4 mb-md-0">
                        <h5>For Recruiters</h5>
                        <ul className="footer-links">
                            <li><Link to="/register?type=recruiter">Post a Job</Link></li>
                            <li><Link to="/recruiter/dashboard">Dashboard</Link></li>
                            <li><Link to="/recruiter/applications">Applications</Link></li>
                            <li><Link to="/companies">Company Profile</Link></li>
                        </ul>
                    </Col>

                    <Col lg={4} md={4} className="footer-contact-col">
                        <h5>Contact Us</h5>
                        <ul className="contact-info">
                            <li>
                                <MapPin size={18} className="me-2" />
                                <span>Global Hub, Tech City, 10001</span>
                            </li>
                            <li>
                                <Phone size={18} className="me-2" />
                                <span>+1 (234) 567-890</span>
                            </li>
                            <li>
                                <Mail size={18} className="me-2" />
                                <span>support@zpluse.com</span>
                            </li>
                        </ul>
                    </Col>
                </Row>

                <hr className="footer-divider" />

                <Row className="footer-bottom py-3 align-items-center">
                    <Col md={6}>
                        <p className="footer-copyright mb-0">
                            &copy; {new Date().getFullYear()} Zpluse Jobs Finder. All rights reserved.
                        </p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <div className="footer-credits">
                            All rights reserved by Zpluse (www.zpluse.com)
                        </div>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;