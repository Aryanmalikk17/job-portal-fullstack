import React from 'react';
import { Card } from 'react-bootstrap';

const StatsCard = ({ title, value, icon, color, subtitle, trend }) => {
    const getColorClass = (color) => {
        const colorMap = {
            primary: 'stats-card-primary',
            success: 'stats-card-success',
            info: 'stats-card-info',
            warning: 'stats-card-warning',
            danger: 'stats-card-danger'
        };
        return colorMap[color] || 'stats-card-primary';
    };

    const getIconColor = (color) => {
        const colorMap = {
            primary: 'text-primary',
            success: 'text-success',
            info: 'text-info',
            warning: 'text-warning',
            danger: 'text-danger'
        };
        return colorMap[color] || 'text-primary';
    };

    return (
        <Card className={`stats-card ${getColorClass(color)}`}>
            <Card.Body className="p-4">
                <div className="stats-content">
                    <div className="stats-icon">
                        <i className={`${icon} ${getIconColor(color)}`}></i>
                    </div>
                    <div className="stats-info">
                        <div className="stats-number">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                        <div className="stats-label">{title}</div>
                        {subtitle && (
                            <div className="stats-subtitle">{subtitle}</div>
                        )}
                        {trend && (
                            <div className={`stats-trend ${trend.type === 'up' ? 'trend-up' : 'trend-down'}`}>
                                <i className={`fas fa-arrow-${trend.type === 'up' ? 'up' : 'down'} me-1`}></i>
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