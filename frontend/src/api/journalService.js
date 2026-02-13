import apiClient from './apiClient';
import { saveJournal } from './contentService';

// For backward compatibility - use contentService instead
export const getJournalEntries = async () => {
    try {
        const response = await apiClient.get('/api/content?type=journal');
        return response.content || [];
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        return [];
    }
};

export const saveJournalEntry = async (journalData) => {
    return saveJournal(journalData);
};

// Legacy localStorage functions (for development fallback)
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