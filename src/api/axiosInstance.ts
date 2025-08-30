import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Ensure cookies are sent with requests
});

// Optional: Add a request interceptor to include auth token if available
// This would typically come from AuthContext or a similar state management
axiosInstance.interceptors.request.use(
    (config) => {
        // Example: if you store token in localStorage or a global state
        // const token = localStorage.getItem('authToken');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Add a response interceptor for global error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Example: Redirect to login on 401 Unauthorized
        // if (error.response && error.response.status === 401) {
        //     window.location.href = '/login';
        // }
        return Promise.reject(error);
    }
);

export default axiosInstance;