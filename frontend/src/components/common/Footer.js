import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="modern-footer bg-dark text-light py-4 mt-auto">
            <Container>
                <Row>
                    <Col md={6}>
                        <h5>Zpluse Jobs Finder</h5>
                        <p className="text-muted">
                            Your gateway to finding the perfect job opportunities.
                        </p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <p className="text-muted">
                            © 2025 Zpluse Jobs Finder. All rights reserved.
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;