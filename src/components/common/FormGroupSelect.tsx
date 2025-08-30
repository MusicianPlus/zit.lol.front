import React from 'react';
import { Form } from 'react-bootstrap';

/**
 * Interface for a select option.
 * @interface Option
 */
interface Option {
    /**
     * The value of the option.
     */
    value: string;
    /**
     * The display label for the option.
     */
    label: string;
}

/**
 * Props for the FormGroupSelect component.
 * @interface FormGroupSelectProps
 */
interface FormGroupSelectProps {
    /**
     * The label for the form group.
     */
    label: string;
    /**
     * The name attribute for the select element.
     */
    name: string;
    /**
     * The current selected value of the select element.
     */
    value: string;
    /**
     * Event handler for when the select value changes.
     */
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    /**
     * An array of options to be displayed in the select dropdown.
     */
    options: Option[];
    /**
     * The placeholder text for the default option.
     */
    placeholder: string;
    /**
     * Determines if the select element is disabled. Defaults to false.
     */
    disabled?: boolean;
}

/**
 * A reusable form group component that renders a Bootstrap Form.Select element.
 * It handles the label, options, and basic change events.
 * @param {FormGroupSelectProps} props - The props for the component.
 * @returns {React.FC<FormGroupSelectProps>} The FormGroupSelect component.
 */
const FormGroupSelect: React.FC<FormGroupSelectProps> = ({ label, name, value, onChange, options, placeholder, disabled = false }) => {
    return (
        <Form.Group className="mb-4">
            <Form.Label className="fw-bold">{label}</Form.Label>
            <Form.Select
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
            >
                <option value="">{placeholder}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </Form.Select>
        </Form.Group>
    );
};

export default FormGroupSelect;