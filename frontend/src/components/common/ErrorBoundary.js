import React from 'react';
import { Alert, Container, Button } from 'react-bootstrap';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Container className="my-5">
                    <Alert variant="danger" className="text-center border-0 shadow-sm glass-card rounded-4 p-5">
                        <div className="d-flex justify-content-center mb-4">
                            <div className="bg-soft-danger p-3 rounded-circle">
                                <AlertTriangle size={48} className="text-danger" />
                            </div>
                        </div>
                        <Alert.Heading className="fw-bold mb-3">
                            Something went wrong!
                        </Alert.Heading>
                        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '500px' }}>
                            We're sorry, but something unexpected happened in the application. 
                            Please try refreshing the page or contact support if the problem persists.
                        </p>
                        <div className="d-flex justify-content-center gap-3">
                            <Button 
                                variant="danger" 
                                className="px-4 py-2 d-flex align-items-center shadow-sm"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCcw size={18} className="me-2" />
                                Refresh Page
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                className="px-4 py-2"
                                onClick={() => window.location.href = '/'}
                            >
                                Back to Home
                            </Button>
                        </div>
                    </Alert>
                    <style jsx>{`
                        .bg-soft-danger { background-color: #fff5f5; }
                    `}</style>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;