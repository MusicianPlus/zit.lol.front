import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { PcbService, Pcb, Component, BomItem, UpdateBomMappingPayload } from '../../api/pcb'; // Import PcbService and interfaces
import axios from 'axios'; // Keep axios for now for allComponents fetch

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ComponentSelections {
    [key: string]: string; // Maps component_in_pcb_id to component_id
}

const PcbMapper: React.FC = () => {
    const [pcbs, setPcbs] = useState<Pcb[]>([]);
    const [allComponents, setAllComponents] = useState<Component[]>([]);
    const [selectedPcbId, setSelectedPcbId] = useState<string>('');
    const [bomData, setBomData] = useState<BomItem[]>([]);
    const [componentSelections, setComponentSelections] = useState<ComponentSelections>({});
    const [status, setStatus] = useState<string>(''); // Status message
    const [loading, setLoading] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('pcbSelect');

    // PCB'leri ve tüm bileşenleri yükle
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const pcbRes = await PcbService.getAllPcbs(); // Use PcbService
                setPcbs(pcbRes);
                // Assuming there's a ComponentService or similar to fetch all components
                // For now, I'll assume PcbService can fetch all components or it's a separate service
                // Based on previous CsvUploader, it was /api/components/all, so let's create a ComponentService
                // For now, I'll keep the direct axios call for components until ComponentService is created.
                const componentsRes = await axios.get<Component[]>(`${API_BASE_URL}/api/components/all`);
                setAllComponents(componentsRes.data);
            } catch (err: any) {
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

    const fetchExistingBomData = async (pcbId: string) => {
        setLoading(true);
        setStatus('PCB BOM verileri yükleniyor...');
        setBomData([]);
        setComponentSelections({});
        try {
            const fetchedBomData = await PcbService.getMappedBom(pcbId); // Use PcbService
            setBomData(fetchedBomData);
            
            const newSelections: ComponentSelections = {};
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
            
        } catch (err: any) {
            setStatus('Mevcut BOM verisi alınırken hata: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handlePcbSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pcbId = e.target.value;
        setSelectedPcbId(pcbId);
    };

    const handleComponentSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, bomItemId: string) => {
        const { value } = e.target;
        setComponentSelections(prevSelections => ({
            ...prevSelections,
            [bomItemId]: value
        }));
    };

    const handleFinalizeMapping = async () => {
        const updates: UpdateBomMappingPayload['updates'] = bomData.map(item => {
            const selectedComponentId = componentSelections[item.component_in_pcb_id] || null;
            return {
                component_in_pcb_id: item.component_in_pcb_id,
                component_id: selectedComponentId
            };
        });

        setStatus(`Eşleştirme güncellemeleri gönderiliyor...`);
        setLoading(true);

        try {
            await PcbService.updateBomMapping({ pcbId: selectedPcbId, updates: updates }); // Use PcbService
            setStatus('Eşleştirmeler başarıyla güncellendi!');
        } catch (err: any) {
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

                    <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k as string)} id="mapper-tabs" className="mb-3">
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
                                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleComponentSelectChange(e, item.component_in_pcb_id)} 
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