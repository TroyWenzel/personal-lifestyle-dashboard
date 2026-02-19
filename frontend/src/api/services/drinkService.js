// ═══════════════════════════════════════════════════════════════
// TheCocktailDB API Service
// ═══════════════════════════════════════════════════════════════

const API_BASE = 'https://www.thecocktaildb.com/api/json/v1/1';

/**
 * Search for cocktails by name
 * @param {string} query - Cocktail name to search for
 * @returns {Promise<Object>} - Search results
 */
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

/**
 * Get a random cocktail
 * @returns {Promise<Object>} - Random cocktail data
 */
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

// Aliases for TanStack Query compatibility
export const searchDrinks = searchCocktails;
export const getRandomDrink = getRandomCocktail;