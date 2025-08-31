import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Alert, Spinner, Button, Form, Modal, FormControl, InputGroup, Row, Col } from 'react-bootstrap';
import stockApi from '../../api/stock'; // Import stockApi

interface StockItem {
    component_id: string;
    quantity_on_hand: number;
    component_name: string;
    manufacturer_part_number: string;
}

interface NewStockPayload {
    component_id: string;
    quantity: number;
}

interface UpdateQuantities {
    [component_id: string]: number;
}

interface Status {
    message: string;
    variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
}

const StockManager: React.FC = () => {
    const [stock, setStock] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [newStock, setNewStock] = useState<NewStockPayload>({ component_id: '', quantity: 0 });
    const [updateQuantities, setUpdateQuantities] = useState<UpdateQuantities>({});
    const [status, setStatus] = useState<Status | null>(null);

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        try {
            setLoading(true);
            const res = await stockApi.getAllStock(); // Use stockApi
            setStock(res.data);
            const initialQuantities: UpdateQuantities = res.data.reduce((acc, item) => {
                acc[item.component_id] = item.quantity_on_hand;
                return acc;
            }, {} as UpdateQuantities);
            setUpdateQuantities(initialQuantities);
        } catch (err: any) {
            setError('Stok bilgileri yüklenirken bir hata oluştu.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (id: string, quantityChange: number) => {
        try {
            const currentQuantity = updateQuantities[id];
            const newQuantity = currentQuantity + quantityChange;
            
            if (newQuantity < 0) {
                setError('Stok miktarı negatif olamaz.');
                return;
            }

            const updatedItem = (await stockApi.updateStockQuantity(id, newQuantity)).data; // Use stockApi
            setUpdateQuantities(prevQuantities => ({
                ...prevQuantities,
                [id]: updatedItem.quantity_on_hand
            }));

            setError(null);
            
        } catch (err: any) {
            setError('Stok güncellenirken hata: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleManualQuantityChange = (id: string, value: string) => {
        const intValue = parseInt(value, 10) || 0;
        setUpdateQuantities({
            ...updateQuantities,
            [id]: intValue
        });
    };

    const handleAddStock = async () => {
        try {
            if (!newStock.component_id || newStock.quantity <= 0) {
                setError('Lütfen geçerli bir Component ID ve miktar girin.');
                return;
            }
            await stockApi.addStock(newStock.component_id, newStock.quantity); // Use stockApi
            setShowAddModal(false);
            setNewStock({ component_id: '', quantity: 0 });
            fetchStock();
            setError(null);
            setStatus({ message: 'Stok başarıyla eklendi/güncellendi!', variant: 'success' });
        } catch (err: any) {
            setError('Stok eklenirken hata: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteStock = async (component_id: string) => {
        if (window.confirm('Bu stok kalemini silmek istediğinizden emin misiniz?')) {
            try {
                await stockApi.deleteStock(component_id); // Use stockApi
                fetchStock();
                setError(null);
                setStatus({ message: 'Stok kalemi başarıyla silindi!', variant: 'success' });
            } catch (err: any) {
                setError('Stok silinirken hata: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" />
                <p>Yükleniyor...</p>
            </Container>
        );
    }

    return (
        <>
            {status && (
                <Alert variant={status.variant} onClose={() => setStatus(null)} dismissible className="mb-3">
                    {status.message}
                </Alert>
            )}
            <Card className="shadow-sm mb-4 mx-auto">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <Card.Title className="mb-0 text-primary fw-bold">Stockman</Card.Title>
                    <Button variant="primary" onClick={() => setShowAddModal(true)} className="fw-bold">
                        Yeni Stok Ekle
                    </Button>
                </Card.Header>
                <Card.Body className="d-flex justify-content-center align-items-center flex-column">
                    <hr />
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                    
                    <div className="table-responsive">
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Bileşen Adı</th>
                                    <th>Üretici P/N</th>
                                    <th>Mevcut Miktar</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stock.map((item) => (
                                    <tr key={item.component_id}>
                                        <td className="align-middle">{item.component_id}</td>
                                        <td className="align-middle">{item.component_name}</td>
                                        <td className="align-middle">{item.manufacturer_part_number}</td>
                                        <td className="align-middle">
                                            <InputGroup className="w-auto">
                                                <Button 
                                                    variant="outline" 
                                                    onClick={() => handleUpdateQuantity(item.component_id, -1)} 
                                                    className="fw-bold"
                                                >
                                                    -
                                                </Button>
                                                <FormControl
                                                    //type="number"
                                                    value={updateQuantities[item.component_id]}
                                                    //onChange={(e) => handleManualQuantityChange(item.component_id, e.target.value)}
                                                    className="text-center bg-white" 
                                                />
                                                <Button 
                                                    variant="outline" 
                                                    onClick={() => handleUpdateQuantity(item.component_id, 1)} 
                                                    className="fw-bold"
                                                >
                                                    +
                                                </Button>
                                            </InputGroup>
                                        </td>
                                        <td className="align-middle">
                                            <Button 
                                                variant="danger" 
                                                size="sm" 
                                                onClick={() => handleDeleteStock(item.component_id)}
                                                className="w-100"
                                            >
                                                Sil
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Stok Ekleme Modalı */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>Yeni Stok Ekle</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Bileşen ID</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Bileşen ID girin"
                                value={newStock.component_id}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStock({ ...newStock, component_id: e.target.value })}
                            />
                            <Form.Text className="text-muted">
                                Components tablosunda bulunan bir ID olmalıdır.
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Miktar</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Miktar girin"
                                value={newStock.quantity}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStock({ ...newStock, quantity: parseInt(e.target.value, 10) || 0 })} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default StockManager;