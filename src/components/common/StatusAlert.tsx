import React from 'react';
import { Alert } from 'react-bootstrap';

/**
 * Props for the StatusAlert component.
 * @interface StatusAlertProps
 */
interface StatusAlertProps {
    /**
     * The status message to display. If it contains 'hata' (error), the alert will be red (danger variant).
     * Otherwise, it will be green (success variant).
     */
    status: string;
}

/**
 * A reusable component for displaying status messages (success or error).
 * It automatically determines the alert variant based on the presence of 'hata' in the status message.
 * @param {StatusAlertProps} props - The props for the component.
 * @returns {React.FC<StatusAlertProps> | null} The StatusAlert component or null if no status is provided.
 */
const StatusAlert: React.FC<StatusAlertProps> = ({ status }) => {
    if (!status) {
        return null;
    }

    const variant = status.includes('hata') ? 'danger' : 'success';

    return (
        <Alert variant={variant}>
            {status}
        </Alert>
    );
};

export default StatusAlert;