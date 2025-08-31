import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Yeni kimlik doğrulama ile ilgili import'lar
import Login from './components/Login.tsx';
import MainLayout from './components/MainLayout.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import ErrorBoundary from './components/common/ErrorBoundary.tsx';

// Axios'u tüm istekler için çerez gönderecek şekilde yapılandır
axios.defaults.withCredentials = true;

// Tema CSS'i ve özel CSS'i import et
import '../brite.min.css';
import './App.css'; 

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <ErrorBoundary>
                    <AuthRoutes />
                </ErrorBoundary>
            </AuthProvider>
        </Router>
    );
};

const AuthRoutes = () => {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) {
        return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>Yükleniyor...</div>;
    }

    return (
        isLoggedIn ? (
            <Routes>
                <Route path="/*" element={<MainLayout />} />
            </Routes>
        ) : (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={<Navigate to="/login" />} />
            </Routes>
        )
    );
};

export default App;