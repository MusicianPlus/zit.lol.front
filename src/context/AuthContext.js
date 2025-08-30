import React, { createContext, useReducer, useEffect, useContext } from 'react';
import authApi from '../api/auth';

const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, isLoggedIn: true, user: action.payload };
        case 'LOGOUT':
            return { ...state, isLoggedIn: false, user: null };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, { isLoggedIn: false, user: null, isLoading: true });

    useEffect(() => {
        const checkAuthStatus = async () => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const response = await authApi.verify();
                if (response.status === 200) {
                    dispatch({ type: 'LOGIN', payload: response.data.user });
                } else {
                    dispatch({ type: 'LOGOUT' });
                }
            } catch (error) {
                console.error('Oturum kontrol hatası:', error);
                dispatch({ type: 'LOGOUT' });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        checkAuthStatus();
    }, []);

    const login = async (username, password, rememberMe) => {
        try {
            const response = await authApi.login(username, password, rememberMe);
            if (response.status === 200) {
                dispatch({ type: 'LOGIN', payload: response.data.user });
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Giriş başarısız oldu.' };
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
            dispatch({ type: 'LOGOUT' });
            return { success: true };
        } catch (error) {
            console.error('Çıkış hatası:', error);
            return { success: false, message: error.response?.data?.message || 'Çıkış başarısız oldu.' };
        }
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
