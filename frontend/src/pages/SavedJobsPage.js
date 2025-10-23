import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Modal, Alert, Pagination, Toast, ToastContainer, Dropdown, Form, Badge, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { savedJobsService } from '../services/savedJobsService';
import SavedJobCard from '../components/jobs/SavedJobCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './SavedJobsPage.css';

const SavedJobsPage = () => {
    const { user } = useAuth();
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterRemote, setFilterRemote] = useState('');
    const [sortBy, setSortBy] = useState('savedAt');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        hasNext: false,
        hasPrevious: false
    });
    
    // Selection and bulk actions
    const [selectedJobs, setSelectedJobs] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkAction, setBulkAction] = useState('');
    const [bulkLoading, setBulkLoading] = useState(false);
    
    // Toast notifications
    const [toasts, setToasts] = useState([]);

    // Load saved jobs
    const loadSavedJobs = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            
            const filters = {
                search: searchTerm,
                type: filterType,
                remote: filterRemote,
                sortBy: sortBy,
                sortOrder: 'desc'
            };
            
            const response = await savedJobsService.getSavedJobs(page, 10, filters);
            
            setSavedJobs(response.jobs || []);
            setPagination({
                currentPage: response.currentPage || 1,
                totalPages: response.totalPages || 1,
                totalJobs: response.totalJobs || 0,
                hasNext: response.hasNext || false,
                hasPrevious: response.hasPrevious || false
            });
            
            // Clear selections when data changes
            setSelectedJobs(new Set());
            setSelectAll(false);
            
        } catch (error) {
            console.error('Error loading saved jobs:', error);
            setError('Failed to load saved jobs. Please try again.');
            setSavedJobs([]);
            setPagination({
                currentPage: 1,
                totalPages: 1,
                totalJobs: 0,
                hasNext: false,
                hasPrevious: false
            });
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterType, filterRemote, sortBy]);

    // Initial load
    useEffect(() => {
        if (user) {
            loadSavedJobs();
        }
    }, [user, loadSavedJobs]);

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        loadSavedJobs(1);
    };

    // Handle filter changes
    const handleFilterChange = () => {
        loadSavedJobs(1);
    };

    // Handle pagination
    const handlePageChange = (page) => {
        loadSavedJobs(page);
    };

    // Handle job selection
    const handleJobSelection = (jobId, isSelected) => {
        const newSelected = new Set(selectedJobs);
        if (isSelected) {
            newSelected.add(jobId);
        } else {
            newSelected.delete(jobId);
        }
        setSelectedJobs(newSelected);
        setSelectAll(newSelected.size === savedJobs.length && savedJobs.length > 0);
    };

    // Handle select all
    const handleSelectAll = (isSelected) => {
        if (isSelected) {
            setSelectedJobs(new Set(savedJobs.map(job => job.id || job.jobPostId)));
        } else {
            setSelectedJobs(new Set());
        }
        setSelectAll(isSelected);
    };

    // Handle individual job actions
    const handleRemoveJob = async (jobId) => {
        try {
            await savedJobsService.unsaveJob(jobId);
            
            // Remove from local state
            setSavedJobs(prev => prev.filter(job => (job.id || job.jobPostId) !== jobId));
            setPagination(prev => ({ ...prev, totalJobs: prev.totalJobs - 1 }));
            
            // Remove from selection
            const newSelected = new Set(selectedJobs);
            newSelected.delete(jobId);
            setSelectedJobs(newSelected);
            
            showToast('Job removed from saved jobs', 'success');
            
            // Reload if current page is empty
            if (savedJobs.length === 1 && pagination.currentPage > 1) {
                loadSavedJobs(pagination.currentPage - 1);
            }
        } catch (error) {
            console.error('Error removing job:', error);
            showToast('Failed to remove job. Please try again.', 'error');
        }
    };

    const handleApplyToJob = async (jobId) => {
        try {
            await savedJobsService.applyToJob(jobId);
            
            // Update local state
            setSavedJobs(prev => prev.map(job => 
                (job.id || job.jobPostId) === jobId 
                    ? { ...job, isApplied: true, applied: true, appliedAt: new Date().toISOString() }
                    : job
            ));
            
            showToast('Application submitted successfully!', 'success');
        } catch (error) {
            console.error('Error applying to job:', error);
            showToast('Failed to submit application. Please try again.', 'error');
        }
    };

    // Handle bulk actions
    const handleBulkAction = async () => {
        if (selectedJobs.size === 0) return;
        
        setBulkLoading(true);
        try {
            const jobIds = Array.from(selectedJobs);
            await savedJobsService.bulkActions(jobIds, bulkAction);
            
            if (bulkAction === 'remove') {
                // Remove selected jobs from local state
                setSavedJobs(prev => prev.filter(job => !selectedJobs.has(job.id || job.jobPostId)));
                setPagination(prev => ({ ...prev, totalJobs: prev.totalJobs - selectedJobs.size }));
                showToast(`${selectedJobs.size} jobs removed from saved jobs`, 'success');
            } else if (bulkAction === 'apply') {
                // Update applied status for selected jobs
                setSavedJobs(prev => prev.map(job => 
                    selectedJobs.has(job.id || job.jobPostId) 
                        ? { ...job, isApplied: true, applied: true, appliedAt: new Date().toISOString() }
                        : job
                ));
                showToast(`Applied to ${selectedJobs.size} jobs successfully!`, 'success');
            }
            
            // Clear selections
            setSelectedJobs(new Set());
            setSelectAll(false);
            setShowBulkModal(false);
            
            // Reload if current page is empty
            if (bulkAction === 'remove' && savedJobs.length === selectedJobs.size && pagination.currentPage > 1) {
                loadSavedJobs(pagination.currentPage - 1);
            }
        } catch (error) {
            console.error('Error performing bulk action:', error);
            showToast('Failed to perform bulk action. Please try again.', 'error');
        } finally {
            setBulkLoading(false);
        }
    };

    // Toast management
    const showToast = (message, type = 'info') => {
        const toast = {
            id: Date.now(),
            message,
            type,
            show: true
        };
        setToasts(prev => [...prev, toast]);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, 5000);
    };

    const hideToast = (toastId) => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
    };

    // Clear all saved jobs
    const handleClearAll = async () => {
        try {
            await savedJobsService.clearAllSavedJobs();
            setSavedJobs([]);
            setPagination(prev => ({ ...prev, totalJobs: 0 }));
            setSelectedJobs(new Set());
            setSelectAll(false);
            showToast('All saved jobs cleared successfully', 'success');
        } catch (error) {
            console.error('Error clearing all jobs:', error);
            showToast('Failed to clear all jobs. Please try again.', 'error');
        }
    };

    // Clear filters
    const clearFilters = () => {
        setSearchTerm('');
        setFilterType('');
        setFilterRemote('');
        setSortBy('savedAt');
    };

    if (loading && savedJobs.length === 0) {
        return (
            <div className="saved-jobs-page">
                <Container className="py-5">
                    <LoadingSpinner message="Loading your saved jobs..." />
                </Container>
            </div>
        );
    }

    return (
        <div className="saved-jobs-page">
            <Container fluid className="px-4 py-4">
                {/* Enhanced Page Header */}
                <div className="page-header-section mb-5">
                    <Card className="page-header-card">
                        <Card.Body className="p-4">
                            <Row className="align-items-center">
                                <Col md={8}>
                                    <div className="header-content">
                                        <div className="header-icon-title">
                                            <div className="header-icon">
                                                <i className="fas fa-heart"></i>
                                            </div>
                                            <div>
                                                <h1 className="page-title mb-2">My Saved Jobs</h1>
                                                <p className="page-subtitle">
                                                    Manage your bookmarked job opportunities
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={4} className="text-end">
                                    <div className="header-stats">
                                        <div className="stat-card">
                                            <div className="stat-number">{pagination.totalJobs}</div>
                                            <div className="stat-label">Saved Jobs</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-number">
                                                {savedJobs.filter(job => job.isApplied || job.applied).length}
                                            </div>
                                            <div className="stat-label">Applied</div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </div>

                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)} className="modern-alert mb-4">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {error}
                    </Alert>
                )}

                {/* Enhanced Filters and Search */}
                <Card className="filters-card mb-4">
                    <Card.Body className="p-4">
                        <Row className="align-items-end">
                            <Col md={5}>
                                <Form onSubmit={handleSearch}>
                                    <Form.Group>
                                        <Form.Label className="filter-label">
                                            <i className="fas fa-search me-2"></i>
                                            Search Jobs
                                        </Form.Label>
                                        <InputGroup className="search-input-group">
                                            <Form.Control
                                                type="text"
                                                placeholder="Search by title, company, or location..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="modern-search-input"
                                            />
                                            <Button 
                                                variant="primary" 
                                                type="submit"
                                                className="search-btn"
                                            >
                                                <i className="fas fa-search"></i>
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>
                                </Form>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label className="filter-label">
                                        <i className="fas fa-briefcase me-2"></i>
                                        Job Type
                                    </Form.Label>
                                    <Form.Select 
                                        value={filterType} 
                                        onChange={(e) => {
                                            setFilterType(e.target.value);
                                            setTimeout(handleFilterChange, 100);
                                        }}
                                        className="modern-select"
                                    >
                                        <option value="">All Types</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Internship">Internship</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label className="filter-label">
                                        <i className="fas fa-home me-2"></i>
                                        Work Style
                                    </Form.Label>
                                    <Form.Select 
                                        value={filterRemote} 
                                        onChange={(e) => {
                                            setFilterRemote(e.target.value);
                                            setTimeout(handleFilterChange, 100);
                                        }}
                                        className="modern-select"
                                    >
                                        <option value="">All Styles</option>
                                        <option value="true">Remote</option>
                                        <option value="false">On-site</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label className="filter-label">
                                        <i className="fas fa-sort me-2"></i>
                                        Sort By
                                    </Form.Label>
                                    <Form.Select 
                                        value={sortBy} 
                                        onChange={(e) => {
                                            setSortBy(e.target.value);
                                            setTimeout(handleFilterChange, 100);
                                        }}
                                        className="modern-select"
                                    >
                                        <option value="savedAt">Recently Saved</option>
                                        <option value="postedDate">Recently Posted</option>
                                        <option value="jobTitle">Job Title</option>
                                        <option value="companyName">Company</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={1}>
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={clearFilters}
                                    className="clear-filters-btn"
                                    title="Clear Filters"
                                >
                                    <i className="fas fa-times"></i>
                                </Button>
                            </Col>
                        </Row>

                        {/* Active Filters Display */}
                        {(searchTerm || filterType || filterRemote) && (
                            <div className="active-filters mt-3">
                                <span className="active-filters-label">Active Filters:</span>
                                {searchTerm && (
                                    <Badge bg="primary" className="filter-badge">
                                        Search: "{searchTerm}"
                                        <button 
                                            className="btn-close btn-close-white ms-2"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setTimeout(handleFilterChange, 100);
                                            }}
                                        ></button>
                                    </Badge>
                                )}
                                {filterType && (
                                    <Badge bg="info" className="filter-badge">
                                        Type: {filterType}
                                        <button 
                                            className="btn-close btn-close-white ms-2"
                                            onClick={() => {
                                                setFilterType('');
                                                setTimeout(handleFilterChange, 100);
                                            }}
                                        ></button>
                                    </Badge>
                                )}
                                {filterRemote && (
                                    <Badge bg="success" className="filter-badge">
                                        Style: {filterRemote === 'true' ? 'Remote' : 'On-site'}
                                        <button 
                                            className="btn-close btn-close-white ms-2"
                                            onClick={() => {
                                                setFilterRemote('');
                                                setTimeout(handleFilterChange, 100);
                                            }}
                                        ></button>
                                    </Badge>
                                )}
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Bulk Actions Bar */}
                {savedJobs.length > 0 && (
                    <Card className="bulk-actions-card mb-4">
                        <Card.Body className="p-3">
                            <Row className="align-items-center">
                                <Col md={6}>
                                    <div className="bulk-selection">
                                        <Form.Check
                                            type="checkbox"
                                            className="select-all-checkbox"
                                            checked={selectAll}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            label={
                                                selectedJobs.size === 0 ? (
                                                    <span className="selection-text">Select jobs for bulk actions</span>
                                                ) : (
                                                    <span className="selection-text">
                                                        <strong>{selectedJobs.size}</strong> job{selectedJobs.size > 1 ? 's' : ''} selected
                                                    </span>
                                                )
                                            }
                                        />
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="bulk-actions-buttons text-end">
                                        {selectedJobs.size > 0 && (
                                            <>
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => {
                                                        setBulkAction('apply');
                                                        setShowBulkModal(true);
                                                    }}
                                                    className="bulk-action-btn me-2"
                                                >
                                                    <i className="fas fa-paper-plane me-1"></i>
                                                    Apply to Selected ({selectedJobs.size})
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => {
                                                        setBulkAction('remove');
                                                        setShowBulkModal(true);
                                                    }}
                                                    className="bulk-action-btn me-2"
                                                >
                                                    <i className="fas fa-trash me-1"></i>
                                                    Remove Selected ({selectedJobs.size})
                                                </Button>
                                            </>
                                        )}
                                        
                                        <Dropdown>
                                            <Dropdown.Toggle variant="outline-secondary" size="sm" className="options-dropdown">
                                                <i className="fas fa-ellipsis-v"></i>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu align="end">
                                                <Dropdown.Item onClick={handleClearAll} className="text-danger">
                                                    <i className="fas fa-trash me-2"></i>
                                                    Clear All Saved Jobs
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item as={Link} to="/jobs">
                                                    <i className="fas fa-search me-2"></i>
                                                    Browse More Jobs
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                )}

                {/* Jobs List or Empty State */}
                {savedJobs.length > 0 ? (
                    <>
                        <div className="saved-jobs-grid">
                            {savedJobs.map((job) => (
                                <SavedJobCard
                                    key={job.id || job.jobPostId}
                                    job={job}
                                    onRemove={handleRemoveJob}
                                    onApply={handleApplyToJob}
                                    onSelect={handleJobSelection}
                                    isSelected={selectedJobs.has(job.id || job.jobPostId)}
                                />
                            ))}
                        </div>

                        {/* Enhanced Pagination */}
                        {pagination.totalPages > 1 && (
                            <Card className="pagination-card mt-4">
                                <Card.Body className="p-3">
                                    <Row className="align-items-center">
                                        <Col md={6}>
                                            <div className="pagination-info">
                                                <span className="pagination-text">
                                                    Showing <strong>{savedJobs.length}</strong> of <strong>{pagination.totalJobs}</strong> saved jobs
                                                </span>
                                            </div>
                                        </Col>
                                        <Col md={6}>
                                            <Pagination className="custom-pagination justify-content-end mb-0">
                                                <Pagination.First 
                                                    disabled={!pagination.hasPrevious}
                                                    onClick={() => handlePageChange(1)}
                                                />
                                                <Pagination.Prev 
                                                    disabled={!pagination.hasPrevious}
                                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                />
                                                
                                                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                                                    let page;
                                                    if (pagination.totalPages <= 5) {
                                                        page = i + 1;
                                                    } else if (pagination.currentPage <= 3) {
                                                        page = i + 1;
                                                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                                        page = pagination.totalPages - 4 + i;
                                                    } else {
                                                        page = pagination.currentPage - 2 + i;
                                                    }
                                                    
                                                    return (
                                                        <Pagination.Item
                                                            key={page}
                                                            active={page === pagination.currentPage}
                                                            onClick={() => handlePageChange(page)}
                                                        >
                                                            {page}
                                                        </Pagination.Item>
                                                    );
                                                })}
                                                
                                                <Pagination.Next 
                                                    disabled={!pagination.hasNext}
                                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                />
                                                <Pagination.Last 
                                                    disabled={!pagination.hasNext}
                                                    onClick={() => handlePageChange(pagination.totalPages)}
                                                />
                                            </Pagination>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        )}
                    </>
                ) : (
                    /* Enhanced Empty State */
                    <Card className="empty-state-card">
                        <Card.Body className="text-center p-5">
                            {pagination.totalJobs === 0 && !searchTerm && !filterType && !filterRemote ? (
                                // No saved jobs at all
                                <div className="empty-state">
                                    <div className="empty-icon">
                                        <i className="fas fa-heart-broken"></i>
                                    </div>
                                    <h3 className="empty-title">No Saved Jobs Yet</h3>
                                    <p className="empty-description">
                                        Start building your job collection by saving interesting opportunities you find while browsing.
                                    </p>
                                    <div className="empty-actions">
                                        <Button as={Link} to="/jobs" variant="primary" size="lg" className="cta-button">
                                            <i className="fas fa-search me-2"></i>
                                            Browse Jobs
                                        </Button>
                                    </div>
                                    <div className="empty-tips mt-4">
                                        <h6>💡 Pro Tips:</h6>
                                        <ul className="tips-list">
                                            <li>Click the heart icon on any job to save it for later</li>
                                            <li>Saved jobs help you keep track of opportunities you're interested in</li>
                                            <li>You can apply to multiple saved jobs at once using bulk actions</li>
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                // No results for current filters
                                <div className="no-results-state">
                                    <div className="empty-icon">
                                        <i className="fas fa-search"></i>
                                    </div>
                                    <h3 className="empty-title">No Jobs Match Your Filters</h3>
                                    <p className="empty-description">
                                        Try adjusting your search criteria or clearing some filters to see more results.
                                    </p>
                                    <div className="empty-actions">
                                        <Button 
                                            variant="outline-primary" 
                                            onClick={clearFilters}
                                            className="me-3"
                                        >
                                            <i className="fas fa-times me-2"></i>
                                            Clear Filters
                                        </Button>
                                        <Button as={Link} to="/jobs" variant="primary">
                                            <i className="fas fa-plus me-2"></i>
                                            Save More Jobs
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                )}

                {/* Enhanced Bulk Action Modal */}
                <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)} centered className="bulk-action-modal">
                    <Modal.Header closeButton className="border-0">
                        <Modal.Title className="modal-title">
                            <i className={`fas fa-${bulkAction === 'apply' ? 'paper-plane text-success' : 'trash text-danger'} me-2`}></i>
                            {bulkAction === 'apply' ? 'Apply to Jobs' : 'Remove Jobs'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                        <div className="text-center">
                            <div className="modal-icon mb-3">
                                <i className={`fas fa-${bulkAction === 'apply' ? 'paper-plane' : 'trash'} fa-3x ${bulkAction === 'apply' ? 'text-success' : 'text-danger'}`}></i>
                            </div>
                            <h5 className="modal-question mb-3">
                                {bulkAction === 'apply' 
                                    ? `Apply to ${selectedJobs.size} job${selectedJobs.size > 1 ? 's' : ''}?`
                                    : `Remove ${selectedJobs.size} job${selectedJobs.size > 1 ? 's' : ''}?`
                                }
                            </h5>
                            <p className="modal-description text-muted">
                                {bulkAction === 'apply' 
                                    ? 'You will submit applications to all selected jobs. Make sure your profile and resume are up to date.'
                                    : 'Selected jobs will be permanently removed from your saved jobs list. This action cannot be undone.'
                                }
                            </p>
                            {bulkAction === 'apply' && (
                                <div className="alert alert-info">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <strong>Tip:</strong> Review each job carefully before applying to ensure you meet the requirements.
                                </div>
                            )}
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button 
                            variant="outline-secondary" 
                            onClick={() => setShowBulkModal(false)}
                            disabled={bulkLoading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant={bulkAction === 'apply' ? 'success' : 'danger'}
                            onClick={handleBulkAction}
                            disabled={bulkLoading}
                            className="modal-action-btn"
                        >
                            {bulkLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    {bulkAction === 'apply' ? 'Applying...' : 'Removing...'}
                                </>
                            ) : (
                                <>
                                    <i className={`fas fa-${bulkAction === 'apply' ? 'paper-plane' : 'trash'} me-2`}></i>
                                    {bulkAction === 'apply' ? `Apply to ${selectedJobs.size} Jobs` : `Remove ${selectedJobs.size} Jobs`}
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Enhanced Toast Notifications */}
                <ToastContainer position="top-end" className="custom-toast-container">
                    {toasts.map(toast => (
                        <Toast
                            key={toast.id}
                            show={toast.show}
                            onClose={() => hideToast(toast.id)}
                            className={`custom-toast toast-${toast.type}`}
                            delay={5000}
                            autohide
                        >
                            <Toast.Header className="toast-header">
                                <div className="toast-icon">
                                    <i className={`fas fa-${toast.type === 'success' ? 'check-circle' : toast.type === 'error' ? 'exclamation-circle' : 'info-circle'}`}></i>
                                </div>
                                <strong className="toast-title me-auto">
                                    {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Info'}
                                </strong>
                            </Toast.Header>
                            <Toast.Body className="toast-body">
                                {toast.message}
                            </Toast.Body>
                        </Toast>
                    ))}
                </ToastContainer>
            </Container>
        </div>
    );
};

export default SavedJobsPage;