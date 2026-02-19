import apiClient from '../client';

// ═══════════════════════════════════════════════════════════════
// Shopping List Service — DB-backed, per user
// ═══════════════════════════════════════════════════════════════

/**
 * Load the full shopping list for the current user
 * @returns {Promise<{food: [], drinks: []}>}
 */
export const loadList = async () => {
    try {
        const response = await apiClient.get('/api/shopping/');
        return response.list || { food: [], drinks: [] };
    } catch (error) {
        console.error('Error loading shopping list:', error);
        return { food: [], drinks: [] };
    }
};

/**
 * Add an item to the shopping list
 * @param {string} section - 'food' or 'drinks'
 * @param {string} name
 * @param {string} measure
 * @returns {Promise<Object>} - { item, duplicate }
 */
export const addItem = async (section, name, measure = '') => {
    try {
        const response = await apiClient.post('/api/shopping/', { section, name, measure });
        return response;
    } catch (error) {
        console.error('Error adding shopping item:', error);
        throw error;
    }
};

/**
 * Toggle checked status of an item
 * @param {number} id - item DB id
 * @returns {Promise<Object>} - updated item
 */
export const toggleItem = async (id) => {
    try {
        const response = await apiClient.put(`/api/shopping/${id}/toggle`);
        return response.item;
    } catch (error) {
        console.error('Error toggling shopping item:', error);
        throw error;
    }
};

/**
 * Delete a single item
 * @param {number} id - item DB id
 */
export const removeItem = async (id) => {
    try {
        await apiClient.delete(`/api/shopping/${id}`);
    } catch (error) {
        console.error('Error removing shopping item:', error);
        throw error;
    }
};

/**
 * Clear all checked items (optionally filter by section)
 * @param {string} section - 'food' | 'drinks' | null for both
 */
export const clearChecked = async (section = null) => {
    try {
        const url = section ? `/api/shopping/clear-checked?section=${section}` : '/api/shopping/clear-checked';
        await apiClient.delete(url);
    } catch (error) {
        console.error('Error clearing checked items:', error);
        throw error;
    }
};