import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Dropdown, Badge } from 'react-bootstrap';

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
                            <div className="search-input-wrapper">
                                <Form.Control
                                    type="text"
                                    placeholder="Search saved jobs by title, company, or location..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="search-input"
                                />
                                <i className="fas fa-search search-icon"></i>
                            </div>
                        </Form.Group>
                    </div>
                </Col>
                <Col md={6}>
                    <div className="filter-actions">
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="advanced-filter-btn"
                        >
                            <i className="fas fa-filter me-2"></i>
                            Filters
                            {getActiveFilterCount() > 0 && (
                                <Badge bg="primary" className="ms-2">
                                    {getActiveFilterCount()}
                                </Badge>
                            )}
                        </Button>

                        <Dropdown className="sort-dropdown">
                            <Dropdown.Toggle variant="outline-primary" className="sort-btn">
                                <i className="fas fa-sort me-2"></i>
                                Sort By
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {sortOptions.map(option => (
                                    <Dropdown.Item
                                        key={option.value}
                                        onClick={() => handleSortChange(option.value)}
                                        className={getCurrentSortValue() === option.value ? 'active' : ''}
                                    >
                                        {option.label}
                                        {getCurrentSortValue() === option.value && (
                                            <i className="fas fa-check ms-2 text-primary"></i>
                                        )}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        {getActiveFilterCount() > 0 && (
                            <Button
                                variant="outline-danger"
                                onClick={clearFilters}
                                className="clear-filters-btn"
                            >
                                <i className="fas fa-times me-2"></i>
                                Clear
                            </Button>
                        )}
                    </div>
                </Col>
            </Row>

            {showAdvanced && (
                <div className="advanced-filters">
                    <Row>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label className="filter-label">Job Type</Form.Label>
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
                            <Form.Group className="mb-3">
                                <Form.Label className="filter-label">Location Type</Form.Label>
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
                            <Form.Group className="mb-3">
                                <Form.Label className="filter-label">Application Status</Form.Label>
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
                                <Form.Label className="filter-label">Results</Form.Label>
                                <div className="results-count">
                                    <strong>{totalJobs}</strong> saved jobs
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {getActiveFilterCount() > 0 && (
                        <div className="active-filters">
                            <span className="active-filters-label">Active Filters:</span>
                            {filters.search && (
                                <Badge 
                                    bg="primary" 
                                    className="filter-badge"
                                    onClick={() => handleFilterChange('search', '')}
                                >
                                    Search: "{filters.search}"
                                    <i className="fas fa-times ms-1"></i>
                                </Badge>
                            )}
                            {filters.type && (
                                <Badge 
                                    bg="primary" 
                                    className="filter-badge"
                                    onClick={() => handleFilterChange('type', '')}
                                >
                                    Type: {filters.type}
                                    <i className="fas fa-times ms-1"></i>
                                </Badge>
                            )}
                            {filters.remote && (
                                <Badge 
                                    bg="primary" 
                                    className="filter-badge"
                                    onClick={() => handleFilterChange('remote', '')}
                                >
                                    Location: {filters.remote === 'true' ? 'Remote' : 'On-site'}
                                    <i className="fas fa-times ms-1"></i>
                                </Badge>
                            )}
                            {filters.applied && (
                                <Badge 
                                    bg="primary" 
                                    className="filter-badge"
                                    onClick={() => handleFilterChange('applied', '')}
                                >
                                    Status: {filters.applied === 'true' ? 'Applied' : 'Not Applied'}
                                    <i className="fas fa-times ms-1"></i>
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