// ═══════════════════════════════════════════════════════════════
// NASA APOD API Service
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch Astronomy Picture of the Day from NASA API
 * @param {string} date - Optional date in YYYY-MM-DD format
 * @returns {Promise<Object>} - APOD data
 */
export const getAstronomyPicture = async (date = '') => {
    try {
        const apiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
        
        let url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
        
        if (date) {
            url += `&date=${date}`;
        }
        
        console.log('Fetching NASA APOD from:', url.replace(apiKey, '***'));
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.msg || `Failed to fetch astronomy picture: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message || 'NASA API error');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching astronomy picture:', error);
        
        if (import.meta.env.DEV) {
            return {
                date: date || new Date().toISOString().split('T')[0],
                title: "Sample Space Image - Development Mode",
                explanation: "This is sample data because we're in development mode or the NASA API is unavailable.",
                url: "https://apod.nasa.gov/apod/image/2401/OrionNebula_Hubble_960.jpg",
                media_type: "image",
                hdurl: "https://apod.nasa.gov/apod/image/2401/OrionNebula_Hubble_3000.jpg",
                copyright: "NASA, ESA, Hubble Heritage Team",
                service_version: "v1"
            };
        }
        
        throw error;
    }
};

/**
 * Fetch multiple APODs for a date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Array>} - Array of APOD data
 */
export const getAstronomyPictures = async (startDate, endDate) => {
    try {
        const apiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
        const response = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`
        );
        if (!response.ok) throw new Error('Failed to fetch astronomy pictures');
        const data = await response.json();
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        console.error('Error fetching astronomy pictures:', error);
        throw error;
    }
};

/**
 * Fetch a random APOD from available dates
 * @returns {Promise<Object>} - Random APOD data
 */
export const getRandomAstronomyPicture = async () => {
    try {
        const start = new Date(1995, 5, 16);
        const end = new Date();
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        const formattedDate = randomDate.toISOString().split('T')[0];
        
        return await getAstronomyPicture(formattedDate);
    } catch (error) {
        console.error('Error fetching random astronomy picture:', error);
        return await getAstronomyPicture();
    }
};

export const getTodaysAstronomyPicture = async () => {
    return await getAstronomyPicture();
};

// ─── LocalStorage Fallback Functions ──────────────────────────

export const saveSpacePhoto = async (photoData) => {
    try {
        const savedPhotos = JSON.parse(localStorage.getItem('savedSpacePhotos') || '[]');

        const exists = savedPhotos.some(photo => photo.date === photoData.date);
        
        if (!exists) {
            savedPhotos.push(photoData);
            localStorage.setItem('savedSpacePhotos', JSON.stringify(savedPhotos));
            return { success: true, message: 'Photo saved locally' };
        } else {
            return { success: false, message: 'Photo already saved' };
        }
    } catch (error) {
        console.error('Error saving space photo:', error);
        return { success: false, message: 'Failed to save photo' };
    }
};

export const getSavedSpacePhotos = () => {
    try {
        const savedPhotos = JSON.parse(localStorage.getItem('savedSpacePhotos') || '[]');
        return savedPhotos;
    } catch (error) {
        console.error('Error getting saved photos:', error);
        return [];
    }
};

export const removeSavedSpacePhoto = (date) => {
    try {
        const savedPhotos = JSON.parse(localStorage.getItem('savedSpacePhotos') || '[]');
        const filteredPhotos = savedPhotos.filter(photo => photo.date !== date);
        localStorage.setItem('savedSpacePhotos', JSON.stringify(filteredPhotos));
        return { success: true, message: 'Photo removed' };
    } catch (error) {
        console.error('Error removing saved photo:', error);
        return { success: false, message: 'Failed to remove photo' };
    }
};

export const getSpacePhoto = getAstronomyPicture;