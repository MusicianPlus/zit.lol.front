import React, { ErrorInfo, ReactNode } from 'react';

/**
 * Props for the ErrorBoundary component.
 * @interface ErrorBoundaryProps
 */
interface ErrorBoundaryProps {
    /**
     * The child components that the ErrorBoundary will wrap.
     */
    children: ReactNode;
}

/**
 * State for the ErrorBoundary component.
 * @interface ErrorBoundaryState
 */
interface ErrorBoundaryState {
    /**
     * Indicates whether an error has occurred.
     */
    hasError: boolean;
    /**
     * The error object that was caught.
     */
    error: Error | null;
    /**
     * Information about the component stack where the error occurred.
     */
    errorInfo: ErrorInfo | null;
}

/**
 * A React Error Boundary component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the entire application.
 * @class ErrorBoundary
 * @extends {React.Component<ErrorBoundaryProps, ErrorBoundaryState>}
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    /**
     * Static method to update state when an error is thrown.
     * @param {Error} error - The error that was thrown.
     * @returns {ErrorBoundaryState} An object to update the state.
     */
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error: error };
    }

    /**
     * Lifecycle method to catch errors and log error information.
     * @param {Error} error - The error that was thrown.
     * @param {ErrorInfo} errorInfo - Information about the component stack where the error occurred.
     */
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo: errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h1>Bir şeyler ters gitti.</h1>
                    <p>Uygulamada beklenmedik bir hata oluştu.</p>
                    {this.state.error && (
                        <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', border: '1px solid #ccc', padding: '10px', margin: '20px auto', maxWidth: '600px' }}>
                            {this.state.error.toString()}
                            <br />
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </details>
                    )}
                    <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
                        Sayfayı Yenile
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;