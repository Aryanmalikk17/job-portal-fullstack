import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Nav, Tab, Badge, ProgressBar, Modal } from 'react-bootstrap';
import { 
    Camera, 
    Briefcase, 
    MapPin, 
    User, 
    ShieldCheck, 
    Plane, 
    CheckCircle2, 
    AlertTriangle, 
    Info, 
    AlertCircle, 
    FileText, 
    CircleUser, 
    Lock, 
    Wrench, 
    Plus, 
    PlusCircle, 
    Link as LinkIcon, 
    Trash2, 
    Save, 
    Upload, 
    Check, 
    ExternalLink 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
    getJobSeekerProfile, 
    updateJobSeekerProfile, 
    getFullFileUrl 
} from '../../services/profileService';
import LoadingSpinner from '../common/LoadingSpinner';
import './JobSeekerProfile.css';

const JobSeekerProfile = () => {
    const { user } = useAuth();
    
    // State management
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);
    const [profileData, setProfileData] = useState({
        // Personal Information
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        city: '',
        state: '',
        country: '',
        willingToRelocate: false,
        
        // Professional Information
        currentJobTitle: '',
        experience: '',
        skills: [],
        education: '',
        workAuthorization: '',
        employmentType: '',
        expectedSalary: '',
        availabilityDate: '',
        linkedinProfile: '',
        githubProfile: '',
        portfolioWebsite: '',
        
        // Resume & Documents
        resume: null,
        coverLetter: '',
        profilePhoto: null
    });

    const [skillInput, setSkillInput] = useState('');
    const [profileCompletion, setProfileCompletion] = useState(0);
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    const calculateProfileCompletion = useCallback((data) => {
        const requiredFields = [
            'firstName', 'lastName', 'email', 'phone', 'city', 'country',
            'currentJobTitle', 'experience', 'workAuthorization', 'employmentType'
        ];
        
        const completedFields = requiredFields.filter(field => 
            data[field] && data[field].toString().trim() !== ''
        ).length;
        
        const additionalPoints = [
            data.skills && data.skills.length > 0 ? 10 : 0,
            data.resume ? 15 : 0,
            data.profilePhoto ? 10 : 0,
            data.linkedinProfile ? 5 : 0
        ].reduce((sum, points) => sum + points, 0);
        
        const baseCompletion = (completedFields / requiredFields.length) * 60;
        const totalCompletion = Math.min(baseCompletion + additionalPoints, 100);
        
        setProfileCompletion(Math.round(totalCompletion));
    }, []);

    const loadProfileData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getJobSeekerProfile();
            const profileFields = (response && response.data && typeof response.data === 'object')
                ? response.data
                : response;
            setProfileData(prev => {
                const merged = { ...prev, ...profileFields };
                calculateProfileCompletion(merged);
                return merged;
            });
        } catch (error) {
            console.error('Error loading profile:', error);
            showNotification('Failed to load profile data', 'error');
        } finally {
            setLoading(false);
        }
    }, [calculateProfileCompletion]);

    useEffect(() => {
        loadProfileData();
    }, [loadProfileData]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setProfileData(prev => {
            const updated = { ...prev, [name]: newValue };
            calculateProfileCompletion(updated);
            return updated;
        });
    };

    const addSkill = () => {
        if (skillInput.trim() && !profileData.skills.includes(skillInput.trim())) {
            const updatedSkills = [...profileData.skills, skillInput.trim()];
            setProfileData(prev => ({ ...prev, skills: updatedSkills }));
            setSkillInput('');
            calculateProfileCompletion({ ...profileData, skills: updatedSkills });
        }
    };

    const removeSkill = (skillToRemove) => {
        const updatedSkills = profileData.skills.filter(skill => skill !== skillToRemove);
        setProfileData(prev => ({ ...prev, skills: updatedSkills }));
        calculateProfileCompletion({ ...profileData, skills: updatedSkills });
    };

    const handleFileUpload = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData(prev => ({ ...prev, [fieldName]: file }));
            calculateProfileCompletion({ ...profileData, [fieldName]: file });
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            const response = await updateJobSeekerProfile(profileData);
            const savedFields = (response && response.data && typeof response.data === 'object')
                ? response.data
                : response;
            if (savedFields) {
                setProfileData(prev => {
                    const merged = { ...prev, ...savedFields };
                    calculateProfileCompletion(merged);
                    return merged;
                });
            }
            showNotification('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error saving profile:', error);
            showNotification('Failed to save profile. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="job-seeker-profile">
            <Container fluid className="px-4 py-4">
                {/* Header Section */}
                <div className="profile-header mb-4">
                    <Card className="profile-header-card border-0 shadow-sm overflow-hidden">
                        <Card.Body className="p-4 p-lg-5">
                            <Row className="align-items-center">
                                <Col md={2} className="text-center mb-4 mb-md-0">
                                    <div className="profile-photo-container position-relative d-inline-block">
                                        {profileData.profilePhoto ? (
                                            <img 
                                                src={getFullFileUrl(profileData.profilePhoto, 'profilePhoto')} 
                                                alt="Profile" 
                                                className="profile-photo rounded-circle border border-4 border-white shadow"
                                                style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                                                onClick={() => setShowPhotoModal(true)}
                                            />
                                        ) : (
                                            <div 
                                                className="profile-photo-placeholder rounded-circle bg-light d-flex flex-column align-items-center justify-content-center shadow-sm border border-4 border-white"
                                                style={{ width: '150px', height: '150px', cursor: 'pointer' }}
                                                onClick={() => setShowPhotoModal(true)}
                                            >
                                                <Camera size={40} className="text-muted mb-2" />
                                                <small className="text-muted fw-bold">Add Photo</small>
                                            </div>
                                        )}
                                        <button 
                                            className="photo-edit-btn position-absolute bottom-0 end-0 bg-primary text-white border-0 rounded-circle p-2 shadow"
                                            onClick={() => setShowPhotoModal(true)}
                                        >
                                            <Camera size={16} />
                                        </button>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="profile-info text-center text-md-start">
                                        <h2 className="profile-name mb-2 fw-bold">
                                            {profileData.firstName} {profileData.lastName}
                                        </h2>
                                        <p className="profile-title mb-2 text-muted d-flex align-items-center justify-content-center justify-content-md-start">
                                            <Briefcase size={18} className="me-2 text-primary" />
                                            {profileData.currentJobTitle || 'Add your job title'}
                                        </p>
                                        <p className="profile-location mb-3 text-muted d-flex align-items-center justify-content-center justify-content-md-start">
                                            <MapPin size={18} className="me-2 text-primary" />
                                            {profileData.city && profileData.country ? 
                                                `${profileData.city}, ${profileData.country}` : 
                                                'Add your location'
                                            }
                                        </p>
                                        <div className="profile-badges d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
                                            <Badge bg="primary" className="px-3 py-2 d-inline-flex align-items-center">
                                                <User size={14} className="me-2" />
                                                Job Seeker
                                            </Badge>
                                            {profileData.workAuthorization && (
                                                <Badge bg="success" className="px-3 py-2 d-inline-flex align-items-center">
                                                    <ShieldCheck size={14} className="me-2" />
                                                    {profileData.workAuthorization}
                                                </Badge>
                                            )}
                                            {profileData.willingToRelocate && (
                                                <Badge bg="info" className="px-3 py-2 d-inline-flex align-items-center">
                                                    <Plane size={14} className="me-2" />
                                                    Open to Relocate
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </Col>
                                <Col md={4} className="mt-4 mt-md-0">
                                    <div className="profile-completion-card p-4 bg-light rounded-4">
                                        <div className="completion-header d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="completion-title mb-0 fw-bold">Profile Strength</h6>
                                            <span className="completion-percentage badge bg-white text-primary shadow-sm">{profileCompletion}%</span>
                                        </div>
                                        <ProgressBar 
                                            variant={profileCompletion >= 80 ? 'success' : profileCompletion >= 50 ? 'warning' : 'danger'}
                                            now={profileCompletion} 
                                            className="completion-progress mb-3"
                                            style={{ height: '8px' }}
                                        />
                                        <small className="completion-text d-flex align-items-center text-muted">
                                            {profileCompletion >= 80 ? (
                                                <><CheckCircle2 size={16} className="text-success me-2" />Great! Your profile looks complete</>
                                            ) : profileCompletion >= 50 ? (
                                                <><AlertTriangle size={16} className="text-warning me-2" />Almost there! Add more details</>
                                            ) : (
                                                <><Info size={16} className="text-info me-2" />Complete your profile to attract employers</>
                                            )}
                                        </small>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </div>

                {/* Notification */}
                {notification && (
                    <Alert 
                        variant={notification.type === 'error' ? 'danger' : notification.type}
                        dismissible 
                        onClose={() => setNotification(null)}
                        className="notification-alert mb-4 border-0 shadow-sm d-flex align-items-center"
                    >
                        {notification.type === 'success' ? <CheckCircle2 size={18} className="me-2" /> : 
                         notification.type === 'error' ? <AlertCircle size={18} className="me-2" /> : 
                         <Info size={18} className="me-2" />}
                        {notification.message}
                    </Alert>
                )}

                {/* Profile Tabs */}
                <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                    <Card className="profile-tabs-card border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom-0 p-0">
                            <Nav variant="tabs" className="profile-nav-tabs border-bottom-0 px-4">
                                <Nav.Item>
                                    <Nav.Link eventKey="personal" className="profile-tab d-flex align-items-center py-3">
                                        <User size={18} className="me-2" />
                                        Personal Info
                                        {profileCompletion < 30 && <Badge bg="danger" className="ms-2 rounded-circle">!</Badge>}
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="professional" className="profile-tab d-flex align-items-center py-3">
                                        <Briefcase size={18} className="me-2" />
                                        Professional
                                        {profileCompletion < 60 && <Badge bg="warning" className="ms-2 rounded-circle">!</Badge>}
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="documents" className="profile-tab d-flex align-items-center py-3">
                                        <FileText size={18} className="me-2" />
                                        Documents
                                        {!profileData.resume && <Badge bg="info" className="ms-2 rounded-circle">+</Badge>}
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card.Header>

                        <Card.Body className="p-4 p-lg-5">
                            <Tab.Content>
                                {/* Personal Information Tab */}
                                <Tab.Pane eventKey="personal">
                                    <div className="tab-content-section">
                                        <div className="section-header mb-4">
                                            <h4 className="section-title d-flex align-items-center fw-bold">
                                                <CircleUser size={24} className="me-2 text-primary" />
                                                Personal Information
                                            </h4>
                                            <p className="section-description text-muted">
                                                Tell us about yourself to help employers get to know you better
                                            </p>
                                        </div>

                                        <Row>
                                            <Col md={6} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">
                                                        First Name <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="firstName"
                                                        value={profileData.firstName}
                                                        onChange={handleInputChange}
                                                        className="modern-input py-2 px-3 border-light bg-light"
                                                        placeholder="Enter your first name"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">
                                                        Last Name <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="lastName"
                                                        value={profileData.lastName}
                                                        onChange={handleInputChange}
                                                        className="modern-input py-2 px-3 border-light bg-light"
                                                        placeholder="Enter your last name"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={8} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">Email Address</Form.Label>
                                                    <div className="position-relative">
                                                        <Form.Control
                                                            type="email"
                                                            value={profileData.email}
                                                            className="modern-input py-2 px-3 border-light bg-light-subtle"
                                                            disabled
                                                            style={{ backgroundColor: '#f8f9fa' }}
                                                        />
                                                        <Lock size={14} className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted" />
                                                    </div>
                                                    <Form.Text className="text-muted small mt-2 d-block">
                                                        Email cannot be changed. Contact support if needed.
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                            <Col md={4} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">
                                                        Phone Number <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="phone"
                                                        value={profileData.phone}
                                                        onChange={handleInputChange}
                                                        className="modern-input py-2 px-3 border-light bg-light"
                                                        placeholder="Enter your phone number"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={4} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">Date of Birth</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="dateOfBirth"
                                                        value={profileData.dateOfBirth}
                                                        onChange={handleInputChange}
                                                        className="modern-input py-2 px-3 border-light bg-light"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">Gender</Form.Label>
                                                    <Form.Select
                                                        name="gender"
                                                        value={profileData.gender}
                                                        onChange={handleInputChange}
                                                        className="modern-select py-2 px-3 border-light bg-light"
                                                    >
                                                        <option value="">Select gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="section-divider my-4 border-light"></div>

                                        <div className="subsection-header mb-4">
                                            <h5 className="subsection-title d-flex align-items-center fw-bold">
                                                <MapPin size={20} className="me-2 text-primary" />
                                                Location Information
                                            </h5>
                                        </div>

                                        <Row>
                                            <Col md={4} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">
                                                        City <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="city"
                                                        value={profileData.city}
                                                        onChange={handleInputChange}
                                                        className="modern-input py-2 px-3 border-light bg-light"
                                                        placeholder="Current city"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">State/Province</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="state"
                                                        value={profileData.state}
                                                        onChange={handleInputChange}
                                                        className="modern-input py-2 px-3 border-light bg-light"
                                                        placeholder="Current state"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">
                                                        Country <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="country"
                                                        value={profileData.country}
                                                        onChange={handleInputChange}
                                                        className="modern-input py-2 px-3 border-light bg-light"
                                                        placeholder="Current country"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={12} className="mb-3">
                                                <Form.Check
                                                    type="checkbox"
                                                    name="willingToRelocate"
                                                    checked={profileData.willingToRelocate}
                                                    onChange={handleInputChange}
                                                    label="I am willing to relocate for the right opportunity"
                                                    className="modern-checkbox fw-medium text-muted"
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Tab.Pane>

                                {/* Professional Information Tab */}
                                <Tab.Pane eventKey="professional">
                                    <div className="tab-content-section">
                                        <div className="section-header mb-4">
                                            <h4 className="section-title d-flex align-items-center fw-bold">
                                                <Briefcase size={24} className="me-2 text-primary" />
                                                Professional Information
                                            </h4>
                                            <p className="section-description text-muted">
                                                Share your professional background and career preferences
                                            </p>
                                        </div>

                                        <Row>
                                            <Col md={6} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">
                                                        Current Job Title <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="currentJobTitle"
                                                        value={profileData.currentJobTitle}
                                                        onChange={handleInputChange}
                                                        className="modern-input py-2 px-3 border-light bg-light"
                                                        placeholder="e.g. Software Engineer, Marketing Manager"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">
                                                        Years of Experience <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Select
                                                        name="experience"
                                                        value={profileData.experience}
                                                        onChange={handleInputChange}
                                                        className="modern-select py-2 px-3 border-light bg-light"
                                                    >
                                                        <option value="">Select experience</option>
                                                        <option value="0-1">0-1 years (Entry Level)</option>
                                                        <option value="1-3">1-3 years (Junior)</option>
                                                        <option value="3-5">3-5 years (Mid-Level)</option>
                                                        <option value="5-8">5-8 years (Senior)</option>
                                                        <option value="8-12">8-12 years (Lead)</option>
                                                        <option value="12+">12+ years (Executive)</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">
                                                        Work Authorization <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Select
                                                        name="workAuthorization"
                                                        value={profileData.workAuthorization}
                                                        onChange={handleInputChange}
                                                        className="modern-select py-2 px-3 border-light bg-light"
                                                    >
                                                        <option value="">Select authorization</option>
                                                        <option value="US Citizen">US Citizen</option>
                                                        <option value="Green Card">Green Card Holder</option>
                                                        <option value="H1B">H1B Visa</option>
                                                        <option value="F1 OPT">F1 OPT</option>
                                                        <option value="Other Visa">Other Visa</option>
                                                        <option value="Need Sponsorship">Need Sponsorship</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">
                                                        Employment Type <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Select
                                                        name="employmentType"
                                                        value={profileData.employmentType}
                                                        onChange={handleInputChange}
                                                        className="modern-select py-2 px-3 border-light bg-light"
                                                    >
                                                        <option value="">Select type</option>
                                                        <option value="Full-time">Full-time</option>
                                                        <option value="Part-time">Part-time</option>
                                                        <option value="Contract">Contract</option>
                                                        <option value="Freelance">Freelance</option>
                                                        <option value="Internship">Internship</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">Expected Salary</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="expectedSalary"
                                                        value={profileData.expectedSalary}
                                                        onChange={handleInputChange}
                                                        className="modern-input py-2 px-3 border-light bg-light"
                                                        placeholder="e.g. $80,000 - $100,000"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">Available From</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="availabilityDate"
                                                        value={profileData.availabilityDate}
                                                        onChange={handleInputChange}
                                                        className="modern-input py-2 px-3 border-light bg-light"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="section-divider my-4 border-light"></div>

                                        <div className="subsection-header mb-4">
                                            <h5 className="subsection-title d-flex align-items-center fw-bold">
                                                <Wrench size={20} className="me-2 text-primary" />
                                                Skills & Expertise
                                            </h5>
                                        </div>

                                        <Row>
                                            <Col md={12} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">Skills</Form.Label>
                                                    <div className="skills-input-container">
                                                        <div className="skills-input-group d-flex gap-2">
                                                            <Form.Control
                                                                type="text"
                                                                value={skillInput}
                                                                onChange={(e) => setSkillInput(e.target.value)}
                                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                                                className="modern-input py-2 px-3 border-light bg-light"
                                                                placeholder="Type a skill and press Enter"
                                                            />
                                                            <Button 
                                                                variant="primary" 
                                                                onClick={addSkill}
                                                                className="add-skill-btn d-flex align-items-center justify-content-center px-4"
                                                            >
                                                                <Plus size={20} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="skills-container mt-3 d-flex flex-wrap gap-2">
                                                        {profileData.skills.map((skill, index) => (
                                                            <Badge 
                                                                key={index} 
                                                                bg="primary" 
                                                                className="skill-badge d-inline-flex align-items-center px-3 py-2 border-0 shadow-sm"
                                                            >
                                                                {skill}
                                                                <button
                                                                    type="button"
                                                                    className="btn-close btn-close-white ms-2"
                                                                    onClick={() => removeSkill(skill)}
                                                                    style={{ fontSize: '0.6em' }}
                                                                ></button>
                                                            </Badge>
                                                        ))}
                                                        {profileData.skills.length === 0 && (
                                                            <p className="text-muted small d-flex align-items-center mt-2 mb-0">
                                                                <PlusCircle size={14} className="me-2" />
                                                                Add your skills to help employers find you
                                                            </p>
                                                        )}
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={12} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">Education</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        name="education"
                                                        value={profileData.education}
                                                        onChange={handleInputChange}
                                                        className="modern-textarea py-2 px-3 border-light bg-light"
                                                        placeholder="Describe your educational background..."
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="section-divider my-4 border-light"></div>

                                        <div className="subsection-header mb-4">
                                            <h5 className="subsection-title d-flex align-items-center fw-bold">
                                                <LinkIcon size={20} className="me-2 text-primary" />
                                                Professional Links
                                            </h5>
                                        </div>

                                        <Row>
                                            <Col md={4} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">LinkedIn Profile</Form.Label>
                                                    <Form.Control
                                                        type="url"
                                                        name="linkedinProfile"
                                                        value={profileData.linkedinProfile}
                                                        onChange={handleInputChange}
                                                        className="modern-input py-2 px-3 border-light bg-light"
                                                        placeholder="https://linkedin.com/in/username"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">GitHub Profile</Form.Label>
                                                    <Form.Control
                                                        type="url"
                                                        name="githubProfile"
                                                        value={profileData.githubProfile}
                                                        onChange={handleInputChange}
                                                        className="modern-input py-2 px-3 border-light bg-light"
                                                        placeholder="https://github.com/username"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">Portfolio Website</Form.Label>
                                                    <Form.Control
                                                        type="url"
                                                        name="portfolioWebsite"
                                                        value={profileData.portfolioWebsite}
                                                        onChange={handleInputChange}
                                                        className="modern-input py-2 px-3 border-light bg-light"
                                                        placeholder="https://yourportfolio.com"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                </Tab.Pane>

                                {/* Documents Tab */}
                                <Tab.Pane eventKey="documents">
                                    <div className="tab-content-section">
                                        <div className="section-header mb-4">
                                            <h4 className="section-title d-flex align-items-center fw-bold">
                                                <FileText size={24} className="me-2 text-primary" />
                                                Documents & Resume
                                            </h4>
                                            <p className="section-description text-muted">
                                                Upload your resume and other important documents
                                            </p>
                                        </div>

                                        <Row>
                                            <Col md={6} className="mb-4">
                                                <div className="upload-section h-100">
                                                    <div className="upload-card p-4 border border-2 border-dashed rounded-4 text-center bg-light h-100 d-flex flex-column align-items-center justify-content-center">
                                                        <div className="upload-icon mb-3 bg-white p-3 rounded-circle shadow-sm">
                                                            <FileText size={40} className="text-danger" />
                                                        </div>
                                                        <h6 className="upload-title fw-bold mb-3">Professional Resume</h6>
                                                        {profileData.resume ? (
                                                            <div className="uploaded-file text-center w-100">
                                                                <p className="file-name mb-3 text-truncate px-3 fw-medium">
                                                                    <CheckCircle2 size={16} className="text-success me-2" />
                                                                    {profileData.resume instanceof File 
                                                                        ? profileData.resume.name 
                                                                        : profileData.resume}
                                                                </p>
                                                                <div className="resume-actions d-flex justify-content-center gap-2">
                                                                    <Button 
                                                                        variant="white" 
                                                                        size="sm"
                                                                        className="d-flex align-items-center border shadow-sm"
                                                                        onClick={() => window.open(getFullFileUrl(profileData.resume, 'resume'), '_blank')}
                                                                    >
                                                                        <ExternalLink size={14} className="me-2" />
                                                                        View
                                                                    </Button>
                                                                    <Button 
                                                                        variant="outline-danger" 
                                                                        size="sm"
                                                                        className="d-flex align-items-center"
                                                                        onClick={() => setProfileData(prev => ({ ...prev, resume: null }))}
                                                                    >
                                                                        <Trash2 size={14} className="me-2" />
                                                                        Remove
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="upload-prompt w-100">
                                                                <p className="upload-text text-muted mb-3">Upload your resume to apply for jobs</p>
                                                                <Form.Control
                                                                    type="file"
                                                                    accept=".pdf,.doc,.docx"
                                                                    onChange={(e) => handleFileUpload(e, 'resume')}
                                                                    className="d-none"
                                                                    id="resume-upload"
                                                                />
                                                                <Button 
                                                                    variant="primary"
                                                                    className="d-inline-flex align-items-center px-4"
                                                                    onClick={() => document.getElementById('resume-upload').click()}
                                                                >
                                                                    <Upload size={18} className="me-2" />
                                                                    Choose File
                                                                </Button>
                                                            </div>
                                                        )}
                                                        <small className="upload-help text-muted mt-3">
                                                            Accepted: PDF, DOC, DOCX (Max 5MB)
                                                        </small>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={12} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label fw-bold small text-muted text-uppercase mb-2">Cover Letter</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={6}
                                                        name="coverLetter"
                                                        value={profileData.coverLetter}
                                                        onChange={handleInputChange}
                                                        className="modern-textarea py-3 px-4 border-light bg-light"
                                                        placeholder="Write a compelling cover letter that highlights your strengths and career goals..."
                                                    />
                                                    <Form.Text className="text-muted small mt-2 d-block">
                                                        A well-written cover letter can significantly improve your job application success rate.
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                </Tab.Pane>
                            </Tab.Content>
                        </Card.Body>

                        {/* Save Button */}
                        <Card.Footer className="bg-white border-top-0 p-4 p-lg-5 pt-0">
                            <div className="d-flex justify-content-end">
                                <Button 
                                    variant="primary" 
                                    size="lg"
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="save-profile-btn px-5 py-3 d-flex align-items-center shadow-lg border-0"
                                    style={{ borderRadius: '12px' }}
                                >
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-3"></span>
                                            Saving Profile...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} className="me-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card.Footer>
                    </Card>
                </Tab.Container>

                {/* Photo Upload Modal */}
                <Modal show={showPhotoModal} onHide={() => setShowPhotoModal(false)} centered className="profile-modal">
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="fw-bold d-flex align-items-center">
                            <Camera size={20} className="me-2 text-primary" />
                            Update Profile Photo
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center p-4">
                        <div className="photo-upload-section">
                            {profileData.profilePhoto ? (
                                <img 
                                    src={profileData.profilePhoto instanceof File ? URL.createObjectURL(profileData.profilePhoto) : getFullFileUrl(profileData.profilePhoto, 'profilePhoto')} 
                                    alt="Profile Preview" 
                                    className="photo-preview rounded-circle shadow-sm mb-4 border border-4 border-light"
                                    style={{ width: '180px', height: '180px', objectFit: 'cover' }}
                                />
                            ) : (
                                <div 
                                    className="photo-preview-placeholder rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-4 border border-4 border-light"
                                    style={{ width: '180px', height: '180px' }}
                                >
                                    <User size={64} className="text-muted opacity-25" />
                                </div>
                            )}
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'profilePhoto')}
                                className="d-none"
                                id="photo-upload"
                            />
                            <div className="d-grid gap-2">
                                <Button 
                                    variant="primary"
                                    onClick={() => document.getElementById('photo-upload').click()}
                                    className="d-flex align-items-center justify-content-center py-2"
                                >
                                    <Upload size={18} className="me-2" />
                                    Choose New Photo
                                </Button>
                                <Button 
                                    variant="outline-danger"
                                    onClick={() => setProfileData(prev => ({ ...prev, profilePhoto: null }))}
                                    className="d-flex align-items-center justify-content-center py-2"
                                    disabled={!profileData.profilePhoto}
                                >
                                    <Trash2 size={18} className="me-2" />
                                    Remove Photo
                                </Button>
                            </div>
                            <p className="text-muted small mt-3 mb-0">
                                Accepted formats: JPG, PNG, GIF (Max 2MB)
                            </p>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="light" onClick={() => setShowPhotoModal(false)} className="px-4">
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={() => setShowPhotoModal(false)}
                            disabled={!profileData.profilePhoto}
                            className="px-4 d-flex align-items-center"
                        >
                            <Check size={18} className="me-2" />
                            Update
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default JobSeekerProfile;