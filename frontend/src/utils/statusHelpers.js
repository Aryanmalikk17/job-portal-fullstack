import React from 'react';
import { 
    Send, 
    Search, 
    Calendar, 
    UserCheck, 
    Award, 
    CheckCircle2, 
    XCircle, 
    ArrowLeft, 
    FileText 
} from 'lucide-react';

/**
 * Returns the appropriate Lucide icon component for a given application status.
 * @param {string} status - The application status string
 * @param {number} size - Optional size for the icon
 * @returns {JSX.Element}
 */
export const getStatusIcon = (status, size = 16) => {
    const iconMap = {
        'APPLIED': Send,
        'UNDER_REVIEW': Search,
        'INTERVIEW_SCHEDULED': Calendar,
        'INTERVIEWED': UserCheck,
        'OFFERED': Award,
        'HIRED': CheckCircle2,
        'REJECTED': XCircle,
        'WITHDRAWN': ArrowLeft
    };
    
    const IconComponent = iconMap[status] || FileText;
    return <IconComponent size={size} />;
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
