import React, { createContext, useReducer, useEffect, useContext, ReactNode } from 'react';
import authApi from '../api/auth'; // Bir önceki adımda oluşturduğunuz dosya

// --- Tip Tanımlamaları (TypeScript'in Gücü) ---

/**
 * API'den dönmesini beklediğimiz kullanıcı nesnesinin yapısı.
 * Kendi projenize göre (örn: name, roles) genişletebilirsiniz.
 */
interface User {
    id: string;
    username: string;
    email: string;
}

/**
 * Reducer tarafından yönetilecek olan state'in yapısı.
 */
interface AuthState {
    isLoggedIn: boolean;
    user: User | null;
    isLoading: boolean;
}

/**
 * Reducer'a gönderilebilecek action'ların tipleri ve payload'ları.
 */
type AuthAction =
    | { type: 'LOGIN'; payload: User }
    | { type: 'LOGOUT' }
    | { type: 'SET_LOADING'; payload: boolean };

/**
 * Context aracılığıyla bileşenlere sağlanacak olan değerlerin yapısı.
 */
interface AuthContextType extends AuthState {
    login: (username: string, password, rememberMe: boolean) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<{ success: boolean; message?: string }>;
}

// --- Reducer Fonksiyonu ---

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                isLoggedIn: true,
                user: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                isLoggedIn: false,
                user: null,
            };
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload,
            };
        default:
            return state;
    }
};

// --- Context ve Provider ---

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const initialState: AuthState = {
        isLoggedIn: false,
        user: null,
        isLoading: true, // Uygulama ilk açıldığında oturumu kontrol edeceğimiz için true
    };

    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const checkAuthStatus = async () => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const response = await authApi.verify();
                if (response.status === 200 && response.data.user) {
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
            if (response.status === 200 && response.data.user) {
                dispatch({ type: 'LOGIN', payload: response.data.user });
                return { success: true };
            }
            return { success: false, message: response.data.message || 'Giriş bilgileri hatalı.' };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Giriş sırasında bir hata oluştu.' };
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
            dispatch({ type: 'LOGOUT' });
            return { success: true };
        } catch (error: any) {
            console.error('Çıkış hatası:', error);
             // Çıkış başarısız olsa bile client tarafında oturumu kapat
            dispatch({ type: 'LOGOUT' });
            return { success: false, message: error.response?.data?.message || 'Çıkış sırasında bir hata oluştu.' };
        }
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * AuthContext'e kolay erişim sağlayan özel bir hook.
 * Bu hook, bir AuthProvider içinde kullanılmalıdır.
 * @returns {AuthContextType} - Kimlik doğrulama state'i ve fonksiyonları.
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};