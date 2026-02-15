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
        <div className="glass-page">
            <div className="glass-container">
                {birthdayData.isBirthdayToday && (
                    <div className="glass-card" style={{ marginBottom: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2))' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎂 Happy Birthday, {birthdayData.displayName}! 🎉</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>We hope you have an amazing day!</p>
                        {birthdayData.birthday && calculateAge(birthdayData.birthday) && (
                            <p style={{ color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                                You're turning {calculateAge(birthdayData.birthday)} today!
                            </p>
                        )}
                    </div>
                )}

                <div className="glass-page-header">
                    <h1>Welcome, {birthdayData.displayName}! 👋</h1>
                    <p className="subtitle">Here's an overview of your personal collection</p>
                </div>

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

                <div className="glass-card" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Quick Actions</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        <button className="glass-btn glass-btn-sm" onClick={() => navigate('/food')}>🍽️ Find Recipes</button>
                        <button className="glass-btn glass-btn-sm" onClick={() => navigate('/weather')}>⛅ Check Weather</button>
                        <button className="glass-btn glass-btn-sm" onClick={() => navigate('/art')}>🎨 Explore Art</button>
                        <button className="glass-btn glass-btn-sm" onClick={() => navigate('/books')}>📚 Search Books</button>
                        <button className="glass-btn glass-btn-sm" onClick={() => navigate('/drinks')}>🍸 Find Drinks</button>
                        <button className="glass-btn glass-btn-sm" onClick={() => navigate('/hobbies')}>✨ New Activity</button>
                        <button className="glass-btn glass-btn-sm" onClick={() => navigate('/space')}>🚀 View Space</button>
                        <button className="glass-btn glass-btn-sm" onClick={() => navigate('/journal')}>📓 Write Journal</button>
                        <button className="glass-btn glass-btn-sm" onClick={() => navigate('/profile')}>👤 Edit Profile</button>
                    </div>
                </div>

                {savedItems.length > 0 ? (
                    <div className="glass-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ color: 'var(--text-primary)' }}>Recently Saved Items</h2>
                            <button className="glass-btn-secondary" onClick={() => navigate('/explore')}>Explore More</button>
                        </div>
                        
                        <div className="glass-grid">
                            {savedItems.slice(0, 6).map(item => (
                                <div key={item.id} className="glass-card-sm">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
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
                                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                                    
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                        <button 
                                            className="glass-btn-secondary glass-btn-sm" 
                                            style={{ flex: 1 }}
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
                                                navigate(routes[item.type]);
                                            }}
                                        >
                                            View
                                        </button>
                                        <button 
                                            className="glass-btn-secondary glass-btn-sm"
                                            onClick={() => handleDelete(item.id)}
                                            disabled={deleteItemMutation.isLoading}
                                            style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                        >
                                            {deleteItemMutation.isLoading ? 'Deleting...' : '🗑️'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="glass-empty-state">
                        <span className="glass-empty-icon">📦</span>
                        <h3>No saved items yet</h3>
                        <p>Start exploring to save items!</p>
                        <button className="glass-btn" onClick={() => navigate('/food')} style={{ marginTop: '1rem' }}>
                            Start Exploring
                        </button>
                    </div>
                )}
                
                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <button 
                        className="glass-btn-secondary"
                        onClick={() => { logout(); navigate("/login"); }}
                        style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;