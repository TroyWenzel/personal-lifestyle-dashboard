import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Import all service functions
import {
    getSavedItems,
    getDashboardStats,
    deleteItem,
    saveMeal,
    saveLocation,
    saveArtwork,
    saveJournal,
    saveActivity,
    saveBook,
    saveDrink,
    saveSpacePhoto,
} from '../services/contentService';

import { getCurrentUser, updateUserProfile } from '../services/userService';
import { getRandomMeal, searchMeals } from '../services/foodService';
import { getCurrentWeather, searchLocation } from '../services/weatherService';
import { searchArtworks, getArtworkDetails } from '../services/artService';
import { searchBooks } from '../services/bookService';
import { searchDrinks, getRandomDrink } from '../services/drinkService';
import { getRandomActivity } from '../services/hobbyService';
import { getSpacePhoto } from '../services/spaceService';
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '../services/journalService';

// ============================================
// Query Keys - Centralized for easy management
// ============================================
export const queryKeys = {
    // User
    user: ['user'],
    userProfile: (uid) => ['user', 'profile', uid],
    
    // Content
    savedItems: ['savedItems'],
    dashboardStats: ['dashboardStats'],
    
    // Food/Meals
    randomMeal: ['randomMeal'],
    searchMeals: (query) => ['meals', 'search', query],
    
    // Weather
    weather: (location) => ['weather', location],
    searchLocations: (query) => ['locations', 'search', query],
    
    // Art
    artworks: (query, page) => ['artworks', 'search', query, page],
    artworkDetails: (id) => ['artwork', 'details', id],
    
    // Books
    books: (query) => ['books', 'search', query],
    
    // Drinks
    drinks: (query) => ['drinks', 'search', query],
    randomDrink: ['randomDrink'],
    
    // Activities
    randomActivity: (params) => ['activity', 'random', params],
    
    // Space
    spacePhoto: (date) => ['spacePhoto', date],
    
    // Journal
    journalEntries: ['journalEntries'],
    journalEntry: (id) => ['journalEntry', id],
};

// ============================================
// User Queries
// ============================================

export const useUser = () => {
    return useQuery({
        queryKey: queryKeys.user,
        queryFn: getCurrentUser,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.user });
        },
    });
};

// ============================================
// Content/Dashboard Queries
// ============================================

export const useSavedItems = () => {
    return useQuery({
        queryKey: queryKeys.savedItems,
        queryFn: getSavedItems,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

export const useDashboardStats = () => {
    return useQuery({
        queryKey: queryKeys.dashboardStats,
        queryFn: getDashboardStats,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useDeleteItem = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: deleteItem,
        onSuccess: () => {
        // Invalidate both saved items and stats when an item is deleted
        queryClient.invalidateQueries({ queryKey: queryKeys.savedItems });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
        },
    });
};

// ============================================
// Save Item Mutations
// ============================================

export const useSaveMeal = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: saveMeal,
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.savedItems });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
        },
    });
};

export const useSaveLocation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: saveLocation,
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.savedItems });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
        },
    });
};

export const useSaveArtwork = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: saveArtwork,
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.savedItems });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
        },
    });
};

export const useSaveBook = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: saveBook,
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.savedItems });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
        },
    });
};

export const useSaveDrink = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: saveDrink,
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.savedItems });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
        },
    });
};

export const useSaveActivity = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: saveActivity,
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.savedItems });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
        },
    });
};

export const useSaveSpacePhoto = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: saveSpacePhoto,
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.savedItems });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
        },
    });
};

export const useSaveJournalEntry = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: saveJournal,
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.savedItems });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
        queryClient.invalidateQueries({ queryKey: queryKeys.journalEntries });
        },
    });
};

// ============================================
// Food/Meal Queries
// ============================================

export const useRandomMeal = () => {
    return useQuery({
        queryKey: queryKeys.randomMeal,
        queryFn: getRandomMeal,
        staleTime: 0, // Always fetch fresh random meal
        cacheTime: 0, // Don't cache random results
    });
};

