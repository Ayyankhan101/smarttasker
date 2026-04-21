import { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi } from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await authApi.getProfile();
            setUser(res.data);
        } catch (error) {
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await authApi.login({ email, password });
        if (res.data.requires2FA) {
            return { requires2FA: true, tempToken: res.data.tempToken };
        }
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return { requires2FA: false };
    };

    const verify2FA = async (tempToken, code) => {
        const res = await authApi.verify2FA({ tempToken, code });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
    };

    const register = async (data) => {
        const res = await authApi.register(data);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const setup2FA = async () => {
        const res = await authApi.setup2FA();
        return res.data;
    };

    const disable2FA = async () => {
        await authApi.disable2FA();
        if (user) {
            setUser({ ...user, is2FAEnabled: false });
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, verify2FA, register, logout, setup2FA, disable2FA, loading }}>
            {children}
        </AuthContext.Provider>
    );
};