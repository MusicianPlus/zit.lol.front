import axiosInstance from './axiosInstance';

export interface StockItem {
    component_id: string;
    component_name: string;
    manufacturer_part_number: string;
    quantity_on_hand: number;
    // Add other properties if known
}

export interface NewStockPayload {
    component_id: string;
    quantity: number;
}

export const StockService = {
    getAllStock: async (): Promise<StockItem[]> => {
        const response = await axiosInstance.get<StockItem[]>('/api/stock');
        return response.data;
    },

    updateStockQuantity: async (id: string, new_quantity: number): Promise<StockItem> => {
        const response = await axiosInstance.put<StockItem>(`/api/stock/${id}`, { new_quantity });
        return response.data;
    },

    addStock: async (payload: NewStockPayload): Promise<void> => {
        await axiosInstance.post('/api/stock', payload);
    },

    deleteStock: async (component_id: string): Promise<void> => {
        await axiosInstance.delete(`/api/stock/${component_id}`);
    },
};