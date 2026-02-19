// ═══════════════════════════════════════════════════════════════
// Open Library API Service
// ═══════════════════════════════════════════════════════════════

const API_BASE = 'https://openlibrary.org';

/**
 * Search for books using Open Library API
 * @param {string} query - Search term (title, author, ISBN)
 * @returns {Promise<Object>} - Search results with books data
 */
export const searchBooks = async (query) => {
    try {
        const response = await fetch(
            `${API_BASE}/search.json?q=${encodeURIComponent(query)}&limit=20`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error in searchBooks:', error);
        throw error;
    }
};

export { saveBook } from './contentService';