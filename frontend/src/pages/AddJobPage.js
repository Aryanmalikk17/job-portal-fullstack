import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import { locationService } from '../services/locationService';
import { companyService } from '../services/companyService';
import RichTextEditor from '../components/jobs/RichTextEditor';

const AddJobPage = () => {
    const navigate = useNavigate();
    
    // Form state - keeping all original fields for backend compatibility
    const [formData, setFormData] = useState({
        jobTitle: '',
        jobType: '',
        remote: '',
        salary: '',
        descriptionOfJob: '',
        city: '',
        state: '',
        country: '',
        companyName: '',
        companyWebsite: ''
    });
    
    // UI state
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState(null);
    const [validatedFields, setValidatedFields] = useState(new Set());
    const [currentStep, setCurrentStep] = useState(1);

    // Calculate form completion progress
    const getFormProgress = () => {
        const requiredFields = ['jobTitle', 'jobType', 'remote', 'city', 'state', 'country', 'companyName'];
        const filledFields = requiredFields.filter(field => formData[field]?.trim());
        const descriptionFilled = formData.descriptionOfJob && formData.descriptionOfJob.length > 50;
        const totalRequired = requiredFields.length + (descriptionFilled ? 1 : 0);
        return Math.round((filledFields.length + (descriptionFilled ? 1 : 0)) / (requiredFields.length + 1) * 100);
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
        
        // Add to validated fields if value exists
        if (value.trim()) {
            setValidatedFields(prev => new Set([...prev, name]));
        }
    };

    // Handle rich text editor change
    const handleDescriptionChange = (content) => {
        setFormData(prev => ({
            ...prev,
            descriptionOfJob: content
        }));
        
        // Clear error for description
        if (errors.descriptionOfJob) {
            setErrors(prev => ({
                ...prev,
                descriptionOfJob: null
            }));
        }

        // Add to validated fields if content exists
        if (content && content.trim() && content !== '<p><br></p>') {
            setValidatedFields(prev => new Set([...prev, 'descriptionOfJob']));
        }
    };

    // Auto-capitalize on blur
    const handleBlur = (e) => {
        const { name, value } = e.target;
        if (value && name !== 'salary') {
            const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
            setFormData(prev => ({
                ...prev,
                [name]: capitalizedValue
            }));
        }
    };

    // Validation
    const validateForm = () => {
        const newErrors = {};
        
        // Required fields validation
        const requiredFields = [
            { field: 'jobTitle', name: 'Job Title' },
            { field: 'jobType', name: 'Employment Type' },
            { field: 'remote', name: 'Work Arrangement' },
            { field: 'city', name: 'City' },
            { field: 'state', name: 'State' },
            { field: 'country', name: 'Country' },
            { field: 'companyName', name: 'Company Name' }
        ];
        
        requiredFields.forEach(({ field, name }) => {
            if (!formData[field] || !formData[field].trim()) {
                newErrors[field] = `${name} is required`;
            }
        });
        
        // Job description validation
        const description = formData.descriptionOfJob;
        if (!description || description === '<p><br></p>' || description.trim() === '' || description.length < 50) {
            newErrors.descriptionOfJob = 'Please provide a detailed job description (at least 50 characters)';
        }
        
        return newErrors;
    };

    // Show notification
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            showNotification('Please fill in all required fields correctly', 'error');
            
            // Scroll to first error
            const firstErrorField = Object.keys(validationErrors)[0];
            const errorElement = document.getElementById(firstErrorField);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        try {
            setLoading(true);
            showNotification('Creating location and company records...', 'info');
            
            // Step 1: Create or get location
            const locationResponse = await locationService.createOrGetLocation({
                city: formData.city.trim(),
                state: formData.state.trim(),
                country: formData.country.trim()
            });
            
            const locationId = locationResponse.data.id;
            console.log('Location created/found with ID:', locationId);
            
            // Step 2: Create or get company
            const companyResponse = await companyService.createOrGetCompany({
                name: formData.companyName.trim(),
                website: formData.companyWebsite.trim() || null
            });
            
            const companyId = companyResponse.data.id;
            console.log('Company created/found with ID:', companyId);
            
            showNotification('Posting your job...', 'info');
            
            // Step 3: Create job with proper IDs
            const jobData = {
                jobTitle: formData.jobTitle.trim(),
                jobType: formData.jobType,
                remote: formData.remote,
                salary: formData.salary.trim() || null,
                descriptionOfJob: formData.descriptionOfJob,
                jobLocationId: locationId,  // ✅ Now sending integer ID
                jobCompanyId: companyId     // ✅ Now sending integer ID
            };
            
            console.log('Submitting job data:', jobData);
            
            // Submit job
            const jobResponse = await jobService.createJob(jobData);
            
            console.log('Job created successfully:', jobResponse);
            showNotification('Job posted successfully! Redirecting to dashboard...', 'success');
            
            // Redirect after success
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
            
        } catch (error) {
            console.error('Error creating job:', error);
            
            let errorMessage = 'Failed to post job. Please try again.';
            
            // Handle specific error types
            if (error.message && error.message.includes('location')) {
                errorMessage = 'Failed to create job location. Please check your location details.';
            } else if (error.message && error.message.includes('company')) {
                errorMessage = 'Failed to create company record. Please check your company details.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 401) {
                errorMessage = 'You are not authorized to post jobs. Please log in again.';
            } else if (error.response?.status === 403) {
                errorMessage = 'You do not have permission to post jobs.';
            }
            
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Go back to dashboard
    const handleBack = () => {
        navigate('/dashboard');
    };

    const progress = getFormProgress();

    return (
        <div className="add-job-page">
            <Container className="py-4">
                {/* Enhanced Header with Animation */}
                <div className="job-posting-header mb-5">
                    <div className="header-background">
                        <div className="header-pattern"></div>
                    </div>
                    <div className="header-content text-center">
                        <div className="header-icon mb-3">
                            <div className="icon-circle">
                                <i className="fas fa-plus"></i>
                            </div>
                            <div className="icon-pulse"></div>
                        </div>
                        <h1 className="header-title mb-3">Post a New Job</h1>
                        <p className="header-subtitle mb-4">
                            Connect with top talent and build your dream team
                        </p>
                        
                        {/* Progress Indicator */}
                        <div className="progress-section mb-4">
                            <div className="progress-label mb-2">
                                <span>Form Completion</span>
                                <span className="progress-percentage">{progress}%</span>
                            </div>
                            <ProgressBar 
                                now={progress} 
                                className="custom-progress"
                                variant={progress < 30 ? 'danger' : progress < 70 ? 'warning' : 'success'}
                            />
                        </div>
                        
                        <div className="header-stats">
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <i className="fas fa-users"></i>
                                </div>
                                <div className="stat-content">
                                    <span className="stat-number">15K+</span>
                                    <span className="stat-label">Active Job Seekers</span>
                                </div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <i className="fas fa-chart-line"></i>
                                </div>
                                <div className="stat-content">
                                    <span className="stat-number">92%</span>
                                    <span className="stat-label">Match Success Rate</span>
                                </div>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <div className="stat-content">
                                    <span className="stat-number">24h</span>
                                    <span className="stat-label">Average Response Time</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Alert */}
                {notification && (
                    <Alert 
                        variant={notification.type === 'success' ? 'success' : notification.type === 'error' ? 'danger' : 'info'} 
                        className="notification-alert mb-4"
                        dismissible 
                        onClose={() => setNotification(null)}
                    >
                        <div className="alert-content">
                            <i className={`alert-icon fa ${
                                notification.type === 'success' ? 'fa-check-circle' : 
                                notification.type === 'error' ? 'fa-exclamation-circle' : 
                                'fa-info-circle'
                            }`}></i>
                            <span>{notification.message}</span>
                        </div>
                    </Alert>
                )}

                {/* Enhanced Form with Modern Styling */}
                <div className="job-form-container">
                    <Form onSubmit={handleSubmit}>
                        {/* Job Basics Section */}
                        <Card className="form-section-card mb-4">
                            <Card.Body className="p-4">
                                <div className="section-header mb-4">
                                    <div className="section-icon-wrapper">
                                        <div className="section-icon">
                                            <i className="fas fa-briefcase"></i>
                                        </div>
                                    </div>
                                    <div className="section-content">
                                        <h3 className="section-title">Job Basics</h3>
                                        <p className="section-description">Start with the essential details about this position</p>
                                    </div>
                                </div>
                                
                                {/* Job Title */}
                                <div className="form-group-enhanced mb-4">
                                    <Form.Group>
                                        <Form.Label className="form-label-enhanced">
                                            Job Title <span className="required-indicator">*</span>
                                        </Form.Label>
                                        <div className="input-wrapper">
                                            <Form.Control
                                                id="jobTitle"
                                                type="text"
                                                name="jobTitle"
                                                value={formData.jobTitle}
                                                onChange={handleInputChange}
                                                onBlur={handleBlur}
                                                className={`form-control-enhanced ${
                                                    errors.jobTitle ? 'error' : 
                                                    validatedFields.has('jobTitle') ? 'success' : ''
                                                }`}
                                                placeholder="e.g. Senior Software Engineer, Marketing Manager, Data Scientist"
                                            />
                                            <div className="input-icon">
                                                <i className="fas fa-user-tie"></i>
                                            </div>
                                        </div>
                                        <div className="form-help">
                                            <i className="fas fa-lightbulb"></i>
                                            Make it specific and clear to attract the right candidates
                                        </div>
                                        {errors.jobTitle && <div className="error-message">{errors.jobTitle}</div>}
                                    </Form.Group>
                                </div>

                                {/* Employment Type and Work Arrangement */}
                                <Row className="mb-4">
                                    <Col md={6}>
                                        <div className="form-group-enhanced">
                                            <Form.Group>
                                                <Form.Label className="form-label-enhanced">
                                                    Employment Type <span className="required-indicator">*</span>
                                                </Form.Label>
                                                <div className="select-wrapper">
                                                    <Form.Select
                                                        id="jobType"
                                                        name="jobType"
                                                        value={formData.jobType}
                                                        onChange={handleInputChange}
                                                        className={`form-select-enhanced ${
                                                            errors.jobType ? 'error' : 
                                                            validatedFields.has('jobType') ? 'success' : ''
                                                        }`}
                                                    >
                                                        <option value="">Choose employment type</option>
                                                        <option value="Full-time">🕘 Full-time</option>
                                                        <option value="Part-time">⏰ Part-time</option>
                                                        <option value="Freelance">💼 Freelance</option>
                                                        <option value="Internship">🎓 Internship</option>
                                                    </Form.Select>
                                                </div>
                                                {errors.jobType && <div className="error-message">{errors.jobType}</div>}
                                            </Form.Group>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="form-group-enhanced">
                                            <Form.Group>
                                                <Form.Label className="form-label-enhanced">
                                                    Work Arrangement <span className="required-indicator">*</span>
                                                </Form.Label>
                                                <div className="select-wrapper">
                                                    <Form.Select
                                                        id="remote"
                                                        name="remote"
                                                        value={formData.remote}
                                                        onChange={handleInputChange}
                                                        className={`form-select-enhanced ${
                                                            errors.remote ? 'error' : 
                                                            validatedFields.has('remote') ? 'success' : ''
                                                        }`}
                                                    >
                                                        <option value="">Select work arrangement</option>
                                                        <option value="Remote-Only">🏠 Remote Only</option>
                                                        <option value="Office-Only">🏢 Office Only</option>
                                                        <option value="Partial-Remote">🔄 Hybrid (Remote + Office)</option>
                                                    </Form.Select>
                                                </div>
                                                {errors.remote && <div className="error-message">{errors.remote}</div>}
                                            </Form.Group>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Salary Range */}
                                <div className="form-group-enhanced mb-4">
                                    <Form.Group>
                                        <Form.Label className="form-label-enhanced">
                                            Salary Range <span className="optional-indicator">(Optional)</span>
                                        </Form.Label>
                                        <div className="input-wrapper">
                                            <Form.Control
                                                id="salary"
                                                type="text"
                                                name="salary"
                                                value={formData.salary}
                                                onChange={handleInputChange}
                                                className="form-control-enhanced"
                                                placeholder="e.g. $80,000 - $120,000 per year, $50/hour, Competitive"
                                            />
                                            <div className="input-icon">
                                                <i className="fas fa-dollar-sign"></i>
                                            </div>
                                        </div>
                                        <div className="form-help success">
                                            <i className="fas fa-chart-line"></i>
                                            Including salary ranges can increase application rates by 30%
                                        </div>
                                    </Form.Group>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Job Description Section */}
                        <Card className="form-section-card mb-4">
                            <Card.Body className="p-4">
                                <div className="section-header mb-4">
                                    <div className="section-icon-wrapper">
                                        <div className="section-icon">
                                            <i className="fas fa-file-alt"></i>
                                        </div>
                                    </div>
                                    <div className="section-content">
                                        <h3 className="section-title">Job Description</h3>
                                        <p className="section-description">Describe the role, responsibilities, and requirements in detail</p>
                                    </div>
                                </div>
                                
                                <div className="form-group-enhanced">
                                    <Form.Group>
                                        <Form.Label className="form-label-enhanced">
                                            Full Job Description <span className="required-indicator">*</span>
                                        </Form.Label>
                                        <div className="editor-wrapper">
                                            <RichTextEditor
                                                value={formData.descriptionOfJob}
                                                onChange={handleDescriptionChange}
                                                placeholder="Describe the role in detail...

