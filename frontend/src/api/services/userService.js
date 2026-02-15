import apiClient from '../client';

// Get current user from backend
export const getCurrentUser = async () => {
    try {
        const response = await apiClient.get('/api/users/me');
        return response;
    } catch (error) {
        console.error('Error getting current user:', error);
        throw error;
    }
};

// Get user profile
export const getUserProfile = async () => {
    try {
        // Try to get from backend first
        const response = await apiClient.get('/api/users/profile');
        return response;
    } catch (error) {
        console.error('Error getting user profile:', error);
        
        // Fallback to localStorage
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No user logged in');
        
        // Decode JWT to get user info (basic implementation)
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

// Update user profile
export const updateUserProfile = async (profileData) => {
    try {
        const response = await apiClient.put('/api/users/profile', profileData);
        
        // Also update localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return response;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

// Update email
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

// Update password
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

// Birthday utility functions
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
    
    // Get next birthday
    let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    
    // If birthday already passed this year, use next year
    if (nextBirthday < today) {
        nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }
    
    // Calculate days until birthday
    const diffTime = nextBirthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
};

// Get user data from localStorage (development/fallback)
export const getUserFromLocalStorage = () => {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error reading user from localStorage:', error);
        return null;
    }
};

// Save user data to localStorage (development/fallback)
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