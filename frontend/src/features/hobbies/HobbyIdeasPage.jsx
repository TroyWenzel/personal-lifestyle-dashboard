import { useState } from 'react';
import { useRandomActivity, useSaveActivity } from '@/api/queries';
import '@/styles/GlassDesignSystem.css';

const HobbyIdeasPage = () => {
    const [activityType, setActivityType] = useState('');
    const [participants, setParticipants] = useState('');
    
    // 🚀 TanStack Query - manually triggered with enabled: false
    const { data: activity, isLoading, refetch } = useRandomActivity({ 
        type: activityType, 
        participants: participants 
    }, { enabled: false });
    
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

                <div className="glass-card" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                Activity Type
                            </label>
                            <select
                                value={activityType}
                                onChange={(e) => setActivityType(e.target.value)}
                                className="glass-select"
                                style={{ width: '100%' }}
                            >
                                {activityTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                Number of People
                            </label>
                            <select
                                value={participants}
                                onChange={(e) => setParticipants(e.target.value)}
                                className="glass-select"
                                style={{ width: '100%' }}
                            >
                                <option value="">Any Number</option>
                                <option value="1">1 Person (Solo)</option>
                                <option value="2">2 People</option>
                                <option value="3">3 People</option>
                                <option value="4">4 People</option>
                                <option value="5">5+ People</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleGetActivity}
                        disabled={isLoading}
                        className="glass-btn"
                        style={{ width: '100%' }}
                    >
                        {isLoading ? '🎲 Finding...' : '🎲 Get Random Activity'}
                    </button>
                </div>

                {isLoading && (
                    <div className="glass-loading">
                        <div className="glass-spinner"></div>
                        <p>Finding the perfect activity...</p>
                    </div>
                )}

                {activity && !isLoading && (
                    <div className="glass-card">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                                {activityTypes.find(t => t.value === activity.type)?.label.split(' ')[0] || '✨'}
                            </div>
                            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: '1rem' }}>
                                {activity.activity}
                            </h3>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="glass-card-sm" style={{ textAlign: 'center' }}>
                                <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Type</div>
                                <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                                    {activityTypes.find(t => t.value === activity.type)?.label || activity.type}
                                </div>
                            </div>
                            
                            <div className="glass-card-sm" style={{ textAlign: 'center' }}>
                                <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Participants</div>
                                <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                                    {activity.participants} {activity.participants === 1 ? 'person' : 'people'}
                                </div>
                            </div>
                            
                            <div className="glass-card-sm" style={{ textAlign: 'center' }}>
                                <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Difficulty</div>
                                <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                                    {getAccessibilityLabel(activity.accessibility)}
                                </div>
                            </div>
                            
                            <div className="glass-card-sm" style={{ textAlign: 'center' }}>
                                <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Cost</div>
                                <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                                    {getPriceLabel(activity.price)}
                                </div>
                            </div>
                        </div>

                        {activity.link && (
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <a 
                                    href={activity.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="glass-btn-secondary"
                                >
                                    🔗 Learn More
                                </a>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button 
                                onClick={handleSaveActivity}
                                disabled={saveActivityMutation.isLoading}
                                className="glass-btn"
                            >
                                {saveActivityMutation.isLoading ? '💾 Saving...' : '💾 Save Activity'}
                            </button>
                            <button 
                                onClick={handleGetActivity}
                                disabled={isLoading}
                                className="glass-btn-secondary"
                            >
                                🔄 Get Another
                            </button>
                        </div>
                    </div>
                )}

                {!activity && !isLoading && (
                    <div className="glass-empty-state">
                        <span className="glass-empty-icon">🎲</span>
                        <h3>Ready to Try Something New?</h3>
                        <p>Click the button above to get a random activity suggestion</p>
                        <div className="glass-suggestion-tags">
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
                )}
            </div>
        </div>
    );
};

export default HobbyIdeasPage;