import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const EmptyState = ({ type = 'no-jobs', onAction, searchTerm, filters }) => {
    const getEmptyStateContent = () => {
        switch (type) {
            case 'no-jobs':
                return {
                    icon: 'fas fa-heart',
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
                    icon: 'fas fa-search',
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
                    icon: 'fas fa-check-circle',
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
                    icon: 'fas fa-clock',
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
                    icon: 'fas fa-heart',
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

    const handleAction = () => {
        if (onAction) {
            onAction();
        }
    };

    return (
        <div className="empty-state">
            <Card className="empty-state-card">
                <Card.Body className="text-center p-5">
                    <div className="empty-state-icon mb-4">
                        <i className={`${content.icon} fa-4x text-muted`}></i>
                    </div>
                    
                    <div className="empty-state-content">
                        <h3 className="empty-state-title mb-3">
                            {content.title}
                        </h3>
                        
                        <p className="empty-state-message text-muted mb-2">
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
                                    className="empty-state-action-btn"
                                >
                                    <i className="fas fa-plus me-2"></i>
                                    {content.actionText}
                                </Button>
                            ) : (
                                <Button
                                    variant={content.actionVariant}
                                    size="lg"
                                    onClick={handleAction}
                                    className="empty-state-action-btn"
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
                                    className="ms-3"
                                >
                                    <i className="fas fa-search me-2"></i>
                                    Browse All Jobs
                                </Button>
                            )}
                        </div>
                        
                        {content.tips.length > 0 && (
                            <div className="empty-state-tips">
                                <h6 className="tips-title text-muted mb-3">
                                    <i className="fas fa-lightbulb me-2"></i>
                                    Pro Tips:
                                </h6>
                                <ul className="tips-list text-start">
                                    {content.tips.map((tip, index) => (
                                        <li key={index} className="tip-item text-muted">
                                            <i className="fas fa-check-circle text-success me-2"></i>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    
                    {type === 'no-jobs' && (
                        <div className="empty-state-features mt-4">
                            <div className="row">
                                <div className="col-md-4">
                                    <div className="feature-item">
                                        <i className="fas fa-heart fa-2x text-primary mb-2"></i>
                                        <h6>Save for Later</h6>
                                        <small className="text-muted">
                                            Bookmark interesting jobs to review when you have time
                                        </small>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="feature-item">
                                        <i className="fas fa-paper-plane fa-2x text-success mb-2"></i>
                                        <h6>Quick Apply</h6>
                                        <small className="text-muted">
                                            Apply directly from your saved jobs list
                                        </small>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="feature-item">
                                        <i className="fas fa-filter fa-2x text-info mb-2"></i>
                                        <h6>Stay Organized</h6>
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