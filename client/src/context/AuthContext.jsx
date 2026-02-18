import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // On mount: validate existing token/session with the server
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Always validate against the server — don't trust localStorage blindly
                    const userData = await authAPI.getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    // Token invalid or expired — clear storage
                    console.warn('Session validation failed, clearing credentials:', error.message);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const register = async (name, email, password) => {
        const data = await authAPI.register({ name, email, password });
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
    };

    const login = async (email, password) => {
        const data = await authAPI.login({ email, password });
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
    };

    const logout = async () => {
        try {
            // Destroy server-side session
            await authAPI.logout();
        } catch (error) {
            console.warn('Logout API error (continuing anyway):', error.message);
        } finally {
            // Always clear client-side state
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    };

    const value = {
        user,
        register,
        login,
        logout,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
