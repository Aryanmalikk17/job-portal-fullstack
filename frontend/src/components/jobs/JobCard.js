import React, { useState } from 'react';
import { Card, Badge, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import JobApplicationModal from './JobApplicationModal';

const JobCard = ({ 
    job, 
    onSave, 
    onApply, 
    showActions = true,
    className = "" 
}) => {
    const { isAuthenticated, user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    
    // Use the accurate status from the enhanced API response
    const [applicationStatus, setApplicationStatus] = useState(job.hasApplied || false);
    const [savedStatus, setSavedStatus] = useState(job.isSaved || false);

    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuthenticated) {
            alert('Please log in to save jobs');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(job.jobPostId, job.isSaved);
        } finally {
            setIsSaving(false);
        }
    };

    const handleApply = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuthenticated) {
            alert('Please log in to apply for jobs');
            return;
        }

        // Open the application modal instead of direct API call
        setShowApplicationModal(true);
    };

    const handleApplicationSuccess = (jobId, response) => {
        // Update local state to show "Applied" status
        setApplicationStatus(true);
        
        // Call parent component's onApply if provided (for dashboard state updates)
        if (onApply) {
            onApply(jobId);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    const truncateText = (text, maxLength = 150) => {
        if (!text) return '';
        
        // Strip HTML tags for plain text preview
        const strippedText = text.replace(/<[^>]*>/g, '');
        return strippedText.length > maxLength ? strippedText.substring(0, maxLength) + '...' : strippedText;
    };

    const truncateHtml = (html, maxLength = 150) => {
        if (!html) return '';
        
        // Strip HTML tags to get plain text for length calculation
        const textContent = html.replace(/<[^>]*>/g, '');
        
        if (textContent.length <= maxLength) {
            return html; // Return full HTML if under limit
        }
        
        // If too long, return truncated plain text
        return textContent.substring(0, maxLength) + '...';
    };

    return (
        <>
            <Card className={`modern-job-card h-100 ${className}`}>
                <Card.Body className="d-flex flex-column">
                    {/* Header Section */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="flex-grow-1">
                            <Card.Title className="job-title mb-1">
                                <Link 
                                    to={`/jobs/${job.jobPostId}`} 
                                    className="text-decoration-none text-dark"
                                >
                                    {job.jobTitle}
                                </Link>
                            </Card.Title>
                            
                            <Card.Subtitle className="company-name text-muted mb-2">
                                <i className="fa fa-building me-1"></i>
                                {job.companyName || `${job.postedBy?.firstName} ${job.postedBy?.lastName}`}
                            </Card.Subtitle>
                        </div>
                        
                        {/* Save Button */}
                        {showActions && isAuthenticated && user?.userType === 'Job Seeker' && (
                            <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`job-save-btn ${job.isSaved ? 'saved' : ''}`}
                                title={job.isSaved ? 'Remove from saved' : 'Save job'}
                            >
                                {isSaving ? (
                                    <Spinner as="span" animation="border" size="sm" />
                                ) : (
                                    <>
                                        <i className={`fa ${job.isSaved ? 'fa-heart' : 'fa-heart-o'} me-1`}></i>
                                        {job.isSaved ? 'Saved' : 'Save'}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Job Meta Information */}
                    <div className="job-meta mb-3">
                        <div className="d-flex flex-wrap gap-2 mb-2">
                            {job.jobType && (
                                <Badge bg="primary" className="job-type-badge">
                                    <i className="fa fa-briefcase me-1"></i>
                                    {job.jobType}
                                </Badge>
                            )}
                            
                            {job.remote && (
                                <Badge bg="info" className="remote-badge">
                                    <i className="fa fa-wifi me-1"></i>
                                    {job.remote}
                                </Badge>
                            )}
                            
                            {job.salary && (
                                <Badge bg="success" className="salary-badge">
                                    <i className="fa fa-dollar-sign me-1"></i>
                                    {job.salary}
                                </Badge>
                            )}
                        </div>
                        
                        <small className="text-muted d-flex align-items-center">
                            <i className="fa fa-calendar me-1"></i>
                            Posted {formatDate(job.postedDate)}
                        </small>
                    </div>

                    {/* Job Description */}
                    <Card.Text className="job-description text-muted mb-3 flex-grow-1">
                        {truncateText(job.descriptionOfJob)}
                    </Card.Text>

                    {/* Location */}
                    {job.jobLocation && (
                        <div className="job-location mb-3">
                            <small className="text-muted">
                                <i className="fa fa-map-marker-alt me-1"></i>
                                {job.jobLocation}
                            </small>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {showActions && (
                        <div className="d-flex justify-content-between align-items-center mt-auto">
                            <Button 
                                as={Link} 
                                to={`/jobs/${job.jobPostId}`}
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                            >
                                <i className="fa fa-eye me-1"></i>
                                View Details
                            </Button>
                            
                            {isAuthenticated && user?.userType === 'Job Seeker' && (
                                !applicationStatus ? (
                                    <Button 
                                        variant="primary" 
                                        size="sm"
                                        onClick={handleApply}
                                    >
                                        <i className="fa fa-paper-plane me-1"></i>
                                        Apply Now
                                    </Button>
                                ) : (
                                    <Badge bg="success" className="applied-badge">
                                        <i className="fa fa-check me-1"></i>
                                        Applied
                                    </Badge>
                                )
                            )}
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Job Application Modal */}
            <JobApplicationModal
                show={showApplicationModal}
                onHide={() => setShowApplicationModal(false)}
                job={job}
                onApplicationSuccess={handleApplicationSuccess}
            />
        </>
    );
};

export default JobCard;