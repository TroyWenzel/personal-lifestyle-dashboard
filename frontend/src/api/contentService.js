import apiClient from "./apiClient";

/**
 * Save an item from any category
 */
export const saveItem = async (itemData) => {
    const response = await apiClient.post('/content/', itemData);
    return response;
};

export const saveMeal = async (meal) => {
    return saveItem({
        category: "food",
        external_id: meal.idMeal,
        title: meal.strMeal,
        metadata: {
            thumbnail: meal.strMealThumb,
            category: meal.strCategory,
            area: meal.strArea,
            instructions: meal.strInstructions
        }
    });
};

export const saveLocation = async (weatherData) => {
    return saveItem(weatherData);
};

export const saveArtwork = async (artData) => {
    return saveItem(artData);
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