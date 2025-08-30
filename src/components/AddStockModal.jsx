import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AddStockModal = ({ show, handleClose, newStock, setNewStock, handleAddStock, error }) => {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>Yeni Stok Ekle</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Bileşen ID</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Bileşen ID girin"
                            value={newStock.component_id}
                            onChange={(e) => setNewStock({ ...newStock, component_id: e.target.value })}
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
                            onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Kapat
                </Button>
                <Button variant="primary" onClick={handleAddStock}>
                    Kaydet
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddStockModal;
