import axiosInstance from './axiosInstance';

const stockApi = {
    getAllStock: () => axiosInstance.get('/api/stock'),
    addStock: (component_id, quantity) => axiosInstance.post('/api/stock', { component_id, quantity }),
    updateStockQuantity: (component_id, new_quantity) => axiosInstance.put(`/api/stock/${component_id}`, { new_quantity }),
    deleteStock: (component_id) => axiosInstance.delete(`/api/stock/${component_id}`),
};

export default stockApi;
