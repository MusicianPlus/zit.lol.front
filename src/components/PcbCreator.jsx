import React, { useState } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PcbCreator = () => {
    const [pcbName, setPcbName] = useState('');
    const [status, setStatus] = useState(null);
    const [createdPcb, setCreatedPcb] = useState(null);
    const [loading, setLoading] = useState(false);

    const CREATE_URL = '${API_BASE_URL}/api/pcb/create-pcb';

    const handleCreatePcb = async () => {
        if (!pcbName.trim()) {
            setStatus({ message: 'Lütfen bir PCB adı girin.', variant: 'danger' });
            return;
        }

        setLoading(true);
        setStatus({ message: 'Yeni PCB oluşturuluyor...', variant: 'info' });
        
        try {
            const res = await axios.post(CREATE_URL, { pcbName });
            setCreatedPcb(res.data.pcb);
            setStatus({ message: `PCB başarıyla oluşturuldu! ID: ${res.data.pcb.pcb_id}`, variant: 'success' });
            setPcbName(''); // Alanı temizle
        } catch (error) {
            setStatus({ message: 'Oluşturma hatası: ' + (error.response?.data?.message || error.message), variant: 'danger' });
            console.error(error);
        } finally {
            setLoading(false);
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
                    <Card.Title className="mb-0 text-primary fw-bold">Yeni PCB Oluştur</Card.Title>
                </Card.Header>
                <Card.Body>

                    <Form.Group className="mb-3">
                        <Form.Label>PCB Adı</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Örn: Proje-X Rev1.0" 
                            value={pcbName}
                            onChange={(e) => setPcbName(e.target.value)} 
                        />
                    </Form.Group>
                    <Button variant="primary" onClick={handleCreatePcb} disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'PCB Oluştur'}
                    </Button>
                    {createdPcb && (
                        <div className="mt-4 p-3 border rounded shadow-sm bg-light">
                            <h6 className="text-primary fw-bold">Oluşturulan PCB Bilgileri:</h6>
                            <p className="mb-1"><strong>ID:</strong> {createdPcb.pcb_id}</p>
                            <p className="mb-0"><strong>Adı:</strong> {createdPcb.pcb_name}</p>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default PcbCreator;