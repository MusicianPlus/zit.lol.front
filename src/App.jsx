import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Yeni kimlik doğrulama ile ilgili import'lar
import Login from './components/Login';
import MainLayout from './components/MainLayout';

// Axios'u tüm istekler için çerez gönderecek şekilde yapılandır
axios.defaults.withCredentials = true;

// Tema CSS'i ve özel CSS'i import et
import '../brite.min.css';
import './App.css'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // fetch yerine axios.get kullan
                const response = await axios.get(`${API_BASE_URL}/api/auth/verify`);
                
                // Axios, başarılı yanıtı direkt 'ok' olarak değil, durum koduna göre verir
                if (response.status === 200) {
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
                // Axios, 401 gibi hataları otomatik olarak bu blokta yakalar
                console.error('Oturum kontrol hatası:', error);
                setIsLoggedIn(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/auth/logout`);
            setIsLoggedIn(false);
            window.location.href = '/login';
        } catch (error) {
            console.error('Çıkış hatası:', error);
        }
    };

    if (isLoading) {
        return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>Yükleniyor...</div>;
    }

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login handleLogin={handleLogin} />} />
                <Route
                    path="/*"
                    element={isLoggedIn ? (
                        <MainLayout handleLogout={handleLogout} />
                    ) : (
                        <Navigate to="/login" />
                    )}
                />
            </Routes>
        </Router>
    );
};

export default App;