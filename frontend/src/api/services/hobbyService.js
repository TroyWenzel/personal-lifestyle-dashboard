const API_BASE = 'https://www.boredapi.com/api';

export const getActivity = async (type = '') => {
    try {
        const url = type 
            ? `${API_BASE}/activity?type=${type}`
            : `${API_BASE}/activity`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error in getActivity:', error);
        throw error;
    }
};

export { saveActivity } from './contentService';

// Alias for TanStack Query compatibility
export const getRandomActivity = getActivity;