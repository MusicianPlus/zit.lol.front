import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Table, Spinner, Tabs, Tab } from 'react-bootstrap';
import { ImporterService } from '../../api/importer'; // Import the new service
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Define interfaces for better type safety
interface Status {
    message: string;
    variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
}

// Assuming uploadData is an array of objects where keys are CSV headers and values are string
interface UploadDataItem {
    [key: string]: string;
}

interface SelectedMapping {
    [key: string]: string;
}

const CsvUploader: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<Status | null>(null);
    const [uploadData, setUploadData] = useState<UploadDataItem[] | null>(null);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [dbColumns, setDbColumns] = useState<string[]>([]); // Assuming dbColumns are strings
    const [selectedMapping, setSelectedMapping] = useState<SelectedMapping>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('upload');

    const { t } = useTranslation(); // Initialize useTranslation

    useEffect(() => {
        const fetchDbColumns = async () => {
            try {
                // Use ImporterService to fetch columns
                const columns = await ImporterService.getComponentColumns();
                setDbColumns(columns);
            } catch (err: any) {
                console.error(t('error') + ':', err); // Translated
                setStatus({ message: t('stock_info_loading_error'), variant: 'danger' }); // Translated
            }
        };
        fetchDbColumns();
    }, []);

    useEffect(() => {
        if (uploadData && uploadData.length > 0) {
            setCsvHeaders(Object.keys(uploadData[0]));
            setActiveTab('mapping');
        } else {
            setCsvHeaders([]);
        }
    }, [uploadData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setStatus(null);
            setUploadData(null);
            setCsvHeaders([]);
            setSelectedMapping({});
            setActiveTab('upload');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setStatus({ message: t('select_file'), variant: 'warning' }); // Translated
            return;
        }

        setStatus({ message: t('file_uploading'), variant: 'info' }); // Translated
        setLoading(true);

        try {
            // Use ImporterService to upload file
            const res = await ImporterService.uploadCsvFile(file);
            setUploadData(res.data);
            setStatus({ message: t('file_uploaded_success'), variant: 'success' }); // Translated
        } catch (err: any) {
            setStatus({ message: t('upload_error', { message: err.response?.data?.message || err.message }), variant: 'danger' }); // Translated
        } finally {
            setLoading(false);
        }
    };

    const handleMappingChange = (dbField: string, csvHeader: string) => {
        setSelectedMapping(prev => ({
            ...prev,
            [dbField]: csvHeader
        }));
    };

    const handleProcess = async () => {
        if (!uploadData || !selectedMapping.manufacturer_part_number || !selectedMapping.quantity) {
            setStatus({ message: t('mapping_missing_required'), variant: 'warning' }); // Translated
            return;
        }
    
        const supplierName = 'LCSC'; 
        setStatus({ message: t('data_processing'), variant: 'info' }); // Translated
        setLoading(true);

        try {
            // Use ImporterService to process data
            const res = await ImporterService.processCsvData({
                data: uploadData,
                mapping: selectedMapping,
                supplierName
            });
            setStatus({ message: t('data_processed_success', { summary: JSON.stringify(res.summary) }), variant: 'success' }); // Translated
        } catch (err: any) {
            setStatus({ message: t('processing_error', { message: err.response?.data?.message || err.message }), variant: 'danger' }); // Translated
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
                    {status && (
                        <Alert 
                            variant={status.variant} 
                            onClose={() => setStatus(null)} 
                            dismissible
                            className="mb-3"
                        >
                            {status.message}
                        </Alert>
                    )}
            <Card className="shadow-sm mb-4 mx-auto">
                <Card.Header>
                    <Card.Title className="mb-0 text-primary fw-bold">{t('upload_csv_components')}</Card.Title> {/* Translated */}
                </Card.Header>
                <Card.Body className="d-flex justify-content-center align-items-center flex-column">
                    
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k as string)}
                        id="csv-uploader-tabs"
                        className="mb-3"
                    >
                        <Tab eventKey="upload" title={t('upload_csv')}> {/* Translated */}
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Label className="fw-bold">{t('select_file')}</Form.Label> {/* Translated */}
                                <div className="d-flex align-items-center">
                                    <Form.Control 
                                        type="file" 
                                        onChange={handleFileChange} 
                                        className="me-2"
                                    />
                                    <Button 
                                        variant="primary" 
                                        onClick={handleUpload} 
                                        disabled={loading || !file}
                                    >
                                        {loading ? <Spinner as="span" animation="border" size="sm" /> : t('upload')} {/* Translated */}
                                    </Button>
                                </div>
                            </Form.Group>
                        </Tab>

                        <Tab eventKey="mapping" title={t('map_columns')} disabled={!uploadData}> {/* Translated */}
                            {uploadData && (
                                <>
                                    <p className="text-muted">
                                        {t('map_csv_db_columns')}
                                        {t('mandatory_fields')}: <strong className="text-danger">manufacturer_part_number</strong> ve <strong className="text-danger">quantity</strong>.
                                    </p>
                                    <div className="table-responsive">
                                        <Table striped bordered hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>{t('db_field')}</th> {/* Translated */}
                                                    <th>{t('csv_column')}</th> {/* Translated */}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dbColumns.map(dbColumn => (
                                                    <tr key={dbColumn}>
                                                        <td><strong>{dbColumn}</strong></td>
                                                        <td>
                                                            <Form.Select
                                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleMappingChange(dbColumn, e.target.value)}
                                                                value={selectedMapping[dbColumn] || ''}
                                                            >
                                                                <option value="">{t('select_option')}</option> {/* Translated */}
                                                                {csvHeaders.map(header => (
                                                                    <option key={header} value={header}>{header}</option>
                                                                ))}
                                                            </Form.Select>
                                                        </td>
                                                    </tr>
                                                ))}
                                                
                                            </tbody>
                                        </Table>
                                    </div>
                                    <Button 
                                        variant="primary" 
                                        onClick={handleProcess} 
                                        className="w-30 mt-2" 
                                        disabled={loading || !selectedMapping.manufacturer_part_number || !selectedMapping.quantity}
                                    >
                                        {loading ? <Spinner as="span" animation="border" size="sm" /> : t('process_and_save_data')} {/* Translated */}
                                    </Button>
                                </>
                            )}
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </>
    );
};

export default CsvUploader;