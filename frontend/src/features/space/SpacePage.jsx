import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAstronomyPicture } from '@/api/services/spaceService';
import { useSavedItems, useSaveSpacePhoto, useDeleteItem } from '@/api/queries';
import '@/styles/GlassDesignSystem.css';
import '@/styles/features/Space.css';

const SpacePage = () => {
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [date, setDate] = useState('');
    const [activeTab, setActiveTab] = useState('explore');
    const location = useLocation();

    const { data: allSavedItems = [] } = useSavedItems();
    const savePhotoMutation = useSaveSpacePhoto();
    const deleteItemMutation = useDeleteItem();
    const savedPhotos = allSavedItems.filter(item => item.type === 'space' || item.type === 'spacePhoto');

    // Switch to saved tab when navigated here from Dashboard
    useEffect(() => {
        if (location.state?.tab === 'saved') {
            setActiveTab('saved');
            window.history.replaceState({}, document.title);
        }
    }, [location]);

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

    const handleSave = () => {
        if (!photo) return;
        savePhotoMutation.mutate(photo, {
            onSuccess: () => alert('Space photo saved!'),
            onError:   () => alert('Failed to save photo'),
        });
    };

    const handleDelete = (id) => {
        deleteItemMutation.mutate(id, {
            onSuccess: () => alert('Photo removed!'),
            onError:   () => alert('Failed to remove photo'),
        });
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
                    <p className="subtitle">Astronomy Picture of the Day from NASA</p>
                </div>

                {/* Tab switcher */}
                <div className="glass-tabs" style={{ marginBottom: '2rem' }}>
                    <button
                        className={`glass-tab ${activeTab === 'explore' ? 'active' : ''}`}
                        onClick={() => setActiveTab('explore')}
                    >
                        🔭 Explore
                    </button>
                    <button
                        className={`glass-tab ${activeTab === 'saved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('saved')}
                    >
                        💾 Saved Photos ({savedPhotos.length})
                    </button>
                </div>

                {/* ── Explore tab ── */}
                {activeTab === 'explore' && (<>
                <div className="space-date-section">
                    <form onSubmit={handleDateSubmit} className="glass-search-box">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="glass-input"
                        />
                        <button type="submit" className="glass-btn">🔍 View Photo</button>
                    </form>
                </div>

                {loading && (
                    <div className="glass-loading">
                        <div className="glass-spinner"></div>
                        <p>Loading astronomy photo...</p>
                    </div>
                )}
                {error && (
                    <div className="glass-empty-state">
                        <span className="glass-empty-icon">⚠️</span>
                        <h3>Error Loading Photo</h3>
                        <p>{error}</p>
                        <button onClick={() => fetchPhoto()} className="glass-btn">Try Again</button>
                    </div>
                )}
                {!loading && !error && photo && (
                    <div className="space-photo-card">
                        {photo.media_type === 'image' ? (
                            <div className="space-image-container">
                                <img src={photo.hdurl || photo.url} alt={photo.title} className="space-main-image" />
                            </div>
                        ) : photo.media_type === 'video' ? (
                            <div className="space-video-container">
                                <iframe src={photo.url} title={photo.title} className="space-video" frameBorder="0" allowFullScreen />
                            </div>
                        ) : null}
                        <div className="space-info-section">
                            <h3 className="space-photo-title">{photo.title}</h3>
                            {photo.date && (
                                <p className="space-date">
                                    📅 {new Date(photo.date).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                                </p>
                            )}
                            {photo.copyright && <p className="space-copyright">📸 Copyright: {photo.copyright}</p>}
                            <p className="space-explanation">{photo.explanation}</p>
                            <div className="space-actions">
                                {photo.hdurl && (
                                    <a href={photo.hdurl} target="_blank" rel="noopener noreferrer" className="glass-btn">
                                        🖼️ View HD Image
                                    </a>
                                )}
                                <button onClick={() => fetchPhoto()} className="glass-btn-secondary">🔄 Today's Photo</button>
                                <button
                                    onClick={handleSave}
                                    className="glass-btn"
                                    disabled={savePhotoMutation.isLoading}
                                >
                                    {savePhotoMutation.isLoading ? '💾 Saving...' : '💾 Save Photo'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                </>)}

                {/* ── Saved tab ── */}
                {activeTab === 'saved' && (
                    savedPhotos.length === 0 ? (
                        <div className="glass-empty-state">
                            <span className="glass-empty-icon">🚀</span>
                            <h3>No Saved Photos</h3>
                            <p>Explore APOD photos and save your favorites!</p>
                            <button className="glass-btn" onClick={() => setActiveTab('explore')}>Start Exploring</button>
                        </div>
                    ) : (
                        <div className="glass-grid">
                            {savedPhotos.map(item => {
                                const m = item.metadata || {};
                                const imgUrl = m.url || m.hdurl;
                                return (
                                    <div key={item.id} className="glass-item-card">
                                        {imgUrl && m.media_type !== 'video' && (
                                            <img src={imgUrl} alt={item.title}
                                                style={{ width:'100%', height:'200px', objectFit:'cover', borderRadius:'12px 12px 0 0' }} />
                                        )}
                                        {(!imgUrl || m.media_type === 'video') && (
                                            <div style={{ height:'120px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem',
                                                background:'rgba(255,255,255,0.03)', borderRadius:'12px 12px 0 0' }}>🚀</div>
                                        )}
                                        <div style={{ padding:'1.25rem' }}>
                                            <h3 style={{ color:'var(--text-primary)', marginBottom:'0.5rem', fontSize:'1rem' }}>{item.title}</h3>
                                            {m.date && <p style={{ color:'var(--text-tertiary)', fontSize:'0.8rem', marginBottom:'0.5rem' }}>📅 {m.date}</p>}
                                            <p style={{ color:'var(--text-tertiary)', fontSize:'0.8rem', marginBottom:'1rem' }}>
                                                Saved {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                            <button
                                                className="glass-btn-secondary"
                                                onClick={() => handleDelete(item.id)}
                                                disabled={deleteItemMutation.isLoading}
                                                style={{ background:'rgba(239,68,68,0.15)', borderColor:'rgba(239,68,68,0.3)' }}
                                            >
                                                🗑️ Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default SpacePage;