import React, { useState } from 'react';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [expanded, setExpanded] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setExpanded(false);
    };

    const closeNavbar = () => setExpanded(false);

    const isActive = (path) => location.pathname === path;

    return (
        <Navbar 
            bg="dark" 
            variant="dark"
            expand="lg" 
            className="modern-header fixed-top" 
            expanded={expanded}
            onToggle={setExpanded}
        >
            <Container>
                {/* Brand */}
                <Navbar.Brand as={Link} to="/" onClick={closeNavbar} className="d-flex align-items-center">
                    <div 
                        className="brand-logo me-2"
                        style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            color: '#2d3748'
                        }}
                    >
                        Z
                    </div>
                    <span className="brand-text">Zpluse Jobs</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="navbar-nav" />
                
                <Navbar.Collapse id="navbar-nav">
                    {/* Main Navigation */}
                    <Nav className="me-auto">
                        <Nav.Link 
                            as={Link} 
                            to="/" 
                            onClick={closeNavbar}
                            className={isActive('/') ? 'active' : ''}
                        >
                            <i className="fa fa-home me-1"></i>
                            Home
                        </Nav.Link>
                        
                        {isAuthenticated && (
                            <>
                                <Nav.Link 
                                    as={Link} 
                                    to="/dashboard" 
                                    onClick={closeNavbar}
                                    className={isActive('/dashboard') ? 'active' : ''}
                                >
                                    <i className="fa fa-tachometer-alt me-1"></i>
                                    Dashboard
                                </Nav.Link>
                                
                                {user?.userType === 'Job Seeker' && (
                                    <>
                                        <Nav.Link 
                                            as={Link} 
                                            to="/saved-jobs" 
                                            onClick={closeNavbar}
                                            className={isActive('/saved-jobs') ? 'active' : ''}
                                        >
                                            <i className="fa fa-heart me-1"></i>
                                            Saved Jobs
                                        </Nav.Link>
                                        
                                        <Nav.Link 
                                            as={Link} 
                                            to="/my-applications" 
                                            onClick={closeNavbar}
                                            className={isActive('/my-applications') ? 'active' : ''}
                                        >
                                            <i className="fa fa-briefcase me-1"></i>
                                            My Applications
                                        </Nav.Link>
                                    </>
                                )}
                            </>
                        )}
                    </Nav>
                    
                    {/* User Navigation */}
                    <Nav>
                        {isAuthenticated ? (
                            <NavDropdown 
                                title={
                                    <span className="text-white">
                                        <i className="fa fa-user-circle me-1"></i>
                                        {user?.firstName} {user?.lastName}
                                    </span>
                                } 
                                id="user-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item 
                                    as={Link} 
                                    to="/profile" 
                                    onClick={closeNavbar}
                                >
                                    <i className="fa fa-user me-2"></i>
                                    My Profile
                                </NavDropdown.Item>
                                
                                <NavDropdown.Item 
                                    as={Link} 
                                    to="/dashboard" 
                                    onClick={closeNavbar}
                                >
                                    <i className="fa fa-tachometer-alt me-2"></i>
                                    Dashboard
                                </NavDropdown.Item>
                                
                                <NavDropdown.Divider />
                                
                                <NavDropdown.Item onClick={handleLogout}>
                                    <i className="fa fa-sign-out-alt me-2"></i>
                                    Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <>
                                <Nav.Link 
                                    as={Link} 
                                    to="/login" 
                                    onClick={closeNavbar}
                                    className="nav-btn me-2"
                                >
                                    <Button variant="outline-light" size="sm">
                                        <i className="fa fa-sign-in-alt me-1"></i>
                                        Login
                                    </Button>
                                </Nav.Link>
                                
                                <Nav.Link 
                                    as={Link} 
                                    to="/register" 
                                    onClick={closeNavbar}
                                    className="nav-btn"
                                >
                                    <Button variant="warning" size="sm">
                                        <i className="fa fa-user-plus me-1"></i>
                                        Register
                                    </Button>
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;