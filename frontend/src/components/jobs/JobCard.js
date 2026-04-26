import React, { useState } from 'react';
import { Card, Badge, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
    Building2, 
    Heart, 
    Briefcase, 
    Wifi, 
    DollarSign, 
    Calendar, 
    MapPin, 
    Eye, 
    Send, 
    Check 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import JobApplicationModal from './JobApplicationModal';
import { formatRelativeTime } from '../../utils/dateUtils';

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



    const truncateText = (text, maxLength = 150) => {
        if (!text) return '';
        
        // Strip HTML tags for plain text preview
        const strippedText = text.replace(/<[^>]*>/g, '');
        return strippedText.length > maxLength ? strippedText.substring(0, maxLength) + '...' : strippedText;
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
                            
                            <Card.Subtitle className="company-name text-muted mb-2 d-flex align-items-center">
                                <Building2 className="me-1" size={16} />
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
                                        <Heart 
                                            className="me-1" 
                                            size={16} 
                                            fill={job.isSaved ? "currentColor" : "none"} 
                                            color={job.isSaved ? "red" : "currentColor"}
                                        />
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
                                <Badge bg="primary" className="job-type-badge d-flex align-items-center">
                                    <Briefcase className="me-1" size={14} />
                                    {job.jobType}
                                </Badge>
                            )}
                            
                            {job.remote && (
                                <Badge bg="info" className="remote-badge d-flex align-items-center">
                                    <Wifi className="me-1" size={14} />
                                    {job.remote}
                                </Badge>
                            )}
                            
                            {job.salary && (
                                <Badge bg="success" className="salary-badge d-flex align-items-center">
                                    <DollarSign className="me-1" size={14} />
                                    {job.salary}
                                </Badge>
                            )}
                        </div>
                        
                        <small className="text-muted d-flex align-items-center">
                            <Calendar className="me-1" size={14} />
                            Posted {formatRelativeTime(job.postedDate)}
                        </small>
                    </div>

                    {/* Job Description */}
                    <Card.Text className="job-description text-muted mb-3 flex-grow-1">
                        {truncateText(job.descriptionOfJob)}
                    </Card.Text>

                    {/* Location */}
                    {job.jobLocation && (
                        <div className="job-location mb-3">
                            <small className="text-muted d-flex align-items-center">
                                <MapPin className="me-1" size={14} />
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
                                className="me-2 d-flex align-items-center"
                            >
                                <Eye className="me-1" size={16} />
                                View Details
                            </Button>
                            
                            {isAuthenticated && user?.userType === 'Job Seeker' && (
                                !applicationStatus ? (
                                    <Button 
                                        variant="primary" 
                                        size="sm"
                                        onClick={handleApply}
                                        className="d-flex align-items-center"
                                    >
                                        <Send className="me-1" size={16} />
                                        Apply Now
                                    </Button>
                                ) : (
                                    <Badge bg="success" className="applied-badge d-flex align-items-center">
                                        <Check className="me-1" size={16} />
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