import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) {
        return <div>Yükleniyor...</div>; // Or a loading spinner
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