export const useSearchMeals = (query, options = {}) => {
    return useQuery({
        queryKey: queryKeys.searchMeals(query),
        queryFn: () => searchMeals(query),
        enabled: !!query && query.length > 0, // Only run if query exists
        staleTime: 1000 * 60 * 10, // 10 minutes
        ...options,
    });
};

// ============================================
// Weather Queries
// ============================================

export const useWeather = (location, options = {}) => {
    return useQuery({
        queryKey: queryKeys.weather(location),
        queryFn: () => getCurrentWeather(location),
        enabled: !!location, // Only run if location is provided
        staleTime: 1000 * 60 * 10, // 10 minutes (weather changes slowly)
        ...options,
    });
};

export const useSearchLocations = (query, options = {}) => {
    return useQuery({
        queryKey: queryKeys.searchLocations(query),
        queryFn: () => searchLocation(query),
        enabled: !!query && query.length > 2, // Only run if query is 3+ chars
        staleTime: 1000 * 60 * 30, // 30 minutes (locations don't change)
        ...options,
    });
};

// ============================================
// Art Queries
// ============================================

export const useSearchArtworks = (query, page = 1, options = {}) => {
    return useQuery({
        queryKey: queryKeys.artworks(query, page),
        queryFn: () => searchArtworks(query, page),
        enabled: !!query && query.length > 0,
        staleTime: 1000 * 60 * 15, // 15 minutes
        ...options,
    });
};

export const useArtworkDetails = (id, options = {}) => {
    return useQuery({
        queryKey: queryKeys.artworkDetails(id),
        queryFn: () => getArtworkDetails(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 30, // 30 minutes
        ...options,
    });
};

// ============================================
// Book Queries
// ============================================

export const useSearchBooks = (query, options = {}) => {
    return useQuery({
        queryKey: queryKeys.books(query),
        queryFn: () => searchBooks(query),
        enabled: !!query && query.length > 0,
        staleTime: 1000 * 60 * 15, // 15 minutes
        ...options,
    });
};

// ============================================
// Drink Queries
// ============================================

export const useSearchDrinks = (query, options = {}) => {
    return useQuery({
        queryKey: queryKeys.drinks(query),
        queryFn: () => searchDrinks(query),
        enabled: !!query && query.length > 0,
        staleTime: 1000 * 60 * 10, // 10 minutes
        ...options,
    });
};

export const useRandomDrink = () => {
    return useQuery({
        queryKey: queryKeys.randomDrink,
        queryFn: getRandomDrink,
        staleTime: 0, // Always fetch fresh random drink
        cacheTime: 0, // Don't cache random results
    });
};

// ============================================
// Activity/Hobby Queries
// ============================================

export const useRandomActivity = (params = {}, options = {}) => {
    return useQuery({
        queryKey: queryKeys.randomActivity(params),
        queryFn: () => getRandomActivity(params),
        staleTime: 0, // Always fetch fresh random activity
        cacheTime: 0, // Don't cache random results
        ...options,
    });
};

// ============================================
// Space Queries
// ============================================

export const useSpacePhoto = (date = null, options = {}) => {
    return useQuery({
        queryKey: queryKeys.spacePhoto(date),
        queryFn: () => getSpacePhoto(date),
        staleTime: 1000 * 60 * 60, // 1 hour (NASA APOD changes daily)
        ...options,
    });
};

// ============================================
// Journal Queries
// ============================================

export const useJournalEntries = () => {
    return useQuery({
        queryKey: queryKeys.journalEntries,
        queryFn: getJournalEntries,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useCreateJournalEntry = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createJournalEntry,
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.journalEntries });
        queryClient.invalidateQueries({ queryKey: queryKeys.savedItems });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
        },
    });
};

export const useUpdateJournalEntry = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }) => updateJournalEntry(id, data),
        onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.journalEntries });
        queryClient.invalidateQueries({ queryKey: queryKeys.journalEntry(variables.id) });
        },
    });
};

export const useDeleteJournalEntry = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: deleteJournalEntry,
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.journalEntries });
        queryClient.invalidateQueries({ queryKey: queryKeys.savedItems });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
        },
    });
};