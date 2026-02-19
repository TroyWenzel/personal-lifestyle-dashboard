import apiClient from '../client';

// ═══════════════════════════════════════════════════════════════
// User Service
// ═══════════════════════════════════════════════════════════════

/**
 * Get current user from backend
 * @returns {Promise<Object>} - User data
 */
export const getCurrentUser = async () => {
    try {
        const response = await apiClient.get('/api/users/me');
        return response;
    } catch (error) {
        console.error('Error getting current user:', error);
        throw error;
    }
};

/**
 * Get user profile
 * @returns {Promise<Object>} - User profile data
 */
export const getUserProfile = async () => {
    try {
        const response = await apiClient.get('/api/users/profile');
        return response;
    } catch (error) {
        console.error('Error getting user profile:', error);
        
        // Fallback to localStorage
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No user logged in');
        
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        return {
            uid: payload.sub || payload.user_id,
            email: payload.email || '',
            displayName: payload.username || '',
            username: payload.username || '',
        };
    }
};

/**
 * Update user profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise<Object>} - API response
 */
export const updateUserProfile = async (profileData) => {
    try {
        const response = await apiClient.put('/api/users/profile', profileData);
        
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return response;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

/**
 * Update user email
 * @param {string} newEmail - New email address
 * @param {string} currentPassword - Current password for verification
 * @returns {Promise<Object>} - API response
 */
export const updateUserEmail = async (newEmail, currentPassword) => {
    try {
        const response = await apiClient.put('/api/users/email', {
            email: newEmail,
            currentPassword: currentPassword
        });
        return response;
    } catch (error) {
        console.error('Error updating email:', error);
        throw error;
    }
};

/**
 * Update user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - API response
 */
export const updateUserPassword = async (currentPassword, newPassword) => {
    try {
        const response = await apiClient.put('/api/users/password', {
            currentPassword,
            newPassword
        });
        return response;
    } catch (error) {
        console.error('Error updating password:', error);
        throw error;
    }
};

// ─── Birthday Utility Functions ───────────────────────────────

export const isUserBirthday = (birthday) => {
    if (!birthday) return false;
    
    const today = new Date();
    const birthDate = new Date(birthday);
    
    return (
        today.getMonth() === birthDate.getMonth() &&
        today.getDate() === birthDate.getDate()
    );
};

export const calculateAge = (birthday) => {
    if (!birthday) return null;
    
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
};

export const getBirthdayCountdown = (birthday) => {
    if (!birthday) return null;
    
    const today = new Date();
    const birthDate = new Date(birthday);
    const currentYear = today.getFullYear();
    
    let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    
    if (nextBirthday < today) {
        nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }
    
    const diffTime = nextBirthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
};

// ─── LocalStorage Fallback Functions ──────────────────────────

export const getUserFromLocalStorage = () => {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error reading user from localStorage:', error);
        return null;
    }
};

export const saveUserToLocalStorage = (userData) => {
    try {
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.uid) {
            localStorage.setItem(`user_${userData.uid}`, JSON.stringify(userData));
        }
    } catch (error) {
        console.error('Error saving user to localStorage:', error);
    }
};