import axiosInstance from './axiosInstance';
import { Pcb } from './pcb'; // Import Pcb interface if needed for plan data

export interface PlanDataItem {
    component_name: string;
    manufacturer_part_number: string;
    required_quantity: number;
    quantity_on_hand: number;
    status: 'Yeterli' | 'Yetersiz' | 'Eşleştirilmemiş';
    shortfall: number;
    // Add other properties if known
}

export const ProductionService = {
    getFullPlan: async (pcbId: string): Promise<{ plan: PlanDataItem[] }> => {
        const response = await axiosInstance.get<{ plan: PlanDataItem[] }>(`/api/production/full-plan/${pcbId}`);
        return response.data;
    },
};