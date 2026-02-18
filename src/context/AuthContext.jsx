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
        // Check for existing token and load user
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Try to load user from localStorage first (for mock mode)
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    } else {
                        // Fallback to API call (for real mode)
                        const userData = await authAPI.getCurrentUser();
                        setUser(userData);
                    }
                } catch (error) {
                    console.error('Failed to load user:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const register = async (name, email, password) => {
        try {
            const data = await authAPI.register({ name, email, password });
            setUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const login = async (email, password) => {
        try {
            const data = await authAPI.login({ email, password });
            setUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
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
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

