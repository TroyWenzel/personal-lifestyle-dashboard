import { createContext, useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// Authentication Context
// ═══════════════════════════════════════════════════════════════

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        
        if (savedToken) {
            setToken(savedToken);
        }
        
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        
        setLoading(false);
    }, []);

    const login = (newToken, userData = null) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        
        if (userData) {
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ 
            token, 
            user,
            login, 
            logout, 
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};