import apiClient from "../client";
import { saveJournal } from './contentService';

// ═══════════════════════════════════════════════════════════════
// Journal Service
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch all journal entries for the current user
 * @returns {Promise<Array>} - Array of journal entries
 */
export const getJournalEntries = async () => {
    try {
        console.log('🔍 Fetching journal entries from API...');
        const response = await apiClient.get('/api/content?type=journal');
        return response.content || [];
    } catch (error) {
        console.error('❌ Error fetching journal entries:', error);
        
        if (import.meta.env.DEV) {
            console.log('⚠️ Using localStorage fallback for journal entries');
            return getLocalJournalEntries();
        }
        
        return [];
    }
};

/**
 * Save a journal entry
 * @param {Object} journalData - Journal entry data
 * @returns {Promise} - API response
 */
export const saveJournalEntry = async (journalData) => {
    return saveJournal(journalData);
};

export const createJournalEntry = saveJournalEntry;

/**
 * Update a journal entry
 * @param {string|number} id - Entry ID
 * @param {Object} journalData - Updated entry data
 * @returns {Promise} - API response
 */
export const updateJournalEntry = async (id, journalData) => {
    try {
        const response = await apiClient.put(`/api/content/${id}`, {
            ...journalData,
            type: 'journal'
        });
        return response;
    } catch (error) {
        console.error('Error updating journal entry:', error);
        throw error;
    }
};

/**
 * Delete a journal entry
 * @param {string|number} id - Entry ID
 * @returns {Promise} - API response
 */
export const deleteJournalEntry = async (id) => {
    try {
        const response = await apiClient.delete(`/api/content/${id}`);
        return response;
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        throw error;
    }
};

// ─── LocalStorage Fallback Functions ──────────────────────────

export const getLocalJournalEntries = () => {
    try {
        return JSON.parse(localStorage.getItem('journalEntries') || '[]');
    } catch (error) {
        console.error('Error getting journal entries from localStorage:', error);
        return [];
    }
};

export const saveLocalJournalEntry = (entry) => {
    try {
        const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        entries.unshift(entry);
        localStorage.setItem('journalEntries', JSON.stringify(entries));
        return entry;
    } catch (error) {
        console.error('Error saving journal entry to localStorage:', error);
        throw error;
    }
};