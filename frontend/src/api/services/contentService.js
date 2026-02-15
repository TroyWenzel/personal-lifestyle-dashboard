import apiClient from '@/api/client';

// ============================================
// Generic Save Functions
// ============================================

/**
 * Generic function to save any type of content item to the backend
 * @param {Object} itemData - Formatted item data matching API schema
 * @returns {Promise} - API response
 */
export const saveItem = async (itemData) => {
    try {
        const response = await apiClient.post('/api/content/', itemData);
        return response;
    } catch (error) {
        console.error('Error saving item:', error);
        throw error;
    }
};

// ============================================
// Food/Meal Functions
// ============================================

/**
 * Format and save a meal from TheMealDB API
 * @param {Object} meal - Raw meal data from TheMealDB
 * @returns {Promise} - API response
 */
export const saveMeal = async (meal) => {
    // Extract ingredients from MealDB format (up to 20 ingredients)
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

    return saveItem({
        category: "food",
        type: "meal",
        external_id: meal.idMeal, // Store original API ID to prevent duplicates
        title: meal.strMeal,
        description: `${meal.strCategory} - ${meal.strArea}`,
        metadata: {
            thumbnail: meal.strMealThumb,
            category: meal.strCategory,
            area: meal.strArea,
            instructions: meal.strInstructions,
            ingredients: ingredients
        }
    });
};

// ============================================
// Weather/Location Functions
// ============================================

/**
 * Format and save weather location data
 * @param {Object} weatherData - Weather data from weatherService
 * @returns {Promise} - API response
 */
export const saveLocation = async (weatherData) => {
    // Handle both WeatherStack and OpenWeatherMap formats
    const location = weatherData.location || weatherData;
    const current = weatherData.current || weatherData;
    
    return saveItem({
        category: "weather",
        type: "location",
        external_id: `${location.name || weatherData.name}-${location.country || weatherData.sys?.country || 'unknown'}`,
        title: `${location.name || weatherData.name}, ${location.country || weatherData.sys?.country || 'Unknown'}`,
        description: `Weather: ${current.weather_descriptions?.[0] || current.weather?.[0]?.description || 'Unknown'}`,
        metadata: {
            temperature: current.temperature || current.main?.temp,
            feels_like: current.feelslike || current.main?.feels_like,
            humidity: current.humidity || current.main?.humidity,
            description: current.weather_descriptions?.[0] || current.weather?.[0]?.description,
            wind_speed: current.wind_speed || current.wind?.speed,
            location: location.name || weatherData.name,
            region: location.region || '',
            country: location.country || weatherData.sys?.country,
            icon: current.weather_icons?.[0] || current.weather?.[0]?.icon
        }
    });
};

// ============================================
// Art Functions
// ============================================

/**
 * Format and save artwork from Art Institute of Chicago API
 * @param {Object} artData - Raw artwork data from artService
 * @returns {Promise} - API response
 */
export const saveArtwork = async (artData) => {
    return saveItem({
        category: "art",
        type: "artwork",
        external_id: artData.id?.toString(),
        title: artData.title || 'Untitled',
        description: `By ${artData.artist_title || 'Unknown Artist'}`,
        metadata: {
            artist: artData.artist_title,
            date: artData.date_display,
            medium: artData.medium_display,
            thumbnail: artData.image_id 
                ? `https://www.artic.edu/iiif/2/${artData.image_id}/full/300,/0/default.jpg`
                : null,
            image_id: artData.image_id,
            department: artData.department_title,
            dimensions: artData.dimensions,
            credit_line: artData.credit_line
        }
    });
};

// ============================================
// Journal Functions
// ============================================

/**
 * Format and save a journal entry
 * @param {Object} journalData - Journal entry data
 * @returns {Promise} - API response
 */
export const saveJournal = async (journalData) => {
    return saveItem({
        category: "personal",
        type: "journal",
        title: journalData.title || 'Untitled Entry',
        description: journalData.content?.substring(0, 100) + '...' || '',
        user_notes: journalData.content,
        metadata: {
            mood: journalData.mood || 'neutral',
            date: journalData.date || new Date().toISOString()
        }
    });
};

// ============================================
// Activity/Hobby Functions
// ============================================

/**
 * Format and save an activity from BoredAPI
 * @param {Object} activity - Raw activity data from BoredAPI
 * @returns {Promise} - API response
 */
export const saveActivity = async (activity) => {
    return saveItem({
        category: "hobby",
        type: "activity",
        external_id: activity.key || Date.now().toString(),
        title: activity.activity,
        description: `Type: ${activity.type} | Participants: ${activity.participants}`,
        metadata: {
            type: activity.type,
            participants: activity.participants,
            price: activity.price,
            accessibility: activity.accessibility,
            link: activity.link
        }
    });
};

