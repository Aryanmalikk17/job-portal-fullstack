import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Nav, Tab, Badge, ProgressBar, Modal } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import LoadingSpinner from '../common/LoadingSpinner';
import './JobSeekerProfile.css'; // We'll create this

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

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await profileService.getJobSeekerProfile();
            setProfileData(prev => ({ ...prev, ...data }));
            calculateProfileCompletion({ ...profileData, ...data });
        } catch (error) {
            console.error('Error loading profile:', error);
            showNotification('Failed to load profile data', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    // Calculate profile completion percentage
    const calculateProfileCompletion = (data) => {
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
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setProfileData(prev => {
            const updated = { ...prev, [name]: newValue };
            calculateProfileCompletion(updated);
            return updated;
        });
    };

    // Handle skill management
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

    // Handle file uploads
    const handleFileUpload = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData(prev => ({ ...prev, [fieldName]: file }));
            calculateProfileCompletion({ ...profileData, [fieldName]: file });
        }
    };

    // Save profile
    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            await profileService.updateJobSeekerProfile(profileData);
            showNotification('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error saving profile:', error);
            showNotification('Failed to save profile. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Show notification
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
                    <Card className="profile-header-card">
                        <Card.Body className="p-4">
                            <Row className="align-items-center">
                                <Col md={2} className="text-center">
                                    <div className="profile-photo-container">
                                        {profileData.profilePhoto ? (
                                            <img 
                                                src={URL.createObjectURL(profileData.profilePhoto)} 
                                                alt="Profile" 
                                                className="profile-photo"
                                                onClick={() => setShowPhotoModal(true)}
                                            />
                                        ) : (
                                            <div 
                                                className="profile-photo-placeholder"
                                                onClick={() => setShowPhotoModal(true)}
                                            >
                                                <i className="fas fa-camera fa-2x"></i>
                                                <div className="photo-overlay">
                                                    <small>Add Photo</small>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="profile-info">
                                        <h2 className="profile-name mb-1">
                                            {profileData.firstName} {profileData.lastName}
                                        </h2>
                                        <p className="profile-title mb-2">
                                            <i className="fas fa-briefcase me-2"></i>
                                            {profileData.currentJobTitle || 'Add your job title'}
                                        </p>
                                        <p className="profile-location mb-2">
                                            <i className="fas fa-map-marker-alt me-2"></i>
                                            {profileData.city && profileData.country ? 
                                                `${profileData.city}, ${profileData.country}` : 
                                                'Add your location'
                                            }
                                        </p>
                                        <div className="profile-badges">
                                            <Badge bg="primary" className="me-2">
                                                <i className="fas fa-user-tie me-1"></i>
                                                Job Seeker
                                            </Badge>
                                            {profileData.workAuthorization && (
                                                <Badge bg="success" className="me-2">
                                                    <i className="fas fa-id-card me-1"></i>
                                                    {profileData.workAuthorization}
                                                </Badge>
                                            )}
                                            {profileData.willingToRelocate && (
                                                <Badge bg="info">
                                                    <i className="fas fa-plane me-1"></i>
                                                    Open to Relocate
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="profile-completion-card">
                                        <div className="completion-header mb-3">
                                            <h6 className="completion-title mb-1">Profile Completion</h6>
                                            <span className="completion-percentage">{profileCompletion}%</span>
                                        </div>
                                        <ProgressBar 
                                            variant={profileCompletion >= 80 ? 'success' : profileCompletion >= 50 ? 'warning' : 'danger'}
                                            now={profileCompletion} 
                                            className="completion-progress"
                                        />
                                        <small className="completion-text mt-2 d-block">
                                            {profileCompletion >= 80 ? (
                                                <><i className="fas fa-check-circle text-success me-1"></i>Great! Your profile looks complete</>
                                            ) : profileCompletion >= 50 ? (
                                                <><i className="fas fa-exclamation-triangle text-warning me-1"></i>Almost there! Add more details</>
                                            ) : (
                                                <><i className="fas fa-info-circle text-info me-1"></i>Complete your profile to attract employers</>
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
                        className="notification-alert mb-4"
                    >
                        <i className={`fas ${
                            notification.type === 'success' ? 'fa-check-circle' : 
                            notification.type === 'error' ? 'fa-exclamation-circle' : 
                            'fa-info-circle'
                        } me-2`}></i>
                        {notification.message}
                    </Alert>
                )}

                {/* Profile Tabs */}
                <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                    <Card className="profile-tabs-card">
                        <Card.Header className="bg-white border-bottom">
                            <Nav variant="tabs" className="profile-nav-tabs">
                                <Nav.Item>
                                    <Nav.Link eventKey="personal" className="profile-tab">
                                        <i className="fas fa-user me-2"></i>
                                        Personal Info
                                        {profileCompletion < 30 && <Badge bg="danger" className="ms-2">!</Badge>}
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="professional" className="profile-tab">
                                        <i className="fas fa-briefcase me-2"></i>
                                        Professional
                                        {profileCompletion < 60 && <Badge bg="warning" className="ms-2">!</Badge>}
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="documents" className="profile-tab">
                                        <i className="fas fa-file-alt me-2"></i>
                                        Documents
                                        {!profileData.resume && <Badge bg="info" className="ms-2">+</Badge>}
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card.Header>

                        <Card.Body className="p-4">
                            <Tab.Content>
                                {/* Personal Information Tab */}
                                <Tab.Pane eventKey="personal">
                                    <div className="tab-content-section">
                                        <div className="section-header mb-4">
                                            <h4 className="section-title">
                                                <i className="fas fa-user-circle me-2"></i>
                                                Personal Information
                                            </h4>
                                            <p className="section-description">
                                                Tell us about yourself to help employers get to know you better
                                            </p>
                                        </div>

                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">
                                                        First Name <span className="required">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="firstName"
                                                        value={profileData.firstName}
                                                        onChange={handleInputChange}
                                                        className="modern-input"
                                                        placeholder="Enter your first name"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">
                                                        Last Name <span className="required">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="lastName"
                                                        value={profileData.lastName}
                                                        onChange={handleInputChange}
                                                        className="modern-input"
                                                        placeholder="Enter your last name"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={8} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">Email Address</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        value={profileData.email}
                                                        className="modern-input"
                                                        disabled
                                                        style={{ backgroundColor: '#f8f9fa' }}
                                                    />
                                                    <Form.Text className="text-muted">
                                                        <i className="fas fa-lock me-1"></i>
                                                        Email cannot be changed. Contact support if needed.
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                            <Col md={4} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">
                                                        Phone Number <span className="required">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="phone"
                                                        value={profileData.phone}
                                                        onChange={handleInputChange}
                                                        className="modern-input"
                                                        placeholder="Enter your phone number"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={4} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">Date of Birth</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="dateOfBirth"
                                                        value={profileData.dateOfBirth}
                                                        onChange={handleInputChange}
                                                        className="modern-input"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">Gender</Form.Label>
                                                    <Form.Select
                                                        name="gender"
                                                        value={profileData.gender}
                                                        onChange={handleInputChange}
                                                        className="modern-select"
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

                                        <div className="section-divider my-4"></div>

                                        <div className="subsection-header mb-3">
                                            <h5 className="subsection-title">
                                                <i className="fas fa-map-marker-alt me-2"></i>
                                                Location Information
                                            </h5>
                                        </div>

                                        <Row>
                                            <Col md={4} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">
                                                        City <span className="required">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="city"
                                                        value={profileData.city}
                                                        onChange={handleInputChange}
                                                        className="modern-input"
                                                        placeholder="Current city"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">State/Province</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="state"
                                                        value={profileData.state}
                                                        onChange={handleInputChange}
                                                        className="modern-input"
                                                        placeholder="Current state"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">
                                                        Country <span className="required">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="country"
                                                        value={profileData.country}
                                                        onChange={handleInputChange}
                                                        className="modern-input"
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
                                                    className="modern-checkbox"
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Tab.Pane>

                                {/* Professional Information Tab */}
                                <Tab.Pane eventKey="professional">
                                    <div className="tab-content-section">
                                        <div className="section-header mb-4">
                                            <h4 className="section-title">
                                                <i className="fas fa-briefcase me-2"></i>
                                                Professional Information
                                            </h4>
                                            <p className="section-description">
                                                Share your professional background and career preferences
                                            </p>
                                        </div>

                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">
                                                        Current Job Title <span className="required">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="currentJobTitle"
                                                        value={profileData.currentJobTitle}
                                                        onChange={handleInputChange}
                                                        className="modern-input"
                                                        placeholder="e.g. Software Engineer, Marketing Manager"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">
                                                        Years of Experience <span className="required">*</span>
                                                    </Form.Label>
                                                    <Form.Select
                                                        name="experience"
                                                        value={profileData.experience}
                                                        onChange={handleInputChange}
                                                        className="modern-select"
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
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">
                                                        Work Authorization <span className="required">*</span>
                                                    </Form.Label>
                                                    <Form.Select
                                                        name="workAuthorization"
                                                        value={profileData.workAuthorization}
                                                        onChange={handleInputChange}
                                                        className="modern-select"
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
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">
                                                        Employment Type <span className="required">*</span>
                                                    </Form.Label>
                                                    <Form.Select
                                                        name="employmentType"
                                                        value={profileData.employmentType}
                                                        onChange={handleInputChange}
                                                        className="modern-select"
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
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">Expected Salary</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="expectedSalary"
                                                        value={profileData.expectedSalary}
                                                        onChange={handleInputChange}
                                                        className="modern-input"
                                                        placeholder="e.g. $80,000 - $100,000"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">Available From</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="availabilityDate"
                                                        value={profileData.availabilityDate}
                                                        onChange={handleInputChange}
                                                        className="modern-input"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="section-divider my-4"></div>

                                        <div className="subsection-header mb-3">
                                            <h5 className="subsection-title">
                                                <i className="fas fa-tools me-2"></i>
                                                Skills & Expertise
                                            </h5>
                                        </div>

                                        <Row>
                                            <Col md={12} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">Skills</Form.Label>
                                                    <div className="skills-input-container">
                                                        <div className="skills-input-group">
                                                            <Form.Control
                                                                type="text"
                                                                value={skillInput}
                                                                onChange={(e) => setSkillInput(e.target.value)}
                                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                                                className="modern-input"
                                                                placeholder="Type a skill and press Enter"
                                                            />
                                                            <Button 
                                                                variant="outline-primary" 
                                                                onClick={addSkill}
                                                                className="add-skill-btn"
                                                            >
                                                                <i className="fas fa-plus"></i>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="skills-container mt-3">
                                                        {profileData.skills.map((skill, index) => (
                                                            <Badge 
                                                                key={index} 
                                                                bg="primary" 
                                                                className="skill-badge me-2 mb-2"
                                                            >
                                                                {skill}
                                                                <button
                                                                    type="button"
                                                                    className="btn-close btn-close-white ms-2"
                                                                    onClick={() => removeSkill(skill)}
                                                                    style={{ fontSize: '0.7em' }}
                                                                ></button>
                                                            </Badge>
                                                        ))}
                                                        {profileData.skills.length === 0 && (
                                                            <p className="text-muted skills-empty">
                                                                <i className="fas fa-plus-circle me-1"></i>
                                                                Add your skills to help employers find you
                                                            </p>
                                                        )}
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={12} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">Education</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        name="education"
                                                        value={profileData.education}
                                                        onChange={handleInputChange}
                                                        className="modern-textarea"
                                                        placeholder="Describe your educational background..."
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="section-divider my-4"></div>

                                        <div className="subsection-header mb-3">
                                            <h5 className="subsection-title">
                                                <i className="fas fa-link me-2"></i>
                                                Professional Links
                                            </h5>
                                        </div>

                                        <Row>
                                            <Col md={4} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">LinkedIn Profile</Form.Label>
                                                    <Form.Control
                                                        type="url"
                                                        name="linkedinProfile"
                                                        value={profileData.linkedinProfile}
                                                        onChange={handleInputChange}
                                                        className="modern-input"
                                                        placeholder="https://linkedin.com/in/username"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">GitHub Profile</Form.Label>
                                                    <Form.Control
                                                        type="url"
                                                        name="githubProfile"
                                                        value={profileData.githubProfile}
                                                        onChange={handleInputChange}
                                                        className="modern-input"
                                                        placeholder="https://github.com/username"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">Portfolio Website</Form.Label>
                                                    <Form.Control
                                                        type="url"
                                                        name="portfolioWebsite"
                                                        value={profileData.portfolioWebsite}
                                                        onChange={handleInputChange}
                                                        className="modern-input"
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
                                            <h4 className="section-title">
                                                <i className="fas fa-file-alt me-2"></i>
                                                Documents & Resume
                                            </h4>
                                            <p className="section-description">
                                                Upload your resume and other important documents
                                            </p>
                                        </div>

                                        <Row>
                                            <Col md={6} className="mb-4">
                                                <div className="upload-section">
                                                    <div className="upload-card">
                                                        <div className="upload-icon">
                                                            <i className="fas fa-file-pdf fa-3x"></i>
                                                        </div>
                                                        <h6 className="upload-title">Resume</h6>
                                                        {profileData.resume ? (
                                                            <div className="uploaded-file">
                                                                <p className="file-name">
                                                                    <i className="fas fa-check-circle text-success me-2"></i>
                                                                    {profileData.resume.name}
                                                                </p>
                                                                <Button 
                                                                    variant="outline-danger" 
                                                                    size="sm"
                                                                    onClick={() => setProfileData(prev => ({ ...prev, resume: null }))}
                                                                >
                                                                    <i className="fas fa-trash me-1"></i>
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="upload-prompt">
                                                                <p className="upload-text">Upload your resume</p>
                                                                <Form.Control
                                                                    type="file"
                                                                    accept=".pdf,.doc,.docx"
                                                                    onChange={(e) => handleFileUpload(e, 'resume')}
                                                                    className="d-none"
                                                                    id="resume-upload"
                                                                />
                                                                <Button 
                                                                    variant="outline-primary"
                                                                    onClick={() => document.getElementById('resume-upload').click()}
                                                                >
                                                                    <i className="fas fa-upload me-2"></i>
                                                                    Choose File
                                                                </Button>
                                                            </div>
                                                        )}
                                                        <small className="upload-help">
                                                            PDF, DOC, DOCX (Max 5MB)
                                                        </small>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={12} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="modern-label">Cover Letter</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={6}
                                                        name="coverLetter"
                                                        value={profileData.coverLetter}
                                                        onChange={handleInputChange}
                                                        className="modern-textarea"
                                                        placeholder="Write a compelling cover letter that highlights your strengths and career goals..."
                                                    />
                                                    <Form.Text className="text-muted">
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
                        <Card.Footer className="bg-white border-top">
                            <div className="d-flex justify-content-end">
                                <Button 
                                    variant="primary" 
                                    size="lg"
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="save-profile-btn"
                                >
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Saving Profile...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save me-2"></i>
                                            Save Profile
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card.Footer>
                    </Card>
                </Tab.Container>

                {/* Photo Upload Modal */}
                <Modal show={showPhotoModal} onHide={() => setShowPhotoModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <i className="fas fa-camera me-2"></i>
                            Update Profile Photo
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        <div className="photo-upload-section">
                            {profileData.profilePhoto ? (
                                <img 
                                    src={URL.createObjectURL(profileData.profilePhoto)} 
                                    alt="Profile Preview" 
                                    className="photo-preview mb-3"
                                />
                            ) : (
                                <div className="photo-preview-placeholder mb-3">
                                    <i className="fas fa-user fa-4x"></i>
                                </div>
                            )}
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'profilePhoto')}
                                className="d-none"
                                id="photo-upload"
                            />
                            <Button 
                                variant="primary"
                                onClick={() => document.getElementById('photo-upload').click()}
                                className="mb-2"
                            >
                                <i className="fas fa-upload me-2"></i>
                                Choose Photo
                            </Button>
                            <br />
                            <small className="text-muted">
                                JPG, PNG, GIF (Max 2MB)
                            </small>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowPhotoModal(false)}>
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={() => setShowPhotoModal(false)}
                            disabled={!profileData.profilePhoto}
                        >
                            <i className="fas fa-check me-2"></i>
                            Update Photo
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default JobSeekerProfile;