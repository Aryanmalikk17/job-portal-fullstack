import React from 'react';
import { Row, Col } from 'react-bootstrap';

/**
 * SkeletonCard — pulsing placeholder to replace spinner loading states.
 * Eliminates Cumulative Layout Shift (CLS) by reserving space before content loads.
 *
 * Props:
 *   count  {number}  - number of skeleton cards to render (default 6)
 *   cols   {number}  - Bootstrap lg columns per card (default 6 = 2-col grid)
 */
const SkeletonCard = ({ count = 6, cols = 6 }) => {
    return (
        <Row>
            {Array.from({ length: count }).map((_, i) => (
                <Col lg={cols} key={i} className="mb-4">
                    <div
                        style={{
                            background: 'white',
                            borderRadius: 20,
                            padding: '1.5rem',
                            boxShadow: '0 4px 15px rgba(0,0,0,.07)',
                            border: '1px solid #e2e8f0',
                        }}
                    >
                        {/* Header row: company logo placeholder + badge */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div
                                className="skeleton"
                                style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }}
                            />
                            <div className="skeleton skeleton-badge" />
                        </div>

                        {/* Job title */}
                        <div className="skeleton skeleton-title" />

                        {/* Company name */}
                        <div className="skeleton skeleton-text" style={{ width: '45%' }} />

                        {/* Location + remote tags */}
                        <div className="d-flex gap-2 mt-3 mb-3">
                            <div className="skeleton" style={{ height: 24, width: 90, borderRadius: 20 }} />
                            <div className="skeleton" style={{ height: 24, width: 70, borderRadius: 20 }} />
                        </div>

                        {/* Description lines */}
                        <div className="skeleton skeleton-text" />
                        <div className="skeleton skeleton-text" style={{ width: '80%' }} />

                        {/* Action buttons */}
                        <div className="d-flex gap-2 mt-4">
                            <div className="skeleton" style={{ height: 36, flex: 1, borderRadius: 10 }} />
                            <div className="skeleton" style={{ height: 36, width: 48, borderRadius: 10 }} />
                        </div>
                    </div>
                </Col>
            ))}
        </Row>
    );
};

export default SkeletonCard;