// ============================================
// Book Functions
// ============================================

/**
 * Format and save a book from OpenLibrary API
 * @param {Object} book - Raw book data from OpenLibrary
 * @returns {Promise} - API response
 */
export const saveBook = async (book) => {
    return saveItem({
        category: "books",
        type: "book",
        external_id: book.id || book.key || Date.now().toString(),
        title: book.title,
        description: `By ${book.author || book.author_name?.[0] || 'Unknown Author'}`,
        metadata: {
            author: book.author || book.author_name?.[0],
            year: book.year || book.first_publish_year,
            coverId: book.coverId || book.cover_i,
            coverUrl: book.coverUrl || (book.cover_i 
                ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
                : null),
            subjects: book.subjects || [],
            pages: book.pages || book.number_of_pages_median,
            isbn: book.isbn?.[0] || book.isbn
        }
    });
};

// ============================================
// Drink Functions
// ============================================

/**
 * Format and save a drink from TheCocktailDB API
 * @param {Object} drink - Raw drink data from TheCocktailDB
 * @returns {Promise} - API response
 */
export const saveDrink = async (drink) => {
    // Extract ingredients from CocktailDB format (up to 15 ingredients)
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
        const ingredient = drink[`strIngredient${i}`];
        const measure = drink[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            ingredients.push({
                ingredient: ingredient.trim(),
                measure: measure ? measure.trim() : ''
            });
        }
    }
    
    return saveItem({
        category: "drinks",
        type: "drink",
        external_id: drink.idDrink,
        title: drink.strDrink,
        description: `${drink.strCategory || 'Cocktail'} - ${drink.strAlcoholic || 'Alcoholic'}`,
        metadata: {
            category: drink.strCategory,
            alcoholic: drink.strAlcoholic,
            glass: drink.strGlass,
            instructions: drink.strInstructions,
            thumbnail: drink.strDrinkThumb,
            ingredients: ingredients,
            video: drink.strVideo
        }
    });
};

// ============================================
// Space Functions
// ============================================

/**
 * Format and save a NASA APOD photo
 * @param {Object} photo - Raw photo data from NASA API
 * @returns {Promise} - API response
 */
export const saveSpacePhoto = async (photo) => {
    return saveItem({
        category: "space",
        type: "space",
        external_id: photo.date,
        title: photo.title,
        description: `NASA APOD - ${photo.date}`,
        metadata: {
            date: photo.date,
            explanation: photo.explanation,
            media_type: photo.media_type,
            url: photo.url,
            hdurl: photo.hdurl,
            copyright: photo.copyright,
            service_version: photo.service_version
        }
    });
};

// ============================================
// Fetch Functions
// ============================================

/**
 * Fetch all saved items for the current user
 * @returns {Promise<Array>} - Array of saved content items
 */
export const getSavedItems = async () => {
    try {
        const response = await apiClient.get('/api/content/');
        return response.content || [];
    } catch (error) {
        console.error('Error fetching saved items:', error);
        // Fallback to localStorage in development mode
        if (import.meta.env.DEV) {
            console.log('Using localStorage fallback for saved items');
            return getLocalStorageItems();
        }
        throw error;
    }
};

/**
 * Fetch dashboard statistics for the current user
 * @returns {Promise<Object>} - Object containing counts for each content type
 */
export const getDashboardStats = async () => {
    try {
        const response = await apiClient.get('/api/content/stats');
        return response;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Fallback to localStorage in development mode
        if (import.meta.env.DEV) {
            console.log('Using localStorage fallback for stats');
            return getLocalStorageStats();
        }
        // Return empty stats if API fails
        return {
            meals: 0,
            journalEntries: 0,
            activities: 0,
            books: 0,
            drinks: 0,
            spacePhotos: 0,
            locations: 0,
            artworks: 0
        };
    }
};

/**
 * Delete a specific item by ID
 * @param {string|number} itemId - ID of the item to delete
 * @returns {Promise} - API response
 */
export const deleteItem = async (itemId) => {
    try {
        const response = await apiClient.delete(`/api/content/${itemId}`);
        return response;
    } catch (error) {
        console.error('Error deleting item:', error);
        throw error;
    }
};

// ============================================
// LocalStorage Fallback Functions (Development Only)
// ============================================

/**
 * Get all saved items from localStorage (development fallback)
 * @returns {Array} - Array of saved items
 */
