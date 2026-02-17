import { useState, useEffect } from "react";
import { useSearchArtworks, useSaveArtwork, useSavedItems, useDeleteItem } from "@/api/queries";
import { getArtworkById } from "@/api/services/artService";
import "@/styles/GlassDesignSystem.css";
import "@/styles/features/Art.css";

const ArtPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentQuery, setCurrentQuery] = useState("");
    const [activeTab, setActiveTab] = useState('search');
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [backgroundArt, setBackgroundArt] = useState([]);
    const [savedArtworksData, setSavedArtworksData] = useState({}); // Store full artwork data by saved item ID

    const { data: artResponse, isLoading } = useSearchArtworks(currentQuery, 1, {
        enabled: !!currentQuery
    });
    
    const artworks = artResponse?.data || [];
    const saveArtworkMutation = useSaveArtwork();
    
    const { data: allSavedItems = [] } = useSavedItems();
    const deleteItemMutation = useDeleteItem();
    
    // Filter for artwork items - check both 'art' and 'artwork' types
    const savedArtworks = allSavedItems.filter(item => 
        item.type === 'art' || item.type === 'artwork' || item.category === 'art'
    );

    // Load saved artworks data from localStorage or context on mount
    useEffect(() => {
        // Try to load saved artworks data from localStorage
        try {
            const stored = localStorage.getItem('savedArtworksData');
            if (stored) {
                setSavedArtworksData(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Error loading saved artworks data:', e);
        }
    }, []);

    // Save savedArtworksData to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('savedArtworksData', JSON.stringify(savedArtworksData));
        } catch (e) {
            console.error('Error saving artworks data:', e);
        }
    }, [savedArtworksData]);

    useEffect(() => {
        const fetchBackgroundArt = async () => {
            try {
                const searches = ['landscape', 'portrait', 'abstract', 'sculpture', 'impressionism'];
                const randomSearch = searches[Math.floor(Math.random() * searches.length)];
                
                const response = await fetch(
                    `https://api.artic.edu/api/v1/artworks/search?q=${randomSearch}&limit=20&fields=id,image_id`
                );
                const data = await response.json();
                
                const artWithImages = data.data.filter(art => art.image_id);
                setBackgroundArt(artWithImages);
            } catch (error) {
                console.error('Error loading background art:', error);
            }
        };

        fetchBackgroundArt();
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            setCurrentQuery(searchQuery.trim());
            setActiveTab('search');
        }
    };

    const handleArtworkClick = async (artwork) => {
        // If we have a valid ID, try to fetch full details
        if (artwork?.id && artwork.id !== 'null' && artwork.id !== 'undefined') {
            try {
                // Use the imported service function
                const detailedArtwork = await getArtworkById(artwork.id);
                setSelectedArtwork(detailedArtwork);
                setShowModal(true);
                return;
            } catch (error) {
                console.error('Error fetching artwork details:', error);
                // If fetch fails, fall back to the artwork data we have
            }
        }
        
        // If no valid ID or fetch failed, show what we have
        setSelectedArtwork(artwork);
        setShowModal(true);
    };

    const handleSave = async (artwork) => {
        // Ensure we have a valid ID
        const artworkId = artwork.id || artwork.external_id;
        
        if (!artworkId) {
            alert('Cannot save artwork: Invalid ID');
            return;
        }

        // Create a proper thumbnail URL if image_id exists
        const thumbnailUrl = artwork.image_id 
            ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/400,/0/default.jpg`
            : null;

        const itemData = {
            type: "art",
            category: "art",
            external_id: artworkId.toString(),
            title: artwork.title || "Untitled",
            metadata: {
                artist: artwork.artist_title || artwork.artist_display || "Unknown Artist",
                artist_title: artwork.artist_title,
                artist_display: artwork.artist_display,
                date: artwork.date_display,
                medium: artwork.medium_display,
                image_id: artwork.image_id,
                thumbnail: thumbnailUrl,
                dimensions: artwork.dimensions,
                credit_line: artwork.credit_line,
                department: artwork.department_title
            }
        };
        
        saveArtworkMutation.mutate(itemData, {
            onSuccess: (result) => {
                // Store the full artwork data using the saved item's ID
                if (result?.id) {
                    setSavedArtworksData(prev => ({
                        ...prev,
                        [result.id]: {
                            ...artwork,
                            id: artworkId,
                            image_id: artwork.image_id,
                            artist_title: artwork.artist_title,
                            artist_display: artwork.artist_display
                        }
                    }));
                }
                alert("Artwork saved successfully!");
            },
            onError: (error) => {
                console.error("Error saving artwork:", error);
                alert("Failed to save artwork");
            }
        });
    };

    const handleDelete = (itemId) => {
        deleteItemMutation.mutate(itemId, {
            onSuccess: () => {
                // Remove from savedArtworksData when deleted
                setSavedArtworksData(prev => {
                    const newData = { ...prev };
                    delete newData[itemId];
                    return newData;
                });
                alert('Artwork removed!');
            },
            onError: (error) => {
                console.error('Error deleting:', error);
                alert('Failed to remove artwork');
            }
        });
    };

    // Helper function to extract image_id from thumbnail URL
    const extractImageIdFromThumbnail = (thumbnailUrl) => {
        if (!thumbnailUrl) return null;
        
        try {
            // The pattern is: https://www.artic.edu/iiif/2/[image_id]/full/400,/0/default.jpg
            const matches = thumbnailUrl.match(/\/iiif\/2\/([^\/]+)\/full\//);
            return matches ? matches[1] : null;
        } catch (e) {
            console.error('Error extracting image_id:', e);
        }
        return null;
    };

    return (
        <div className="glass-page">
            <div className="art-mosaic-background">
                <div className="art-mosaic-grid">
                    {backgroundArt.map((art, index) => (
                        <div 
                            key={art.id} 
                            className="art-mosaic-tile"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <img 
                                src={`https://www.artic.edu/iiif/2/${art.image_id}/full/300,/0/default.jpg`}
                                alt="Background art"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-container art-content-overlay">
                <div className="glass-page-header">
                    <h2>🎨 Art Discovery</h2>
                    <p className="subtitle">Explore masterpieces from museums worldwide</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <button 
                        className="glass-tab active"
                        onClick={() => setActiveTab(activeTab === 'saved' ? 'search' : 'saved')}
                        style={{ maxWidth: '400px' }}
                    >
                        {activeTab === 'saved' ? '🔍 Back to Search' : `💝 View Saved Collection (${savedArtworks.length})`}
                    </button>
                </div>

                {activeTab === 'search' && (
                    <>
                        <div className="glass-search-section">
                            <div className="glass-search-box">
                                <input 
                                    type="text"
                                    value={searchQuery} 
                                    onChange={e => setSearchQuery(e.target.value)} 
                                    placeholder="Search artworks, artists, or styles (e.g., Monet, Impressionism)..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="glass-input"
                                />
                                <button 
                                    onClick={handleSearch} 
                                    disabled={isLoading}
                                    className="glass-btn"
                                >
                                    {isLoading ? 'Searching...' : '🔍 Search'}
                                </button>
                            </div>
                        </div>

                        {isLoading && (
                            <div className="glass-loading">
                                <div className="glass-spinner"></div>
                                <p>Searching art collections...</p>
                            </div>
                        )}

                        {artworks.length > 0 && !isLoading && (
                            <div className="glass-grid">
                                {artworks.map(artwork => (
                                    <div 
                                        key={artwork.id} 
                                        className="glass-item-card art-clickable"
                                        onClick={() => handleArtworkClick(artwork)}
                                    >
                                        {artwork.image_id && (
                                            <img 
                                                src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/400,/0/default.jpg`}
                                                alt={artwork.title}
                                                style={{
                                                    width: '100%',
                                                    height: '250px',
                                                    objectFit: 'cover',
                                                    borderRadius: '12px 12px 0 0'
                                                }}
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.querySelector('.fallback-image')?.classList.remove('hidden');
                                                }}
                                            />
                                        )}
                                        {!artwork.image_id && (
                                            <div className="fallback-image" style={{
                                                width: '100%',
                                                height: '250px',
                                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '12px 12px 0 0',
                                                fontSize: '3rem'
                                            }}>
                                                🎨
                                            </div>
                                        )}
                                        <div style={{ padding: '1.5rem' }}>
                                            <h3 style={{ 
                                                fontSize: '1.1rem', 
                                                marginBottom: '0.5rem',
                                                color: 'var(--text-primary)'
                                            }}>
                                                {artwork.title || "Untitled"}
                                            </h3>
                                            <p style={{ 
                                                color: 'var(--text-secondary)',
                                                marginBottom: '0.5rem'
                                            }}>
                                                {artwork.artist_title || "Unknown Artist"}
                                            </p>
                                            {artwork.date_display && (
                                                <p style={{ 
                                                    fontSize: '0.85rem',
                                                    color: 'var(--text-tertiary)',
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    📅 {artwork.date_display}
                                                </p>
                                            )}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSave(artwork);
                                                }}
                                                className="glass-btn"
                                                disabled={saveArtworkMutation.isLoading}
                                            >
                                                {saveArtworkMutation.isLoading ? '💾 Saving...' : '💾 Save'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {artworks.length === 0 && !isLoading && currentQuery && (
                            <div className="glass-empty-state">
                                <span className="glass-empty-icon">🎨</span>
                                <h3>No Artworks Found</h3>
                                <p>Try searching for different artists or styles</p>
                                <div className="glass-suggestion-tags">
                                    <button onClick={() => { setSearchQuery('Monet'); setCurrentQuery('Monet'); }}>Monet</button>
                                    <button onClick={() => { setSearchQuery('Van Gogh'); setCurrentQuery('Van Gogh'); }}>Van Gogh</button>
                                    <button onClick={() => { setSearchQuery('Picasso'); setCurrentQuery('Picasso'); }}>Picasso</button>
                                    <button onClick={() => { setSearchQuery('Impressionism'); setCurrentQuery('Impressionism'); }}>Impressionism</button>
                                </div>
                            </div>
                        )}

                        {!currentQuery && (
                            <div className="glass-empty-state">
                                <span className="glass-empty-icon">🎨</span>
                                <h3>Discover Art</h3>
                                <p>Search for artworks, artists, or art movements</p>
                                <div className="glass-suggestion-tags">
                                    <button onClick={() => { setSearchQuery('Renaissance'); setCurrentQuery('Renaissance'); }}>Renaissance</button>
                                    <button onClick={() => { setSearchQuery('Modern Art'); setCurrentQuery('Modern Art'); }}>Modern Art</button>
                                    <button onClick={() => { setSearchQuery('Abstract'); setCurrentQuery('Abstract'); }}>Abstract</button>
                                    <button onClick={() => { setSearchQuery('Portrait'); setCurrentQuery('Portrait'); }}>Portrait</button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'saved' && (
                    <>
                        {savedArtworks.length > 0 ? (
                            <div className="glass-grid">
                                {savedArtworks.map(item => {
                                    // Get the full artwork data if we have it
                                    const fullArtworkData = savedArtworksData[item.id];
                                    
                                    // Determine artist name - check all possible sources
                                    const artistName = 
                                        fullArtworkData?.artist_title || 
                                        fullArtworkData?.artist_display ||
                                        item.metadata?.artist_title || 
                                        item.metadata?.artist || 
                                        item.metadata?.artist_display ||
                                        "Unknown Artist";
                                    
                                    // Determine image URL
                                    let imageUrl = null;
                                    
                                    // Try to get from full data first
                                    if (fullArtworkData?.image_id) {
                                        imageUrl = `https://www.artic.edu/iiif/2/${fullArtworkData.image_id}/full/400,/0/default.jpg`;
                                    } 
                                    // Then try from metadata
                                    else if (item.metadata?.image_id) {
                                        imageUrl = `https://www.artic.edu/iiif/2/${item.metadata.image_id}/full/400,/0/default.jpg`;
                                    }
                                    // Then try from stored thumbnail
                                    else if (item.metadata?.thumbnail) {
                                        imageUrl = item.metadata.thumbnail;
                                    }
                                    
                                    return (
                                        <div 
                                            key={item.id} 
                                            className="glass-item-card art-clickable"
                                            onClick={() => {
                                                if (fullArtworkData) {
                                                    handleArtworkClick(fullArtworkData);
                                                } else {
                                                    const artworkData = {
                                                        id: item.external_id || item.metadata?.image_id,
                                                        title: item.title,
                                                        artist_title: item.metadata?.artist_title || item.metadata?.artist,
                                                        artist_display: item.metadata?.artist_display,
                                                        date_display: item.metadata?.date,
                                                        medium_display: item.metadata?.medium,
                                                        image_id: item.metadata?.image_id,
                                                        dimensions: item.metadata?.dimensions,
                                                        credit_line: item.metadata?.credit_line
                                                    };
                                                    handleArtworkClick(artworkData);
                                                }
                                            }}
                                        >
                                            {imageUrl ? (
                                                <img 
                                                    src={imageUrl}
                                                    alt={item.title}
                                                    style={{
                                                        width: '100%',
                                                        height: '250px',
                                                        objectFit: 'cover',
                                                        borderRadius: '12px 12px 0 0'
                                                    }}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const parent = e.target.parentElement;
                                                        const fallback = document.createElement('div');
                                                        fallback.className = 'fallback-image';
                                                        fallback.style.cssText = 'width: 100%; height: 250px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); display: flex; align-items: center; justify-content: center; border-radius: 12px 12px 0 0; font-size: 3rem;';
                                                        fallback.textContent = '🎨';
                                                        parent.insertBefore(fallback, e.target);
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '100%',
                                                    height: '250px',
                                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '12px 12px 0 0',
                                                    fontSize: '3rem'
                                                }}>
                                                    🎨
                                                </div>
                                            )}
                                            <div style={{ padding: '1.5rem' }}>
                                                <h3 style={{ 
                                                    fontSize: '1.1rem', 
                                                    marginBottom: '0.5rem',
                                                    color: 'var(--text-primary)'
                                                }}>
                                                    {item.title}
                                                </h3>
                                                <p style={{ 
                                                    color: 'var(--text-secondary)',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    {artistName}
                                                </p>
                                                {(item.metadata?.date || fullArtworkData?.date_display) && (
                                                    <p style={{ 
                                                        fontSize: '0.85rem',
                                                        color: 'var(--text-tertiary)',
                                                        marginBottom: '0.25rem'
                                                    }}>
                                                        📅 {item.metadata?.date || fullArtworkData?.date_display}
                                                    </p>
                                                )}
                                                <p style={{ 
                                                    fontSize: '0.8rem',
                                                    color: 'var(--text-tertiary)',
                                                    marginBottom: '1rem'
                                                }}>
                                                    Saved {new Date(item.createdAt).toLocaleDateString()}
                                                </p>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(item.id);
                                                    }}
                                                    className="glass-btn-secondary"
                                                    disabled={deleteItemMutation.isLoading}
                                                >
                                                    🗑️ Remove
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="glass-empty-state">
                                <span className="glass-empty-icon">🎨</span>
                                <h3>No Saved Artworks</h3>
                                <p>Search for art and save your favorites here</p>
                                <button 
                                    onClick={() => setActiveTab('search')}
                                    className="glass-btn"
                                >
                                    Start Exploring
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showModal && selectedArtwork && (
                <div className="art-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="art-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="art-modal-close"
                            onClick={() => setShowModal(false)}
                        >
                            ✕
                        </button>
                        
                        <div className="art-modal-layout">
                            <div className="art-modal-image-section">
                                {selectedArtwork.image_id ? (
                                    <img 
                                        src={`https://www.artic.edu/iiif/2/${selectedArtwork.image_id}/full/843,/0/default.jpg`}
                                        alt={selectedArtwork.title}
                                        className="art-modal-image"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            const parent = e.target.parentElement;
                                            const fallback = document.createElement('div');
                                            fallback.style.cssText = 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 5rem; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)';
                                            fallback.textContent = '🎨';
                                            parent.appendChild(fallback);
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '5rem',
                                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                                    }}>
                                        🎨
                                    </div>
                                )}
                            </div>

                            <div className="art-modal-details">
                                <h2 className="art-modal-title">
                                    {selectedArtwork.title || "Untitled"}
                                </h2>
                                
                                <div className="art-modal-info">
                                    <div className="art-info-item">
                                        <span className="art-info-label">👤 Artist:</span>
                                        <span className="art-info-value">
                                            {selectedArtwork.artist_title || selectedArtwork.artist_display || "Unknown"}
                                        </span>
                                    </div>

                                    {selectedArtwork.date_display && (
                                        <div className="art-info-item">
                                            <span className="art-info-label">📅 Date:</span>
                                            <span className="art-info-value">{selectedArtwork.date_display}</span>
                                        </div>
                                    )}

                                    {selectedArtwork.medium_display && (
                                        <div className="art-info-item">
                                            <span className="art-info-label">🎨 Medium:</span>
                                            <span className="art-info-value">{selectedArtwork.medium_display}</span>
                                        </div>
                                    )}

                                    {selectedArtwork.dimensions && (
                                        <div className="art-info-item">
                                            <span className="art-info-label">📏 Dimensions:</span>
                                            <span className="art-info-value">{selectedArtwork.dimensions}</span>
                                        </div>
                                    )}

                                    {selectedArtwork.place_of_origin && (
                                        <div className="art-info-item">
                                            <span className="art-info-label">🌍 Origin:</span>
                                            <span className="art-info-value">{selectedArtwork.place_of_origin}</span>
                                        </div>
                                    )}

                                    {selectedArtwork.credit_line && (
                                        <div className="art-info-item">
                                            <span className="art-info-label">🏛️ Collection:</span>
                                            <span className="art-info-value">{selectedArtwork.credit_line}</span>
                                        </div>
                                    )}
                                </div>

                                {selectedArtwork.description && (
                                    <div className="art-modal-description">
                                        <h3>About this Artwork</h3>
                                        <div dangerouslySetInnerHTML={{ __html: selectedArtwork.description }} />
                                    </div>
                                )}

                                {selectedArtwork.publication_history && (
                                    <div className="art-modal-description">
                                        <h3>Publication History</h3>
                                        <div dangerouslySetInnerHTML={{ __html: selectedArtwork.publication_history }} />
                                    </div>
                                )}

                                <button 
                                    onClick={() => handleSave(selectedArtwork)}
                                    className="glass-btn"
                                    style={{ marginTop: '2rem' }}
                                    disabled={saveArtworkMutation.isLoading}
                                >
                                    {saveArtworkMutation.isLoading ? '💾 Saving...' : '💾 Save to Collection'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtPage;