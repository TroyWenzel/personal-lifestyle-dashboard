import { useState } from 'react';
import { useSpacePhoto, useSaveSpacePhoto } from '@/api/queries';
import "@/styles/GlassDesignSystem.css";

const SpacePage = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [dateToFetch, setDateToFetch] = useState(null);

    // 🚀 TanStack Query
    const { data: spacePhoto, isLoading, refetch } = useSpacePhoto(dateToFetch);
    const savePhotoMutation = useSaveSpacePhoto();

    const handleFetchPhoto = () => {
        setDateToFetch(selectedDate || null);
    };

    const handleSavePhoto = () => {
        if (!spacePhoto) return;

        const photoData = {
            title: spacePhoto.title,
            date: spacePhoto.date,
            explanation: spacePhoto.explanation,
            url: spacePhoto.url,
            hdurl: spacePhoto.hdurl,
            media_type: spacePhoto.media_type,
            copyright: spacePhoto.copyright
        };

        savePhotoMutation.mutate(photoData, {
            onSuccess: () => {
                alert('Space photo saved successfully!');
            },
            onError: (error) => {
                console.error('Error saving photo:', error);
                alert('Failed to save space photo');
            },
        });
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    return (
        <div className="glass-page">
            <div className="glass-container">
                <div className="glass-page-header">
                    <h2>🚀 NASA Astronomy Picture of the Day</h2>
                    <p className="subtitle">Explore the cosmos with NASA's daily space imagery</p>
                </div>

                <div className="glass-search-section">
                    <div className="glass-search-box">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            max={getTodayDate()}
                            className="glass-input"
                        />
                        <button 
                            onClick={handleFetchPhoto}
                            disabled={isLoading}
                            className="glass-btn"
                        >
                            {isLoading ? 'Loading...' : '🔍 Get Photo'}
                        </button>
                        <button 
                            onClick={() => { setSelectedDate(''); setDateToFetch(null); refetch(); }}
                            disabled={isLoading}
                            className="glass-btn secondary"
                        >
                            📅 Today's Photo
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading space imagery...</p>
                    </div>
                )}

                {/* Space Photo Display */}
                {spacePhoto && !isLoading && (
                    <div className="space-photo-container">
                        <div className="photo-header">
                            <h3>{spacePhoto.title}</h3>
                            <span className="photo-date">📅 {spacePhoto.date}</span>
                        </div>

                        {spacePhoto.media_type === 'image' ? (
                            <div className="photo-wrapper">
                                <img 
                                    src={spacePhoto.url} 
                                    alt={spacePhoto.title}
                                    className="space-photo"
                                    loading="lazy"
                                />
                                {spacePhoto.copyright && (
                                    <p className="photo-copyright">© {spacePhoto.copyright}</p>
                                )}
                            </div>
                        ) : spacePhoto.media_type === 'video' ? (
                            <div className="video-wrapper">
                                <iframe
                                    src={spacePhoto.url}
                                    title={spacePhoto.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="space-video"
                                />
                            </div>
                        ) : null}

                        <div className="photo-details">
                            <h4>📖 Explanation</h4>
                            <p className="photo-explanation">{spacePhoto.explanation}</p>
                        </div>

                        <div className="photo-actions">
                            <button 
                                onClick={handleSavePhoto}
                                disabled={savePhotoMutation.isLoading}
                                className="glass-btn glass-btn-sm"
                            >
                                {savePhotoMutation.isLoading ? '💾 Saving...' : '💾 Save Photo'}
                            </button>
                            {spacePhoto.hdurl && (
                                <a 
                                    href={spacePhoto.hdurl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hd-link"
                                >
                                    🖼️ View HD Version
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!spacePhoto && !isLoading && (
                    <div className="no-results">
                        <div className="empty-state">
                            <span className="empty-icon">🌌</span>
                            <h3>Explore the Universe</h3>
                            <p>Select a date or view today's astronomy picture</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpacePage;