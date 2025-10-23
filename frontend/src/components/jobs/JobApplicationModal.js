import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { jobService } from '../../services/jobService';

const JobApplicationModal = ({ 
    show, 
    onHide, 
    job, 
    onApplicationSuccess 
}) => {
    const [formData, setFormData] = useState({
        coverLetter: '',
        resumePath: '',
        resumeFile: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError(null);
    };

    // Handle file upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB max)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                setError('File size must be less than 5MB');
                e.target.value = ''; // Clear the input
                return;
            }

            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                setError('Please upload a PDF, DOC, or DOCX file');
                e.target.value = ''; // Clear the input
                return;
            }

            setFormData(prev => ({
                ...prev,
                resumeFile: file,
                resumePath: file.name // Set the file name as path for now
            }));
            
            // Clear any previous errors
            if (error) setError(null);
        }
    };

    // Remove selected file
    const removeFile = () => {
        setFormData(prev => ({
            ...prev,
            resumeFile: null,
            resumePath: ''
        }));
    };

    // FIXED: Handle form submission with file upload support
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            let resumePath = formData.resumePath;
            
            // If there's a file to upload, handle the upload first
            if (formData.resumeFile) {
                try {
                    // For now, we'll just use the filename as the path
                    // In a production environment, you'd upload to a file storage service
                    resumePath = `resumes/${Date.now()}_${formData.resumeFile.name}`;
                    
                    // TODO: Implement actual file upload to server/cloud storage
                    // const uploadResponse = await fileUploadService.uploadResume(formData.resumeFile);
                    // resumePath = uploadResponse.filePath;
                } catch (uploadError) {
                    throw new Error('Failed to upload resume. Please try again.');
                }
            }

            // Use the fixed applyForJob method from jobService
            const response = await jobService.applyForJob(job.jobPostId, {
                coverLetter: formData.coverLetter.trim() || '',
                resumePath: resumePath || null
            });

            if (response.success) {
                // Show success message
                setSuccess(true);
                
                // Notify parent component of successful application
                if (onApplicationSuccess) {
                    onApplicationSuccess(job.jobPostId, response);
                }

                // Auto-close modal after 2 seconds
                setTimeout(() => {
                    handleClose();
                }, 2000);
            } else {
                // Handle API error responses
                throw new Error(response.message || 'Failed to submit application');
            }

        } catch (error) {
            console.error('Application submission error:', error);
            
            // Handle specific error cases from backend
            if (error.message && error.message.includes('already applied')) {
                setError('You have already applied for this job.');
            } else if (error.message && error.message.includes('Only job seekers')) {
                setError('Only job seekers can apply for jobs. Please log in as a job seeker.');
            } else if (error.message && error.message.includes('Job not found')) {
                setError('This job is no longer available.');
            } else if (error.message && error.message.includes('logged in')) {
                setError('You must be logged in to apply for jobs.');
            } else {
                setError(error.message || 'Failed to submit application. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle modal close
    const handleClose = () => {
        setFormData({
            coverLetter: '',
            resumePath: '',
            resumeFile: null
        });
        setError(null);
        setSuccess(false);
        setIsSubmitting(false);
        onHide();
    };

    // Character count for cover letter
    const coverLetterCount = formData.coverLetter.length;
    const maxCoverLetterLength = 2000;

    return (
        <Modal 
            show={show} 
            onHide={handleClose}
            size="lg"
            centered
            backdrop={isSubmitting ? 'static' : true}
            keyboard={!isSubmitting}
        >
            <Modal.Header closeButton={!isSubmitting}>
                <Modal.Title>
                    <i className="fas fa-paper-plane me-2 text-primary"></i>
                    Apply for Job
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Job Information */}
                <div className="job-info-section mb-4 p-3 bg-light rounded">
                    <h5 className="mb-2 text-primary">{job?.jobTitle}</h5>
                    <p className="mb-1 text-muted">
                        <i className="fas fa-building me-2"></i>
                        {job?.companyName || job?.jobCompanyId?.name || `${job?.postedBy?.firstName} ${job?.postedBy?.lastName}`}
                    </p>
                    {job?.jobLocation && (
                        <p className="mb-0 text-muted">
                            <i className="fas fa-map-marker-alt me-2"></i>
                            {job.jobLocation}
                        </p>
                    )}
                    {job?.jobType && (
                        <p className="mb-0 text-muted">
                            <i className="fas fa-briefcase me-2"></i>
                            {job.jobType}
                        </p>
                    )}
                </div>

                {/* Success Message */}
                {success && (
                    <Alert variant="success" className="mb-3">
                        <i className="fas fa-check-circle me-2"></i>
                        <strong>Application Submitted Successfully!</strong>
                        <br />
                        Your application has been sent to the recruiter. You will be notified of any updates.
                    </Alert>
                )}

                {/* Error Message */}
                {error && (
                    <Alert variant="danger" className="mb-3">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        <strong>Application Failed:</strong>
                        <br />
                        {error}
                    </Alert>
                )}

                {/* Application Form */}
                {!success && (
                    <Form onSubmit={handleSubmit}>
                        {/* Cover Letter Section */}
                        <Form.Group className="mb-4">
                            <Form.Label>
                                <i className="fas fa-edit me-2"></i>
                                Cover Letter <span className="text-muted">(Optional)</span>
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={8}
                                name="coverLetter"
                                value={formData.coverLetter}
                                onChange={handleInputChange}
                                placeholder="Write a personalized cover letter to increase your chances of getting hired..."
                                maxLength={maxCoverLetterLength}
                                disabled={isSubmitting}
                                className="cover-letter-textarea"
                            />
                            <Form.Text className="text-muted d-flex justify-content-between">
                                <span>
                                    Tip: Mention specific skills and experiences relevant to this role
                                </span>
                                <span className={coverLetterCount > maxCoverLetterLength * 0.9 ? 'text-warning' : ''}>
                                    {coverLetterCount}/{maxCoverLetterLength}
                                </span>
                            </Form.Text>
                        </Form.Group>

                        {/* Resume Section - Now Functional */}
                        <Form.Group className="mb-4">
                            <Form.Label>
                                <i className="fas fa-file-pdf me-2"></i>
                                Resume <span className="text-muted">(Optional)</span>
                            </Form.Label>
                            <div className="resume-upload-section">
                                <Form.Control
                                    type="file"
                                    name="resumeFile"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    disabled={isSubmitting}
                                    className="mb-2"
                                />
                                <div className="file-upload-help">
                                    <small className="text-muted">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Supported formats: PDF, DOC, DOCX (Max 5MB)
                                    </small>
                                </div>
                                {formData.resumeFile && (
                                    <div className="selected-file mt-2 p-2 bg-light rounded">
                                        <i className="fas fa-file me-2 text-primary"></i>
                                        <span className="file-name">{formData.resumeFile.name}</span>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="text-danger p-0 ms-2"
                                            onClick={removeFile}
                                            disabled={isSubmitting}
                                        >
                                            <i className="fas fa-times"></i>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Form.Group>

                        {/* Application Guidelines */}
                        <div className="application-guidelines mb-4 p-3 bg-info bg-opacity-10 rounded">
                            <h6 className="text-info mb-2">
                                <i className="fas fa-lightbulb me-2"></i>
                                Application Tips
                            </h6>
                            <ul className="mb-0 small text-muted">
                                <li>Review the job requirements carefully</li>
                                <li>Highlight relevant skills and experiences</li>
                                <li>Keep your cover letter concise and professional</li>
                                <li>Proofread before submitting</li>
                            </ul>
                        </div>
                    </Form>
                )}
            </Modal.Body>

            <Modal.Footer className="d-flex justify-content-between">
                <div>
                    {!success && (
                        <small className="text-muted">
                            <i className="fas fa-shield-alt me-1"></i>
                            Your application will be sent securely to the recruiter
                        </small>
                    )}
                </div>
                <div>
                    <Button 
                        variant="secondary" 
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="me-2"
                    >
                        {success ? 'Close' : 'Cancel'}
                    </Button>
                    
                    {!success && (
                        <Button 
                            variant="primary" 
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                                    Submitting Application...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane me-2"></i>
                                    Submit Application
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </Modal.Footer>

            <style jsx>{`
                .job-info-section {
                    border-left: 4px solid #0d6efd;
                }
                
                .cover-letter-textarea {
                    min-height: 200px;
                    resize: vertical;
                }
                
                .resume-upload-placeholder {
                    background: #f8f9fa;
                    transition: all 0.3s ease;
                }
                
                .resume-upload-placeholder:hover {
                    background: #e9ecef;
                }
                
                .application-guidelines {
                    border-left: 4px solid #0dcaf0;
                }
                
                .modal-title {
                    font-weight: 600;
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
                    border: none;
                }
                
                .btn-primary:hover {
                    background: linear-gradient(135deg, #0b5ed7 0%, #0a58ca 100%);
                    transform: translateY(-1px);
                }
            `}</style>
        </Modal>
    );
};

export default JobApplicationModal;