import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { 
    Edit, 
    AlertCircle, 
    ListChecks, 
    Circle, 
    CheckCircle2, 
    StickyNote, 
    Info, 
    Clock, 
    Save 
} from 'lucide-react';

const StatusUpdateModal = ({ 
    show, 
    onHide, 
    application, 
    onStatusUpdate 
}) => {
    const [formData, setFormData] = useState({
        status: '',
        recruiterNotes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Available status options based on current status
    const getAvailableStatuses = (currentStatus) => {
        const statusFlow = {
            'APPLIED': [
                { value: 'UNDER_REVIEW', label: 'Under Review', variant: 'info', description: 'Move to review stage' },
                { value: 'INTERVIEW_SCHEDULED', label: 'Schedule Interview', variant: 'warning', description: 'Schedule an interview with the candidate' },
                { value: 'REJECTED', label: 'Reject', variant: 'danger', description: 'Reject this application' }
            ],
            'UNDER_REVIEW': [
                { value: 'INTERVIEW_SCHEDULED', label: 'Schedule Interview', variant: 'warning', description: 'Schedule an interview with the candidate' },
                { value: 'REJECTED', label: 'Reject', variant: 'danger', description: 'Reject this application' }
            ],
            'INTERVIEW_SCHEDULED': [
                { value: 'INTERVIEWED', label: 'Mark as Interviewed', variant: 'secondary', description: 'Interview has been completed' },
                { value: 'REJECTED', label: 'Reject', variant: 'danger', description: 'Reject this application' }
            ],
            'INTERVIEWED': [
                { value: 'OFFERED', label: 'Make Offer', variant: 'success', description: 'Extend a job offer to the candidate' },
                { value: 'REJECTED', label: 'Reject', variant: 'danger', description: 'Reject this application' }
            ],
            'OFFERED': [
                { value: 'HIRED', label: 'Mark as Hired', variant: 'success', description: 'Candidate has accepted the offer' },
                { value: 'REJECTED', label: 'Reject', variant: 'danger', description: 'Candidate declined or offer withdrawn' }
            ],
            'HIRED': [],
            'REJECTED': [],
            'WITHDRAWN': []
        };
        
        return statusFlow[currentStatus] || [];
    };

    // Initialize form data when application changes
    useEffect(() => {
        if (application) {
            setFormData({
                status: application.status || '',
                recruiterNotes: application.recruiterNotes || ''
            });
            setError(null);
        }
    }, [application]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user makes changes
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.status) {
            setError('Please select a status');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Call the parent component's status update handler with backend API format
            await onStatusUpdate(application.id, formData.status, formData.recruiterNotes.trim() || null);
        } catch (error) {
            console.error('Status update error:', error);
            setError('Failed to update application status: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            status: application?.status || '',
            recruiterNotes: application?.recruiterNotes || ''
        });
        setError(null);
        setIsSubmitting(false);
        onHide();
    };

    if (!application) return null;

    const availableStatuses = getAvailableStatuses(application.status);

    return (
        <Modal 
            show={show} 
            onHide={handleClose}
            size="md"
            centered
            backdrop={isSubmitting ? 'static' : true}
            keyboard={!isSubmitting}
        >
            <Modal.Header closeButton={!isSubmitting}>
                <Modal.Title className="d-flex align-items-center">
                    <Edit className="me-2 text-primary" size={24} />
                    Update Application Status
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Current Application Info */}
                <div className="current-application-info mb-4 p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="mb-1 text-primary">{application.applicantName}</h6>
                            <p className="mb-0 text-muted small">{application.jobTitle}</p>
                        </div>
                        <Badge 
                            bg={application.status === 'APPLIED' ? 'primary' : 
                               application.status === 'UNDER_REVIEW' ? 'info' :
                               application.status === 'INTERVIEW_SCHEDULED' ? 'warning' :
                               application.status === 'INTERVIEWED' ? 'secondary' :
                               application.status === 'OFFERED' ? 'success' :
                               application.status === 'HIRED' ? 'success' : 'danger'}
                            className="text-uppercase"
                        >
                            Current: {application.status?.replace(/_/g, ' ')}
                        </Badge>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <Alert variant="danger" className="mb-3 d-flex align-items-center">
                        <AlertCircle className="me-2" size={18} />
                        {error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    {/* Status Selection */}
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold d-flex align-items-center">
                            <ListChecks className="me-2" size={18} />
                            New Status
                        </Form.Label>
                        
                        {availableStatuses.length > 0 ? (
                            <div className="status-options">
                                {availableStatuses.map((statusOption) => (
                                    <div key={statusOption.value} className="status-option mb-2">
                                        <Form.Check
                                            type="radio"
                                            id={`status-${statusOption.value}`}
                                            name="status"
                                            value={statusOption.value}
                                            checked={formData.status === statusOption.value}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                            className="d-none"
                                        />
                                        <Form.Label 
                                            htmlFor={`status-${statusOption.value}`}
                                            className={`status-option-card w-100 p-3 border rounded cursor-pointer d-flex justify-content-between align-items-center ${
                                                formData.status === statusOption.value ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
                                            }`}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center">
                                                    <Badge bg={statusOption.variant} className="me-2">
                                                        {statusOption.label}
                                                    </Badge>
                                                </div>
                                                <small className="text-muted">{statusOption.description}</small>
                                            </div>
                                            <div>
                                                <Circle 
                                                    size={16} 
                                                    className={formData.status === statusOption.value ? 'text-primary fill-primary' : 'text-muted'} 
                                                />
                                            </div>
                                        </Form.Label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <CheckCircle2 className="text-success mb-2" size={48} />
                                <p className="text-muted mb-0">
                                    No status changes available. This application is in its final state.
                                </p>
                            </div>
                        )}
                    </Form.Group>

                    {/* Recruiter Notes */}
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold d-flex align-items-center">
                            <StickyNote className="me-2" size={18} />
                            Add Notes <span className="text-muted fw-normal ms-1">(Optional)</span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            name="recruiterNotes"
                            value={formData.recruiterNotes}
                            onChange={handleInputChange}
                            placeholder="Add internal notes about this candidate or decision..."
                            disabled={isSubmitting}
                            maxLength={1000}
                        />
                        <Form.Text className="text-muted d-flex justify-content-between">
                            <span>These notes are private and will not be visible to the candidate</span>
                            <span>{formData.recruiterNotes.length}/1000</span>
                        </Form.Text>
                    </Form.Group>

                    {/* Action Preview */}
                    {formData.status && formData.status !== application.status && (
                        <div className="action-preview mb-3 p-3 bg-info bg-opacity-10 rounded border-start border-4 border-info">
                            <h6 className="text-info mb-2 d-flex align-items-center">
                                <span className="me-2 d-flex align-items-center">
                                    <Info size={18} />
                                </span>
                                Action Summary
                            </h6>
                            <p className="mb-1 small">
                                <strong>Status Change:</strong> {application.status?.replace(/_/g, ' ')} → {formData.status?.replace(/_/g, ' ')}
                            </p>
                            {formData.recruiterNotes && (
                                <p className="mb-0 small">
                                    <strong>Notes:</strong> {formData.recruiterNotes.length > 50 ? 'Added' : formData.recruiterNotes}
                                </p>
                            )}
                        </div>
                    )}
                </Form>
            </Modal.Body>

            <Modal.Footer className="d-flex justify-content-between">
                <div>
                    <small className="text-muted d-flex align-items-center">
                        <Clock className="me-1" size={14} />
                        Changes will be saved immediately
                    </small>
                </div>
                <div className="d-flex">
                    <Button 
                        variant="secondary" 
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="me-2"
                    >
                        Cancel
                    </Button>
                    
                    {availableStatuses.length > 0 && (
                        <Button 
                            variant="primary" 
                            className="d-flex align-items-center"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !formData.status || formData.status === application.status}
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="me-2" size={18} />
                                    Update Status
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </Modal.Footer>

            <style jsx>{`
                .status-option-card {
                    transition: all 0.3s ease;
                    margin: 0;
                }
                
                .status-option-card:hover {
                    border-color: #0d6efd !important;
                    background-color: rgba(13, 110, 253, 0.05) !important;
                }
                
                .cursor-pointer {
                    cursor: pointer;
                }
                
                .action-preview {
                    border-left-width: 4px !important;
                }

                .fill-primary {
                    fill: currentColor;
                }
            `}</style>
        </Modal>
    );
};

export default StatusUpdateModal;