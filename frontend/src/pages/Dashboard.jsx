import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { useSavedItems, useDashboardStats, useDeleteItem } from "@/api/queries";
import { isUserBirthday, calculateAge, getBirthdayCountdown } from "@/api/services/userService";
import "@/styles/pages/Dashboard.css";

function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // 🚀 TanStack Query - replaces all the useState and useEffect!
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
    
    // Loading state - combine both queries
    const loading = itemsLoading || statsLoading;
    
    // 🎂 Birthday calculations (memoized to avoid recalculation)
    const birthdayData = useMemo(() => {
        if (!user) return { birthday: null, isBirthdayToday: false, countdown: null, displayName: 'User' };
        
        // Try to get birthday and name from localStorage first
        let userData = null;
        if (user.uid) {
            const userDataStr = localStorage.getItem(`user_${user.uid}`);
            userData = userDataStr ? JSON.parse(userDataStr) : null;
        }
        
        // Also check the main user object in localStorage
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

    // Delete an item using mutation
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
            <div className="dashboard-container loading">
                <div className="spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* 🎂 BIRTHDAY CELEBRATION BANNER - Shows on birthday */}
            {birthdayData.isBirthdayToday && (
                <div className="birthday-celebration">
                    <div className="birthday-card">
                        <div className="birthday-emoji">🎂</div>
                        <div className="birthday-message">
                            <h2>Happy Birthday, {birthdayData.displayName}! 🎉</h2>
                            <p>We hope you have an amazing day!</p>
                            {birthdayData.birthday && calculateAge(birthdayData.birthday) && (
                                <p className="birthday-age">
                                    You're turning {calculateAge(birthdayData.birthday)} today!
                                </p>
                            )}
                            <div className="birthday-special-offer">
                                <span className="offer-badge">🎁 Birthday Special</span>
                                <span>Check out today's featured items just for you!</span>
                            </div>
                        </div>
                        <div className="birthday-emoji">🎈</div>
                    </div>
                </div>
            )}

            {/* 🎂 BIRTHDAY COUNTDOWN - Shows when birthday is within 30 days */}
            {!birthdayData.isBirthdayToday && birthdayData.countdown && birthdayData.countdown <= 30 && (
                <div className="birthday-countdown-banner">
                    <span className="countdown-icon">🎂</span>
                    <span className="countdown-text">
                        Your birthday is in {birthdayData.countdown} day{birthdayData.countdown !== 1 ? 's' : ''}! 
                        {birthdayData.countdown <= 7 ? ' 🎉 So soon!' : ''}
                    </span>
                </div>
            )}

            {/* Welcome header section */}
            <div className="dashboard-header">
                <h1>Welcome, {birthdayData.displayName}! 👋</h1>
                <p className="welcome-text">
                    Here's an overview of your personal collection
                </p>
            </div>

            {/* Statistics grid - clickable cards that navigate to respective pages */}
            <div className="stats-grid">
                <div className="stat-card" onClick={() => navigate('/food')}>
                    <div className="stat-icon">🍽️</div>
                    <div className="stat-info">
                        <h3>{stats.meals}</h3>
                        <p>Saved Meals</p>
                    </div>
                </div>
                
                <div className="stat-card" onClick={() => navigate('/weather')}>
                    <div className="stat-icon">⛅</div>
                    <div className="stat-info">
                        <h3>{stats.locations}</h3>
                        <p>Saved Locations</p>
                    </div>
                </div>

                <div className="stat-card" onClick={() => navigate('/art')}>
                    <div className="stat-icon">🎨</div>
                    <div className="stat-info">
                        <h3>{stats.artworks}</h3>
                        <p>Saved Artworks</p>
                    </div>
                </div>

                <div className="stat-card" onClick={() => navigate('/books')}>
                    <div className="stat-icon">📚</div>
                    <div className="stat-info">
                        <h3>{stats.books}</h3>
                        <p>Saved Books</p>
                    </div>
                </div>

                <div className="stat-card" onClick={() => navigate('/drinks')}>
                    <div className="stat-icon">🸸</div>
                    <div className="stat-info">
                        <h3>{stats.drinks}</h3>
                        <p>Saved Drinks</p>
                    </div>
                </div>

                <div className="stat-card" onClick={() => navigate('/hobbies')}>
                    <div className="stat-icon">✨</div>
                    <div className="stat-info">
                        <h3>{stats.activities}</h3>
                        <p>Saved Activities</p>
                    </div>
                </div>

                <div className="stat-card" onClick={() => navigate('/space')}>
                    <div className="stat-icon">🚀</div>
                    <div className="stat-info">
                        <h3>{stats.spacePhotos}</h3>
                        <p>Space Photos</p>
                    </div>
                </div>

                <div className="stat-card" onClick={() => navigate('/journal')}>
                    <div className="stat-icon">📓</div>
                    <div className="stat-info">
                        <h3>{stats.journalEntries}</h3>
                        <p>Journal Entries</p>
                    </div>
                </div>
            </div>

            {/* Quick action buttons for common tasks */}
            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <button className="action-btn" onClick={() => navigate('/food')}>
                        🍽️ Find Recipes
                    </button>
                    <button className="action-btn" onClick={() => navigate('/weather')}>
                        ⛅ Check Weather
                    </button>
                    <button className="action-btn" onClick={() => navigate('/art')}>
                        🎨 Explore Art
                    </button>
                    <button className="action-btn" onClick={() => navigate('/books')}>
                        📚 Search Books
                    </button>
                    <button className="action-btn" onClick={() => navigate('/drinks')}>
                        🸸 Find Drinks
                    </button>
                    <button className="action-btn" onClick={() => navigate('/hobbies')}>
                        ✨ New Activity
                    </button>
                    <button className="action-btn" onClick={() => navigate('/space')}>
                        🚀 View Space
                    </button>
                    <button className="action-btn" onClick={() => navigate('/journal')}>
                        📓 Write Journal
                    </button>
                    <button className="action-btn" onClick={() => navigate('/profile')}>
                        👤 Edit Profile
                    </button>
                </div>
            </div>

            {/* Recently saved items section */}
            <div className="recent-section">
                <div className="section-header">
                    <h2>Recently Saved Items</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/explore')}>
                        Explore More
                    </button>
                </div>
                
                {savedItems.length === 0 ? (
                    <div className="no-items">
                        <p>No saved items yet. Start exploring to save items!</p>
                        <button className="btn btn-primary" onClick={() => navigate('/food')}>
                            Start Exploring
                        </button>
                    </div>
                ) : (
                    <div className="items-container">
                        {savedItems.slice(0, 6).map(item => (
                            <div key={item.id} className="saved-item-card">
                                <div className="item-header">
                                    <span className="item-type">
                                        {item.type === 'meal' && '🍽️'}
                                        {item.type === 'location' && '⛅'}
                                        {item.type === 'artwork' && '🎨'}
                                        {item.type === 'book' && '📚'}
                                        {item.type === 'drink' && '🸸'}
                                        {item.type === 'activity' && '✨'}
                                        {item.type === 'spacePhoto' && '🚀'}
                                        {item.type === 'journal' && '📓'}
                                    </span>
                                    <span className="item-date">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <h3 className="item-title">{item.title}</h3>
                                
                                <div className="item-details">
                                    <p><strong>Category:</strong> {item.category}</p>
                                    
                                    {item.metadata?.area && (
                                        <p><strong>Cuisine:</strong> {item.metadata.area}</p>
                                    )}
                                    
                                    {item.description && (
                                        <p className="item-description">
                                            {item.description.substring(0, 100)}...
                                        </p>
                                    )}
                                </div>
                                
                                {item.metadata?.thumbnail && (
                                    <img 
                                        src={item.metadata.thumbnail} 
                                        alt={item.title}
                                        className="item-thumbnail"
                                    />
                                )}
                                
                                <div className="item-actions">
                                    <button className="btn-view" onClick={() => {
                                        if (item.type === 'meal') navigate('/food');
                                        else if (item.type === 'location') navigate('/weather');
                                        else if (item.type === 'artwork') navigate('/art');
                                        else if (item.type === 'book') navigate('/books');
                                        else if (item.type === 'drink') navigate('/drinks');
                                        else if (item.type === 'activity') navigate('/hobbies');
                                        else if (item.type === 'spacePhoto') navigate('/space');
                                        else if (item.type === 'journal') navigate('/journal');
                                    }}>
                                        View
                                    </button>
                                    <button 
                                        className="btn-delete"
                                        onClick={() => handleDelete(item.id)}
                                        disabled={deleteItemMutation.isLoading}
                                    >
                                        {deleteItemMutation.isLoading ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="dashboard-footer">
                <button className="btn btn-logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Dashboard;