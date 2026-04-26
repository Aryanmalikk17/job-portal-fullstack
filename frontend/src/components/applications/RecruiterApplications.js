import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner, Form, Modal, Table, Tab, Tabs } from 'react-bootstrap';
import { 
    Users, 
    RefreshCcw, 
    AlertCircle, 
    FileText, 
    Clock, 
    Eye, 
    Handshake, 
    Inbox, 
    Edit3,
    CheckCircle2
} from 'lucide-react';
import { 
    getRecruiterApplications, 
    getRecruiterStatistics,
    updateApplicationStatus 
} from '../../services/applicationService';
import { formatDate } from '../../utils/dateUtils';

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
            const data = await getRecruiterApplications();
            setApplications(data || []);
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
            const stats = await getRecruiterStatistics();
            setStatistics(stats);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    // Filter applications by status
    const filteredApplications = (applications || []).filter(app => {
        if (filterStatus === 'ALL') return true;
        return app.status === filterStatus;
    });





    // Handle status update
    const handleStatusUpdate = async () => {
        if (!selectedApplication || !newStatus) return;

        try {
            setUpdating(true);
            const response = await updateApplicationStatus(
                selectedApplication.id,
                {
                    status: newStatus,
                    recruiterNotes: recruiterNotes
                }
            );

            if (response) {
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
                setError('Failed to update application status');
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
    const StatisticsCard = ({ title, value, icon: Icon, color = 'primary' }) => (
        <Card className="h-100 text-center border-0 shadow-sm glass-card">
            <Card.Body className="p-4">
                <div className={`text-${color} mb-3 d-flex justify-content-center`}>
                    <Icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="mb-1 fw-bold">{value}</h3>
                <p className="text-muted mb-0 small text-uppercase fw-semibold">{title}</p>
            </Card.Body>
        </Card>
    );

    return (
        <Container className="my-4">
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="d-flex align-items-center fw-bold">
                            <Users size={28} className="me-3 text-primary" />
                            Application Management
                        </h2>
                        <Button 
                            variant="outline-primary" 
                            className="d-flex align-items-center px-3 py-2 shadow-sm"
                            onClick={() => {
                                fetchApplications();
                                fetchStatistics();
                            }}
                            disabled={loading}
                        >
                            <RefreshCcw size={18} className={`me-2 ${loading ? 'spin-animation' : ''}`} />
                            Refresh
                        </Button>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="danger" className="border-0 shadow-sm d-flex align-items-center" dismissible onClose={() => setError(null)}>
                            <AlertCircle size={20} className="me-2" />
                            {error}
                        </Alert>
                    )}

                    <Tabs
                        id="recruiter-tabs"
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-4 custom-tabs border-0"
                    >
                        {/* Statistics Tab */}
                        <Tab eventKey="statistics" title="Overview">
                            {statistics && (
                                <Row className="g-4">
                                    <Col md={3}>
                                        <StatisticsCard
                                            title="Total Applications"
                                            value={statistics.totalApplications || 0}
                                            icon={FileText}
                                            color="primary"
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <StatisticsCard
                                            title="Pending Review"
                                            value={statistics.pendingApplications || 0}
                                            icon={Clock}
                                            color="warning"
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <StatisticsCard
                                            title="Under Review"
                                            value={statistics.reviewedApplications || 0}
                                            icon={Eye}
                                            color="info"
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <StatisticsCard
                                            title="Interviews"
                                            value={statistics.interviewApplications || 0}
                                            icon={Handshake}
                                            color="success"
                                        />
                                    </Col>
                                </Row>
                            )}
                        </Tab>

                        {/* Applications Tab */}
                        <Tab eventKey="applications" title="All Applications">
                            {/* Filter Controls */}
                            <Card className="mb-4 border-0 shadow-sm glass-card">
                                <Card.Body className="p-4">
                                    <Row className="align-items-center">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Filter by Status:</Form.Label>
                                                <Form.Select 
                                                    value={filterStatus}
                                                    onChange={(e) => setFilterStatus(e.target.value)}
                                                    className="border-light bg-light"
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
                                            <div className="text-muted small">
                                                Total Applications: <strong className="text-dark">{applications.length}</strong>
                                                {filterStatus !== 'ALL' && (
                                                    <span className="ms-2">
                                                        | Filtered: <strong className="text-primary">{filteredApplications.length}</strong>
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
                                    <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                                    <p className="mt-3 text-muted fw-medium">Loading applications...</p>
                                </div>
                            )}

                            {/* Applications Table */}
                            {!loading && (
                                <>
                                    {filteredApplications.length === 0 ? (
                                        <Card className="text-center py-5 border-0 shadow-sm glass-card">
                                            <Card.Body>
                                                <div className="text-muted mb-3 d-flex justify-content-center">
                                                    <Inbox size={64} strokeWidth={1} />
                                                </div>
                                                <h5 className="fw-bold">
                                                    {filterStatus === 'ALL' 
                                                        ? 'No Applications Yet' 
                                                        : `No ${filterStatus.toLowerCase()} applications`
                                                    }
                                                </h5>
                                                <p className="text-muted mb-0">
                                                    Applications will appear here when candidates apply to your jobs.
                                                </p>
                                            </Card.Body>
                                        </Card>
                                    ) : (
                                        <Card className="border-0 shadow-sm overflow-hidden">
                                            <Card.Body className="p-0">
                                                <Table responsive hover className="mb-0 custom-table">
                                                    <thead>
                                                        <tr>
                                                            <th className="ps-4">Candidate</th>
                                                            <th>Job Position</th>
                                                            <th>Applied Date</th>
                                                            <th>Status</th>
                                                            <th className="text-end pe-4">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredApplications.map((application) => (
                                                            <tr key={application.id}>
                                                                <td className="ps-4">
                                                                    <div>
                                                                        <div className="fw-bold text-dark">
                                                                            {application.applicantName}
                                                                        </div>
                                                                        <div className="small text-muted">
                                                                            {application.applicantEmail}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        <div className="fw-semibold">{application.jobTitle}</div>
                                                                        <div className="small text-muted">
                                                                            ID: {application.jobId}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="small text-muted">{formatDate(application.applyDate)}</div>
                                                                </td>
                                                                <td>
                                                                    <Badge 
                                                                        bg={null} 
                                                                        className={`status-badge status-${application.status.toLowerCase()}`}
                                                                    >
                                                                        {application.status}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-end pe-4">
                                                                    <Button
                                                                        variant="light"
                                                                        size="sm"
                                                                        onClick={() => openStatusModal(application)}
                                                                        className="btn-action d-inline-flex align-items-center"
                                                                    >
                                                                        <Edit3 size={14} className="me-2" />
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
            <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} size="lg" centered className="status-modal">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Update Application Status</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedApplication && (
                        <>
                            <div className="application-brief p-3 bg-light rounded-3 mb-4 d-flex align-items-center">
                                <div className="me-3 bg-white p-2 rounded-circle shadow-sm">
                                    <Users size={24} className="text-primary" />
                                </div>
                                <div>
                                    <div className="fw-bold text-dark">{selectedApplication.applicantName}</div>
                                    <div className="small text-muted">{selectedApplication.jobTitle} • Applied {formatDate(selectedApplication.applyDate)}</div>
                                </div>
                            </div>

                            {selectedApplication.coverLetter && (
                                <div className="mb-4">
                                    <label className="small fw-bold text-muted text-uppercase mb-2 d-block">Cover Letter:</label>
                                    <div className="p-3 bg-light rounded border-start border-4 border-primary shadow-sm" style={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedApplication.coverLetter}
                                    </div>
                                </div>
                            )}

                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-muted text-uppercase mb-2">New Status:</Form.Label>
                                <Form.Select 
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="border-light bg-light py-2"
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="REVIEWED">Under Review</option>
                                    <option value="INTERVIEW">Interview</option>
                                    <option value="ACCEPTED">Accepted</option>
                                    <option value="REJECTED">Rejected</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase mb-2">Recruiter Notes:</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={recruiterNotes}
                                    onChange={(e) => setRecruiterNotes(e.target.value)}
                                    placeholder="Add internal notes about this candidate..."
                                    className="border-light bg-light"
                                />
                                <Form.Text className="text-muted small">Notes are only visible to the recruitment team.</Form.Text>
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button 
                        variant="light" 
                        onClick={() => setShowStatusModal(false)}
                        disabled={updating}
                        className="px-4"
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleStatusUpdate}
                        disabled={updating || !newStatus}
                        className="px-4 d-flex align-items-center"
                    >
                        {updating ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={18} className="me-2" />
                                Confirm Update
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            <style jsx>{`
                .spin-animation {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .custom-table thead th {
                    background-color: #f8f9fa;
                    border-bottom: 2px solid #edf2f7;
                    color: #718096;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding-top: 1rem;
                    padding-bottom: 1rem;
                }
                
                .custom-table tbody td {
                    vertical-align: middle;
                    padding-top: 1.25rem;
                    padding-bottom: 1.25rem;
                    border-bottom: 1px solid #edf2f7;
                }
                
                .btn-action {
                    border: 1px solid #edf2f7;
                    color: #4a5568;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                
                .btn-action:hover {
                    background-color: #ebf8ff;
                    border-color: #bee3f8;
                    color: #2b6cb0;
                }
                
                .status-badge {
                    padding: 0.5rem 0.75rem;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 0.75rem;
                }
                
                .status-pending { background-color: #ebf8ff; color: #2b6cb0; }
                .status-reviewed { background-color: #e6fffa; color: #2c7a7b; }
                .status-interview { background-color: #fffaf0; color: #9c4221; }
                .status-accepted { background-color: #f0fff4; color: #276749; }
                .status-rejected { background-color: #fff5f5; color: #9b2c2c; }
            `}</style>
        </Container>
    );
};

export default RecruiterApplications;