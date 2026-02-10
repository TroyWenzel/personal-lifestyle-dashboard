import apiClient from "./apiClient";

/**
 * Save a meal to the user's saved items
 */
export const saveMeal = async (meal) => {
    const itemData = {
        category: "food",
        external_id: meal.idMeal,
        title: meal.strMeal,
        metadata: {
            thumbnail: meal.strMealThumb,
            category: meal.strCategory,
            area: meal.strArea,
            instructions: meal.strInstructions
        }
    };
    
    const response = await apiClient.post('/content/', itemData);
    return response;
};

/**
 * Get all saved items for the current user
 */
export const getSavedItems = async () => {
    const response = await apiClient.get('/content/');
    return response;
};

/**
 * Delete a saved item
 */
export const deleteItem = async (itemId) => {
    const response = await apiClient.delete(`/content/${itemId}`);
    return response;
};