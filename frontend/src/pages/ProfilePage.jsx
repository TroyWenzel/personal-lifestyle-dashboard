import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { 
    isUserBirthday,
    calculateAge 
} from '@/api/services/userService';
import '@/styles/pages/Profile.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user: authUser, token } = useContext(AuthContext);
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
        if (authUser || token) {
            loadProfile();
        }
    }, [authUser, token]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            
            // Check if user is authenticated via AuthContext
            if (!token || !authUser) {
                navigate('/login');
                return;
            }

            // Get additional user data from localStorage if available
            const userStr = localStorage.getItem('user');
            const userData = userStr ? JSON.parse(userStr) : authUser;
            
            setProfile({
                displayName: userData.username || userData.displayName || '',
                email: userData.email || '',
                birthday: userData.birthday || '',
                phoneNumber: userData.phoneNumber || '',
                photoURL: userData.photoURL || '',
                createdAt: userData.createdAt || new Date().toISOString(),
                lastLogin: userData.lastLogin || new Date().toISOString()
            });
        } catch (error) {
            console.error('Error loading profile:', error);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            // Update localStorage
            const userStr = localStorage.getItem('user');
            const userData = JSON.parse(userStr);
            
            const updatedUser = {
                ...userData,
                username: profile.displayName,
                displayName: profile.displayName,
                birthday: profile.birthday,
                phoneNumber: profile.phoneNumber,
                photoURL: profile.photoURL
            };

            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        // Validate password strength
        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setSaving(true);

        try {
            // For now, just show success (backend integration needed)
            setSuccess('Password change requested - backend integration needed');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error changing password:', error);
            setError(error.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading-spinner">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>👤 My Profile</h1>
                <p>Manage your account settings and preferences</p>
            </div>

            {/* Birthday Banner */}
            {profile.birthday && isUserBirthday(profile.birthday) && (
                <div className="birthday-banner">
                    🎂 Happy Birthday! You're {calculateAge(profile.birthday)} today! 🎉
                </div>
            )}

            {/* Error/Success Messages */}
            {error && (
                <div className="alert alert-error">
                    ❌ {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    ✅ {success}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="profile-tabs">
                <button 
                    className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile Info
                </button>
                <button 
                    className={`tab ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                >
                    Change Password
                </button>
                <button 
                    className={`tab ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    Account Info
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {/* Profile Info Tab */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleProfileUpdate} className="profile-form">
                        <div className="form-section">
                            <h2>Personal Information</h2>
                            
                            <div className="form-group">
                                <label htmlFor="displayName">Display Name</label>
                                <input
                                    type="text"
                                    id="displayName"
                                    name="displayName"
                                    value={profile.displayName}
                                    onChange={handleInputChange}
                                    placeholder="Your display name"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={profile.email}
                                    disabled
                                    className="disabled-input"
                                />
                                <small>Email cannot be changed from here</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="birthday">Birthday</label>
                                <input
                                    type="date"
                                    id="birthday"
                                    name="birthday"
                                    value={profile.birthday}
                                    onChange={handleInputChange}
                                />
                                {profile.birthday && (
                                    <small>Age: {calculateAge(profile.birthday)} years old</small>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="phoneNumber">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={profile.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="photoURL">Profile Photo URL</label>
                                <input
                                    type="url"
                                    id="photoURL"
                                    name="photoURL"
                                    value={profile.photoURL}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/photo.jpg"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={() => navigate('/dashboard')}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* Change Password Tab */}
                {activeTab === 'password' && (
                    <form onSubmit={handlePasswordChange} className="profile-form">
                        <div className="form-section">
                            <h2>Change Password</h2>
                            
                            <div className="form-group">
                                <label htmlFor="currentPassword">Current Password</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordInputChange}
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordInputChange}
                                    placeholder="Enter new password"
                                    required
                                    minLength={6}
                                />
                                <small>Must be at least 6 characters</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordInputChange}
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Account Info Tab */}
                {activeTab === 'security' && (
                    <div className="account-info">
                        <h2>Account Information</h2>
                        
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{profile.email}</span>
                            </div>
                            
                            <div className="info-item">
                                <span className="info-label">Account Created:</span>
                                <span className="info-value">
                                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            
                            <div className="info-item">
                                <span className="info-label">Last Login:</span>
                                <span className="info-value">
                                    {profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div className="danger-zone">
                            <h3>⚠️ Danger Zone</h3>
                            <p>Once you delete your account, there is no going back.</p>
                            <button className="btn btn-danger" disabled>
                                Delete Account (Coming Soon)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;