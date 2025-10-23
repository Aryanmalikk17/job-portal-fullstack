import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { profileService } from '../../services/profileService';
import AvatarUpload from './AvatarUpload';
import FileUpload from './FileUpload';

const RecruiterProfile = ({ user, section = 'personal' }) => {
    const [profileData, setProfileData] = useState({
        // Personal Information
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: '',
        jobTitle: '',
        
        // Company Information
        companyName: '',
        companyWebsite: '',
        companyDescription: '',
        industry: '',
        companySize: '',
        companyType: '',
        foundedYear: '',
        
        // Contact Information
        businessPhone: '',
        businessEmail: '',
        officeAddress: '',
        officeCity: '',
        officeState: '',
        officeCountry: '',
        
        // Files
        profilePhoto: null,
        companyLogo: null
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            const data = await profileService.getRecruiterProfile();
            setProfileData(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error('Error loading profile:', error);
            showNotification('Failed to load profile data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileUpload = async (file, type) => {
        try {
            setSaving(true);
            const uploadedFile = await profileService.uploadFile(file, type);
            setProfileData(prev => ({
                ...prev,
                [type]: uploadedFile
            }));
            showNotification(`${type === 'profilePhoto' ? 'Profile photo' : 'Company logo'} uploaded successfully!`, 'success');
        } catch (error) {
            console.error('Error uploading file:', error);
            showNotification('Failed to upload file', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            setErrors({});
            
            // Validate required fields
            const requiredFields = ['firstName', 'lastName', 'phone'];
            const newErrors = {};
            
            requiredFields.forEach(field => {
                if (!profileData[field]?.trim()) {
                    newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
                }
            });
            
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            await profileService.updateRecruiterProfile(profileData);
            showNotification('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error saving profile:', error);
            showNotification('Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const renderPersonalInfo = () => (
        <Card className="profile-section-card">
            <Card.Header className="profile-section-header">
                <h4 className="section-title">
                    <i className="fas fa-user me-2"></i>
                    Personal Information
                </h4>
            </Card.Header>
            <Card.Body className="p-4">
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label">
                                First Name <span className="required">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="firstName"
                                value={profileData.firstName}
                                onChange={handleInputChange}
                                className={`profile-form-control ${errors.firstName ? 'is-invalid' : ''}`}
                                placeholder="Enter your first name"
                            />
                            {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label">
                                Last Name <span className="required">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="lastName"
                                value={profileData.lastName}
                                onChange={handleInputChange}
                                className={`profile-form-control ${errors.lastName ? 'is-invalid' : ''}`}
                                placeholder="Enter your last name"
                            />
                            {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label">Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={profileData.email}
                                className="profile-form-control"
                                disabled
                                title="Email cannot be changed"
                            />
                            <Form.Text className="text-muted">
                                Email cannot be changed. Contact support if needed.
                            </Form.Text>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label">
                                Phone Number <span className="required">*</span>
                            </Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                value={profileData.phone}
                                onChange={handleInputChange}
                                className={`profile-form-control ${errors.phone ? 'is-invalid' : ''}`}
                                placeholder="Enter your phone number"
                            />
                            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-4">
                    <Form.Label className="profile-form-label">Job Title/Position</Form.Label>
                    <Form.Control
                        type="text"
                        name="jobTitle"
                        value={profileData.jobTitle}
                        onChange={handleInputChange}
                        className="profile-form-control"
                        placeholder="e.g. HR Manager, Talent Acquisition Specialist"
                    />
                </Form.Group>
            </Card.Body>
        </Card>
    );

    const renderCompanyInfo = () => (
        <Card className="profile-section-card">
            <Card.Header className="profile-section-header">
                <h4 className="section-title">
                    <i className="fas fa-building me-2"></i>
                    Company Information
                </h4>
            </Card.Header>
            <Card.Body className="p-4">
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label">Company Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="companyName"
                                value={profileData.companyName}
                                onChange={handleInputChange}
                                className="profile-form-control"
                                placeholder="Enter company name"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label">Company Website</Form.Label>
                            <Form.Control
                                type="url"
                                name="companyWebsite"
                                value={profileData.companyWebsite}
                                onChange={handleInputChange}
                                className="profile-form-control"
                                placeholder="https://www.yourcompany.com"
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label className="profile-form-label">Company Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        name="companyDescription"
                        value={profileData.companyDescription}
                        onChange={handleInputChange}
                        className="profile-form-control"
                        placeholder="Describe your company, its mission, values, and what makes it unique..."
                    />
                </Form.Group>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label">Industry</Form.Label>
                            <Form.Select
                                name="industry"
                                value={profileData.industry}
                                onChange={handleInputChange}
                                className="profile-form-control"
                            >
                                <option value="">Select industry</option>
                                <option value="technology">Technology</option>
                                <option value="healthcare">Healthcare</option>
                                <option value="finance">Finance</option>
                                <option value="education">Education</option>
                                <option value="retail">Retail</option>
                                <option value="manufacturing">Manufacturing</option>
                                <option value="consulting">Consulting</option>
                                <option value="marketing">Marketing & Advertising</option>
                                <option value="real-estate">Real Estate</option>
                                <option value="automotive">Automotive</option>
                                <option value="hospitality">Hospitality</option>
                                <option value="non-profit">Non-Profit</option>
                                <option value="government">Government</option>
                                <option value="other">Other</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label">Company Size</Form.Label>
                            <Form.Select
                                name="companySize"
                                value={profileData.companySize}
                                onChange={handleInputChange}
                                className="profile-form-control"
                            >
                                <option value="">Select company size</option>
                                <option value="1-10">1-10 employees (Startup)</option>
                                <option value="11-50">11-50 employees (Small)</option>
                                <option value="51-200">51-200 employees (Medium)</option>
                                <option value="201-1000">201-1000 employees (Large)</option>
                                <option value="1000+">1000+ employees (Enterprise)</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label">Company Type</Form.Label>
                            <Form.Select
                                name="companyType"
                                value={profileData.companyType}
                                onChange={handleInputChange}
                                className="profile-form-control"
                            >
                                <option value="">Select company type</option>
                                <option value="startup">Startup</option>
                                <option value="public">Public Company</option>
                                <option value="private">Private Company</option>
                                <option value="non-profit">Non-Profit</option>
                                <option value="government">Government</option>
                                <option value="agency">Agency</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label">Founded Year</Form.Label>
                            <Form.Control
                                type="number"
                                name="foundedYear"
                                value={profileData.foundedYear}
                                onChange={handleInputChange}
                                className="profile-form-control"
                                placeholder="e.g. 2010"
                                min="1800"
                                max={new Date().getFullYear()}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                {/* Contact Information */}
                <hr className="my-4" />
                <h5 className="mb-3">Business Contact Information</h5>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label">Business Phone</Form.Label>
                            <Form.Control
                                type="tel"
                                name="businessPhone"
                                value={profileData.businessPhone}
                                onChange={handleInputChange}
                                className="profile-form-control"
                                placeholder="Business phone number"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label">Business Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="businessEmail"
                                value={profileData.businessEmail}
                                onChange={handleInputChange}
                                className="profile-form-control"
                                placeholder="business@company.com"
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label className="profile-form-label">Office Address</Form.Label>
                    <Form.Control
                        type="text"
                        name="officeAddress"
                        value={profileData.officeAddress}
                        onChange={handleInputChange}
                        className="profile-form-control"
                        placeholder="Street address"
                    />
                </Form.Group>

                <Row>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label">City</Form.Label>
                            <Form.Control
                                type="text"
                                name="officeCity"
                                value={profileData.officeCity}
                                onChange={handleInputChange}
                                className="profile-form-control"
                                placeholder="City"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label">State/Province</Form.Label>
                            <Form.Control
                                type="text"
                                name="officeState"
                                value={profileData.officeState}
                                onChange={handleInputChange}
                                className="profile-form-control"
                                placeholder="State/Province"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label">Country</Form.Label>
                            <Form.Control
                                type="text"
                                name="officeCountry"
                                value={profileData.officeCountry}
                                onChange={handleInputChange}
                                className="profile-form-control"
                                placeholder="Country"
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );

    const renderDocuments = () => (
        <Card className="profile-section-card">
            <Card.Header className="profile-section-header">
                <h4 className="section-title">
                    <i className="fas fa-file-alt me-2"></i>
                    Documents & Media
                </h4>
            </Card.Header>
            <Card.Body className="p-4">
                <Row>
                    <Col md={6}>
                        <div className="upload-section">
                            <h6 className="upload-title">Profile Photo</h6>
                            <AvatarUpload
                                currentImage={profileData.profilePhoto}
                                onUpload={(file) => handleFileUpload(file, 'profilePhoto')}
                                loading={saving}
                            />
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="upload-section">
                            <h6 className="upload-title">Company Logo</h6>
                            <FileUpload
                                currentFile={profileData.companyLogo}
                                onUpload={(file) => handleFileUpload(file, 'companyLogo')}
                                loading={saving}
                                acceptedTypes=".png,.jpg,.jpeg,.gif,.svg"
                                maxSize={2}
                                fileType="logo"
                            />
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );

    const renderSettings = () => (
        <Card className="profile-section-card">
            <Card.Header className="profile-section-header">
                <h4 className="section-title">
                    <i className="fas fa-cog me-2"></i>
                    Account Settings
                </h4>
            </Card.Header>
            <Card.Body className="p-4">
                <Alert variant="info">
                    <i className="fas fa-info-circle me-2"></i>
                    Account settings and privacy controls will be implemented in the next update.
                </Alert>
            </Card.Body>
        </Card>
    );

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="recruiter-profile">
            {/* Notification */}
            {notification && (
                <Alert 
                    variant={notification.type === 'success' ? 'success' : 'danger'} 
                    className="mb-4"
                    dismissible 
                    onClose={() => setNotification(null)}
                >
                    <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                    {notification.message}
                </Alert>
            )}

            {/* Render section based on active tab */}
            {section === 'personal' && renderPersonalInfo()}
            {section === 'company' && renderCompanyInfo()}
            {section === 'documents' && renderDocuments()}
            {section === 'settings' && renderSettings()}

            {/* Save Button */}
            {(section === 'personal' || section === 'company') && (
                <div className="profile-actions mt-4">
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
                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save me-2"></i>
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default RecruiterProfile;