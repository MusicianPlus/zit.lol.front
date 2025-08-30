import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Defines the shape of the authentication context.
 * @interface AuthContextType
 */
interface AuthContextType {
    /**
     * Indicates if the user is currently logged in.
     */
    isLoggedIn: boolean;
    /**
     * Indicates if the authentication status is currently being loaded.
     */
    isLoading: boolean;
    /**
     * Function to call when a user successfully logs in.
     */
    handleLogin: () => void;
    /**
     * Function to call to log out the current user.
     */
    handleLogout: () => Promise<void>;
}

/**
 * React Context for managing authentication state.
 * @type {React.Context<AuthContextType | null>}
 */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Provides authentication state and functions to its children components.
 * It handles checking the user's login status on mount and provides login/logout functionalities.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the provider.
 * @returns {React.FC<{ children: React.ReactNode }>}
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/auth/verify`);
                if (response.status === 200) {
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
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
            // Optionally redirect to login page after logout
            // window.location.href = '/login';
        } catch (error) {
            console.error('Çıkış hatası:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, isLoading, handleLogin, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to consume the authentication context.
 * Throws an error if used outside of an AuthProvider.
 * @returns {AuthContextType} The authentication context values.
 * @throws {Error} If useAuth is not used within an AuthProvider.
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};