const getLocalStorageItems = () => {
    try {
        const savedMeals = JSON.parse(localStorage.getItem('savedMeals') || '[]');
        const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        const savedActivities = JSON.parse(localStorage.getItem('savedActivities') || '[]');
        const savedBooks = JSON.parse(localStorage.getItem('savedBooks') || '[]');
        const savedDrinks = JSON.parse(localStorage.getItem('savedDrinks') || '[]');
        const savedSpacePhotos = JSON.parse(localStorage.getItem('savedSpacePhotos') || '[]');
        const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
        const savedArtworks = JSON.parse(localStorage.getItem('savedArtworks') || '[]');
        
        // Format items to match API response structure
        const formatItem = (item, type) => ({
            id: item.id || Date.now() + Math.random(),
            type: type,
            category: type === 'meal' ? 'food' : 
                     type === 'location' ? 'weather' :
                     type === 'artwork' ? 'art' : 
                     type === 'journal' ? 'personal' :
                     type === 'activity' ? 'hobby' :
                     type === 'book' ? 'books' :
                     type === 'drink' ? 'drinks' :
                     type === 'space' ? 'space' : 'other',
            title: item.title || item.strMeal || item.name || item.activity || 'Untitled',
            description: item.description || '',
            user_notes: item.user_notes || item.content || '',
            metadata: item.metadata || item,
            createdAt: item.createdAt || item.savedAt || item.date || new Date().toISOString()
        });
        
        const allItems = [
            ...savedMeals.map(item => formatItem(item, 'meal')),
            ...journalEntries.map(item => formatItem(item, 'journal')),
            ...savedActivities.map(item => formatItem(item, 'activity')),
            ...savedBooks.map(item => formatItem(item, 'book')),
            ...savedDrinks.map(item => formatItem(item, 'drink')),
            ...savedSpacePhotos.map(item => formatItem(item, 'space')),
            ...savedLocations.map(item => formatItem(item, 'location')),
            ...savedArtworks.map(item => formatItem(item, 'artwork'))
        ];
        
        // Sort by date, newest first
        return allItems.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    } catch (error) {
        console.error('Error getting localStorage items:', error);
        return [];
    }
};

/**
 * Get dashboard statistics from localStorage (development fallback)
 * @returns {Object} - Stats object
 */
const getLocalStorageStats = () => {
    try {
        return {
            meals: JSON.parse(localStorage.getItem('savedMeals') || '[]').length,
            journalEntries: JSON.parse(localStorage.getItem('journalEntries') || '[]').length,
            activities: JSON.parse(localStorage.getItem('savedActivities') || '[]').length,
            books: JSON.parse(localStorage.getItem('savedBooks') || '[]').length,
            drinks: JSON.parse(localStorage.getItem('savedDrinks') || '[]').length,
            spacePhotos: JSON.parse(localStorage.getItem('savedSpacePhotos') || '[]').length,
            locations: JSON.parse(localStorage.getItem('savedLocations') || '[]').length,
            artworks: JSON.parse(localStorage.getItem('savedArtworks') || '[]').length
        };
    } catch (error) {
        console.error('Error getting localStorage stats:', error);
        return {
            meals: 0,
            journalEntries: 0,
            activities: 0,
            books: 0,
            drinks: 0,
            spacePhotos: 0,
            locations: 0,
            artworks: 0
        };
    }
};

// ============================================
// LocalStorage Save Functions (Development Only)
// ============================================

/**
 * Save a meal to localStorage (development fallback)
 * @param {Object} meal - Meal data to save
 */
export const saveMealToLocalStorage = (meal) => {
    try {
        const savedMeals = JSON.parse(localStorage.getItem('savedMeals') || '[]');
        const newMeal = {
            id: Date.now(),
            ...meal,
            savedAt: new Date().toISOString()
        };
        savedMeals.unshift(newMeal);
        localStorage.setItem('savedMeals', JSON.stringify(savedMeals));
        return newMeal;
    } catch (error) {
        console.error('Error saving meal to localStorage:', error);
        throw error;
    }
};

/**
 * Save a location to localStorage (development fallback)
 * @param {Object} location - Location data to save
 */
export const saveLocationToLocalStorage = (location) => {
    try {
        const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
        const newLocation = {
            id: Date.now(),
            ...location,
            savedAt: new Date().toISOString()
        };
        savedLocations.unshift(newLocation);
        localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
        return newLocation;
    } catch (error) {
        console.error('Error saving location to localStorage:', error);
        throw error;
    }
};

/**
 * Save an artwork to localStorage (development fallback)
 * @param {Object} artwork - Artwork data to save
 */
export const saveArtworkToLocalStorage = (artwork) => {
    try {
        const savedArtworks = JSON.parse(localStorage.getItem('savedArtworks') || '[]');
        const newArtwork = {
            id: Date.now(),
            ...artwork,
            savedAt: new Date().toISOString()
        };
        savedArtworks.unshift(newArtwork);
        localStorage.setItem('savedArtworks', JSON.stringify(savedArtworks));
        return newArtwork;
    } catch (error) {
        console.error('Error saving artwork to localStorage:', error);
        throw error;
    }
};