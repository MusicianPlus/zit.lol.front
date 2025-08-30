import React from 'react';
import { Spinner } from 'react-bootstrap';

/**
 * Props for the LoadingSpinner component.
 * @interface LoadingSpinnerProps
 */
interface LoadingSpinnerProps {
    /**
     * Determines whether the spinner should be visible.
     */
    show: boolean;
    /**
     * Optional text to display visually hidden for accessibility purposes.
     * Defaults to 'Yükleniyor...' (Loading...).
     */
    text?: string;
}

/**
 * A reusable component for displaying a loading spinner.
 * It uses Bootstrap's Spinner component.
 * @param {LoadingSpinnerProps} props - The props for the component.
 * @returns {React.FC<LoadingSpinnerProps> | null} The LoadingSpinner component or null if `show` is false.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ show, text = 'Yükleniyor...' }) => {
    if (!show) {
        return null;
    }

    return (
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" >
            <span className="visually-hidden">{text}</span>
        </Spinner>
    );
};

export default LoadingSpinner;