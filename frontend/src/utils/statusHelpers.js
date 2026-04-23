import React from 'react';
// Note: We use FontAwesome class names for now to ensure compatibility with 
// the current environment's stylesheet, but structured as a utility for easy Lucide migration.
export const getStatusIcon = (status) => {
    const iconMap = {
        'APPLIED': 'fa-paper-plane',
        'UNDER_REVIEW': 'fa-search',
        'INTERVIEW_SCHEDULED': 'fa-calendar-alt',
        'INTERVIEWED': 'fa-user-check',
        'OFFERED': 'fa-award',
        'HIRED': 'fa-check-circle',
        'REJECTED': 'fa-times-circle',
        'WITHDRAWN': 'fa-arrow-left'
    };
    return iconMap[status] || 'fa-file-alt';
};

export const getStatusColor = (status) => {
    const colorMap = {
        'APPLIED': 'primary',
        'UNDER_REVIEW': 'warning',
        'INTERVIEW_SCHEDULED': 'info',
        'INTERVIEWED': 'secondary',
        'OFFERED': 'success',
        'HIRED': 'success',
        'REJECTED': 'danger',
        'WITHDRAWN': 'secondary'
    };
    return colorMap[status] || 'secondary';
};

export const getStatusLabel = (status) => {
    if (!status) return 'N/A';
    return status.replace(/_/g, ' ').toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
