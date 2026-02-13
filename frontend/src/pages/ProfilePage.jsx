import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getUserProfile, 
    updateUserProfile, 
    changePassword,
    isUserBirthday,
    calculateAge 
} from '../api/userService';
import '../styles/pages/Profile.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('profile'); // profile, password, security
    
    // Profile state
    const [profile, setProfile] = useState({
        displayName: '',
        email: '',
        birthday: '',
        phoneNumber: '',
        photoURL: '',
        createdAt: '',
        lastLogin: ''
    });

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Load user profile on mount
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const userData = await getUserProfile();
            setProfile({
                displayName: userData.displayName || '',
                email: userData.email || '',
                birthday: userData.birthday || '',
                phoneNumber: userData.phoneNumber || '',
                photoURL: userData.photoURL || '',
                createdAt: userData.createdAt || '',
                lastLogin: userData.lastLogin || ''
            });
        } catch (error) {
            console.error('Error loading profile:', error);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    // Handle profile update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await updateUserProfile(profile);
            setSuccess('Profile updated successfully! 🎉');
            
            // Check if today is birthday
            if (isUserBirthday(profile.birthday)) {
                setSuccess('Happy Birthday! 🎂 Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            
            if (error.code === 'auth/requires-recent-login') {
                setError('Please log out and log back in to update your email');
            } else {
                setError(error.message || 'Failed to update profile');
            }
        } finally {
            setSaving(false);
        }
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await changePassword(passwordData.currentPassword, passwordData.newPassword);
            setSuccess('Password updated successfully! 🔐');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error changing password:', error);
            
            if (error.code === 'auth/wrong-password') {
                setError('Current password is incorrect');
            } else if (error.code === 'auth/weak-password') {
                setError('Password is too weak');
            } else {
                setError(error.message || 'Failed to change password');
            }
        } finally {
            setSaving(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Check if today is birthday
    const isBirthdayToday = isUserBirthday(profile.birthday);
    const age = calculateAge(profile.birthday);

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading your profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                {isBirthdayToday && (
                    <div className="birthday-banner">
                        <div className="birthday-content">
                            <span className="birthday-emoji">🎂</span>
                            <div className="birthday-text">
                                <h2>Happy Birthday, {profile.displayName || 'there'}! 🎉</h2>
                                <p>We hope you have an amazing day! {age && `You're turning ${age}!`}</p>
                            </div>
                            <span className="birthday-emoji">🎈</span>
                        </div>
                        <div className="birthday-confetti"></div>
                    </div>
                )}

                <div className="profile-layout">
                    <aside className="profile-sidebar">
                        <div className="profile-avatar">
                            {profile.photoURL ? (
                                <img src={profile.photoURL} alt={profile.displayName} />
                            ) : (
                                <div className="avatar-placeholder">
                                    {profile.displayName?.charAt(0) || profile.email?.charAt(0) || '👤'}
                                </div>
                            )}
                        </div>
                        
                        <h2 className="profile-name">
                            {profile.displayName || 'Add your name'}
                        </h2>
                        
                        <p className="profile-email">{profile.email}</p>
                        
                        {profile.birthday && (
                            <div className="profile-birthday">
                                <span className="birthday-icon">🎂</span>
                                <span>{formatDate(profile.birthday)}</span>
                                {age && <span className="age-badge">Age: {age}</span>}
                            </div>
                        )}
                        
                        <div className="profile-stats">
                            <div className="stat-item">
                                <span className="stat-label">Member since</span>
                                <span className="stat-value">{formatDate(profile.createdAt).split(',')[1] || formatDate(profile.createdAt)}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Last login</span>
                                <span className="stat-value">{formatDate(profile.lastLogin).split(',')[1] || formatDate(profile.lastLogin)}</span>
                            </div>
                        </div>

                        <div className="profile-tabs">
                            <button 
                                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <span className="tab-icon">👤</span>
                                <span className="tab-text">Profile</span>
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                                onClick={() => setActiveTab('password')}
                            >
                                <span className="tab-icon">🔐</span>
                                <span className="tab-text">Password</span>
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                                onClick={() => setActiveTab('security')}
                            >
                                <span className="tab-icon">🛡️</span>
                                <span className="tab-text">Security</span>
                            </button>
                        </div>
                    </aside>

                    <main className="profile-main">
                        {error && (
                            <div className="alert alert-error">
                                <span className="alert-icon">⚠️</span>
                                <span className="alert-message">{error}</span>
                            </div>
                        )}
                        
                        {success && (
                            <div className="alert alert-success">
                                <span className="alert-icon">✅</span>
                                <span className="alert-message">{success}</span>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="profile-card glass-card">
                                <h3>Edit Profile</h3>
                                <form onSubmit={handleProfileUpdate}>
                                    <div className="form-group">
                                        <label className="form-label">Display Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={profile.displayName}
                                            onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                                            placeholder="Your name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            value={profile.email}
                                            onChange={(e) => setProfile({...profile, email: e.target.value})}
                                            placeholder="your@email.com"
                                        />
                                        <small className="form-hint">
                                            You'll need to log in again after changing your email
                                        </small>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Birthday</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={profile.birthday}
                                            onChange={(e) => setProfile({...profile, birthday: e.target.value})}
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                        {profile.birthday && (
                                            <small className="form-hint birthday-countdown">
                                                {isBirthdayToday ? (
                                                    <span className="birthday-today">🎉 Today is your birthday! 🎂</span>
                                                ) : (
                                                    `🎈 You'll be ${age + 1} on your next birthday`
                                                )}
                                            </small>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Phone Number (Optional)</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            value={profile.phoneNumber}
                                            onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
                                            placeholder="(555) 123-4567"
                                        />
                                    </div>

                                    <div className="form-actions">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <span className="spinner-small"></span>
                                                    Saving...
                                                </>
                                            ) : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="profile-card glass-card">
                                <h3>Change Password</h3>
                                <form onSubmit={handlePasswordChange}>
                                    <div className="form-group">
                                        <label className="form-label">Current Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                            placeholder="Enter current password"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">New Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                            placeholder="Enter new password"
                                            required
                                            minLength={6}
                                        />
                                        <small className="form-hint">
                                            Password must be at least 6 characters
                                        </small>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            placeholder="Confirm new password"
                                            required
                                        />
                                    </div>

                                    <div className="form-actions">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <span className="spinner-small"></span>
                                                    Updating...
                                                </>
                                            ) : 'Update Password'}
                                        </button>
                                    </div>
                                </form>

                                <div className="password-requirements">
                                    <h4>Password Requirements:</h4>
                                    <ul>
                                        <li className={passwordData.newPassword.length >= 6 ? 'met' : ''}>
                                            ✓ At least 6 characters
                                        </li>
                                        <li className={/[A-Z]/.test(passwordData.newPassword) ? 'met' : ''}>
                                            ✓ At least one uppercase letter
                                        </li>
                                        <li className={/[0-9]/.test(passwordData.newPassword) ? 'met' : ''}>
                                            ✓ At least one number
                                        </li>
                                        <li className={passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword ? 'met' : ''}>
                                            ✓ Passwords match
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="profile-card glass-card">
                                <h3>Security Settings</h3>
                                
                                <div className="security-section">
                                    <div className="security-item">
                                        <div className="security-info">
                                            <h4>Account Age</h4>
                                            <p>Member since {formatDate(profile.createdAt)}</p>
                                        </div>
                                        <span className="security-badge">Verified</span>
                                    </div>

                                    <div className="security-item">
                                        <div className="security-info">
                                            <h4>Email Verification</h4>
                                            <p>Your email is verified and secure</p>
                                        </div>
                                        <span className="security-badge success">✅ Verified</span>
                                    </div>

                                    <div className="security-item">
                                        <div className="security-info">
                                            <h4>Two-Factor Authentication</h4>
                                            <p>Add an extra layer of security to your account</p>
                                        </div>
                                        <button className="btn btn-secondary">
                                            Enable 2FA
                                        </button>
                                    </div>

                                    <div className="security-item">
                                        <div className="security-info">
                                            <h4>Birthday Privacy</h4>
                                            <p>Your birthday is {profile.birthday ? 'set' : 'not set'}</p>
                                        </div>
                                        <span className="security-badge">
                                            {profile.birthday ? 'Private' : 'Not Set'}
                                        </span>
                                    </div>

                                    <div className="security-item warning">
                                        <div className="security-info">
                                            <h4>Delete Account</h4>
                                            <p>Permanently delete your account and all data</p>
                                        </div>
                                        <button className="btn btn-error">
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;