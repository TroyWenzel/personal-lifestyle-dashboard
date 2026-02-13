import { auth } from '../firebase/config';
import { 
    updateProfile,
    updateEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from 'firebase/auth';


// Get current user profile
export const getUserProfile = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    // Get additional user data from localStorage or your backend
    const userData = localStorage.getItem(`user_${user.uid}`);
    const additionalData = userData ? JSON.parse(userData) : {};
    
    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified,
        metadata: user.metadata,
        birthday: additionalData.birthday || '',
        phoneNumber: user.phoneNumber || '',
        createdAt: user.metadata.creationTime,
        lastLogin: user.metadata.lastSignInTime,
        ...additionalData
    };
};

// Update user profile
export const updateUserProfile = async (profileData) => {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    try {
        // Update display name
        if (profileData.displayName) {
            await updateProfile(user, {
                displayName: profileData.displayName
            });
        }

        // Update email (requires recent authentication)
        if (profileData.email && profileData.email !== user.email) {
            await updateEmail(user, profileData.email);
        }

        // Store additional data (birthday, etc.)
        const userData = {
            birthday: profileData.birthday || '',
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));

        return { success: true, user: { ...user, ...profileData } };
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    try {
        // Re-authenticate user
        const credential = EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
        
        await reauthenticateWithCredential(user, credential);
        
        // Update password
        await updatePassword(user, newPassword);
        
        return { success: true, message: 'Password updated successfully' };
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};

// Check if today is user's birthday
export const isUserBirthday = (birthday) => {
    if (!birthday) return false;
    
    const today = new Date();
    const birthDate = new Date(birthday);
    
    return today.getMonth() === birthDate.getMonth() && 
           today.getDate() === birthDate.getDate();
};

// Calculate age from birthday
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

// Get birthday countdown
export const getBirthdayCountdown = (birthday) => {
    if (!birthday) return null;
    
    const today = new Date();
    const birthDate = new Date(birthday);
    let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    
    if (today > nextBirthday) {
        nextBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
    }
    
    const diffTime = nextBirthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
};