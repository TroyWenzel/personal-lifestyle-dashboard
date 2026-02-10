import axios from 'axios';

// Create an axios instance with default config
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Add request interceptors for auth
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptors for error handling
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;

// Export the apiRequest function for compatibility
export const apiRequest = async (endpoint) => {
    return apiClient.get(endpoint);
};