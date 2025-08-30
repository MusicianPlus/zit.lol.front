import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import routes from './routes';

import '../brite.min.css';
import './App.css'; 

const AppContent = () => {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>Yükleniyor...</div>;
    }

    return (
        <Routes>
            {routes.map((route, index) => (
                <Route
                    key={index}
                    path={route.path}
                    element={route.auth ? (
                        <ProtectedRoute>
                            <route.component />
                        </ProtectedRoute>
                    ) : (
                        <route.component />
                    )}
                >
                    {route.children && route.children.map((childRoute, childIndex) => (
                        <Route
                            key={childIndex}
                            path={childRoute.path}
                            element={<childRoute.component />}
                        />
                    ))}
                </Route>
            ))}
        </Routes>
    );
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
};

export default App;