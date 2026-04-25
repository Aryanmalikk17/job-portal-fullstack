import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { 
    User, 
    Building2, 
    FileText, 
    Settings2, 
    Save, 
    CheckCircle2, 
    AlertCircle, 
    Info 
} from 'lucide-react';
import { 
    getRecruiterProfile, 
    updateRecruiterProfile, 
    uploadFile
} from '../../services/profileService';
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

    const showNotification = useCallback((message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    }, []);

    const loadProfileData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getRecruiterProfile();
            const profileFields = (response && response.data && typeof response.data === 'object')
                ? response.data
                : response;
            if (profileFields && Object.prototype.hasOwnProperty.call(profileFields, 'company')
                && !Object.prototype.hasOwnProperty.call(profileFields, 'companyName')) {
                profileFields.companyName = profileFields.company;
            }
            setProfileData(prev => ({ ...prev, ...profileFields }));
        } catch (error) {
            console.error('Error loading profile:', error);
            showNotification('Failed to load profile data', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        loadProfileData();
    }, [loadProfileData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileUpload = async (file, type) => {
        try {
            setSaving(true);
            const uploadedFile = await uploadFile(file, type);
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

            const packagedData = {
                ...profileData,
                industry: profileData.industry,
                companyWebsite: profileData.companyWebsite,
                companyDescription: profileData.companyDescription,
                companySize: profileData.companySize,
                companyType: profileData.companyType,
                foundedYear: profileData.foundedYear,
                officeCity: profileData.officeCity,
                officeState: profileData.officeState,
                officeCountry: profileData.officeCountry
            };

            const response = await updateRecruiterProfile(packagedData);
            const savedFields = (response && response.data && typeof response.data === 'object')
                ? response.data
                : response;
            if (savedFields) {
                if (savedFields.company && !savedFields.companyName) {
                    savedFields.companyName = savedFields.company;
                }
                setProfileData(prev => ({ ...prev, ...savedFields }));
            }
            showNotification('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error saving profile:', error);
            showNotification('Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };


    const renderPersonalInfo = () => (
        <Card className="profile-section-card border-0 shadow-sm">
            <Card.Header className="profile-section-header bg-white border-0 pt-4 px-4">
                <h4 className="section-title d-flex align-items-center fw-bold">
                    <User size={22} className="me-2 text-primary" />
                    Personal Information
                </h4>
            </Card.Header>
            <Card.Body className="p-4">
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-4">
                            <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">
                                First Name <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="firstName"
                                value={profileData.firstName}
                                onChange={handleInputChange}
                                className={`profile-form-control py-2 px-3 border-light bg-light ${errors.firstName ? 'is-invalid' : ''}`}
                                placeholder="Enter your first name"
                            />
                            {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-4">
                            <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">
                                Last Name <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="lastName"
                                value={profileData.lastName}
                                onChange={handleInputChange}
                                className={`profile-form-control py-2 px-3 border-light bg-light ${errors.lastName ? 'is-invalid' : ''}`}
                                placeholder="Enter your last name"
                            />
                            {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                        </Form.Group>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-4">
                            <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={profileData.email}
                                className="profile-form-control py-2 px-3 border-light bg-light-subtle"
                                disabled
                                style={{ backgroundColor: '#f8f9fa' }}
                            />
                            <Form.Text className="text-muted small mt-2 d-block">
                                Email cannot be changed. Contact support if needed.
                            </Form.Text>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-4">
                            <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">
                                Phone Number <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                value={profileData.phone}
                                onChange={handleInputChange}
                                className={`profile-form-control py-2 px-3 border-light bg-light ${errors.phone ? 'is-invalid' : ''}`}
                                placeholder="Enter your phone number"
                            />
                            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-2">
                    <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">Job Title/Position</Form.Label>
                    <Form.Control
                        type="text"
                        name="jobTitle"
                        value={profileData.jobTitle}
                        onChange={handleInputChange}
                        className="profile-form-control py-2 px-3 border-light bg-light"
                        placeholder="e.g. HR Manager, Talent Acquisition Specialist"
                    />
                </Form.Group>
            </Card.Body>
        </Card>
    );

    const renderCompanyInfo = () => (
        <Card className="profile-section-card border-0 shadow-sm">
            <Card.Header className="profile-section-header bg-white border-0 pt-4 px-4">
                <h4 className="section-title d-flex align-items-center fw-bold">
                    <Building2 size={22} className="me-2 text-primary" />
                    Company Information
                </h4>
            </Card.Header>
            <Card.Body className="p-4">
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-4">
                            <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">Company Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="companyName"
                                value={profileData.companyName}
                                onChange={handleInputChange}
                                className="profile-form-control py-2 px-3 border-light bg-light"
                                placeholder="Enter company name"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-4">
                            <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">Company Website</Form.Label>
                            <Form.Control
                                type="url"
                                name="companyWebsite"
                                value={profileData.companyWebsite}
                                onChange={handleInputChange}
                                className="profile-form-control py-2 px-3 border-light bg-light"
                                placeholder="https://www.yourcompany.com"
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-4">
                    <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">Company Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        name="companyDescription"
                        value={profileData.companyDescription}
                        onChange={handleInputChange}
                        className="profile-form-control py-3 px-3 border-light bg-light"
                        placeholder="Describe your company, its mission, values, and what makes it unique..."
                    />
                </Form.Group>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-4">
                            <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">Industry</Form.Label>
                            <Form.Select
                                name="industry"
                                value={profileData.industry}
                                onChange={handleInputChange}
                                className="profile-form-control py-2 px-3 border-light bg-light"
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
                        <Form.Group className="mb-4">
                            <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">Company Size</Form.Label>
                            <Form.Select
                                name="companySize"
                                value={profileData.companySize}
                                onChange={handleInputChange}
                                className="profile-form-control py-2 px-3 border-light bg-light"
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
                        <Form.Group className="mb-4">
                            <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">Company Type</Form.Label>
                            <Form.Select
                                name="companyType"
                                value={profileData.companyType}
                                onChange={handleInputChange}
                                className="profile-form-control py-2 px-3 border-light bg-light"
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
                        <Form.Group className="mb-4">
                            <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">Founded Year</Form.Label>
                            <Form.Control
                                type="number"
                                name="foundedYear"
                                value={profileData.foundedYear}
                                onChange={handleInputChange}
                                className="profile-form-control py-2 px-3 border-light bg-light"
                                placeholder="e.g. 2010"
                                min="1800"
                                max={new Date().getFullYear()}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                {/* Contact Information */}
                <div className="section-divider my-4 border-light"></div>
                <h5 className="mb-4 fw-bold small text-muted text-uppercase">Business Contact Information</h5>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-4">
                            <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">Business Phone</Form.Label>
                            <Form.Control
                                type="tel"
                                name="businessPhone"
                                value={profileData.businessPhone}
                                onChange={handleInputChange}
                                className="profile-form-control py-2 px-3 border-light bg-light"
                                placeholder="Business phone number"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-4">
                            <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">Business Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="businessEmail"
                                value={profileData.businessEmail}
                                onChange={handleInputChange}
                                className="profile-form-control py-2 px-3 border-light bg-light"
                                placeholder="business@company.com"
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-4">
                    <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">Office Address</Form.Label>
                    <Form.Control
                        type="text"
                        name="officeAddress"
                        value={profileData.officeAddress}
                        onChange={handleInputChange}
                        className="profile-form-control py-2 px-3 border-light bg-light"
                        placeholder="Street address"
                    />
                </Form.Group>

                <Row>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">City</Form.Label>
                            <Form.Control
                                type="text"
                                name="officeCity"
                                value={profileData.officeCity}
                                onChange={handleInputChange}
                                className="profile-form-control py-2 px-3 border-light bg-light"
                                placeholder="City"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">State/Province</Form.Label>
                            <Form.Control
                                type="text"
                                name="officeState"
                                value={profileData.officeState}
                                onChange={handleInputChange}
                                className="profile-form-control py-2 px-3 border-light bg-light"
                                placeholder="State/Province"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-form-label fw-bold small text-muted text-uppercase mb-2">Country</Form.Label>
                            <Form.Control
                                type="text"
                                name="officeCountry"
                                value={profileData.officeCountry}
                                onChange={handleInputChange}
                                className="profile-form-control py-2 px-3 border-light bg-light"
                                placeholder="Country"
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );

    const renderDocuments = () => (
        <Card className="profile-section-card border-0 shadow-sm">
            <Card.Header className="profile-section-header bg-white border-0 pt-4 px-4">
                <h4 className="section-title d-flex align-items-center fw-bold">
                    <FileText size={22} className="me-2 text-primary" />
                    Documents & Media
                </h4>
            </Card.Header>
            <Card.Body className="p-4">
                <Row>
                    <Col md={6}>
                        <div className="upload-section text-center p-3">
                            <h6 className="upload-title fw-bold text-muted small text-uppercase mb-3">Profile Photo</h6>
                            <AvatarUpload
                                currentImage={profileData.profilePhoto}
                                onUpload={(file) => handleFileUpload(file, 'profilePhoto')}
                                loading={saving}
                            />
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="upload-section text-center p-3">
                            <h6 className="upload-title fw-bold text-muted small text-uppercase mb-3">Company Logo</h6>
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
        <Card className="profile-section-card border-0 shadow-sm">
            <Card.Header className="profile-section-header bg-white border-0 pt-4 px-4">
                <h4 className="section-title d-flex align-items-center fw-bold">
                    <Settings2 size={22} className="me-2 text-primary" />
                    Account Settings
                </h4>
            </Card.Header>
            <Card.Body className="p-4">
                <Alert variant="info" className="border-0 shadow-sm d-flex align-items-center">
                    <Info size={18} className="me-3 text-info" />
                    <div>
                        <p className="mb-0 fw-medium">Account settings and privacy controls will be implemented in the next update.</p>
                        <small className="text-muted">Stay tuned for enhanced security and preference management.</small>
                    </div>
                </Alert>
            </Card.Body>
        </Card>
    );

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted fw-medium">Loading profile data...</p>
            </div>
        );
    }

    return (
        <div className="recruiter-profile">
            {/* Notification */}
            {notification && (
                <Alert 
                    variant={notification.type === 'success' ? 'success' : 'danger'} 
                    className="mb-4 border-0 shadow-sm d-flex align-items-center"
                    dismissible 
                    onClose={() => setNotification(null)}
                >
                    {notification.type === 'success' ? (
                        <CheckCircle2 size={18} className="me-2" />
                    ) : (
                        <AlertCircle size={18} className="me-2" />
                    )}
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
                <div className="profile-actions mt-4 d-flex justify-content-end">
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
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={20} className="me-2" />
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