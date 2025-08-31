import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { PcbService, Pcb } from '../../api/pcb'; // Import PcbService and Pcb interface
import { ProductionService, PlanDataItem } from '../../api/production'; // Import ProductionService and PlanDataItem

interface Status {
    message: string;
    variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
}

const ProductionPlanner: React.FC = () => {
    const [pcbs, setPcbs] = useState<Pcb[]>([]);
    const [selectedPcb, setSelectedPcb] = useState<string>('');
    const [planData, setPlanData] = useState<PlanDataItem[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<Status | null>(null);

    useEffect(() => {
        const fetchPcbs = async () => {
            try {
                const res = await PcbService.getAllPcbs(); // Use PcbService
                setPcbs(res);
            } catch (err: any) {
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
            const res = await ProductionService.getFullPlan(selectedPcb); // Use ProductionService
            setPlanData(res.plan);
            setStatus({ message: 'Üretim planı başarıyla oluşturuldu.', variant: 'success' });
        } catch (err: any) {
            setStatus({ message: 'Plan oluşturulurken hata: ' + (err.response?.data?.message || err.message), variant: 'danger' });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (statusText: 'Yeterli' | 'Yetersiz' | 'Eşleştirilmemiş'): string => {
        switch (statusText) {
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
        <>
            {status && (
                <Alert variant={status.variant} onClose={() => setStatus(null)} dismissible className="mb-3">
                    {status.message}
                </Alert>
            )}
            <Card className="shadow-sm mb-4 mx-auto">
                <Card.Header>
                    <Card.Title className="mb-0 text-primary fw-bold">Üretim Planlama Modülü</Card.Title>
                </Card.Header>
                <Card.Body className="d-flex justify-content-center align-items-center flex-column">
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">PCB Seçin</Form.Label>
                        <Form.Select
                            value={selectedPcb}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPcb(e.target.value)}
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
                    <Card.Body className="d-flex justify-content-center align-items-center flex-column">
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
        </>
    );
};

export default ProductionPlanner;