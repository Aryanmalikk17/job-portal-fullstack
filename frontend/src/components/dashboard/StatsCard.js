import React from 'react';
import { Card } from 'react-bootstrap';
import { HelpCircle } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, color = 'primary', subtitle, trend }) => {
    // Map color names to modern CSS classes
    const getColorClass = (c) => {
        const colorMap = {
            primary: 'stats-card-primary',
            success: 'stats-card-success',
            info: 'stats-card-info',
            warning: 'stats-card-warning',
            danger: 'stats-card-danger'
        };
        return colorMap[c] || 'stats-card-primary';
    };

    const getIconColor = (c) => {
        const colorMap = {
            primary: 'text-primary',
            success: 'text-success',
            info: 'text-info',
            warning: 'text-warning',
            danger: 'text-danger'
        };
        return colorMap[c] || 'text-primary';
    };

    // Safe icon rendering: fallback to HelpCircle if Icon is not provided or invalid
    const IconComponent = Icon || HelpCircle;

    return (
        <Card className={`stats-card ${getColorClass(color)}`}>
            <Card.Body className="p-4">
                <div className="stats-content d-flex align-items-center">
                    <div className="stats-icon me-3">
                        <IconComponent size={24} className={getIconColor(color)} />
                    </div>
                    <div className="stats-info">
                        <div className="stats-number h3 mb-0 font-weight-bold">
                            {typeof value === 'number' ? value.toLocaleString() : (value || 0)}
                        </div>
                        <div className="stats-label text-muted">{title}</div>
                        {subtitle && (
                            <div className="stats-subtitle x-small text-muted">{subtitle}</div>
                        )}
                        {trend && (
                            <div className={`stats-trend ${trend.type === 'up' ? 'text-success' : 'text-danger'} small mt-1`}>
                                {trend.value}%
                            </div>
                        )}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default StatsCard;