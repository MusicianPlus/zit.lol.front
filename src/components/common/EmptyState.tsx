import React from 'react';
import { Card } from 'react-bootstrap';

/**
 * Props for the EmptyState component.
 * @interface EmptyStateProps
 */
interface EmptyStateProps {
    /**
     * The title or main message for the empty state.
     */
    title: string;
    /**
     * An optional subtitle or descriptive text.
     */
    message?: string;
    /**
     * Optional React node to display as an icon or illustration.
     */
    icon?: React.ReactNode;
    /**
     * Optional React node to display as a call to action (e.g., a Button).
     */
    callToAction?: React.ReactNode;
}

/**
 * A reusable component to display a clear message when there is no data or content to show.
 * @param {EmptyStateProps} props - The props for the component.
 * @returns {React.FC<EmptyStateProps>} The EmptyState component.
 */
const EmptyState: React.FC<EmptyStateProps> = ({ title, message, icon, callToAction }) => {
    return (
        <Card className="text-center p-4 my-4">
            <Card.Body>
                {icon && <div className="mb-3 text-muted" style={{ fontSize: '3rem' }}>{icon}</div>}
                <Card.Title as="h4">{title}</Card.Title>
                {message && <Card.Text className="text-muted">{message}</Card.Text>}
                {callToAction && <div className="mt-3">{callToAction}</div>}
            </Card.Body>
        </Card>
    );
};

export default EmptyState;
