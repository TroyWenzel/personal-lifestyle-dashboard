import { useState, useEffect } from 'react';
import { getAstronomyPicture } from '@/api/services/spaceService';
import '@/styles/GlassDesignSystem.css';
import '@/styles/features/Space.css';

const SpacePage = () => {
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [date, setDate] = useState('');

    // Fetch today's APOD
    const fetchPhoto = async (specificDate = '') => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAstronomyPicture(specificDate);
            
            if (data.error) {
                throw new Error(data.error.message || 'NASA API error');
            }
            
            setPhoto(data);
            if (specificDate) {
                setDate(specificDate);
            }
        } catch (error) {
            console.error('Error fetching space photo:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhoto();
    }, []);

    const handleDateSubmit = (e) => {
        e.preventDefault();
        if (date) {
            fetchPhoto(date);
        }
    };

    return (
        <div className="space-page">
            {/* Static Carina Nebula Background */}
            <div className="space-background-static"></div>
            
            {/* Dark overlay for readability */}
            <div className="space-overlay"></div>

            <div className="glass-container space-content">
                <div className="glass-page-header">
                    <h2>🚀 Space Explorer</h2>
                    <p className="subtitle">
                        Astronomy Picture of the Day from NASA
                    </p>
                </div>

                {/* Date Picker */}
                <div className="space-date-section">
                    <form onSubmit={handleDateSubmit} className="glass-search-box">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="glass-input"
                            placeholder="Select a date"
                        />
                        <button type="submit" className="glass-btn">
                            🔍 View Photo
                        </button>
                    </form>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="glass-loading">
                        <div className="glass-spinner"></div>
                        <p>Loading astronomy photo...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="glass-empty-state">
                        <span className="glass-empty-icon">⚠️</span>
                        <h3>Error Loading Photo</h3>
                        <p>{error}</p>
                        <button onClick={() => fetchPhoto()} className="glass-btn">
                            Try Again
                        </button>
                    </div>
                )}

                {/* Photo Display */}
                {!loading && !error && photo && (
                    <div className="space-photo-card">
                        {photo.media_type === 'image' ? (
                            <div className="space-image-container">
                                <img
                                    src={photo.hdurl || photo.url}
                                    alt={photo.title}
                                    className="space-main-image"
                                />
                            </div>
                        ) : photo.media_type === 'video' ? (
                            <div className="space-video-container">
                                <iframe
                                    src={photo.url}
                                    title={photo.title}
                                    className="space-video"
                                    frameBorder="0"
                                    allowFullScreen
                                />
                            </div>
                        ) : null}

                        <div className="space-info-section">
                            <h3 className="space-photo-title">{photo.title}</h3>
                            
                            {photo.date && (
                                <p className="space-date">
                                    📅 {new Date(photo.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            )}

                            {photo.copyright && (
                                <p className="space-copyright">
                                    📸 Copyright: {photo.copyright}
                                </p>
                            )}

                            <p className="space-explanation">{photo.explanation}</p>

                            <div className="space-actions">
                                {photo.hdurl && (
                                    <a
                                        href={photo.hdurl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="glass-btn"
                                    >
                                        🖼️ View HD Image
                                    </a>
                                )}
                                <button
                                    onClick={() => fetchPhoto()}
                                    className="glass-btn-secondary"
                                >
                                    🔄 Today's Photo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpacePage;