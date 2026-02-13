import { useState, useEffect } from 'react';
import { getAstronomyPicture, saveSpacePhoto } from '../api/spaceService';

const SpacePage = () => {
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [date, setDate] = useState('');
    const [savedPhotos, setSavedPhotos] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const fetchPhoto = async (specificDate = '') => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAstronomyPicture(specificDate);
            
            if (data.error) {
                throw new Error(data.error.message || 'NASA API error');
            }
            
            if (data.code === 400) {
                throw new Error('Invalid date format. Use YYYY-MM-DD');
            }
            
            setPhoto(data);
            if (specificDate) {
                setDate(specificDate);
            }
        } catch (error) {
            console.error('Error fetching space photo:', error);
            
            if (error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
                setError('API rate limit exceeded. Please wait an hour before making more requests.');
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhoto();
    }, []);

    const handleSavePhoto = async () => {
        if (!photo) return;
        
        try {
            await saveSpacePhoto(photo);
            setSavedPhotos([photo, ...savedPhotos]);
            alert('Space photo saved successfully!');
        } catch (error) {
            console.error('Error saving photo:', error);
            alert('Failed to save photo');
        }
    };

    const handleDateSubmit = (e) => {
        e.preventDefault();
        if (date) {
            fetchPhoto(date);
            setShowDatePicker(false);
        }
    };

    const getRandomDate = () => {
        const start = new Date(1995, 5, 16);
        const end = new Date();
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return randomDate.toISOString().split('T')[0];
    };

    const handleRandomDate = () => {
        const randomDate = getRandomDate();
        setDate(randomDate);
        fetchPhoto(randomDate);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading && !photo) {
        return (
            <div className="hobby-space-theme space-variant page-content">
                <div className="container">
                    <div className="loading">
                        <div className="spinner">🚀 Loading space magic...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="hobby-space-theme space-variant page-content">
            <div className="container">
                <div className="page-header">
                    <h2>🚀 NASA Astronomy Picture of the Day</h2>
                    <p className="subtitle">Discover the cosmos! Each day a different image or photograph of our fascinating universe</p>
                </div>

                <div className="controls-section">
                    <div className="controls-left">
                        <button 
                            onClick={() => fetchPhoto()}
                            disabled={loading}
                            className="control-btn"
                        >
                            🔄 Today's Photo
                        </button>
                        <button 
                            onClick={handleRandomDate}
                            disabled={loading}
                            className="control-btn random-btn"
                        >
                            🎲 Random Date
                        </button>
                        <button 
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="control-btn date-btn"
                        >
                            📅 Pick Date
                        </button>
                    </div>
                    
                    <div className="controls-right">
                        <button 
                            onClick={handleSavePhoto}
                            disabled={!photo}
                            className="save-btn"
                        >
                            ⭐ Save Photo
                        </button>
                    </div>
                </div>

                {showDatePicker && (
                    <div className="date-picker">
                        <form onSubmit={handleDateSubmit} className="date-form">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min="1995-06-16"
                                max={new Date().toISOString().split('T')[0]}
                                className="date-input"
                            />
                            <button type="submit" className="submit-date-btn">
                                Go
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setShowDatePicker(false)}
                                className="cancel-date-btn"
                            >
                                Cancel
                            </button>
                        </form>
                        <p className="date-hint">
                            Photos available from June 16, 1995 to today
                        </p>
                    </div>
                )}

                {error && (
                    <div className="error-alert">
                        <span className="error-icon">⚠️</span>
                        <div className="error-content">
                            <h3>Error Loading Photo</h3>
                            <p>{error}</p>
                            <button onClick={() => fetchPhoto()} className="retry-btn">
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {photo && !error && (
                    <div className="apod-container">
                        <div className="apod-header">
                            <h1 className="apod-title">{photo.title}</h1>
                            <div className="apod-date">{formatDate(photo.date)}</div>
                        </div>

                        <div className="apod-content">
                            {photo.media_type === 'image' ? (
                                <div className="image-container">
                                    <img 
                                        src={photo.url} 
                                        alt={photo.title}
                                        className="apod-image"
                                        loading="lazy"
                                    />
                                    {photo.hdurl && (
                                        <a 
                                            href={photo.hdurl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="hd-link"
                                        >
                                            🔍 View HD Version
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <div className="video-container">
                                    <iframe
                                        src={photo.url}
                                        title={photo.title}
                                        className="apod-video"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            )}

                            <div className="apod-info">
                                <div className="info-section">
                                    <h3>📝 Explanation</h3>
                                    <p className="explanation">{photo.explanation}</p>
                                </div>

                                <div className="info-grid">
                                    {photo.copyright && (
                                        <div className="info-item">
                                            <span className="info-label">Copyright:</span>
                                            <span className="info-value">© {photo.copyright}</span>
                                        </div>
                                    )}
                                    <div className="info-item">
                                        <span className="info-label">Media Type:</span>
                                        <span className="info-value">{photo.media_type}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Service Version:</span>
                                        <span className="info-value">{photo.service_version}</span>
                                    </div>
                                </div>

                                <div className="share-section">
                                    <h3>Share this discovery</h3>
                                    <div className="share-buttons">
                                        <button className="share-btn">
                                            📱 Twitter
                                        </button>
                                        <button className="share-btn">
                                            💬 Facebook
                                        </button>
                                        <button className="share-btn">
                                            📧 Email
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {savedPhotos.length > 0 && (
                    <div className="saved-photos-section">
                        <h3>⭐ Your Saved Space Photos</h3>
                        <div className="saved-photos-grid">
                            {savedPhotos.slice(0, 4).map((savedPhoto, index) => (
                                <div key={index} className="saved-photo-card">
                                    <img 
                                        src={savedPhoto.url} 
                                        alt={savedPhoto.title}
                                        className="saved-photo"
                                    />
                                    <div className="saved-photo-info">
                                        <h4>{savedPhoto.title}</h4>
                                        <p className="saved-date">{formatDate(savedPhoto.date)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && !error && photo && (
                    <div className="daily-fact">
                        <div className="fact-icon">💫</div>
                        <div className="fact-content">
                            <h3>Space Fact</h3>
                            <p>NASA's Astronomy Picture of the Day (APOD) has been running since June 16, 1995, making it one of the longest-running astronomy websites!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpacePage;