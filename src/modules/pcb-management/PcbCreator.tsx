import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { PcbService, Pcb } from '../../api/pcb'; // Import PcbService and Pcb interface
import { useTranslation } from 'react-i18next'; // Import useTranslation

interface Status {
    message: string;
    variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
}

const PcbCreator: React.FC = () => {
    const [pcbName, setPcbName] = useState<string>('');
    const [status, setStatus] = useState<Status | null>(null);
    const [createdPcb, setCreatedPcb] = useState<Pcb | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const { t } = useTranslation(); // Initialize useTranslation

    const handleCreatePcb = async () => {
        if (!pcbName.trim()) {
            setStatus({ message: t('enter_pcb_name'), variant: 'danger' }); // Translated
            return;
        }

        setLoading(true);
        setStatus({ message: t('creating_new_pcb'), variant: 'info' }); // Translated
        
        try {
            const res = await PcbService.createPcb(pcbName); // Use PcbService
            setCreatedPcb(res.pcb);
            setStatus({ message: t('pcb_created_success', { id: res.pcb.pcb_id }), variant: 'success' }); // Translated
            setPcbName(''); // Alanı temizle
        } catch (error: any) {
            setStatus({ message: t('creation_error', { message: error.response?.data?.message || error.message }), variant: 'danger' }); // Translated
            console.error(error);
        } finally {
            setLoading(false);
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
                    <Card.Title className="mb-0 text-primary fw-bold">{t('create_new_pcb_title')}</Card.Title> {/* Translated */}
                </Card.Header>
                <Card.Body className="d-flex justify-content-center align-items-center flex-column">

                    <Form.Group className="mb-3">
                        <Form.Label>{t('pcb_name')}</Form.Label> {/* Translated */}
                        <Form.Control 
                            type="text" 
                            placeholder="Örn: Proje-X Rev1.0" 
                            value={pcbName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPcbName(e.target.value)} 
                        />
                    </Form.Group>
                    <Button variant="primary" onClick={handleCreatePcb} disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : t('create')} {/* Translated */}
                    </Button>
                    {createdPcb && (
                        <div className="mt-4 p-3 border rounded shadow-sm bg-light">
                            <h6 className="text-primary fw-bold">{t('created_pcb_info')}</h6> {/* Translated */}
                            <p className="mb-1"><strong>{t('id')}:</strong> {createdPcb.pcb_id}</p> {/* Translated */}
                            <p className="mb-0"><strong>{t('name')}:</strong> {createdPcb.pcb_name}</p> {/* Translated */}
                        </div>
                    )}
                </Card.Body>
            </Card>
        </>
    );
};

export default PcbCreator;