import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Table, Spinner, Alert, Row, Col, Tab, Tabs } from 'react-bootstrap';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PcbManager = () => {
    const [pcbs, setPcbs] = useState([]);
    const [allComponents, setAllComponents] = useState([]);
    const [selectedPcbId, setSelectedPcbId] = useState('');
    const [bomFile, setBomFile] = useState(null);
    const [bomData, setBomData] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [columnMapping, setColumnMapping] = useState({
        manufacturer_part_number: '',
        designator: ''
    });
    const [componentSelections, setComponentSelections] = useState({});
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('pcbSelect');

    const PCB_API_URL = `${API_BASE_URL}/api/pcb`;
    const COMPONENTS_API_URL = `${API_BASE_URL}/api/components`;

    // PCB'leri ve tüm bileşenleri yükle
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const pcbRes = await axios.get(PCB_API_URL);
                setPcbs(pcbRes.data);
                const componentsRes = await axios.get(`${COMPONENTS_API_URL}/all`);
                setAllComponents(componentsRes.data);
            } catch (err) {
                setStatus('Veriler yüklenirken bir hata oluştu.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // BOM yüklendiğinde ve sütun eşleşmeleri yapıldığında otomatik eşleştirme yap
    useEffect(() => {
        if (bomData.length > 0 && columnMapping.manufacturer_part_number && allComponents.length > 0) {
            const newSelections = {};
            bomData.forEach((bomItem, index) => {
                const bomMpn = bomItem[columnMapping.manufacturer_part_number];
                // Envanterdeki bileşenlerde BOM MPN'sini ara
                const matchedComponent = allComponents.find(
                    comp => comp.manufacturer_part_number === bomMpn
                );

                if (matchedComponent) {
                    newSelections[index] = matchedComponent.component_id;
                }
            });
            setComponentSelections(newSelections);
        }
    }, [bomData, columnMapping.manufacturer_part_number, allComponents]); // Bu bağımlılıklar değiştiğinde çalışır


    const handlePcbSelect = (e) => {
        const pcbId = e.target.value;
        setSelectedPcbId(pcbId);
        if (pcbId) {
            setActiveTab('bomUpload');
            setBomData([]);
            setCsvHeaders([]);
            setStatus('');
            setComponentSelections({});
        }
    };

    const handleFileChange = (e) => {
        setBomFile(e.target.files[0]);
        setStatus('');
        setBomData([]);
        setCsvHeaders([]);
        setComponentSelections({});
    };

    const handleBomUpload = async () => {
        if (!selectedPcbId) {
            setStatus('Lütfen önce bir PCB seçin.');
            return;
        }
        if (!bomFile) {
            setStatus('Lütfen bir BOM dosyası seçin.');
            return;
        }

        const formData = new FormData();
        formData.append('bomFile', bomFile);

        setStatus('BOM dosyası yükleniyor ve işleniyor...');
        setLoading(true);

        try {
            const res = await axios.post(`${PCB_API_URL}/upload-bom`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.bomData.length > 0) {
                const headers = Object.keys(res.data.bomData[0]);
                setCsvHeaders(headers);
                setBomData(res.data.bomData);
                setStatus('BOM dosyası başarıyla yüklendi. Şimdi eşleştirme yapın.');
                setActiveTab('columnMapping');
            } else {
                setStatus('Yüklenen dosyada veri bulunamadı.');
            }
        } catch (err) {
            setStatus('Yükleme hatası: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleColumnMappingChange = (e) => {
        const { name, value } = e.target;
        const newMapping = { ...columnMapping, [name]: value };
        setColumnMapping(newMapping);
        
        if (newMapping.manufacturer_part_number && newMapping.designator) {
            setActiveTab('componentMatching');
        }
    };

    const handleComponentSelectChange = (e, index) => {
        const { value } = e.target;
        setComponentSelections(prev => ({ ...prev, [index]: value }));
    };

    const handleFinalizeMapping = async () => {
        if (!columnMapping.manufacturer_part_number || !columnMapping.designator) {
            setStatus('Lütfen tüm zorunlu alanları eşleştirin.');
            return;
        }

        // Bileşenleri MPN'ye göre grupla ve adetlerini say
        const groupedBomData = bomData.reduce((acc, item, index) => {
            const mpn = item[columnMapping.manufacturer_part_number];
            const designator = item[columnMapping.designator];
            const componentId = componentSelections[index] || null;

            if (!acc[mpn]) {
                acc[mpn] = {
                    component_id: componentId,
                    manufacturer_part_number: mpn,
                    designators: [designator],
                    quantity: 1,
                    is_matched: !!componentId
                };
            } else {
                acc[mpn].designators.push(designator);
                acc[mpn].quantity++;
            }
            return acc;
        }, {});

        // Gruplanmış veriyi API'ye göndereceğimiz formata dönüştür
        const finalBomData = Object.values(groupedBomData).map(item => ({
            component_id: item.component_id,
            manufacturer_part_number: item.manufacturer_part_number,
            quantity: item.quantity,
            designators: item.designators
        }));

        const unmappedCount = finalBomData.filter(item => !item.component_id).length;
        const mappedCount = finalBomData.length - unmappedCount;

        if (mappedCount === 0 && unmappedCount === 0) {
            setStatus('Kaydedilecek veri bulunamadı.');
            return;
        }

        setStatus(`BOM verileri (${mappedCount} eşleşmiş, ${unmappedCount} eşleşmemiş parça) backend'e gönderiliyor...`);
        setLoading(true);

        try {
            await axios.post(`${PCB_API_URL}/save-bom`, {
                pcbId: selectedPcbId,
                bomData: finalBomData
            });
            setStatus('BOM verileri başarıyla kaydedildi!');
        } catch (err) {
            setStatus('Kaydetme hatası: ' + (err.response?.data?.message || err.message));
            console.error('BOM kaydetme hatası:', err);
        } finally {
            setLoading(false);
        }
    };
    
    // Sayfalama mantığı
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = bomData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(bomData.length / itemsPerPage);

    const paginatePrev = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const paginateNext = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));


    return (
        <Container className="my-4">
            <Card className="shadow-sm mb-4">
                <Card.Header>
                    <h5 className="mb-0 text-primary fw-bold">PCB BOM Yönetimi</h5>
                </Card.Header>
                <Card.Body>
                    {status && (
                        <Alert variant={status.includes('hata') ? 'danger' : 'success'}>
                            {status}
                        </Alert>
                    )}

                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        id="uncontrolled-tab-example"
                        className="mb-3"
                    >
                        <Tab eventKey="pcbSelect" title="1. PCB Seçin">
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold">Bir PCB Seçin</Form.Label>
                                <Form.Select onChange={handlePcbSelect} value={selectedPcbId}>
                                    <option value="">-- PCB Seç --</option>
                                    {pcbs.map(pcb => (
                                        <option key={pcb.pcb_id} value={pcb.pcb_id}>
                                            {pcb.pcb_name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Tab>

                        <Tab eventKey="bomUpload" title="2. BOM Yükle" disabled={!selectedPcbId}>
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold">BOM Dosyasını Yükle</Form.Label>
                                <div className="d-flex align-items-center">
                                    <Form.Control
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".csv"
                                        className="me-2"
                                        disabled={loading}
                                    />
                                    <Button
                                        onClick={handleBomUpload}
                                        disabled={loading || !bomFile}
                                        variant="primary"
                                    >
                                        {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Yükle'}
                                    </Button>
                                </div>
                            </Form.Group>
                        </Tab>

                        <Tab eventKey="columnMapping" title="3. Sütun Eşleştir" disabled={!bomData.length}>
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold">Sütunları Eşleştir</Form.Label>
                                <Row>
                                    <Col md={6}>
                                        <Form.Label>Parça Numarası (MPN):</Form.Label>
                                        <Form.Select
                                            name="manufacturer_part_number"
                                            value={columnMapping.manufacturer_part_number}
                                            onChange={handleColumnMappingChange}
                                        >
                                            <option value="">-- Seç --</option>
                                            {csvHeaders.map(header => (
                                                <option key={header} value={header}>{header}</option>
                                            ))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label>Designator:</Form.Label>
                                        <Form.Select
                                            name="designator"
                                            value={columnMapping.designator}
                                            onChange={handleColumnMappingChange}
                                        >
                                            <option value="">-- Seç --</option>
                                            {csvHeaders.map(header => (
                                                <option key={header} value={header}>{header}</option>
                                            ))}
                                        </Form.Select>
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Tab>

                        <Tab eventKey="componentMatching" title="4. Bileşenleri Eşleştir" disabled={!columnMapping.manufacturer_part_number || !columnMapping.designator}>
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
                                            <th className="align-middle">Designator</th>
                                            <th className="align-middle">Parça No (BOM)</th>
                                            <th className="align-middle">Envanterdeki Komponent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((item, index) => (
                                            <tr key={indexOfFirstItem + index}>
                                                <td className="align-middle">{item[columnMapping.designator]}</td>
                                                <td className="align-middle">{item[columnMapping.manufacturer_part_number]}</td>
                                                <td className="align-middle">
                                                    <Form.Select 
                                                        onChange={(e) => handleComponentSelectChange(e, indexOfFirstItem + index)} 
                                                        value={componentSelections[indexOfFirstItem + index] || ''}
                                                    >
                                                        <option value="">-- Eşleştir --</option>
                                                        {allComponents.map(comp => (
                                                            <option key={comp.component_id} value={comp.component_id}>
                                                                {comp.manufacturer_part_number} - {comp.component_name}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            <div className="d-grid mt-4">
                                <Button
                                    variant="success"
                                    onClick={handleFinalizeMapping}
                                    disabled={loading}
                                >
                                    {loading ? <Spinner animation="border" size="sm" /> : 'Eşleştirmeyi Onayla ve BOM\'u Kaydet'}
                                </Button>
                            </div>
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PcbManager;