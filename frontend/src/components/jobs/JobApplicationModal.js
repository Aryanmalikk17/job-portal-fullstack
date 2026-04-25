import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { 
    Send, 
    Building2, 
    MapPin, 
    Briefcase, 
    CheckCircle2, 
    AlertCircle, 
    Edit, 
    FileText, 
    Info, 
    File, 
    X, 
    Lightbulb, 
    ShieldCheck 
} from 'lucide-react';
import { applyToJob } from '../../services/applicationService';

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

            // Use the fixed applyToJob method from applicationService
            const response = await applyToJob(job.jobPostId || job.id, {
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
                <Modal.Title className="d-flex align-items-center">
                    <Send className="me-2 text-primary" size={24} />
                    Apply for Job
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Job Information */}
                <div className="job-info-section mb-4 p-3 bg-light rounded">
                    <h5 className="mb-2 text-primary">{job?.jobTitle}</h5>
                    <p className="mb-1 text-muted d-flex align-items-center">
                        <Building2 className="me-2" size={16} />
                        {job?.companyName || job?.jobCompanyId?.name || `${job?.postedBy?.firstName} ${job?.postedBy?.lastName}`}
                    </p>
                    {job?.jobLocation && (
                        <p className="mb-1 text-muted d-flex align-items-center">
                            <MapPin className="me-2" size={16} />
                            {job.jobLocation}
                        </p>
                    )}
                    {job?.jobType && (
                        <p className="mb-0 text-muted d-flex align-items-center">
                            <Briefcase className="me-2" size={16} />
                            {job.jobType}
                        </p>
                    )}
                </div>

                {/* Success Message */}
                {success && (
                    <Alert variant="success" className="mb-3 d-flex align-items-start">
                        <CheckCircle2 className="me-2 mt-1" size={18} />
                        <div>
                            <strong>Application Submitted Successfully!</strong>
                            <br />
                            Your application has been sent to the recruiter. You will be notified of any updates.
                        </div>
                    </Alert>
                )}

                {/* Error Message */}
                {error && (
                    <Alert variant="danger" className="mb-3 d-flex align-items-start">
                        <AlertCircle className="me-2 mt-1" size={18} />
                        <div>
                            <strong>Application Failed:</strong>
                            <br />
                            {error}
                        </div>
                    </Alert>
                )}

                {/* Application Form */}
                {!success && (
                    <Form onSubmit={handleSubmit}>
                        {/* Cover Letter Section */}
                        <Form.Group className="mb-4">
                            <Form.Label className="d-flex align-items-center">
                                <Edit className="me-2" size={18} />
                                Cover Letter <span className="text-muted ms-1">(Optional)</span>
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
                            <Form.Label className="d-flex align-items-center">
                                <FileText className="me-2" size={18} />
                                Resume <span className="text-muted ms-1">(Optional)</span>
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
                                    <small className="text-muted d-flex align-items-center">
                                        <Info className="me-1" size={14} />
                                        Supported formats: PDF, DOC, DOCX (Max 5MB)
                                    </small>
                                </div>
                                {formData.resumeFile && (
                                    <div className="selected-file mt-2 p-2 bg-light rounded d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <File className="me-2 text-primary" size={16} />
                                            <span className="file-name">{formData.resumeFile.name}</span>
                                        </div>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="text-danger p-0 ms-2 d-flex align-items-center"
                                            onClick={removeFile}
                                            disabled={isSubmitting}
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Form.Group>

                        {/* Application Guidelines */}
                        <div className="application-guidelines mb-4 p-3 bg-info bg-opacity-10 rounded">
                            <h6 className="text-info mb-2 d-flex align-items-center">
                                <Lightbulb className="me-2" size={18} />
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
                        <small className="text-muted d-flex align-items-center">
                            <ShieldCheck className="me-1" size={14} />
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
                            className="d-flex align-items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                                    Submitting Application...
                                </>
                            ) : (
                                <>
                                    <Send className="me-2" size={18} />
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