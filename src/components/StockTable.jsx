import React from 'react';
import { Table, Button, Form, FormControl, InputGroup } from 'react-bootstrap';

const StockTable = ({ stock, updateQuantities, handleUpdateQuantity, handleDeleteStock, handleManualQuantityChange }) => {
    return (
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
                                        type="number"
                                        value={updateQuantities[item.component_id]}
                                        onChange={(e) => handleManualQuantityChange(item.component_id, e.target.value)}
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
    );
};

export default StockTable;
