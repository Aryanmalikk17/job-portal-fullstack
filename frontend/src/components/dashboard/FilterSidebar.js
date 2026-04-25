import React from 'react';
import { Card, Form, Button, Badge } from 'react-bootstrap';
import { 
    Briefcase, 
    Home, 
    Calendar, 
    Filter, 
    X, 
    Lightbulb 
} from 'lucide-react';

const FilterSidebar = ({ filters, onFilterChange, onClearAll, totalResults }) => {
    const filterGroups = [
        {
            title: 'Employment Type',
            key: 'employmentType',
            icon: Briefcase,
            options: [
                { value: 'Full-time', label: 'Full-time', count: null },
                { value: 'Part-time', label: 'Part-time', count: null },
                { value: 'Freelance', label: 'Freelance', count: null },
                { value: 'Internship', label: 'Internship', count: null }
            ]
        },
        {
            title: 'Remote Work',
            key: 'remoteWork',
            icon: Home,
            options: [
                { value: 'Remote-Only', label: '🏠 Remote Only', count: null },
                { value: 'Office-Only', label: '🏢 Office Only', count: null },
                { value: 'Partial-Remote', label: '🔄 Hybrid', count: null }
            ]
        },
        {
            title: 'Date Posted',
            key: 'datePosted',
            icon: Calendar,
            options: [
                { value: 'today', label: 'Today', count: null },
                { value: 'last7days', label: 'Last 7 Days', count: null },
                { value: 'last30days', label: 'Last 30 Days', count: null }
            ]
        }
    ];

    const getTotalActiveFilters = () => {
        return filters.employmentType.length + filters.remoteWork.length + filters.datePosted.length;
    };

    const handleFilterToggle = (filterType, value, checked) => {
        onFilterChange(filterType, value, checked);
    };

    return (
        <div className="filter-sidebar">
            {/* Filter Header */}
            <Card className="filter-header-card mb-3">
                <Card.Body className="p-3">
                    <div className="filter-header">
                        <h5 className="filter-title mb-2 d-flex align-items-center">
                            <Filter className="me-2" size={18} />
                            Filters
                        </h5>
                        <div className="filter-stats d-flex align-items-center">
                            <Badge bg="primary" className="results-badge">
                                {totalResults} Result{totalResults !== 1 ? 's' : ''}
                            </Badge>
                            {getTotalActiveFilters() > 0 && (
                                <Badge bg="secondary" className="ms-2">
                                    {getTotalActiveFilters()} Active
                                </Badge>
                            )}
                        </div>
                    </div>
                    {getTotalActiveFilters() > 0 && (
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="clear-all-btn mt-2 d-flex align-items-center"
                            onClick={onClearAll}
                        >
                            <X className="me-1" size={14} />
                            Clear All
                        </Button>
                    )}
                </Card.Body>
            </Card>

            {/* Filter Groups */}
            {filterGroups.map((group) => (
                <Card key={group.key} className="filter-group-card mb-3">
                    <Card.Body className="p-3">
                        <h6 className="filter-group-title mb-3 d-flex align-items-center">
                            <group.icon className="me-2 text-muted" size={16} />
                            {group.title}
                            {filters[group.key].length > 0 && (
                                <Badge bg="primary" className="ms-2 filter-count-badge">
                                    {filters[group.key].length}
                                </Badge>
                            )}
                        </h6>
                        
                        <div className="filter-options">
                            {group.options.map((option) => (
                                <Form.Check
                                    key={option.value}
                                    type="checkbox"
                                    id={`${group.key}-${option.value}`}
                                    label={
                                        <div className="filter-option-label">
                                            <span className="option-text">{option.label}</span>
                                            {option.count && (
                                                <span className="option-count">({option.count})</span>
                                            )}
                                        </div>
                                    }
                                    checked={filters[group.key].includes(option.value)}
                                    onChange={(e) => handleFilterToggle(group.key, option.value, e.target.checked)}
                                    className="filter-checkbox mb-2"
                                />
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            ))}

            {/* Filter Tips */}
            <Card className="filter-tips-card">
                <Card.Body className="p-3">
                    <h6 className="tips-title mb-2 d-flex align-items-center">
                        <Lightbulb className="me-2 text-warning" size={18} />
                        Search Tips
                    </h6>
                    <ul className="tips-list small text-muted">
                        <li>Use multiple filters to narrow your search</li>
                        <li>Clear filters to see all available jobs</li>
                        <li>Try different keywords in the search box</li>
                        <li>Save jobs you're interested in for later</li>
                    </ul>
                </Card.Body>
            </Card>
        </div>
    );
};

export default FilterSidebar;