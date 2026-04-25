import React, { useState } from 'react';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    Home, 
    LayoutDashboard, 
    Heart, 
    Briefcase, 
    CircleUser, 
    User, 
    LogOut, 
    LogIn, 
    UserPlus 
} from 'lucide-react';
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
                            background: 'linear-gradient(135deg, #34C1D9 0%, #1A8FA3 100%)',
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
                            className={`d-flex align-items-center ${isActive('/') ? 'active' : ''}`}
                        >
                            <Home size={18} />
                            <span>Home</span>
                        </Nav.Link>
                        
                        {isAuthenticated && (
                            <>
                                <Nav.Link 
                                    as={Link} 
                                    to={user?.userType === 'Recruiter' ? '/dashboard/recruiter' : '/dashboard/jobseeker'} 
                                    onClick={closeNavbar}
                                    className={`d-flex align-items-center ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}
                                >
                                    <LayoutDashboard size={18} />
                                    <span>Dashboard</span>
                                </Nav.Link>
                                
                                {user?.userType === 'Job Seeker' && (
                                    <>
                                        <Nav.Link 
                                            as={Link} 
                                            to="/saved-jobs" 
                                            onClick={closeNavbar}
                                            className={`d-flex align-items-center ${isActive('/saved-jobs') ? 'active' : ''}`}
                                        >
                                            <Heart size={18} />
                                            <span>Saved Jobs</span>
                                        </Nav.Link>
                                        
                                        <Nav.Link 
                                            as={Link} 
                                            to="/my-applications" 
                                            onClick={closeNavbar}
                                            className={`d-flex align-items-center ${isActive('/my-applications') ? 'active' : ''}`}
                                        >
                                            <Briefcase size={18} />
                                            <span>My Applications</span>
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
                                    <span className="text-white d-flex align-items-center">
                                        <CircleUser size={18} />
                                        <span className="ms-2">{user?.firstName} {user?.lastName}</span>
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
                                    <User className="me-2" size={18} />
                                    My Profile
                                </NavDropdown.Item>
                                
                                <NavDropdown.Item 
                                    as={Link} 
                                    to={user?.userType === 'Recruiter' ? '/dashboard/recruiter' : '/dashboard/jobseeker'} 
                                    onClick={closeNavbar}
                                >
                                    <LayoutDashboard className="me-2" size={18} />
                                    Dashboard
                                </NavDropdown.Item>
                                
                                <NavDropdown.Divider />
                                
                                <NavDropdown.Item onClick={handleLogout}>
                                    <LogOut className="me-2" size={18} />
                                    Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <>
                                <Nav.Link 
                                    as={Link} 
                                    to="/login" 
                                    onClick={closeNavbar}
                                    className="nav-btn p-0 me-3"
                                >
                                    <Button variant="outline-light" size="sm" className="d-flex align-items-center py-2 px-3">
                                        <LogIn size={18} />
                                        <span>Login</span>
                                    </Button>
                                </Nav.Link>
                                
                                <Nav.Link 
                                    as={Link} 
                                    to="/register" 
                                    onClick={closeNavbar}
                                    className="nav-btn p-0"
                                >
                                    <Button variant="warning" size="sm" className="d-flex align-items-center py-2 px-3">
                                        <UserPlus size={18} />
                                        <span>Register</span>
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