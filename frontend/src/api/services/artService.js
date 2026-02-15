const ART_API_BASE = 'https://api.artic.edu/api/v1';

// Search for artworks using Art Institute of Chicago API
export const searchArt = async (query) => {
    try {
        const response = await fetch(
            `${ART_API_BASE}/artworks/search?q=${encodeURIComponent(query)}&fields=id,title,artist_title,date_display,medium_display,image_id,department_title&limit=20`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in searchArt:', error);
        throw error;
    }
};

// Get detailed information about a specific artwork
export const getArtworkById = async (id) => {
    try {
        const response = await fetch(
            `${ART_API_BASE}/artworks/${id}?fields=id,title,artist_title,date_display,medium_display,image_id,dimensions,credit_line,department_title`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error in getArtworkById:', error);
        throw error;
    }
};

// Re-export save function from contentService
export { saveArtwork } from './contentService';

// Aliases for TanStack Query compatibility
export const searchArtworks = searchArt;
export const getArtworkDetails = getArtworkById;