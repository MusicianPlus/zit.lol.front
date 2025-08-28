import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Table, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PcbMapper = () => {
    const [pcbs, setPcbs] = useState([]);
    const [allComponents, setAllComponents] = useState([]);
    const [selectedPcbId, setSelectedPcbId] = useState('');
    const [bomData, setBomData] = useState([]);
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

    // Seçili PCB değiştiğinde mevcut BOM'u yükle
    useEffect(() => {
        if (selectedPcbId) {
            fetchExistingBomData(selectedPcbId);
        } else {
            setBomData([]);
            setComponentSelections({});
        }
    }, [selectedPcbId]);

    const fetchExistingBomData = async (pcbId) => {
        setLoading(true);
        setStatus('PCB BOM verileri yükleniyor...');
        setBomData([]);
        setComponentSelections({});
        try {
            const res = await axios.get(`${PCB_API_URL}/${pcbId}/mapped-bom`);
            const fetchedBomData = res.data;
            setBomData(fetchedBomData);
            
            const newSelections = {};
            fetchedBomData.forEach((item) => {
                if (item.component_id) {
                    newSelections[item.component_in_pcb_id] = item.component_id;
                } else {
                    const matchedComponent = allComponents.find(
                        comp => comp.manufacturer_part_number === item.bom_mpn
                    );
                    if (matchedComponent) {
                        newSelections[item.component_in_pcb_id] = matchedComponent.component_id;
                    }
                }
            });
            
            setComponentSelections(newSelections);
            setStatus('BOM verileri başarıyla yüklendi. Şimdi eşleştirme yapabilirsiniz.');
            setActiveTab('componentMatching');
            
        } catch (err) {
            setStatus('Mevcut BOM verisi alınırken hata: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handlePcbSelect = (e) => {
        const pcbId = e.target.value;
        setSelectedPcbId(pcbId);
    };

    const handleComponentSelectChange = (e, bomItemId) => {
        const { value } = e.target;
        setComponentSelections(prevSelections => ({
            ...prevSelections,
            [bomItemId]: value
        }));
    };

    const handleFinalizeMapping = async () => {
        const updates = bomData.map(item => {
            const selectedComponentId = componentSelections[item.component_in_pcb_id] || null;
            return {
                component_in_pcb_id: item.component_in_pcb_id,
                component_id: selectedComponentId
            };
        });

        setStatus(`Eşleştirme güncellemeleri gönderiliyor...`);
        setLoading(true);

        try {
            await axios.put(`${PCB_API_URL}/update-bom-mapping`, {
                pcbId: selectedPcbId,
                updates: updates
            });
            setStatus('Eşleştirmeler başarıyla güncellendi!');
        } catch (err) {
            setStatus('Eşleştirme hatası: ' + (err.response?.data?.message || err.message));
            console.error('Eşleştirme hatası:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="my-4">
            <Card className="shadow-sm mb-4">
                <Card.Header>
                    <h5 className="mb-0 text-primary fw-bold">PCB BOM Eşleştirme</h5>
                </Card.Header>
                <Card.Body>
                    {status && (
                        <Alert variant={status.includes('hata') ? 'danger' : 'success'}>
                            {status}
                        </Alert>
                    )}

                    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="mapper-tabs" className="mb-3">
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
                        <Tab eventKey="componentMatching" title="2. Bileşenleri Eşleştir" disabled={!bomData.length}>
                            <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.25rem', padding: '1rem', marginBottom: '1rem' }}>
                                <Table striped bordered hover className="m-0">
                                    <thead>
                                        <tr>
                                            <th>Designator</th>
                                            <th>Parça No (BOM)</th>
                                            <th>Envanterdeki Komponent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bomData.map((item) => (
                                            <tr key={item.component_in_pcb_id}>
                                                <td>{item.designator}</td>
                                                <td>{item.bom_mpn}</td>
                                                <td>
                                                    <Form.Select 
                                                        onChange={(e) => handleComponentSelectChange(e, item.component_in_pcb_id)} 
                                                        value={componentSelections[item.component_in_pcb_id] ?? ''}
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
                                    {loading ? <Spinner animation="border" size="sm" /> : 'Eşleştirmeyi Onayla ve BOM\'u Güncelle'}
                                </Button>
                            </div>
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PcbMapper;