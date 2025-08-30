import axiosInstance from './axiosInstance';

interface UploadDataItem {
    [key: string]: string;
}

interface ProcessCsvPayload {
    data: UploadDataItem[];
    mapping: { [key: string]: string };
    supplierName: string;
}

interface ProcessCsvResponse {
    summary: any; // Define a more specific type for summary if possible
}

export const ImporterService = {
    getComponentColumns: async (): Promise<string[]> => {
        const response = await axiosInstance.get<string[]>('/api/components/columns');
        return response.data;
    },

    uploadCsvFile: async (file: File): Promise<{ data: UploadDataItem[] }> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosInstance.post<{ data: UploadDataItem[] }>('/api/importer/upload-file', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    processCsvData: async (payload: ProcessCsvPayload): Promise<ProcessCsvResponse> => {
        const response = await axiosInstance.post<ProcessCsvResponse>('/api/importer/process-csv', payload);
        return response.data;
    },
};