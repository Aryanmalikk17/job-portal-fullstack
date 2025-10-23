import React, { useState } from 'react';
import { Card, Button, Badge, Dropdown, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './SavedJobCard.css';

const SavedJobCard = ({ job, onRemove, onApply, onSelect, isSelected }) => {
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);

    // FIXED: Handle undefined job object and provide defaults
    if (!job) {
        return null;
    }

    // Utility function to strip HTML tags and format text
    const stripHtmlTags = (html) => {
        if (!html) return 'No description available';
        
        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Get text content and clean it up
        let text = tempDiv.textContent || tempDiv.innerText || '';
        
        // Clean up extra whitespace and line breaks
        text = text.replace(/\s+/g, ' ').trim();
        
        return text || 'No description available';
    };

    // Utility function to render HTML content safely
    const renderHtmlContent = (html) => {
        if (!html) return 'No description available';
        
        // Simple HTML sanitization - you might want to use a library like DOMPurify for production
        const cleanHtml = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
            .replace(/on\w+="[^"]*"/gi, ''); // Remove event handlers
        
        return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
    };

    // FIXED: Map backend field names to frontend expectations
    const jobData = {
        id: job.jobPostId || job.id,
        title: job.jobTitle || 'Untitled Position',
        company: job.companyName || 'Company Not Specified',
        location: job.jobLocation || job.location || 'Location Not Specified',
        type: job.jobType || 'Not Specified',
        remote: job.remote,
        salary: job.salary,
        description: job.descriptionOfJob || 'No description available',
        skills: job.skills || [],
        savedAt: job.savedAt || job.postedDate || new Date(),
        isApplied: job.isApplied || job.applied || false,
        appliedAt: job.appliedAt,
        applicationDeadline: job.applicationDeadline,
        companyLogo: job.companyLogo
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const formatSavedDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Saved yesterday';
        if (diffDays < 7) return `Saved ${diffDays} days ago`;
        if (diffDays < 30) return `Saved ${Math.ceil(diffDays / 7)} weeks ago`;
        return `Saved on ${formatDate(dateString)}`;
    };

    const getDaysUntilDeadline = (deadline) => {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getDeadlineStatus = (deadline) => {
        const daysLeft = getDaysUntilDeadline(deadline);
        if (daysLeft < 0) return { status: 'expired', text: 'Expired', variant: 'danger' };
        if (daysLeft <= 3) return { status: 'urgent', text: `${daysLeft} days left`, variant: 'warning' };
        if (daysLeft <= 7) return { status: 'soon', text: `${daysLeft} days left`, variant: 'info' };
        return { status: 'normal', text: `${daysLeft} days left`, variant: 'secondary' };
    };

    const handleApply = async (jobData) => {
        setIsApplying(true);
        try {
            await onApply(jobData.id);
            setShowApplyModal(false);
        } catch (error) {
            console.error('Error applying to job:', error);
        } finally {
            setIsApplying(false);
        }
    };

    const handleRemove = async (jobData) => {
        setIsRemoving(true);
        try {
            await onRemove(jobData.id);
            setShowRemoveModal(false);
        } catch (error) {
            console.error('Error removing job:', error);
        } finally {
            setIsRemoving(false);
        }
    };

    const deadlineInfo = jobData.applicationDeadline ? getDeadlineStatus(jobData.applicationDeadline) : null;

    // Get clean description text for preview
    const cleanDescription = stripHtmlTags(jobData.description);
    const shortDescription = cleanDescription.length > 200 ? 
        `${cleanDescription.slice(0, 200)}...` : 
        cleanDescription;

    return (
        <>
            <Card className={`saved-job-card ${isSelected ? 'selected' : ''} ${jobData.isApplied ? 'applied' : ''}`}>
                <Card.Body>
                    <div className="saved-job-content">
                        {/* Selection Checkbox */}
                        <div className="job-selection">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                checked={isSelected}
                                onChange={(e) => onSelect(jobData.id, e.target.checked)}
                            />
                        </div>

                        {/* Company Logo */}
                        <div className="company-logo-section">
                            {jobData.companyLogo ? (
                                <img 
                                    src={jobData.companyLogo} 
                                    alt={`${jobData.company} logo`}
                                    className="company-logo"
                                />
                            ) : (
                                <div className="company-logo-placeholder">
                                    {jobData.company.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Job Information */}
                        <div className="job-info">
                            <div className="job-header">
                                <h5 className="job-title">
                                    <Link to={`/jobs/${jobData.id}`} className="job-title-link">
                                        {jobData.title}
                                    </Link>
                                    {jobData.isApplied && (
                                        <Badge bg="success" className="ms-2 applied-badge">
                                            <i className="fas fa-check me-1"></i>
                                            Applied
                                        </Badge>
                                    )}
                                </h5>
                                <p className="company-name">
                                    <i className="fas fa-building me-2"></i>
                                    {jobData.company}
                                </p>
                            </div>

                            <div className="job-meta">
                                <span className="job-location">
                                    <i className="fas fa-map-marker-alt me-1"></i>
                                    {jobData.location}
                                </span>
                                <span className="job-type">
                                    <i className="fas fa-briefcase me-1"></i>
                                    {jobData.type}
                                </span>
                                {jobData.remote && jobData.remote !== 'Office-Only' && (
                                    <Badge bg="info" className="remote-badge">
                                        <i className="fas fa-home me-1"></i>
                                        {jobData.remote}
                                    </Badge>
                                )}
                                {jobData.salary && (
                                    <span className="job-salary">
                                        <i className="fas fa-dollar-sign me-1"></i>
                                        {jobData.salary}
                                    </span>
                                )}
                            </div>

                            <div className="job-description">
                                <div className="job-description-content">
                                    {showFullDescription ? (
                                        <>
                                            {renderHtmlContent(jobData.description)}
                                            <span 
                                                className="description-show-more ms-2"
                                                onClick={() => setShowFullDescription(false)}
                                            >
                                                Show Less
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <p>{shortDescription}</p>
                                            {cleanDescription.length > 200 && (
                                                <span 
                                                    className="description-show-more"
                                                    onClick={() => setShowFullDescription(true)}
                                                >
                                                    Show More
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {jobData.skills && jobData.skills.length > 0 && (
                                <div className="job-skills">
                                    {jobData.skills.slice(0, 4).map((skill, index) => (
                                        <Badge key={index} bg="light" text="dark" className="skill-badge">
                                            {skill}
                                        </Badge>
                                    ))}
                                    {jobData.skills.length > 4 && (
                                        <Badge bg="secondary" className="skill-badge">
                                            +{jobData.skills.length - 4} more
                                        </Badge>
                                    )}
                                </div>
                            )}

                            <div className="job-dates">
                                <small className="text-muted saved-date">
                                    <i className="fas fa-heart me-1"></i>
                                    {formatSavedDate(jobData.savedAt)}
                                </small>
                                {jobData.isApplied && jobData.appliedAt && (
                                    <small className="text-success applied-date">
                                        <i className="fas fa-check-circle me-1"></i>
                                        Applied on {formatDate(jobData.appliedAt)}
                                    </small>
                                )}
                                {deadlineInfo && (
                                    <small className={`deadline-info text-${deadlineInfo.variant}`}>
                                        <i className="fas fa-clock me-1"></i>
                                        {deadlineInfo.text}
                                    </small>
                                )}
                            </div>
                        </div>

                        {/* Job Actions */}
                        <div className="job-actions">
                            <div className="primary-actions">
                                {!jobData.isApplied ? (
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => setShowApplyModal(true)}
                                        className="apply-btn"
                                        disabled={deadlineInfo?.status === 'expired'}
                                    >
                                        <i className="fas fa-paper-plane me-1"></i>
                                        Apply Now
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        disabled
                                        className="applied-btn"
                                    >
                                        <i className="fas fa-check me-1"></i>
                                        Applied
                                    </Button>
                                )}
                                
                                <Button
                                    as={Link}
                                    to={`/jobs/${jobData.id}`}
                                    variant="outline-primary"
                                    size="sm"
                                    className="view-btn"
                                >
                                    <i className="fas fa-eye me-1"></i>
                                    View Details
                                </Button>
                            </div>

                            <Dropdown className="job-options-dropdown">
                                <Dropdown.Toggle 
                                    variant="outline-secondary" 
                                    size="sm" 
                                    className="options-btn"
                                    id={`dropdown-${jobData.id}`}
                                >
                                    <i className="fas fa-ellipsis-v"></i>
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item 
                                        onClick={() => setShowRemoveModal(true)}
                                        className="text-danger"
                                    >
                                        <i className="fas fa-heart-broken me-2"></i>
                                        Remove from Saved
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item 
                                        as={Link} 
                                        to={`/jobs/${jobData.id}`}
                                        target="_blank"
                                    >
                                        <i className="fas fa-external-link-alt me-2"></i>
                                        Open in New Tab
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Apply Confirmation Modal */}
            <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Apply to Job</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-3">
                        <i className="fas fa-paper-plane fa-3x text-success mb-3"></i>
                        <h5>Apply to {jobData.title}?</h5>
                        <p className="text-muted">
                            You're about to apply to <strong>{jobData.title}</strong> at <strong>{jobData.company}</strong>.
                        </p>
                        {deadlineInfo && deadlineInfo.status !== 'expired' && (
                            <div className={`alert alert-${deadlineInfo.variant}`}>
                                <i className="fas fa-clock me-2"></i>
                                Application deadline: {deadlineInfo.text}
                            </div>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowApplyModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="success" 
                        onClick={() => handleApply(jobData)}
                        disabled={isApplying}
                    >
                        {isApplying ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Applying...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-paper-plane me-2"></i>
                                Apply Now
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Remove Confirmation Modal */}
            <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Remove Saved Job</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-3">
                        <i className="fas fa-heart-broken fa-3x text-danger mb-3"></i>
                        <h5>Remove {jobData.title}?</h5>
                        <p className="text-muted">
                            Are you sure you want to remove <strong>{jobData.title}</strong> at <strong>{jobData.company}</strong> from your saved jobs?
                        </p>
                        <div className="alert alert-warning">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            This action cannot be undone.
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={() => handleRemove(jobData)}
                        disabled={isRemoving}
                    >
                        {isRemoving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Removing...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-heart-broken me-2"></i>
                                Remove Job
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SavedJobCard;