import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Table, Alert, Spinner, Button, Form, Modal, FormControl, InputGroup, Row, Col } from 'react-bootstrap';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const StockManager = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStock, setNewStock] = useState({ component_id: '', quantity: 0 });
  const [updateQuantities, setUpdateQuantities] = useState({});

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/stock`);
      setStock(res.data);
      const initialQuantities = res.data.reduce((acc, item) => {
        acc[item.component_id] = item.quantity_on_hand;
        return acc;
      }, {});
      setUpdateQuantities(initialQuantities);
    } catch (err) {
      setError('Stok bilgileri yüklenirken bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    const handleUpdateQuantity = async (id, quantityChange) => {
    try {
        const currentQuantity = updateQuantities[id];
        const newQuantity = currentQuantity + quantityChange;
        
        if (newQuantity < 0) {
        setError('Stok miktarı negatif olamaz.');
        return;
        }

        // API çağrısını yap
        const response = await axios.put(`${API_BASE_URL}/api/stock/${id}`, { new_quantity: newQuantity });
        
        // API'den dönen güncel miktarı state'e kaydet
        const updatedItem = response.data;
        setUpdateQuantities(prevQuantities => ({
            ...prevQuantities,
            [id]: updatedItem.quantity_on_hand
        }));

        setError(null);
        // Artık fetchStock() fonksiyonunu burada çağırmıyoruz!
        
    } catch (err) {
        setError('Stok güncellenirken hata: ' + (err.response?.data?.message || err.message));
    }
    };

  const handleManualQuantityChange = (id, value) => {
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
      await axios.post(`${API_BASE_URL}/api/stock`, {
        component_id: newStock.component_id,
        quantity: parseInt(newStock.quantity, 10)
      });
      setShowAddModal(false);
      setNewStock({ component_id: '', quantity: 0 });
      fetchStock();
      setError(null);
      alert('Stok başarıyla eklendi/güncellendi!');
    } catch (err) {
      setError('Stok eklenirken hata: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteStock = async (component_id) => {
    if (window.confirm('Bu stok kalemini silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/stock/${component_id}`);
        fetchStock();
        setError(null);
        alert('Stok kalemi başarıyla silindi!');
      } catch (err) {
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
    <Container className="my-4">
        {status && (
            <Alert variant={status.variant} onClose={() => setStatus(null)} dismissible className="mb-3">
                {status.message}
            </Alert>
        )}
      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
            <Card.Title className="mb-0 text-primary fw-bold">Stockman</Card.Title>
            <Button variant="primary" onClick={() => setShowAddModal(true)} className="fw-bold">
                Yeni Stok Ekle
            </Button>
        </Card.Header>
        <Card.Body>
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
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Kapat
          </Button>
          <Button variant="primary" onClick={handleAddStock}>
            Kaydet
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StockManager;