import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Alert, Table, Spinner, Tabs, Tab } from 'react-bootstrap';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CsvUploader = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState(null); // Nesne olarak güncellendi
    const [uploadData, setUploadData] = useState(null);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [dbColumns, setDbColumns] = useState([]);
    const [selectedMapping, setSelectedMapping] = useState({});
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('upload');

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const UPLOAD_URL = `${API_BASE_URL}/api/importer/upload-file`;
    const PROCESS_URL = `${API_BASE_URL}/api/importer/process-csv`;
    const COLUMNS_URL = `${API_BASE_URL}/api/components/columns`;

    useEffect(() => {
        const fetchDbColumns = async () => {
            try {
                const res = await axios.get(COLUMNS_URL);
                setDbColumns(res.data);
            } catch (err) {
                console.error('Veritabanı sütunları alınamadı:', err);
                setStatus({ message: 'Veritabanı sütunları alınırken bir hata oluştu.', variant: 'danger' });
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

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setStatus(null);
        setUploadData(null);
        setCsvHeaders([]);
        setSelectedMapping({});
        setActiveTab('upload');
    };

    const handleUpload = async () => {
        if (!file) {
            setStatus({ message: 'Lütfen bir dosya seçin.', variant: 'warning' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        setStatus({ message: 'Dosya yükleniyor...', variant: 'info' });
        setLoading(true);

        try {
            const res = await axios.post(UPLOAD_URL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUploadData(res.data.data);
            setStatus({ message: 'Dosya başarıyla yüklendi. Şimdi sütunları eşleyin.', variant: 'success' });
        } catch (err) {
            setStatus({ message: 'Yükleme hatası: ' + (err.response?.data?.message || err.message), variant: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleMappingChange = (dbField, csvHeader) => {
        setSelectedMapping(prev => ({
            ...prev,
            [dbField]: csvHeader
        }));
    };

    const handleProcess = async () => {
        if (!uploadData || !selectedMapping.manufacturer_part_number || !selectedMapping.quantity) {
            setStatus({ message: 'Eşleme eksik: "manufacturer_part_number" ve "quantity" alanları zorunludur.', variant: 'warning' });
            return;
        }
    
        const supplierName = 'LCSC'; 
        setStatus({ message: 'Veriler işleniyor...', variant: 'info' });
        setLoading(true);

        try {
            const res = await axios.post(PROCESS_URL, {
                data: uploadData,
                mapping: selectedMapping,
                supplierName
            });
            setStatus({ message: 'Veriler başarıyla işlendi ve kaydedildi. Özet: ' + JSON.stringify(res.data.summary), variant: 'success' });
        } catch (err) {
            setStatus({ message: 'İşleme hatası: ' + (err.response?.data?.message || err.message), variant: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="my-4">
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
            <Card className="shadow-sm mb-4">
                <Card.Header>
                    <Card.Title className="mb-0 text-primary fw-bold">CSV ile Komponent Yükle</Card.Title>
                </Card.Header>
                <Card.Body>
                    
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        id="csv-uploader-tabs"
                        className="mb-3"
                    >
                        <Tab eventKey="upload" title="1. CSV Yükle">
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Label className="fw-bold">Dosya Seçin</Form.Label>
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
                                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Yükle'}
                                    </Button>
                                </div>
                            </Form.Group>
                        </Tab>

                        <Tab eventKey="mapping" title="2. Sütunları Eşle" disabled={!uploadData}>
                            {uploadData && (
                                <>
                                    <p className="text-muted">
                                        Lütfen CSV dosyanızdaki sütunları veritabanındaki alanlarla eşleştirin.
                                        Zorunlu alanlar: <strong className="text-danger">manufacturer_part_number</strong> ve <strong className="text-danger">quantity</strong>.
                                    </p>
                                    <div className="table-responsive">
                                        <Table striped bordered hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>Veritabanı Alanı</th>
                                                    <th>CSV Sütunu</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dbColumns.map(dbColumn => (
                                                    <tr key={dbColumn}>
                                                        <td><strong>{dbColumn}</strong></td>
                                                        <td>
                                                            <Form.Select
                                                                onChange={(e) => handleMappingChange(dbColumn, e.target.value)}
                                                                value={selectedMapping[dbColumn] || ''}
                                                            >
                                                                <option value="">Seçim Yapın</option>
                                                                {csvHeaders.map(header => (
                                                                    <option key={header} value={header}>{header}</option>
                                                                ))}
                                                            </Form.Select>
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td><strong>quantity</strong></td>
                                                    <td>
                                                        <Form.Select
                                                            onChange={(e) => handleMappingChange('quantity', e.target.value)}
                                                            value={selectedMapping['quantity'] || ''}
                                                        >
                                                            <option value="">Seçim Yapın</option>
                                                            {csvHeaders.map(header => (
                                                                <option key={header} value={header}>{header}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                    <Button 
                                        variant="primary" 
                                        onClick={handleProcess} 
                                        className="w-30 mt-2" 
                                        disabled={loading || !selectedMapping.manufacturer_part_number || !selectedMapping.quantity}
                                    >
                                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Verileri İşle ve Kaydet'}
                                    </Button>
                                </>
                            )}
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CsvUploader;