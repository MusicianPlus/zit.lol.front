import axiosInstance from './axiosInstance';

// Define interfaces for data structures
export interface Pcb {
    pcb_id: string;
    pcb_name: string;
    // Add other PCB properties if known
}

export interface Component {
    component_id: string;
    manufacturer_part_number: string;
    component_name: string;
    // Add other component properties if known
}

export interface BomItem {
    component_in_pcb_id: string;
    designator: string;
    bom_mpn: string; // Manufacturer Part Number from BOM
    component_id: string | null; // Mapped component ID, can be null
    // Add other BOM item properties if known
}

export interface UpdateBomMappingPayload {
    pcbId: string;
    updates: Array<{
        component_in_pcb_id: string;
        component_id: string | null;
    }>;
}

export const PcbService = {
    createPcb: async (pcbName: string): Promise<{ pcb: Pcb }> => {
        const response = await axiosInstance.post<{ pcb: Pcb }>('/api/pcb/create-pcb', { pcbName });
        return response.data;
    },

    getAllPcbs: async (): Promise<Pcb[]> => {
        const response = await axiosInstance.get<Pcb[]>('/api/pcb');
        return response.data;
    },

    getMappedBom: async (pcbId: string): Promise<BomItem[]> => {
        const response = await axiosInstance.get<BomItem[]>(`/api/pcb/${pcbId}/mapped-bom`);
        return response.data;
    },

    updateBomMapping: async (payload: UpdateBomMappingPayload): Promise<void> => {
        await axiosInstance.put('/api/pcb/update-bom-mapping', payload);
    },
};