const API_BASE = 'https://www.thecocktaildb.com/api/json/v1/1';

export const searchCocktails = async (query) => {
    try {
        const response = await fetch(`${API_BASE}/search.php?s=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in searchCocktails:', error);
        throw error;
    }
};

export const getRandomCocktail = async () => {
    try {
        const response = await fetch(`${API_BASE}/random.php`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in getRandomCocktail:', error);
        throw error;
    }
};

export { saveDrink } from './contentService';