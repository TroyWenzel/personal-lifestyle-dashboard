import { useState } from 'react';
import { useRandomActivity, useSaveActivity } from '@/api/queries';
import "@/styles/GlassDesignSystem.css";

const HobbyIdeasPage = () => {
    const [activityType, setActivityType] = useState('');
    const [participants, setParticipants] = useState('');
    
    // 🚀 TanStack Query with manual refetch
    const { data: activity, isLoading, refetch } = useRandomActivity({ 
        type: activityType, 
        participants: participants 
    });
    const saveActivityMutation = useSaveActivity();

    const handleGetActivity = () => {
        refetch();
    };

    const handleSaveActivity = () => {
        if (!activity) return;

        saveActivityMutation.mutate(activity, {
            onSuccess: () => {
                alert('Activity saved successfully!');
            },
            onError: (error) => {
                console.error('Error saving activity:', error);
                alert('Failed to save activity');
            },
        });
    };

    const activityTypes = [
        { value: '', label: 'Any Type' },
        { value: 'education', label: '📚 Education' },
        { value: 'recreational', label: '🎮 Recreational' },
        { value: 'social', label: '👥 Social' },
        { value: 'diy', label: '🔨 DIY' },
        { value: 'charity', label: '❤️ Charity' },
        { value: 'cooking', label: '🍳 Cooking' },
        { value: 'relaxation', label: '🧘 Relaxation' },
        { value: 'music', label: '🎵 Music' },
        { value: 'busywork', label: '💼 Productive' }
    ];

    const getAccessibilityLabel = (value) => {
        if (value <= 0.2) return 'Very Easy';
        if (value <= 0.5) return 'Easy';
        if (value <= 0.7) return 'Moderate';
        if (value <= 0.9) return 'Challenging';
        return 'Very Challenging';
    };

    const getPriceLabel = (value) => {
        if (value === 0) return 'Free';
        if (value <= 0.3) return 'Low Cost';
        if (value <= 0.6) return 'Moderate Cost';
        return 'High Cost';
    };

    return (
        <div className="glass-page">
            <div className="glass-container">
                <div className="glass-page-header">
                    <h2>✨ Activity Ideas</h2>
                    <p className="subtitle">Beat boredom with personalized activity suggestions</p>
                </div>

                {/* Filters */}
                <div className="activity-filters">
                    <div className="filter-group">
                        <label htmlFor="type">Activity Type</label>
                        <select
                            id="type"
                            value={activityType}
                            onChange={(e) => setActivityType(e.target.value)}
                            className="filter-select"
                        >
                            {activityTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="participants">Number of People</label>
                        <select
                            id="participants"
                            value={participants}
                            onChange={(e) => setParticipants(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Any Number</option>
                            <option value="1">1 Person (Solo)</option>
                            <option value="2">2 People</option>
                            <option value="3">3 People</option>
                            <option value="4">4 People</option>
                            <option value="5">5+ People</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleGetActivity}
                        disabled={isLoading}
                        className="generate-btn"
                    >
                        {isLoading ? '🎲 Finding...' : '🎲 Get Random Activity'}
                    </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Finding the perfect activity...</p>
                    </div>
                )}

                {/* Activity Display */}
                {activity && !isLoading && (
                    <div className="activity-card">
                        <div className="activity-icon">
                            {activityTypes.find(t => t.value === activity.type)?.label.split(' ')[0] || '✨'}
                        </div>
                        
                        <h3 className="activity-title">{activity.activity}</h3>
                        
                        <div className="activity-details">
                            <div className="detail-row">
                                <span className="detail-label">Type:</span>
                                <span className="detail-value">
                                    {activityTypes.find(t => t.value === activity.type)?.label || activity.type}
                                </span>
                            </div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Participants:</span>
                                <span className="detail-value">
                                    {activity.participants} {activity.participants === 1 ? 'person' : 'people'}
                                </span>
                            </div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Accessibility:</span>
                                <span className="detail-value">
                                    {getAccessibilityLabel(activity.accessibility)}
                                </span>
                            </div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Cost:</span>
                                <span className="detail-value">
                                    {getPriceLabel(activity.price)}
                                </span>
                            </div>

                            {activity.link && (
                                <div className="detail-row">
                                    <a 
                                        href={activity.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="activity-link"
                                    >
                                        🔗 Learn More
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="activity-actions">
                            <button 
                                onClick={handleSaveActivity}
                                disabled={saveActivityMutation.isLoading}
                                className="glass-btn glass-btn-sm"
                            >
                                {saveActivityMutation.isLoading ? '💾 Saving...' : '💾 Save Activity'}
                            </button>
                            <button 
                                onClick={handleGetActivity}
                                disabled={isLoading}
                                className="secondary-btn"
                            >
                                🔄 Get Another
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!activity && !isLoading && (
                    <div className="no-results">
                        <div className="empty-state">
                            <span className="empty-icon">🎲</span>
                            <h3>Ready to Try Something New?</h3>
                            <p>Click the button above to get a random activity suggestion</p>
                            <div className="suggestion-tags">
                                <span className="suggestion-label">Or try:</span>
                                <button onClick={() => { setActivityType('recreational'); handleGetActivity(); }}>
                                    🎮 Fun Activity
                                </button>
                                <button onClick={() => { setActivityType('education'); handleGetActivity(); }}>
                                    📚 Learn Something
                                </button>
                                <button onClick={() => { setActivityType('relaxation'); handleGetActivity(); }}>
                                    🧘 Relax
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HobbyIdeasPage;