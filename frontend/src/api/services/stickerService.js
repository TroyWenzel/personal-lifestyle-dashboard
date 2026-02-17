// Klipy Stickers API Service - CORRECT API
import axios from 'axios';

const RAPIDAPI_KEY = '7f46012794msh86675c2a25ae2dbp11462fjsn8ae064daae3f';
const RAPIDAPI_HOST = 'klipy-gifs-stickers-clips.p.rapidapi.com';
const CUSTOMER_ID = '4R66DAS'; // Required by Klipy

/**
 * Search for stickers using Klipy API
 * @param {string} query - Search term (e.g., "happy", "love", "celebration")
 * @param {number} limit - Number of stickers to return (default: 20)
 * @returns {Promise} - Array of sticker objects
 */
export const searchStickers = async (query, limit = 20) => {
    try {
        console.log('🎨 Fetching stickers for:', query);
        
        const options = {
            method: 'GET',
            url: `https://${RAPIDAPI_HOST}/Lv4AhGjw9VAYXZEOMuUDXF7fqNS3SIFbduFRcfIzwQ0AublWHCVayOyD1cvxL8Xq/stickers/search`,
            params: {
                customer_id: CUSTOMER_ID,
                locale: 'us',
                q: query,
                page: '1',
                per_page: limit.toString()
            },
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        };

        const response = await axios.request(options);
        console.log('✅ Stickers API response:', response.data);
        
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching stickers:', error);
        console.error('Error details:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get trending stickers
 * @param {number} limit - Number of stickers to return
 * @returns {Promise} - Array of trending sticker objects
 */
export const getTrendingStickers = async (limit = 20) => {
    try {
        console.log('🎨 Fetching trending stickers');
        
        const options = {
            method: 'GET',
            url: `https://${RAPIDAPI_HOST}/Lv4AhGjw9VAYXZEOMuUDXF7fqNS3SIFbduFRcfIzwQ0AublWHCVayOyD1cvxL8Xq/stickers/trending`,
            params: {
                customer_id: CUSTOMER_ID,
                locale: 'us',
                page: '1',
                per_page: limit.toString()
            },
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        };

        const response = await axios.request(options);
        console.log('✅ Trending stickers response:', response.data);
        
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching trending stickers:', error);
        throw error;
    }
};

// Common sticker categories for journal moods
export const MOOD_STICKER_CATEGORIES = {
    happy: ['happy', 'smile', 'joy', 'celebrate'],
    sad: ['sad', 'cry', 'tears', 'comfort'],
    excited: ['excited', 'party', 'yay', 'celebration'],
    calm: ['calm', 'peace', 'relax', 'zen'],
    anxious: ['anxious', 'worry', 'stress', 'nervous'],
    grateful: ['grateful', 'thank you', 'blessed', 'hearts'],
    angry: ['angry', 'mad', 'frustrated', 'upset'],
    neutral: ['emoji', 'face', 'neutral', 'expression']
};