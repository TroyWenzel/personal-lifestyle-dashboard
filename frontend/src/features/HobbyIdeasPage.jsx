import { useState } from 'react';
import { getActivity } from '../api/hobbyService';

const HobbyIdeasPage = () => {
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [selectedType, setSelectedType] = useState('');

    const activityTypes = [
        { id: 'education', label: '🎓 Education', color: '#4f46e5' },
        { id: 'recreational', label: '🎯 Recreational', color: '#10b981' },
        { id: 'social', label: '👥 Social', color: '#f59e0b' },
        { id: 'diy', label: '🔨 DIY', color: '#ef4444' },
        { id: 'charity', label: '❤️ Charity', color: '#ec4899' },
        { id: 'cooking', label: '👨‍🍳 Cooking', color: '#8b5cf6' },
        { id: 'relaxation', label: '😌 Relaxation', color: '#0ea5e9' },
        { id: 'music', label: '🎵 Music', color: '#f97316' },
        { id: 'busywork', label: '💼 Busywork', color: '#64748b' }
    ];

    const fetchActivity = async () => {
        setLoading(true);
        try {
            const data = await getActivity(selectedType);
            setActivity(data);
        } catch (error) {
            console.error('Error fetching activity:', error);
            alert('Failed to fetch activity ideas');
        } finally {
            setLoading(false);
        }
    };

    const saveToFavorites = () => {
        if (activity) {
            setFavorites([...favorites, {
                ...activity,
                savedAt: new Date().toISOString(),
                id: Date.now()
            }]);
            alert('Added to favorites!');
        }
    };

    const getRandomType = () => {
        const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        setSelectedType(randomType.id);
    };

    return (
        <div className="hobby-space-theme page-content">
            <div className="container">
                <div className="page-header">
                    <h2>✨ Discover New Activities</h2>
                    <p className="subtitle">Beat boredom with personalized activity suggestions!</p>
                </div>

                <div className="controls-section">
                    <div className="filter-buttons">
                        <button 
                            className={`filter-btn ${selectedType === '' ? 'active' : ''}`}
                            onClick={() => setSelectedType('')}
                        >
                            🎲 Random
                        </button>
                        {activityTypes.map(type => (
                            <button
                                key={type.id}
                                className={`filter-btn ${selectedType === type.id ? 'active' : ''}`}
                                onClick={() => setSelectedType(type.id)}
                                style={{ borderColor: type.color }}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                    
                    <div className="controls-right">
                        <button 
                            onClick={getRandomType}
                            className="control-btn"
                        >
                            🎲 Random Type
                        </button>
                    </div>
                </div>

                <div className="search-section">
                    <div className="search-box">
                        <button 
                            onClick={fetchActivity} 
                            disabled={loading}
                            className="search-btn"
                        >
                            {loading ? 'Finding Activity...' : 'Find Activity'}
                        </button>
                    </div>
                </div>

                {activity && activity.activity && (
                    <div className="items-grid">
                        <div className="item-card">
                            <div className="card-header">
                                <span className="card-category" style={{ 
                                    backgroundColor: activityTypes.find(t => t.id === activity.type)?.color || '#6b7280'
                                }}>
                                    {activityTypes.find(t => t.id === activity.type)?.label || 'General'}
                                </span>
                                {activity.price && (
                                    <span className="meta-tag">
                                        Price: {'💵'.repeat(Math.ceil(activity.price * 5))}
                                    </span>
                                )}
                            </div>
                            
                            <div className="card-body">
                                <h3 className="card-title">{activity.activity}</h3>
                                
                                <div className="card-details">
                                    {activity.participants > 1 && (
                                        <div className="detail-item">
                                            <span className="detail-icon">👥</span>
                                            <span>{activity.participants} participants</span>
                                        </div>
                                    )}
                                    
                                    {activity.accessibility !== undefined && (
                                        <div className="detail-item">
                                            <span className="detail-icon">♿</span>
                                            <span>
                                                Accessibility: {activity.accessibility < 0.3 ? 'Easy' : 
                                                activity.accessibility < 0.7 ? 'Moderate' : 'Challenging'}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {activity.link && (
                                        <a href={activity.link} target="_blank" rel="noopener noreferrer" className="control-btn">
                                            🔗 Learn More
                                        </a>
                                    )}
                                </div>
                            </div>
                            
                            <div className="card-footer">
                                <button onClick={saveToFavorites} className="save-btn">
                                    ⭐ Save to Favorites
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {favorites.length > 0 && (
                    <div className="saved-photos-section"> {/* Reusing this class from SpacePage */}
                        <h3>⭐ Your Saved Activities</h3>
                        <div className="saved-photos-grid">
                            {favorites.map(fav => (
                                <div key={fav.id} className="saved-photo-card">
                                    <div className="saved-photo-info">
                                        <h4>{fav.activity}</h4>
                                        <div className="favorite-meta">
                                            <span className="meta-tag">
                                                {activityTypes.find(t => t.id === fav.type)?.label}
                                            </span>
                                            <span className="saved-date">
                                                {new Date(fav.savedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HobbyIdeasPage;