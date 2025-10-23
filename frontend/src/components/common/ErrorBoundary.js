import React from 'react';
import { Alert, Container, Button } from 'react-bootstrap';

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
                    <Alert variant="danger" className="text-center">
                        <Alert.Heading>
                            <i className="fa fa-exclamation-triangle me-2"></i>
                            Something went wrong!
                        </Alert.Heading>
                        <p>
                            We're sorry, but something unexpected happened. 
                            Please try refreshing the page or contact support if the problem persists.
                        </p>
                        <hr />
                        <div className="d-flex justify-content-center">
                            <Button 
                                variant="outline-danger" 
                                onClick={() => window.location.reload()}
                            >
                                <i className="fa fa-refresh me-1"></i>
                                Refresh Page
                            </Button>
                        </div>
                    </Alert>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;