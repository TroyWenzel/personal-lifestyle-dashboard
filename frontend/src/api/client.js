import axios from 'axios';

// Create configured axios instance for API calls
const apiClient = axios.create({
    // Use environment variable for API URL, fallback to localhost
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies in requests if needed
});

// Request interceptor - adds auth token to every request
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

// Response interceptor - handles common errors globally
apiClient.interceptors.response.use(
    (response) => response.data, // Extract data directly for cleaner usage
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        
        // Handle 401 Unauthorized errors - clear invalid token and redirect to login
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