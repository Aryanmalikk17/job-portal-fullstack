import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const LoadingSpinner = ({ message = 'Loading...', size = 'lg' }) => {
    return (
        <Container fluid className="loading-container d-flex justify-content-center align-items-center">
            <div className="text-center">
                <Spinner 
                    animation="border" 
                    variant="primary" 
                    size={size}
                    className="mb-3"
                />
                <div className="text-muted">{message}</div>
            </div>
        </Container>
    );
};

export default LoadingSpinner;