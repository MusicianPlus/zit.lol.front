import React from 'react';
import { Table, Button } from 'react-bootstrap';

/**
 * Interface for a table header column.
 * @interface TableHeader
 */
interface TableHeader {
    /**
     * The display label for the header.
     */
    label: string;
    /**
     * A unique key for the header, often corresponding to a data property.
     */
    key: string;
}

/**
 * Props for the PaginatedTable component.
 * @interface PaginatedTableProps
 */
interface PaginatedTableProps {
    /**
     * An array of header objects defining the table columns.
     */
    headers: TableHeader[];
    /**
     * The data to be displayed in the current page of the table.
     * Consider a more specific type if possible based on the data structure.
     */
    data: any[]; 
    /**
     * A function that renders a table row for each item in the data array.
     * It receives the item and its index as arguments.
     */
    renderRow: (item: any, index: number) => React.ReactNode; 
    /**
     * The current active page number.
     */
    currentPage: number;
    /**
     * The total number of pages available.
     */
    totalPages: number;
    /**
     * Callback function to change the current page.
     */
    onPageChange: (page: number) => void;
    /**
     * The number of items to display per page. Not directly used in rendering, but useful for context.
     */
    itemsPerPage?: number; 
}

/**
 * A reusable component for displaying paginated data in a Bootstrap table.
 * It includes navigation buttons for pagination.
 * @param {PaginatedTableProps} props - The props for the component.
 * @returns {React.FC<PaginatedTableProps>} The PaginatedTable component.
 */
const PaginatedTable: React.FC<PaginatedTableProps> = ({
    headers,
    data,
    renderRow,
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage // This prop is not directly used in rendering but can be useful for context
}) => {
    const paginatePrev = () => onPageChange(Math.max(1, currentPage - 1));
    const paginateNext = () => onPageChange(Math.min(totalPages, currentPage + 1));

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 text-primary fw-bold">Bileşenleri Eşleştir</h5>
                <div className="d-flex">
                    <Button
                        variant="outline-primary"
                        onClick={paginatePrev}
                        disabled={currentPage === 1}
                        className="me-2"
                    >
                        « Önceki
                    </Button>
                    <Button
                        variant="outline-primary"
                        onClick={paginateNext}
                        disabled={currentPage === totalPages}
                    >
                        Sonraki »
                    </Button>
                </div>
            </div>
            <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.25rem', padding: '1rem', marginBottom: '1rem' }}>
                <Table striped bordered hover className="m-0">
                    <thead>
                        <tr>
                            {headers.map(header => (
                                <th key={header.key} className="align-middle">{header.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(renderRow)}
                    </tbody>
                </Table>
            </div>
        </>
    );
};

export default PaginatedTable;