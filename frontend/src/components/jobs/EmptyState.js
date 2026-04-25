import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
    Heart, 
    Search, 
    CheckCircle2, 
    Clock, 
    Plus, 
    Lightbulb, 
    Send, 
    Filter 
} from 'lucide-react';

const EmptyState = ({ type = 'no-jobs', onAction, searchTerm, filters }) => {
    const getEmptyStateContent = () => {
        switch (type) {
            case 'no-jobs':
                return {
                    icon: Heart,
                    title: 'No Saved Jobs Yet',
                    message: 'Start building your collection of interesting job opportunities.',
                    submessage: 'Browse jobs and click the heart icon to save them for later.',
                    actionText: 'Browse Jobs',
                    actionLink: '/jobs',
                    actionVariant: 'primary',
                    tips: [
                        'Save jobs that interest you to review later',
                        'Apply to saved jobs when you\'re ready',
                        'Keep track of application deadlines'
                    ]
                };
            
            case 'no-results':
                return {
                    icon: Search,
                    title: 'No Jobs Found',
                    message: searchTerm ? 
                        `No saved jobs match "${searchTerm}"` : 
                        'No saved jobs match your current filters.',
                    submessage: 'Try adjusting your search or filters to find what you\'re looking for.',
                    actionText: 'Clear Filters',
                    actionVariant: 'outline-primary',
                    tips: [
                        'Try different keywords or remove some filters',
                        'Check for typos in your search',
                        'Browse all your saved jobs instead'
                    ]
                };
            
            case 'all-applied':
                return {
                    icon: CheckCircle2,
                    title: 'All Jobs Applied!',
                    message: 'Great job! You\'ve applied to all your saved jobs.',
                    submessage: 'Keep exploring new opportunities to grow your career.',
                    actionText: 'Find More Jobs',
                    actionLink: '/jobs',
                    actionVariant: 'success',
                    tips: [
                        'Save more jobs to keep your pipeline full',
                        'Follow up on your applications',
                        'Update your profile to attract recruiters'
                    ]
                };
            
            case 'expired':
                return {
                    icon: Clock,
                    title: 'All Applications Expired',
                    message: 'The application deadlines for your saved jobs have passed.',
                    submessage: 'Don\'t worry! New opportunities are posted every day.',
                    actionText: 'Find Fresh Jobs',
                    actionLink: '/jobs',
                    actionVariant: 'warning',
                    tips: [
                        'Set up job alerts to catch new postings',
                        'Apply to jobs as soon as you save them',
                        'Check saved jobs regularly for deadlines'
                    ]
                };
            
            default:
                return {
                    icon: Heart,
                    title: 'No Saved Jobs',
                    message: 'Your saved jobs collection is empty.',
                    submessage: 'Start saving jobs that interest you.',
                    actionText: 'Browse Jobs',
                    actionLink: '/jobs',
                    actionVariant: 'primary',
                    tips: []
                };
        }
    };

    const content = getEmptyStateContent();
    const IconComponent = content.icon;

    const handleAction = () => {
        if (onAction) {
            onAction();
        }
    };

    return (
        <div className="empty-state">
            <Card className="empty-state-card border-0 shadow-sm">
                <Card.Body className="text-center p-5">
                    <div className="empty-state-icon mb-4">
                        <IconComponent size={64} className="text-muted opacity-50" />
                    </div>
                    
                    <div className="empty-state-content">
                        <h3 className="empty-state-title mb-3 fw-bold">
                            {content.title}
                        </h3>
                        
                        <p className="empty-state-message text-muted mb-2 fs-5">
                            {content.message}
                        </p>
                        
                        <p className="empty-state-submessage text-muted mb-4">
                            {content.submessage}
                        </p>
                        
                        <div className="empty-state-actions mb-4">
                            {content.actionLink ? (
                                <Button
                                    as={Link}
                                    to={content.actionLink}
                                    variant={content.actionVariant}
                                    size="lg"
                                    className="empty-state-action-btn px-4 d-inline-flex align-items-center"
                                >
                                    <Plus size={20} className="me-2" />
                                    {content.actionText}
                                </Button>
                            ) : (
                                <Button
                                    variant={content.actionVariant}
                                    size="lg"
                                    onClick={handleAction}
                                    className="empty-state-action-btn px-4"
                                >
                                    {content.actionText}
                                </Button>
                            )}
                            
                            {type === 'no-results' && (
                                <Button
                                    as={Link}
                                    to="/jobs"
                                    variant="outline-secondary"
                                    size="lg"
                                    className="ms-3 px-4 d-inline-flex align-items-center"
                                >
                                    <Search size={20} className="me-2" />
                                    Browse All Jobs
                                </Button>
                            )}
                        </div>
                        
                        {content.tips.length > 0 && (
                            <div className="empty-state-tips mt-5">
                                <h6 className="tips-title text-muted mb-3 d-flex align-items-center justify-content-center">
                                    <Lightbulb size={18} className="me-2 text-warning" />
                                    Pro Tips:
                                </h6>
                                <ul className="tips-list text-start mx-auto" style={{ maxWidth: '400px' }}>
                                    {content.tips.map((tip, index) => (
                                        <li key={index} className="tip-item text-muted mb-2 d-flex align-items-start">
                                            <CheckCircle2 size={16} className="text-success me-2 mt-1 flex-shrink-0" />
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    
                    {type === 'no-jobs' && (
                        <div className="empty-state-features mt-5 pt-4 border-top">
                            <div className="row g-4">
                                <div className="col-md-4">
                                    <div className="feature-item">
                                        <Heart size={32} className="text-primary mb-3" />
                                        <h6 className="fw-bold">Save for Later</h6>
                                        <small className="text-muted">
                                            Bookmark interesting jobs to review when you have time
                                        </small>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="feature-item">
                                        <Send size={32} className="text-success mb-3" />
                                        <h6 className="fw-bold">Quick Apply</h6>
                                        <small className="text-muted">
                                            Apply directly from your saved jobs list
                                        </small>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="feature-item">
                                        <Filter size={32} className="text-info mb-3" />
                                        <h6 className="fw-bold">Stay Organized</h6>
                                        <small className="text-muted">
                                            Filter and sort your saved jobs to stay organized
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default EmptyState;