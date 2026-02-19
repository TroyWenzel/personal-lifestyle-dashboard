import axios from 'axios';

// ═══════════════════════════════════════════════════════════════
// API Client Configuration
// ═══════════════════════════════════════════════════════════════

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// ─── Request Interceptor ──────────────────────────────────────
// Adds auth token to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────
// Handles common errors globally
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        
        // Handle 401 Unauthorized - clear token and redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;

// Legacy compatibility wrapper
export const apiRequest = async (endpoint) => {
    return apiClient.get(endpoint);
};