• Key responsibilities and daily tasks
• Required qualifications and skills  
• Preferred experience and background
• Benefits, perks, and compensation
• Company culture and values
• Growth opportunities"
                                                className={`editor-enhanced ${
                                                    errors.descriptionOfJob ? 'error' : 
                                                    validatedFields.has('descriptionOfJob') ? 'success' : ''
                                                }`}
                                            />
                                        </div>
                                        <div className="form-help">
                                            <i className="fas fa-lightbulb"></i>
                                            Include key responsibilities, required skills, benefits, and company culture
                                        </div>
                                        {errors.descriptionOfJob && <div className="error-message">{errors.descriptionOfJob}</div>}
                                    </Form.Group>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Location Section */}
                        <Card className="form-section-card mb-4">
                            <Card.Body className="p-4">
                                <div className="section-header mb-4">
                                    <div className="section-icon-wrapper">
                                        <div className="section-icon">
                                            <i className="fas fa-map-marker-alt"></i>
                                        </div>
                                    </div>
                                    <div className="section-content">
                                        <h3 className="section-title">Job Location</h3>
                                        <p className="section-description">Where will this position be based?</p>
                                    </div>
                                </div>
                                
                                <Row>
                                    <Col md={4}>
                                        <div className="form-group-enhanced mb-4">
                                            <Form.Group>
                                                <Form.Label className="form-label-enhanced">
                                                    City <span className="required-indicator">*</span>
                                                </Form.Label>
                                                <div className="input-wrapper">
                                                    <Form.Control
                                                        id="city"
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className={`form-control-enhanced ${
                                                            errors.city ? 'error' : 
                                                            validatedFields.has('city') ? 'success' : ''
                                                        }`}
                                                        placeholder="e.g. New York"
                                                    />
                                                    <div className="input-icon">
                                                        <i className="fas fa-city"></i>
                                                    </div>
                                                </div>
                                                {errors.city && <div className="error-message">{errors.city}</div>}
                                            </Form.Group>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className="form-group-enhanced mb-4">
                                            <Form.Group>
                                                <Form.Label className="form-label-enhanced">
                                                    State/Province <span className="required-indicator">*</span>
                                                </Form.Label>
                                                <div className="input-wrapper">
                                                    <Form.Control
                                                        id="state"
                                                        type="text"
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className={`form-control-enhanced ${
                                                            errors.state ? 'error' : 
                                                            validatedFields.has('state') ? 'success' : ''
                                                        }`}
                                                        placeholder="e.g. NY, California"
                                                    />
                                                    <div className="input-icon">
                                                        <i className="fas fa-map"></i>
                                                    </div>
                                                </div>
                                                {errors.state && <div className="error-message">{errors.state}</div>}
                                            </Form.Group>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className="form-group-enhanced mb-4">
                                            <Form.Group>
                                                <Form.Label className="form-label-enhanced">
                                                    Country <span className="required-indicator">*</span>
                                                </Form.Label>
                                                <div className="input-wrapper">
                                                    <Form.Control
                                                        id="country"
                                                        type="text"
                                                        name="country"
                                                        value={formData.country}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className={`form-control-enhanced ${
                                                            errors.country ? 'error' : 
                                                            validatedFields.has('country') ? 'success' : ''
                                                        }`}
                                                        placeholder="e.g. United States"
                                                    />
                                                    <div className="input-icon">
                                                        <i className="fas fa-globe"></i>
                                                    </div>
                                                </div>
                                                {errors.country && <div className="error-message">{errors.country}</div>}
                                            </Form.Group>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Company Information Section */}
                        <Card className="form-section-card mb-4">
                            <Card.Body className="p-4">
                                <div className="section-header mb-4">
                                    <div className="section-icon-wrapper">
                                        <div className="section-icon">
                                            <i className="fas fa-building"></i>
                                        </div>
                                    </div>
                                    <div className="section-content">
                                        <h3 className="section-title">Company Information</h3>
                                        <p className="section-description">Tell candidates about your organization</p>
                                    </div>
                                </div>
                                
                                <Row>
                                    <Col md={8}>
                                        <div className="form-group-enhanced mb-4">
                                            <Form.Group>
                                                <Form.Label className="form-label-enhanced">
                                                    Company Name <span className="required-indicator">*</span>
                                                </Form.Label>
                                                <div className="input-wrapper">
                                                    <Form.Control
                                                        id="companyName"
                                                        type="text"
                                                        name="companyName"
                                                        value={formData.companyName}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className={`form-control-enhanced ${
                                                            errors.companyName ? 'error' : 
                                                            validatedFields.has('companyName') ? 'success' : ''
                                                        }`}
                                                        placeholder="e.g. Google Inc., Microsoft Corporation"
                                                    />
                                                    <div className="input-icon">
                                                        <i className="fas fa-building"></i>
                                                    </div>
                                                </div>
                                                <div className="form-help">
                                                    <i className="fas fa-eye"></i>
                                                    This will be displayed prominently on the job listing
                                                </div>
                                                {errors.companyName && <div className="error-message">{errors.companyName}</div>}
                                            </Form.Group>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className="form-group-enhanced mb-4">
                                            <Form.Group>
                                                <Form.Label className="form-label-enhanced">
                                                    Company Website <span className="optional-indicator">(Optional)</span>
                                                </Form.Label>
                                                <div className="input-wrapper">
                                                    <Form.Control
                                                        id="companyWebsite"
                                                        type="url"
                                                        name="companyWebsite"
                                                        value={formData.companyWebsite}
                                                        onChange={handleInputChange}
                                                        className="form-control-enhanced"
                                                        placeholder="https://company.com"
                                                    />
                                                    <div className="input-icon">
                                                        <i className="fas fa-link"></i>
                                                    </div>
                                                </div>
                                                <div className="form-help">
                                                    <i className="fas fa-external-link-alt"></i>
                                                    Help candidates learn more about your company
                                                </div>
                                            </Form.Group>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Form>
                </div>

                {/* Enhanced Action Footer */}
                <Card className="action-footer-card">
                    <Card.Body className="p-4">
                        <div className="action-footer">
                            <div className="footer-left">
                                <Button 
                                    variant="outline-secondary" 
                                    className="btn-back-enhanced"
                                    onClick={handleBack}
                                    disabled={loading}
                                >
                                    <i className="fas fa-arrow-left"></i>
                                    <span>Back to Dashboard</span>
                                </Button>
                            </div>
                            
                            <div className="footer-center">
                                <div className="reach-info">
                                    <div className="reach-icon">
                                        <i className="fas fa-users"></i>
                                    </div>
                                    <div className="reach-content">
                                        <span className="reach-text">Reach over</span>
                                        <span className="reach-number">15,000+</span>
                                        <span className="reach-text">qualified candidates</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="footer-right">
                                <Button 
                                    type="submit" 
                                    className="btn-post-enhanced"
                                    onClick={handleSubmit}
                                    disabled={loading || progress < 90}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            <span>Posting Job...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-rocket"></i>
                                            <span>Post Job Now</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </Container>

            <style jsx>{`
                .add-job-page {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 2rem 0;
                }

                .job-posting-header {
                    position: relative;
                    margin-bottom: 3rem;
                }

                .header-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }

                .header-pattern {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: 
                        radial-gradient(circle at 20% 50%, rgba(120,119,198,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(255,119,198,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 40% 80%, rgba(120,200,255,0.1) 0%, transparent 50%);
                    border-radius: 20px;
                }

                .header-content {
                    position: relative;
                    z-index: 2;
                    padding: 3rem 2rem;
                }

                .header-icon {
                    position: relative;
                    display: inline-block;
                    margin-bottom: 1.5rem;
                }

                .icon-circle {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 2rem;
                    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
                    animation: iconFloat 3s ease-in-out infinite;
                }

                .icon-pulse {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    opacity: 0.3;
                    animation: pulse 2s infinite;
                }

                @keyframes iconFloat {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.2); opacity: 0.1; }
                    100% { transform: scale(1.4); opacity: 0; }
                }

                .header-title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 1rem;
                }

                .header-subtitle {
                    font-size: 1.2rem;
                    color: #6b7280;
                    font-weight: 400;
                    max-width: 600px;
                    margin: 0 auto 2rem;
                }

                .progress-section {
                    max-width: 400px;
                    margin: 0 auto 2rem;
                }

                .progress-label {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.9rem;
                    color: #6b7280;
                    font-weight: 500;
                }

                .progress-percentage {
                    color: #667eea;
                    font-weight: 600;
                }

                .custom-progress {
                    height: 8px;
                    border-radius: 10px;
                    background-color: rgba(255,255,255,0.3);
                    overflow: hidden;
                }

                .custom-progress .progress-bar {
                    border-radius: 10px;
                    transition: all 0.3s ease;
                }

                .header-stats {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                    flex-wrap: wrap;
                    margin-top: 2rem;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .stat-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #667eea;
                    font-size: 1.1rem;
                }

                .stat-content {
                    display: flex;
                    flex-direction: column;
                }

                .stat-number {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1f2937;
                    line-height: 1;
                }

                .stat-label {
                    font-size: 0.8rem;
                    color: #6b7280;
                    font-weight: 500;
                }

                .stat-divider {
                    width: 1px;
                    height: 40px;
                    background: rgba(0,0,0,0.1);
                    margin: 0 1rem;
                }

                .notification-alert {
                    border: none;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    backdrop-filter: blur(10px);
                }

                .alert-content {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .alert-icon {
                    font-size: 1.1rem;
                }

                .job-form-container {
                    max-width: 900px;
                    margin: 0 auto;
                }

                .form-section-card {
                    border: none;
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    backdrop-filter: blur(10px);
                    background: rgba(255,255,255,0.95);
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .form-section-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .section-icon-wrapper {
                    position: relative;
                }

                .section-icon {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.2rem;
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
                }

                .section-content h3 {
                    color: #1f2937;
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 0 0 0.5rem 0;
                }

                .section-description {
                    color: #6b7280;
                    font-size: 0.95rem;
                    margin: 0;
                }

                .form-group-enhanced {
                    margin-bottom: 1.5rem;
                }

                .form-label-enhanced {
                    color: #374151;
                    font-weight: 600;
                    font-size: 0.95rem;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .required-indicator {
                    color: #ef4444;
                    font-weight: 700;
                }

                .optional-indicator {
                    color: #64748b;
                    font-weight: 400;
                    font-size: 0.85rem;
                }

                .input-wrapper, .select-wrapper {
                    position: relative;
                }

                .form-control-enhanced, .form-select-enhanced {
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 0.75rem 1rem;
                    padding-left: 3rem;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    background: #ffffff;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }

                .form-control-enhanced:focus, .form-select-enhanced:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    outline: none;
                }

                .form-control-enhanced.success, .form-select-enhanced.success {
                    border-color: #10b981;
                    background-color: rgba(16, 185, 129, 0.05);
                }

                .form-control-enhanced.error, .form-select-enhanced.error {
                    border-color: #ef4444;
                    background-color: rgba(239, 68, 68, 0.05);
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                    font-size: 0.9rem;
                    z-index: 2;
                }

                .form-help {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                    font-size: 0.85rem;
                    color: #6b7280;
                }

                .form-help.success {
                    color: #059669;
                }

                .form-help i {
                    font-size: 0.8rem;
                }

                .error-message {
                    color: #ef4444;
                    font-size: 0.85rem;
                    margin-top: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .error-message::before {
                    content: "⚠️";
                    font-size: 0.8rem;
                }

                .editor-wrapper {
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    background: #ffffff;
                }

                .editor-wrapper:focus-within {
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .editor-enhanced.success .editor-wrapper {
                    border-color: #10b981;
                }

                .editor-enhanced.error .editor-wrapper {
                    border-color: #ef4444;
                }

                .action-footer-card {
                    border: none;
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    backdrop-filter: blur(10px);
                    background: rgba(255,255,255,0.95);
                    position: sticky;
                    bottom: 2rem;
                    z-index: 10;
                }

                .action-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 2rem;
                    flex-wrap: wrap;
                }

                .footer-left, .footer-right {
                    flex: 0 0 auto;
                }

                .footer-center {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                }

                .btn-back-enhanced {
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 0.75rem 1.5rem;
                    font-weight: 600;
                    background: #ffffff;
                    color: #374151;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }

                .btn-back-enhanced:hover {
                    border-color: #9ca3af;
                    background: #f9fafb;
                    transform: translateY(-1px);
                }

                .reach-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    border: 1px solid rgba(102, 126, 234, 0.2);
                }

                .reach-icon {
                    color: #667eea;
                    font-size: 1.1rem;
                }

                .reach-content {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.9rem;
                }

                .reach-text {
                    color: #6b7280;
                }

                .reach-number {
                    color: #667eea;
                    font-weight: 700;
                    font-size: 1rem;
                }

                .btn-post-enhanced {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 12px;
                    padding: 0.75rem 2rem;
                    font-weight: 600;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
                }

                .btn-post-enhanced:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
                    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
                }

                .btn-post-enhanced:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
                }

                @media (max-width: 768px) {
                    .header-title {
                        font-size: 2rem;
                    }
                    
                    .header-stats {
                        gap: 1rem;
                    }
                    
                    .stat-divider {
                        display: none;
                    }
                    
                    .action-footer {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    
                    .footer-center {
                        order: -1;
                    }
                }
            `}</style>
        </div>
    );
};

export default AddJobPage;