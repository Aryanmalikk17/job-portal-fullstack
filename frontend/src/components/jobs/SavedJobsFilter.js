import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Dropdown, Badge } from 'react-bootstrap';
import { Search, Filter, ArrowUpDown, Check, X } from 'lucide-react';

const SavedJobsFilter = ({ onFilterChange, totalJobs, appliedFilters }) => {
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        remote: '',
        applied: '',
        sortBy: 'savedAt',
        sortOrder: 'desc'
    });

    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        if (appliedFilters) {
            setFilters(prev => ({ ...prev, ...appliedFilters }));
        }
    }, [appliedFilters]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            search: '',
            type: '',
            remote: '',
            applied: '',
            sortBy: 'savedAt',
            sortOrder: 'desc'
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    const getActiveFilterCount = () => {
        return Object.values(filters).filter(value => 
            value !== '' && value !== 'savedAt' && value !== 'desc'
        ).length;
    };

    const jobTypes = [
        { value: '', label: 'All Job Types' },
        { value: 'Full-time', label: 'Full-time' },
        { value: 'Part-time', label: 'Part-time' },
        { value: 'Contract', label: 'Contract' },
        { value: 'Freelance', label: 'Freelance' },
        { value: 'Internship', label: 'Internship' }
    ];

    const remoteOptions = [
        { value: '', label: 'All Locations' },
        { value: 'true', label: 'Remote Only' },
        { value: 'false', label: 'On-site Only' }
    ];

    const appliedOptions = [
        { value: '', label: 'All Jobs' },
        { value: 'true', label: 'Applied Jobs' },
        { value: 'false', label: 'Not Applied' }
    ];

    const sortOptions = [
        { value: 'savedAt_desc', label: 'Recently Saved' },
        { value: 'savedAt_asc', label: 'Oldest Saved' },
        { value: 'postedDate_desc', label: 'Recently Posted' },
        { value: 'postedDate_asc', label: 'Oldest Posted' },
        { value: 'title_asc', label: 'Job Title A-Z' },
        { value: 'title_desc', label: 'Job Title Z-A' },
        { value: 'company_asc', label: 'Company A-Z' },
        { value: 'deadline_asc', label: 'Deadline Soon' }
    ];

    const handleSortChange = (sortValue) => {
        const [sortBy, sortOrder] = sortValue.split('_');
        handleFilterChange('sortBy', sortBy);
        handleFilterChange('sortOrder', sortOrder);
    };

    const getCurrentSortValue = () => {
        return `${filters.sortBy}_${filters.sortOrder}`;
    };

    return (
        <div className="saved-jobs-filter">
            <Row className="align-items-center mb-3">
                <Col md={6}>
                    <div className="search-section">
                        <Form.Group className="mb-0">
                            <div className="search-input-wrapper position-relative">
                                <Form.Control
                                    type="text"
                                    placeholder="Search saved jobs by title, company, or location..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="search-input"
                                    style={{ paddingLeft: '40px' }}
                                />
                                <Search 
                                    size={18} 
                                    className="search-icon position-absolute text-muted" 
                                    style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
                                />
                            </div>
                        </Form.Group>
                    </div>
                </Col>
                <Col md={6}>
                    <div className="filter-actions d-flex gap-2 justify-content-md-end mt-3 mt-md-0">
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="advanced-filter-btn d-inline-flex align-items-center"
                        >
                            <Filter size={16} className="me-2" />
                            Filters
                            {getActiveFilterCount() > 0 && (
                                <Badge bg="primary" className="ms-2">
                                    {getActiveFilterCount()}
                                </Badge>
                            )}
                        </Button>

                        <Dropdown className="sort-dropdown">
                            <Dropdown.Toggle variant="outline-primary" className="sort-btn d-inline-flex align-items-center">
                                <ArrowUpDown size={16} className="me-2" />
                                Sort By
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {sortOptions.map(option => (
                                    <Dropdown.Item
                                        key={option.value}
                                        onClick={() => handleSortChange(option.value)}
                                        className={`d-flex align-items-center justify-content-between ${getCurrentSortValue() === option.value ? 'active' : ''}`}
                                    >
                                        {option.label}
                                        {getCurrentSortValue() === option.value && (
                                            <Check size={14} className="ms-2 text-primary" />
                                        )}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        {getActiveFilterCount() > 0 && (
                            <Button
                                variant="outline-danger"
                                onClick={clearFilters}
                                className="clear-filters-btn d-inline-flex align-items-center"
                            >
                                <X size={16} className="me-2" />
                                Clear
                            </Button>
                        )}
                    </div>
                </Col>
            </Row>

            {showAdvanced && (
                <div className="advanced-filters p-4 bg-light rounded-3 mt-3 border">
                    <Row>
                        <Col md={3}>
                            <Form.Group className="mb-3 mb-md-0">
                                <Form.Label className="filter-label fw-bold small text-uppercase text-muted">Job Type</Form.Label>
                                <Form.Select
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="filter-select"
                                >
                                    {jobTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group className="mb-3 mb-md-0">
                                <Form.Label className="filter-label fw-bold small text-uppercase text-muted">Location Type</Form.Label>
                                <Form.Select
                                    value={filters.remote}
                                    onChange={(e) => handleFilterChange('remote', e.target.value)}
                                    className="filter-select"
                                >
                                    {remoteOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group className="mb-3 mb-md-0">
                                <Form.Label className="filter-label fw-bold small text-uppercase text-muted">Application Status</Form.Label>
                                <Form.Select
                                    value={filters.applied}
                                    onChange={(e) => handleFilterChange('applied', e.target.value)}
                                    className="filter-select"
                                >
                                    {appliedOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <div className="filter-summary">
                                <Form.Label className="filter-label fw-bold small text-uppercase text-muted">Results</Form.Label>
                                <div className="results-count py-2">
                                    <strong>{totalJobs}</strong> saved jobs
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {getActiveFilterCount() > 0 && (
                        <div className="active-filters mt-3 pt-3 border-top d-flex flex-wrap align-items-center gap-2">
                            <span className="active-filters-label small text-muted">Active Filters:</span>
                            {filters.search && (
                                <Badge 
                                    bg="primary" 
                                    className="filter-badge d-inline-flex align-items-center px-3 py-2 cursor-pointer"
                                    onClick={() => handleFilterChange('search', '')}
                                >
                                    Search: "{filters.search}"
                                    <X size={12} className="ms-1" />
                                </Badge>
                            )}
                            {filters.type && (
                                <Badge 
                                    bg="primary" 
                                    className="filter-badge d-inline-flex align-items-center px-3 py-2 cursor-pointer"
                                    onClick={() => handleFilterChange('type', '')}
                                >
                                    Type: {filters.type}
                                    <X size={12} className="ms-1" />
                                </Badge>
                            )}
                            {filters.remote && (
                                <Badge 
                                    bg="primary" 
                                    className="filter-badge d-inline-flex align-items-center px-3 py-2 cursor-pointer"
                                    onClick={() => handleFilterChange('remote', '')}
                                >
                                    Location: {filters.remote === 'true' ? 'Remote' : 'On-site'}
                                    <X size={12} className="ms-1" />
                                </Badge>
                            )}
                            {filters.applied && (
                                <Badge 
                                    bg="primary" 
                                    className="filter-badge d-inline-flex align-items-center px-3 py-2 cursor-pointer"
                                    onClick={() => handleFilterChange('applied', '')}
                                >
                                    Status: {filters.applied === 'true' ? 'Applied' : 'Not Applied'}
                                    <X size={12} className="ms-1" />
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SavedJobsFilter;