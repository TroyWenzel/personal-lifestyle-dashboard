const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

// Search for meals by name
export const searchMeals = async (query) => {
    try {
        const response = await fetch(`${API_BASE}/search.php?s=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in searchMeals:', error);
        throw error;
    }
};

// Get detailed meal information by ID
export const getMealById = async (id) => {
    try {
        const response = await fetch(`${API_BASE}/lookup.php?i=${id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in getMealById:', error);
        throw error;
    }
};

// Re-export save function from contentService for consistent import pattern
export { saveMeal } from './contentService';