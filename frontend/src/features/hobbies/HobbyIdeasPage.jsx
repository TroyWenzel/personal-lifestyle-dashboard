import { useState, useCallback } from 'react';
import apiClient from '@/api/client';
import { saveActivity } from '@/api/services/contentService';
import '@/styles/GlassDesignSystem.css';

const activityTypes = [
    { value: '',             label: 'Any Type' },
    { value: 'education',    label: '📚 Education' },
    { value: 'recreational', label: '🎮 Recreational' },
    { value: 'social',       label: '👥 Social' },
    { value: 'diy',          label: '🔨 DIY' },
    { value: 'charity',      label: '❤️ Charity' },
    { value: 'cooking',      label: '🍳 Cooking' },
    { value: 'relaxation',   label: '🧘 Relaxation' },
    { value: 'music',        label: '🎵 Music' },
    { value: 'busywork',     label: '💼 Productive' },
];

const getAccessibilityLabel = (value) => {
    if (value <= 0.2) return '🟢 Very Easy';
    if (value <= 0.5) return '🟡 Easy';
    if (value <= 0.7) return '🟠 Moderate';
    if (value <= 0.9) return '🔴 Challenging';
    return '⚫ Very Challenging';
};

const getPriceLabel = (value) => {
    if (value === 0)  return '✅ Free';
    if (value <= 0.3) return '💚 Low Cost';
    if (value <= 0.6) return '🟡 Moderate Cost';
    return '🔴 High Cost';
};

const getTypeEmoji = (typeValue) => {
    const found = activityTypes.find(t => t.value === typeValue);
    if (!found || found.value === '') return '✨';
    return found.label.split(' ')[0];
};

const HobbyIdeasPage = () => {
    const [activityType, setActivityType] = useState('');
    const [participants, setParticipants] = useState('');
    const [activity,     setActivity]     = useState(null);
    const [isLoading,    setIsLoading]    = useState(false);
    const [error,        setError]        = useState(null);
    const [isSaving,     setIsSaving]     = useState(false);
    const [saveStatus,   setSaveStatus]   = useState(null);

    const fetchActivity = useCallback(async (overrideType, overrideParticipants) => {
        const type  = overrideType         !== undefined ? overrideType         : activityType;
        const parts = overrideParticipants !== undefined ? overrideParticipants : participants;

        setIsLoading(true);
        setError(null);
        setActivity(null);
        setSaveStatus(null);

        try {
            const params = new URLSearchParams();
            if (type)  params.append('type', type);
            if (parts) params.append('participants', parts);

            const url = params.toString()
                ? `/api/hobbies/random?${params}`
                : `/api/hobbies/random`;

            const data = await apiClient.get(url);

            if (data.error) throw new Error(data.error);

            setActivity(data);
        } catch (err) {
            const message = err.response?.data?.error || err.message || 'Something went wrong. Please try again.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [activityType, participants]);

    const handleSaveActivity = async () => {
        if (!activity) return;
        setIsSaving(true);
        setSaveStatus(null);

        try {
            await saveActivity(activity);
            setSaveStatus('success');
        } catch {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const handleQuickPick = (type) => {
        setActivityType(type);
        fetchActivity(type, participants);
    };

    return (
        <div className="glass-page">
            <div className="glass-container">

                <div className="glass-page-header">
                    <h2>✨ Activity Ideas</h2>
                    <p className="subtitle">Beat boredom with personalized activity suggestions</p>
                </div>

                <div className="glass-card" style={{ marginBottom: '2rem' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                    }}>
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
                                {activityTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
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
                        onClick={() => fetchActivity()}
                        disabled={isLoading}
                        className="glass-btn"
                        style={{ width: '100%' }}
                    >
                        {isLoading ? '🎲 Finding...' : '🎲 Get Random Activity'}
                    </button>
                </div>

                {isLoading && (
                    <div className="glass-loading">
                        <div className="glass-spinner" />
                        <p>Finding the perfect activity...</p>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="glass-empty-state">
                        <span className="glass-empty-icon">😅</span>
                        <h3>Nothing Found</h3>
                        <p>{error}</p>
                        <div className="glass-suggestion-tags">
                            <button onClick={() => handleQuickPick('recreational')}>🎮 Try Recreational</button>
                            <button onClick={() => handleQuickPick('relaxation')}>🧘 Try Relaxation</button>
                            <button onClick={() => { setParticipants(''); fetchActivity(activityType, ''); }}>👥 Any Group Size</button>
                        </div>
                    </div>
                )}

                {activity && !isLoading && (
                    <div className="glass-card" style={{ animation: 'fadeInScale 0.4s ease' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                                {getTypeEmoji(activity.type)}
                            </div>
                            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                                {activity.activity}
                            </h3>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '1rem',
                            marginBottom: '2rem',
                        }}>
                            {[
                                { label: 'Type',         value: activityTypes.find(t => t.value === activity.type)?.label || activity.type },
                                { label: 'Participants', value: `${activity.participants} ${activity.participants === 1 ? 'person' : 'people'}` },
                                { label: 'Difficulty',   value: getAccessibilityLabel(activity.accessibility) },
                                { label: 'Cost',         value: getPriceLabel(activity.price) },
                            ].map(({ label, value }) => (
                                <div key={label} className="glass-card-sm" style={{ textAlign: 'center' }}>
                                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem', fontSize: '0.85rem' }}>{label}</div>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{value}</div>
                                </div>
                            ))}
                        </div>

                        {activity.link && (
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <a href={activity.link} target="_blank" rel="noopener noreferrer" className="glass-btn-secondary">
                                    🔗 Learn More
                                </a>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={handleSaveActivity}
                                disabled={isSaving}
                                className="glass-btn"
                                style={saveStatus === 'success' ? { background: 'linear-gradient(135deg,#10b981,#059669)' } : {}}
                            >
                                {isSaving ? '💾 Saving...' : saveStatus === 'success' ? '✅ Saved!' : saveStatus === 'error' ? '❌ Save Failed — Try Again' : '💾 Save Activity'}
                            </button>
                            <button onClick={() => fetchActivity()} disabled={isLoading} className="glass-btn-secondary">
                                🔄 Get Another
                            </button>
                        </div>
                    </div>
                )}

                {!activity && !isLoading && !error && (
                    <div className="glass-empty-state">
                        <span className="glass-empty-icon">🎲</span>
                        <h3>Ready to Try Something New?</h3>
                        <p>Select your preferences above, or jump in with a quick suggestion</p>
                        <div className="glass-suggestion-tags">
                            <button onClick={() => handleQuickPick('recreational')}>🎮 Fun Activity</button>
                            <button onClick={() => handleQuickPick('education')}>📚 Learn Something</button>
                            <button onClick={() => handleQuickPick('relaxation')}>🧘 Relax</button>
                            <button onClick={() => handleQuickPick('cooking')}>🍳 Cook Something</button>
                            <button onClick={() => handleQuickPick('social')}>👥 With Friends</button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default HobbyIdeasPage;