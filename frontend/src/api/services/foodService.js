// ═══════════════════════════════════════════════════════════════
// TheMealDB API Service
// ═══════════════════════════════════════════════════════════════

const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

/**
 * Extract ingredients and measurements from meal object
 * @param {Object} meal - Raw meal data from TheMealDB
 * @returns {Array} - Array of {ingredient, measure} objects
 */
export const extractIngredients = (meal) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            ingredients.push({
                ingredient: ingredient.trim(),
                measure: measure ? measure.trim() : ''
            });
        }
    }
    return ingredients;
};

/**
 * Search for meals by name
 * @param {string} query - Meal name to search for
 * @returns {Promise<Object>} - Search results
 */
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

/**
 * Get detailed meal information by ID
 * @param {string} id - Meal ID
 * @returns {Promise<Object>} - Meal details
 */
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

/**
 * Get a random meal
 * @returns {Promise<Object>} - Random meal data
 */
export const getRandomMeal = async () => {
    try {
        const response = await fetch(`${API_BASE}/random.php`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in getRandomMeal:', error);
        throw error;
    }
};

export { saveMeal } from './contentService';