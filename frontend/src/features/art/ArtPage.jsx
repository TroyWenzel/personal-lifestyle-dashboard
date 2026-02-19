import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSearchArtworks, useSaveArtwork, useSavedItems, useDeleteItem } from "@/api/queries";
import { getArtworkById } from "@/api/services/artService";
import { saveItem } from "@/api/services/contentService";
import "@/styles/GlassDesignSystem.css";
import "@/styles/features/Art.css";
import { useToast, ToastContainer } from '@/components/ui/Toast';

// ═══════════════════════════════════════════════════════════════
// Art Discovery Page
// ═══════════════════════════════════════════════════════════════

const ArtPage = () => {
    const { toasts, toast, removeToast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentQuery, setCurrentQuery] = useState("");
    const [activeTab, setActiveTab] = useState('search');
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [backgroundArt, setBackgroundArt] = useState([]);
    const [savedArtworksData, setSavedArtworksData] = useState({});
    const location = useLocation();

    const { data: artResponse, isLoading } = useSearchArtworks(currentQuery, 1, {
        enabled: !!currentQuery
    });
    
    const artworks = artResponse?.data || [];
    const saveArtworkMutation = useSaveArtwork();
    
    const { data: allSavedItems = [], refetch: refetchSaved } = useSavedItems();
    const deleteItemMutation = useDeleteItem();
    
    // Filter for artwork items
    const savedArtworks = allSavedItems.filter(item => 
        item.type === 'art' || item.type === 'artwork' || item.category === 'art'
    );

    // ─── Load saved artworks data from localStorage ───────────
    useEffect(() => {
        try {
            const stored = localStorage.getItem('savedArtworksData');
            if (stored) {
                setSavedArtworksData(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Error loading saved artworks data:', e);
        }
    }, []);

    // ─── Save artworks data to localStorage ───────────────────
    useEffect(() => {
        try {
            localStorage.setItem('savedArtworksData', JSON.stringify(savedArtworksData));
        } catch (e) {
            console.error('Error saving artworks data:', e);
        }
    }, [savedArtworksData]);

    // ─── Handle navigation from Dashboard ─────────────────────
    useEffect(() => {
        if (location.state?.tab === 'saved') {
            setActiveTab('saved');
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // ─── Load background art mosaic ───────────────────────────
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

    // ─── Event Handlers ───────────────────────────────────────

    const handleSearch = () => {
        if (searchQuery.trim()) {
            setCurrentQuery(searchQuery.trim());
            setActiveTab('search');
        }
    };

    const handleArtworkClick = async (artwork) => {
        const savedMatch = savedArtworks.find(
            s => s.external_id === String(artwork.id || artwork.external_id)
        );
        const savedItemId = artwork.savedItemId || savedMatch?.id || null;

        if (artwork?.id && artwork.id !== 'null' && artwork.id !== 'undefined') {
            try {
                const detailedArtwork = await getArtworkById(artwork.id);
                setSelectedArtwork({ ...detailedArtwork, savedItemId });
                setShowModal(true);
                return;
            } catch (error) {
                console.error('Error fetching artwork details:', error);
            }
        }

        setSelectedArtwork({ ...artwork, savedItemId });
        setShowModal(true);
    };

    const handleSave = async (artwork) => {
        const artworkId = artwork.id || artwork.external_id;
        if (!artworkId) { 
            toast.error('Cannot save artwork: Invalid ID'); 
            return; 
        }

        const image_id = artwork.image_id;
        const thumbnailUrl = image_id
            ? `https://www.artic.edu/iiif/2/${image_id}/full/400,/0/default.jpg`
            : null;

        try {
            const result = await saveItem({
                category: "art",
                type: "artwork",
                external_id: artworkId.toString(),
                title: artwork.title || "Untitled",
                description: `By ${artwork.artist_title || artwork.artist_display || "Unknown Artist"}`,
                metadata: {
                    artist: artwork.artist_title || artwork.artist_display || "Unknown Artist",
                    date: artwork.date_display,
                    medium: artwork.medium_display,
                    image_id,
                    thumbnail: thumbnailUrl,
                    dimensions: artwork.dimensions,
                    credit_line: artwork.credit_line,
                    department: artwork.department_title,
                }
            });
            
            if (result?.id) {
                setSavedArtworksData(prev => ({
                    ...prev,
                    [result.id]: { ...artwork, id: artworkId, image_id }
                }));
            }
            
            saveArtworkMutation.reset();
            refetchSaved();
            toast.success("Artwork saved to your collection!");
            
        } catch (error) {
            if (error?.response?.status === 409) {
                toast.info("Already in your collection!");
            } else {
                console.error("Error saving artwork:", error);
                toast.error("Failed to save artwork");
            }
        }
    };

    const handleDelete = (itemId) => {
        deleteItemMutation.mutate(itemId, {
            onSuccess: () => {
                setSavedArtworksData(prev => {
                    const newData = { ...prev };
                    delete newData[itemId];
                    return newData;
                });
                toast.success('Artwork removed from collection');
            },
            onError: (error) => {
                console.error('Error deleting:', error);
                toast.error('Failed to remove artwork');
            }
        });
    };

    // ─── Render ───────────────────────────────────────────────

    return (
        <div className="glass-page">
            {/* ─── Background Art Mosaic ────────────────────── */}
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
                {/* ─── Header ───────────────────────────────── */}
                <div className="glass-page-header">
                    <h2>🎨 Art Discovery</h2>
                    <p className="subtitle">Explore masterpieces from museums worldwide</p>
                </div>

                {/* ─── Tab Switcher ─────────────────────────── */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <button 
                        className="glass-tab active"
                        onClick={() => setActiveTab(activeTab === 'saved' ? 'search' : 'saved')}
                        style={{ maxWidth: '400px' }}
                    >
                        {activeTab === 'saved' ? '🔍 Back to Search' : `💝 View Saved Collection (${savedArtworks.length})`}
                    </button>
                </div>

                {/* ─── Search Tab ────────────────────────────── */}
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
                                        {artwork.image_id ? (
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
                                                }}
                                            />
                                        ) : (
                                            <div className="art-fallback-image">
                                                🎨
                                            </div>
                                        )}
                                        <div style={{ padding: '1.5rem' }}>
                                            <h3 className="art-card-title">
                                                {artwork.title || "Untitled"}
                                            </h3>
                                            <p className="art-card-artist">
                                                {artwork.artist_title || "Unknown Artist"}
                                            </p>
                                            {artwork.date_display && (
                                                <p className="art-card-date">
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

                        {/* ─── Empty States ───────────────────── */}
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

                {/* ─── Saved Tab ─────────────────────────────── */}
                {activeTab === 'saved' && (
                    <>
                        {savedArtworks.length > 0 ? (
                            <div className="glass-grid">
                                {savedArtworks.map(item => {
                                    const fullArtworkData = savedArtworksData[item.id];
                                    
                                    const artistName = 
                                        fullArtworkData?.artist_title || 
                                        fullArtworkData?.artist_display ||
                                        item.metadata?.artist_title || 
                                        item.metadata?.artist || 
                                        item.metadata?.artist_display ||
                                        "Unknown Artist";
                                    
                                    let imageUrl = null;
                                    
                                    if (fullArtworkData?.image_id) {
                                        imageUrl = `https://www.artic.edu/iiif/2/${fullArtworkData.image_id}/full/400,/0/default.jpg`;
                                    } else if (item.metadata?.image_id) {
                                        imageUrl = `https://www.artic.edu/iiif/2/${item.metadata.image_id}/full/400,/0/default.jpg`;
                                    } else if (item.metadata?.thumbnail) {
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
                                                    className="art-card-image"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="art-fallback-image">
                                                    🎨
                                                </div>
                                            )}
                                            <div style={{ padding: '1.5rem' }}>
                                                <h3 className="art-card-title">
                                                    {item.title}
                                                </h3>
                                                <p className="art-card-artist">
                                                    {artistName}
                                                </p>
                                                {(item.metadata?.date || fullArtworkData?.date_display) && (
                                                    <p className="art-card-date">
                                                        📅 {item.metadata?.date || fullArtworkData?.date_display}
                                                    </p>
                                                )}
                                                <p className="art-card-saved-date">
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

            {/* ─── Artwork Detail Modal ──────────────────────── */}
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
                                        }}
                                    />
                                ) : (
                                    <div className="art-fallback-image-large">
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

                                {selectedArtwork.savedItemId ? (
                                    <button
                                        onClick={() => { handleDelete(selectedArtwork.savedItemId); setShowModal(false); }}
                                        className="glass-btn"
                                        style={{ marginTop: '2rem', background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.4)' }}
                                        disabled={deleteItemMutation.isLoading}
                                    >
                                        🗑️ Remove from Collection
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSave(selectedArtwork)}
                                        className="glass-btn"
                                        style={{ marginTop: '2rem' }}
                                        disabled={saveArtworkMutation.isLoading}
                                    >
                                        {saveArtworkMutation.isLoading ? '💾 Saving...' : '💾 Save to Collection'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
};

export default ArtPage;