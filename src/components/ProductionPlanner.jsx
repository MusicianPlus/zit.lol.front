import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Table, Spinner, Alert } from 'react-bootstrap';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductionPlanner = () => {
    const [pcbs, setPcbs] = useState([]);
    const [selectedPcb, setSelectedPcb] = useState('');
    const [planData, setPlanData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const API_URLS = {
        fetchPcbs: `${API_BASE_URL}/api/pcb`,
        fetchFullPlan: `${API_BASE_URL}/api/production/full-plan/`
    };

    useEffect(() => {
        const fetchPcbs = async () => {
            try {
                const res = await axios.get(API_URLS.fetchPcbs);
                setPcbs(res.data);
            } catch (err) {
                setStatus({ message: 'PCB listesi alınırken bir hata oluştu.', variant: 'danger' });
            }
        };
        fetchPcbs();
    }, []);

    const handleGeneratePlan = async () => {
        if (!selectedPcb) {
            setStatus({ message: 'Lütfen bir PCB seçin.', variant: 'warning' });
            return;
        }

        setLoading(true);
        setStatus({ message: 'Üretim planı oluşturuluyor...', variant: 'info' });
        setPlanData(null);

        try {
            const res = await axios.get(`${API_URLS.fetchFullPlan}${selectedPcb}`);
            setPlanData(res.data.plan);
            setStatus({ message: 'Üretim planı başarıyla oluşturuldu.', variant: 'success' });
        } catch (err) {
            setStatus({ message: 'Plan oluşturulurken hata: ' + (err.response?.data?.message || err.message), variant: 'danger' });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Yeterli':
                return 'success';
            case 'Yetersiz':
                return 'danger';
            case 'Eşleştirilmemiş':
            default:
                return 'warning';
        }
    };

    return (
        <Container className="my-4">
            {status && (
                <Alert variant={status.variant} onClose={() => setStatus(null)} dismissible className="mb-3">
                    {status.message}
                </Alert>
            )}
            <Card className="shadow-sm mb-4">
                <Card.Header>
                    <Card.Title className="mb-0 text-primary fw-bold">Üretim Planlama Modülü</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">PCB Seçin</Form.Label>
                        <Form.Select
                            value={selectedPcb}
                            onChange={(e) => setSelectedPcb(e.target.value)}
                        >
                            <option value="">-- Bir PCB Seçin --</option>
                            {pcbs.map(pcb => (
                                <option key={pcb.pcb_id} value={pcb.pcb_id}>
                                    {pcb.pcb_name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Button 
                        variant="primary" 
                        onClick={handleGeneratePlan} 
                        disabled={!selectedPcb || loading} 
                        className="w-100"
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : 'Üretim Planını Oluştur'}
                    </Button>
                </Card.Body>
            </Card>

            {planData && (
                <Card className="shadow-sm mb-4">
                    <Card.Header>
                        <Card.Title className="mb-0 text-primary fw-bold">Plan Detayları</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <div className="table-responsive">
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Bileşen Adı</th>
                                        <th>Üretici P/N</th>
                                        <th>Gerekli Miktar</th>
                                        <th>Mevcut Stok</th>
                                        <th>Durum</th>
                                        <th>Eksik Miktar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {planData.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                {item.status === 'Eşleştirilmemiş'
                                                    ? `Bilinmiyor: ${item.manufacturer_part_number}` // Eşleşmemişse MPN'yi göster
                                                    : item.component_name}
                                            </td>
                                            <td>{item.manufacturer_part_number}</td>
                                            <td>{item.required_quantity}</td>
                                            <td>{item.quantity_on_hand}</td>
                                            <td>
                                                <span className={`badge bg-${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className={item.shortfall > 0 ? 'text-danger fw-bold' : ''}>
                                                {item.shortfall > 0 ? `-${item.shortfall}` : '0'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default ProductionPlanner;