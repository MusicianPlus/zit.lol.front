import axiosInstance from './axiosInstance';

const authApi = {
    login: (username, password, rememberMe) => axiosInstance.post('/api/auth/login', { username, password, rememberMe }),
    logout: () => axiosInstance.post('/api/auth/logout'),
    verify: () => axiosInstance.get('/api/auth/verify'),
};

export default authApi;
