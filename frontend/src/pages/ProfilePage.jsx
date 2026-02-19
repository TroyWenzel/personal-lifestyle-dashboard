import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import apiClient from '@/api/client';
import { isUserBirthday, calculateAge } from '@/api/services/userService';
import '@/styles/GlassDesignSystem.css';
import { useToast, ToastContainer, ConfirmDialog } from '@/components/ui/Toast';

const ProfilePage = () => {
    const { toasts, toast, removeToast } = useToast();
    const [confirmStep, setConfirmStep] = useState(0); // 0=none, 1=first, 2=second
    const navigate = useNavigate();
    const { user: authUser, token } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('profile');
    
    const [profile, setProfile] = useState({
        displayName: '',
        email: '',
        birthday: '',
        phoneNumber: '',
        photoURL: '',
        createdAt: '',
        lastLogin: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (authUser || token) {
            loadProfile();
        } else {
            navigate('/login');
        }
    }, [authUser, token, navigate]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            
            if (!token || !authUser) {
                navigate('/login');
                return;
            }

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

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setSaving(true);

        try {
            setSuccess('Password change feature - backend integration needed');
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
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleDeleteAccount = () => {
        setConfirmStep(1);
    };

    const doDeleteAccount = async () => {
        setConfirmStep(0);
        try {
            setSaving(true);
            await apiClient.delete('/auth/delete-account');
            localStorage.clear();
            navigate('/register');
        } catch (err) {
            console.error('Delete account error:', err);
            setError('Failed to delete account. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="glass-page">
                <div className="glass-loading">
                    <div className="glass-spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="glass-page">
            <div className="glass-container" style={{ maxWidth: '800px' }}>
                <div className="glass-page-header">
                    <h2>👤 My Profile</h2>
                    <p className="subtitle">Manage your account settings and preferences</p>
                </div>

                {profile.birthday && isUserBirthday(profile.birthday) && (
                    <div className="glass-card" style={{ textAlign: 'center', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2))' }}>
                        <h3 style={{ color: 'var(--text-primary)' }}>🎂 Happy Birthday! You are {calculateAge(profile.birthday)} today! 🎉</h3>
                    </div>
                )}

                {error && (
                    <div className="glass-card" style={{ marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        <p style={{ color: '#ef4444', margin: 0 }}>❌ {error}</p>
                    </div>
                )}
                
                {success && (
                    <div className="glass-card" style={{ marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                        <p style={{ color: '#10b981', margin: 0 }}>✅ {success}</p>
                    </div>
                )}

                <div className="glass-card" style={{ padding: 0 }}>
                    <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', padding: '1.5rem' }}>
                        <button 
                            className={activeTab === 'profile' ? 'glass-btn glass-btn-sm' : 'glass-btn-secondary glass-btn-sm'}
                            onClick={() => setActiveTab('profile')}
                        >
                            📝 Profile Info
                        </button>
                        <button 
                            className={activeTab === 'password' ? 'glass-btn glass-btn-sm' : 'glass-btn-secondary glass-btn-sm'}
                            onClick={() => setActiveTab('password')}
                        >
                            🔐 Password
                        </button>
                        <button 
                            className={activeTab === 'account' ? 'glass-btn glass-btn-sm' : 'glass-btn-secondary glass-btn-sm'}
                            onClick={() => setActiveTab('account')}
                        >
                            ⚙️ Account
                        </button>
                    </div>

                    <div style={{ padding: '2rem' }}>
                        {activeTab === 'profile' && (
                            <form onSubmit={handleProfileUpdate}>
                                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Personal Information</h3>
                                
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={profile.displayName}
                                        onChange={handleInputChange}
                                        placeholder="Your display name"
                                        className="glass-input"
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        disabled
                                        className="glass-input"
                                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                                    />
                                    <small style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                        Email cannot be changed
                                    </small>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                        Birthday
                                    </label>
                                    <input
                                        type="date"
                                        name="birthday"
                                        value={profile.birthday}
                                        onChange={handleInputChange}
                                        className="glass-input"
                                    />
                                    {profile.birthday && calculateAge(profile.birthday) && (
                                        <small style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                            Age: {calculateAge(profile.birthday)} years old
                                        </small>
                                    )}
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={profile.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="+1 (555) 123-4567"
                                        className="glass-input"
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button type="submit" className="glass-btn" disabled={saving}>
                                        {saving ? 'Saving...' : '💾 Save Changes'}
                                    </button>
                                    <button type="button" className="glass-btn-secondary" onClick={() => navigate('/dashboard')}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'password' && (
                            <form onSubmit={handlePasswordChange}>
                                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Change Password</h3>
                                
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordInputChange}
                                        placeholder="Enter current password"
                                        required
                                        className="glass-input"
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordInputChange}
                                        placeholder="Enter new password"
                                        required
                                        minLength={6}
                                        className="glass-input"
                                    />
                                    <small style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                        Must be at least 6 characters
                                    </small>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordInputChange}
                                        placeholder="Confirm new password"
                                        required
                                        className="glass-input"
                                    />
                                </div>

                                <button type="submit" className="glass-btn" disabled={saving}>
                                    {saving ? 'Changing...' : '🔐 Change Password'}
                                </button>
                            </form>
                        )}

                        {activeTab === 'account' && (
                            <div>
                                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Account Information</h3>
                                
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{profile.email}</span>
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Account Created:</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                                            {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Last Login:</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                                            {profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="glass-card" style={{ marginTop: '2rem', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                                    <h4 style={{ color: '#ef4444', marginBottom: '0.75rem' }}>⚠️ Danger Zone</h4>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                                        Once you delete your account, there is no going back. Please be certain.
                                    </p>
                                    <button 
                                        className="glass-btn-secondary" 
                                        onClick={handleDeleteAccount}
                                        disabled={saving}
                                        style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                                    >
                                        {saving ? 'Deleting...' : '🗑️ Delete Account'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

            {confirmStep === 1 && (
                <ConfirmDialog
                    message="Are you absolutely sure you want to delete your account? This will permanently delete your account and ALL saved items. This cannot be undone."
                    confirmLabel="Yes, Delete"
                    onConfirm={() => setConfirmStep(2)}
                    onCancel={() => setConfirmStep(0)}
                />
            )}
            {confirmStep === 2 && (
                <ConfirmDialog
                    message="Last chance — delete your account permanently? There is no going back."
                    confirmLabel="Delete Forever"
                    onConfirm={doDeleteAccount}
                    onCancel={() => setConfirmStep(0)}
                />
            )}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
};

export default ProfilePage;