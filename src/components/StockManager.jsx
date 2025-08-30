import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner, Button } from 'react-bootstrap';
import stockApi from '../api/stock';
import StockTable from './StockTable';
import AddStockModal from './AddStockModal';

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
      const res = await stockApi.getAllStock();
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

      const response = await stockApi.updateStockQuantity(id, newQuantity);
      
      const updatedItem = response.data;
      setUpdateQuantities(prevQuantities => ({
          ...prevQuantities,
          [id]: updatedItem.quantity_on_hand
      }));

      setError(null);
      
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
      await stockApi.addStock(newStock.component_id, parseInt(newStock.quantity, 10));
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
        await stockApi.deleteStock(component_id);
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
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
            <Card.Title className="mb-0 text-primary fw-bold">Stockman</Card.Title>
            <Button variant="primary" onClick={() => setShowAddModal(true)} className="fw-bold">
                Yeni Stok Ekle
            </Button>
        </Card.Header>
        <Card.Body>
          <hr />
          
          <StockTable 
            stock={stock} 
            updateQuantities={updateQuantities}
            handleUpdateQuantity={handleUpdateQuantity}
            handleDeleteStock={handleDeleteStock}
            handleManualQuantityChange={handleManualQuantityChange}
          />
        </Card.Body>
      </Card>

      <AddStockModal 
        show={showAddModal} 
        handleClose={() => setShowAddModal(false)}
        newStock={newStock}
        setNewStock={setNewStock}
        handleAddStock={handleAddStock}
        error={error}
      />
    </Container>
  );
};

export default StockManager;