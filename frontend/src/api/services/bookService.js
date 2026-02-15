const API_BASE = 'https://openlibrary.org';

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