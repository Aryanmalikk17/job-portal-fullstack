import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner, Form, Modal, Table, Tab, Tabs } from 'react-bootstrap';
import { jobService } from '../../services/jobService';

const RecruiterApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [recruiterNotes, setRecruiterNotes] = useState('');
    const [updating, setUpdating] = useState(false);
    const [statistics, setStatistics] = useState(null);
    const [activeTab, setActiveTab] = useState('applications');

    // Fetch applications and statistics on component mount
    useEffect(() => {
        fetchApplications();
        fetchStatistics();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await jobService.getRecruiterApplications();
            setApplications(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to fetch applications. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const stats = await jobService.getRecruiterStatistics();
            setStatistics(stats);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    // Filter applications by status
    const filteredApplications = applications.filter(app => {
        if (filterStatus === 'ALL') return true;
        return app.status === filterStatus;
    });

    // Get status badge variant
    const getStatusVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'primary';
            case 'REVIEWED': return 'info';
            case 'INTERVIEW': return 'warning';
            case 'ACCEPTED': return 'success';
            case 'REJECTED': return 'danger';
            case 'WITHDRAWN': return 'secondary';
            default: return 'secondary';
        }
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle status update
    const handleStatusUpdate = async () => {
        if (!selectedApplication || !newStatus) return;

        try {
            setUpdating(true);
            const response = await jobService.updateApplicationStatus(
                selectedApplication.id,
                newStatus,
                recruiterNotes
            );

            if (response.success) {
                // Update local state
                setApplications(prev => prev.map(app => 
                    app.id === selectedApplication.id 
                        ? { ...app, status: newStatus, recruiterNotes: recruiterNotes }
                        : app
                ));
                setShowStatusModal(false);
                setSelectedApplication(null);
                setNewStatus('');
                setRecruiterNotes('');
                
                // Refresh statistics
                fetchStatistics();
            } else {
                setError(response.message || 'Failed to update application status');
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            setError('Failed to update application status. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const openStatusModal = (application) => {
        setSelectedApplication(application);
        setNewStatus(application.status);
        setRecruiterNotes(application.recruiterNotes || '');
        setShowStatusModal(true);
    };

    // Statistics Card Component
    const StatisticsCard = ({ title, value, icon, color = 'primary' }) => (
        <Card className="h-100 text-center">
            <Card.Body>
                <div className={`text-${color} mb-2`}>
                    <i className={`${icon} fa-2x`}></i>
                </div>
                <h4 className="mb-1">{value}</h4>
                <p className="text-muted mb-0">{title}</p>
            </Card.Body>
        </Card>
    );

    return (
        <Container className="my-4">
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>
                            <i className="fas fa-users me-2 text-primary"></i>
                            Application Management
                        </h2>
                        <Button 
                            variant="outline-primary" 
                            onClick={() => {
                                fetchApplications();
                                fetchStatistics();
                            }}
                            disabled={loading}
                        >
                            <i className="fas fa-sync-alt me-2"></i>
                            Refresh
                        </Button>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {error}
                        </Alert>
                    )}

                    <Tabs
                        id="recruiter-tabs"
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-4"
                    >
                        {/* Statistics Tab */}
                        <Tab eventKey="statistics" title="Overview">
                            {statistics && (
                                <Row className="g-4">
                                    <Col md={3}>
                                        <StatisticsCard
                                            title="Total Applications"
                                            value={statistics.totalApplications || 0}
                                            icon="fas fa-file-alt"
                                            color="primary"
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <StatisticsCard
                                            title="Pending Review"
                                            value={statistics.pendingApplications || 0}
                                            icon="fas fa-clock"
                                            color="warning"
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <StatisticsCard
                                            title="Under Review"
                                            value={statistics.reviewedApplications || 0}
                                            icon="fas fa-eye"
                                            color="info"
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <StatisticsCard
                                            title="Interviews"
                                            value={statistics.interviewApplications || 0}
                                            icon="fas fa-handshake"
                                            color="success"
                                        />
                                    </Col>
                                </Row>
                            )}
                        </Tab>

                        {/* Applications Tab */}
                        <Tab eventKey="applications" title="All Applications">
                            {/* Filter Controls */}
                            <Card className="mb-4">
                                <Card.Body>
                                    <Row className="align-items-center">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Filter by Status:</Form.Label>
                                                <Form.Select 
                                                    value={filterStatus}
                                                    onChange={(e) => setFilterStatus(e.target.value)}
                                                >
                                                    <option value="ALL">All Applications</option>
                                                    <option value="PENDING">Pending</option>
                                                    <option value="REVIEWED">Under Review</option>
                                                    <option value="INTERVIEW">Interview</option>
                                                    <option value="ACCEPTED">Accepted</option>
                                                    <option value="REJECTED">Rejected</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} className="text-end">
                                            <div className="text-muted">
                                                Total Applications: <strong>{applications.length}</strong>
                                                {filterStatus !== 'ALL' && (
                                                    <span className="ms-2">
                                                        | Filtered: <strong>{filteredApplications.length}</strong>
                                                    </span>
                                                )}
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Loading State */}
                            {loading && (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2 text-muted">Loading applications...</p>
                                </div>
                            )}

                            {/* Applications Table */}
                            {!loading && (
                                <>
                                    {filteredApplications.length === 0 ? (
                                        <Card className="text-center py-5">
                                            <Card.Body>
                                                <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                                                <h5 className="text-muted">
                                                    {filterStatus === 'ALL' 
                                                        ? 'No Applications Yet' 
                                                        : `No ${filterStatus.toLowerCase()} applications`
                                                    }
                                                </h5>
                                                <p className="text-muted">
                                                    Applications will appear here when candidates apply to your jobs.
                                                </p>
                                            </Card.Body>
                                        </Card>
                                    ) : (
                                        <Card>
                                            <Card.Body className="p-0">
                                                <Table responsive hover className="mb-0">
                                                    <thead className="bg-light">
                                                        <tr>
                                                            <th>Candidate</th>
                                                            <th>Job Position</th>
                                                            <th>Applied Date</th>
                                                            <th>Status</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredApplications.map((application) => (
                                                            <tr key={application.id}>
                                                                <td>
                                                                    <div>
                                                                        <strong>
                                                                            {application.candidate?.firstName} {application.candidate?.lastName}
                                                                        </strong>
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            {application.candidate?.email}
                                                                        </small>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        <strong>{application.job?.jobTitle}</strong>
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            ID: {application.job?.id}
                                                                        </small>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <small>{formatDate(application.applyDate)}</small>
                                                                </td>
                                                                <td>
                                                                    <Badge bg={getStatusVariant(application.status)}>
                                                                        {application.status}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        onClick={() => openStatusModal(application)}
                                                                        className="me-2"
                                                                    >
                                                                        <i className="fas fa-edit me-1"></i>
                                                                        Update Status
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </Card.Body>
                                        </Card>
                                    )}
                                </>
                            )}
                        </Tab>
                    </Tabs>
                </Col>
            </Row>

            {/* Status Update Modal */}
            <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Update Application Status</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedApplication && (
                        <>
                            <div className="mb-3">
                                <h6>Application Details:</h6>
                                <p><strong>Candidate:</strong> {selectedApplication.candidate?.firstName} {selectedApplication.candidate?.lastName}</p>
                                <p><strong>Position:</strong> {selectedApplication.job?.jobTitle}</p>
                                <p><strong>Applied:</strong> {formatDate(selectedApplication.applyDate)}</p>
                            </div>

                            {selectedApplication.coverLetter && (
                                <div className="mb-3">
                                    <h6>Cover Letter:</h6>
                                    <div className="p-3 bg-light rounded">
                                        {selectedApplication.coverLetter}
                                    </div>
                                </div>
                            )}

                            <Form.Group className="mb-3">
                                <Form.Label>Status:</Form.Label>
                                <Form.Select 
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="REVIEWED">Under Review</option>
                                    <option value="INTERVIEW">Interview</option>
                                    <option value="ACCEPTED">Accepted</option>
                                    <option value="REJECTED">Rejected</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Recruiter Notes:</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={recruiterNotes}
                                    onChange={(e) => setRecruiterNotes(e.target.value)}
                                    placeholder="Add notes about this application..."
                                />
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowStatusModal(false)}
                        disabled={updating}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleStatusUpdate}
                        disabled={updating || !newStatus}
                    >
                        {updating ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Updating...
                            </>
                        ) : (
                            'Update Status'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            <style jsx>{`
                .table th {
                    border-top: none;
                    font-weight: 600;
                }
                
                .table td {
                    vertical-align: middle;
                }
                
                .table tbody tr:hover {
                    background-color: rgba(0,123,255,0.05);
                }
            `}</style>
        </Container>
    );
};

export default RecruiterApplications;