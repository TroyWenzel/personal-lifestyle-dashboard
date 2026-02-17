import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { useSavedItems, useDashboardStats, useDeleteItem } from "@/api/queries";
import { isUserBirthday, calculateAge, getBirthdayCountdown } from "@/api/services/userService";
import "@/styles/GlassDesignSystem.css";

function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const { data: savedItems = [], isLoading: itemsLoading } = useSavedItems();
    const { data: stats = {
        meals: 0,
        journalEntries: 0,
        activities: 0,
        books: 0,
        drinks: 0,
        spacePhotos: 0,
        locations: 0,
        artworks: 0
    }, isLoading: statsLoading } = useDashboardStats();
    const deleteItemMutation = useDeleteItem();
    
    const loading = itemsLoading || statsLoading;
    
    const birthdayData = useMemo(() => {
        if (!user) return { birthday: null, isBirthdayToday: false, countdown: null, displayName: 'User' };
        
        let userData = null;
        if (user.uid) {
            const userDataStr = localStorage.getItem(`user_${user.uid}`);
            userData = userDataStr ? JSON.parse(userDataStr) : null;
        }
        
        if (!userData) {
            const mainUserStr = localStorage.getItem('user');
            userData = mainUserStr ? JSON.parse(mainUserStr) : null;
        }
        
        const birthday = userData?.birthday || null;
        const displayName = userData?.username || userData?.displayName || user.username || user.displayName || user.email?.split('@')[0] || 'User';
        
        return {
            birthday,
            isBirthdayToday: isUserBirthday(birthday),
            countdown: getBirthdayCountdown(birthday),
            displayName
        };
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleDelete = (itemId) => {
        deleteItemMutation.mutate(itemId, {
            onSuccess: () => {
                alert("Item deleted successfully!");
            },
            onError: (error) => {
                console.error("Error deleting item:", error);
                alert("Failed to delete item. Please try again.");
            },
        });
    };

    if (loading) {
        return (
            <div className="glass-page">
                <div className="glass-loading">
                    <div className="glass-spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-page" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
            <div className="glass-container">
                {/* Birthday Banner */}
                {birthdayData.isBirthdayToday && (
                    <div style={{ 
                        background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 142, 83, 0.2))',
                        border: '2px solid rgba(255, 107, 107, 0.3)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '2rem',
                        marginBottom: '2rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎂</div>
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            Happy Birthday, {birthdayData.displayName}! 🎉
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }}>We hope you have an amazing day!</p>
                        {birthdayData.birthday && calculateAge(birthdayData.birthday) && (
                            <p style={{ color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                                You're turning {calculateAge(birthdayData.birthday)} today!
                            </p>
                        )}
                    </div>
                )}

                {/* Birthday Countdown */}
                {!birthdayData.isBirthdayToday && birthdayData.countdown && birthdayData.countdown <= 30 && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        marginBottom: '2rem',
                        textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🎂</span>
                        <span style={{ color: 'var(--text-primary)' }}>
                            Your birthday is in {birthdayData.countdown} day{birthdayData.countdown !== 1 ? 's' : ''}!
                            {birthdayData.countdown <= 7 && ' 🎉 So soon!'}
                        </span>
                    </div>
                )}

                {/* Welcome Header */}
                <div className="glass-page-header">
                    <h2>Welcome, {birthdayData.displayName}! 👋</h2>
                    <p className="subtitle">Here's an overview of your personal collection</p>
                </div>

                {/* Stats Grid */}
                <div className="glass-grid" style={{ marginBottom: '3rem' }}>
                    <div className="glass-card" onClick={() => navigate('/food')} style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
                        <h3 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{stats.meals}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Saved Meals</p>
                    </div>

                    <div className="glass-card" onClick={() => navigate('/weather')} style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛅</div>
                        <h3 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{stats.locations}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Saved Locations</p>
                    </div>

                    <div className="glass-card" onClick={() => navigate('/art')} style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
                        <h3 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{stats.artworks}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Saved Artworks</p>
                    </div>

                    <div className="glass-card" onClick={() => navigate('/books')} style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                        <h3 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{stats.books}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Saved Books</p>
                    </div>

                    <div className="glass-card" onClick={() => navigate('/drinks')} style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍸</div>
                        <h3 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{stats.drinks}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Saved Drinks</p>
                    </div>

                    <div className="glass-card" onClick={() => navigate('/hobbies')} style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                        <h3 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{stats.activities}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Saved Activities</p>
                    </div>

                    <div className="glass-card" onClick={() => navigate('/space')} style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                        <h3 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{stats.spacePhotos}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Space Photos</p>
                    </div>

                    <div className="glass-card" onClick={() => navigate('/journal')} style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📓</div>
                        <h3 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{stats.journalEntries}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Journal Entries</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Quick Actions</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        <button className="glass-btn" onClick={() => navigate('/food')}>🍽️ Find Recipes</button>
                        <button className="glass-btn" onClick={() => navigate('/weather')}>⛅ Check Weather</button>
                        <button className="glass-btn" onClick={() => navigate('/art')}>🎨 Explore Art</button>
                        <button className="glass-btn" onClick={() => navigate('/books')}>📚 Search Books</button>
                        <button className="glass-btn" onClick={() => navigate('/drinks')}>🍸 Find Drinks</button>
                        <button className="glass-btn" onClick={() => navigate('/hobbies')}>✨ New Activity</button>
                        <button className="glass-btn" onClick={() => navigate('/space')}>🚀 View Space</button>
                        <button className="glass-btn" onClick={() => navigate('/journal')}>📓 Write Journal</button>
                        <button className="glass-btn" onClick={() => navigate('/profile')}>👤 Edit Profile</button>
                    </div>
                </div>

                {/* Recently Saved Items */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ color: 'var(--text-primary)' }}>Recently Saved Items</h2>
                        <button className="glass-btn" onClick={() => navigate('/food')}>Explore More</button>
                    </div>

                    {savedItems.length === 0 ? (
                        <div className="glass-empty-state">
                            <span className="glass-empty-icon">📦</span>
                            <h3>No saved items yet</h3>
                            <p>Start exploring to save items!</p>
                            <button className="glass-btn" onClick={() => navigate('/food')}>Start Exploring</button>
                        </div>
                    ) : (
                        <div className="glass-grid">
                            {savedItems.slice(0, 6).map(item => (
                                <div key={item.id} className="glass-item-card">
                                    {item.metadata?.thumbnail && (
                                        <img 
                                            src={item.metadata.thumbnail} 
                                            alt={item.title}
                                            className="glass-item-image"
                                        />
                                    )}
                                    
                                    <div className="glass-item-info">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '1.5rem' }}>
                                                {item.type === 'meal' && '🍽️'}
                                                {item.type === 'location' && '⛅'}
                                                {item.type === 'artwork' && '🎨'}
                                                {item.type === 'book' && '📚'}
                                                {item.type === 'drink' && '🍸'}
                                                {item.type === 'activity' && '✨'}
                                                {item.type === 'spacePhoto' && '🚀'}
                                                {item.type === 'journal' && '📓'}
                                            </span>
                                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        <h3 className="glass-item-title">{item.title}</h3>
                                        
                                        <div className="glass-item-meta">
                                            {item.metadata?.category && (
                                                <span className="glass-meta-tag">{item.metadata.category}</span>
                                            )}
                                            {item.metadata?.area && (
                                                <span className="glass-meta-tag">{item.metadata.area}</span>
                                            )}
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                            <button 
                                                className="glass-btn" 
                                                onClick={() => {
                                                    const routes = {
                                                        meal: '/food',
                                                        location: '/weather',
                                                        artwork: '/art',
                                                        book: '/books',
                                                        drink: '/drinks',
                                                        activity: '/hobbies',
                                                        spacePhoto: '/space',
                                                        journal: '/journal'
                                                    };
                                                    navigate(routes[item.type], { state: { savedItem: item } });
                                                }}
                                            >
                                                View Details
                                            </button>
                                            <button 
                                                className="glass-btn-secondary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(item.id);
                                                }}
                                                disabled={deleteItemMutation.isLoading}
                                                style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                            >
                                                {deleteItemMutation.isLoading ? 'Deleting...' : '🗑️'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <button 
                        className="glass-btn-secondary" 
                        onClick={handleLogout}
                        style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;