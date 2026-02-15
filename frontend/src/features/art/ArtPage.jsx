import { useState } from "react";
import { useSearchArtworks, useSaveArtwork } from "@/api/queries";
import "@/styles/features/Food-Drinks-Art-Books.css";

const ArtPage = () => {
    const [query, setQuery] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    
    // 🚀 TanStack Query
    const { data: artData, isLoading } = useSearchArtworks(searchQuery, 1);
    const saveArtworkMutation = useSaveArtwork();
    
    const artworks = artData?.data || [];

    const handleSearch = () => {
        if (query.trim()) {
            setSearchQuery(query);
        }
    };

    const handleSave = (artwork) => {
        const artworkData = {
            id: artwork.id,
            title: artwork.title || "Untitled",
            artist_title: artwork.artist_title || "Unknown Artist",
            date_display: artwork.date_display,
            medium_display: artwork.medium_display,
            image_id: artwork.image_id,
            artist_display: artwork.artist_display,
            department_title: artwork.department_title,
            dimensions: artwork.dimensions,
            credit_line: artwork.credit_line
        };

        saveArtworkMutation.mutate(artworkData, {
            onSuccess: () => {
                alert("Artwork saved successfully!");
            },
            onError: (error) => {
                console.error("Error saving artwork:", error);
                alert("Failed to save artwork");
            },
        });
    };

    return (
        <div className="food-drinks-theme page-content">
            <div className="container">
                <div className="page-header">
                    <h2>🎨 Art Discovery</h2>
                    <p className="subtitle">Explore masterpieces from world-class museums</p>
                </div>
                
                <div className="search-section">
                    <div className="search-box">
                        <input 
                            type="text"
                            value={query} 
                            onChange={e => setQuery(e.target.value)} 
                            placeholder="Search artworks, artists, or styles..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="search-input"
                        />
                        <button 
                            onClick={handleSearch} 
                            disabled={isLoading}
                            className="search-btn"
                        >
                            {isLoading ? 'Searching...' : '🔍 Search Art'}
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Discovering beautiful artworks...</p>
                    </div>
                )}

                {/* Artworks Grid */}
                <div className="items-grid">
                    {artworks.filter(art => art.image_id).map(artwork => (
                        <div key={artwork.id} className="item-card art-card">
                            {artwork.image_id && (
                                <img 
                                    src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/400,/0/default.jpg`}
                                    alt={artwork.title || "Untitled"}
                                    className="item-image"
                                    loading="lazy"
                                />
                            )}
                            <div className="item-info">
                                <h3 className="item-title">{artwork.title || "Untitled"}</h3>
                                <div className="item-meta">
                                    <span className="meta-tag">👨‍🎨 {artwork.artist_title || "Unknown Artist"}</span>
                                    {artwork.date_display && (
                                        <span className="meta-tag">📅 {artwork.date_display}</span>
                                    )}
                                </div>
                                {artwork.medium_display && (
                                    <p className="artwork-medium">{artwork.medium_display}</p>
                                )}
                                <button 
                                    onClick={() => handleSave(artwork)}
                                    disabled={saveArtworkMutation.isLoading}
                                    className="save-btn"
                                >
                                    {saveArtworkMutation.isLoading ? '💾 Saving...' : '💾 Save Artwork'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* No Results */}
                {artworks.length === 0 && !isLoading && searchQuery && (
                    <div className="no-results">
                        <div className="empty-state">
                            <span className="empty-icon">🎨</span>
                            <h3>No artworks found for "{searchQuery}"</h3>
                            <p>Try searching for:</p>
                            <div className="suggestion-tags">
                                <button onClick={() => { setQuery('monet'); setSearchQuery('monet'); }}>
                                    Monet
                                </button>
                                <button onClick={() => { setQuery('picasso'); setSearchQuery('picasso'); }}>
                                    Picasso
                                </button>
                                <button onClick={() => { setQuery('van gogh'); setSearchQuery('van gogh'); }}>
                                    Van Gogh
                                </button>
                                <button onClick={() => { setQuery('landscape'); setSearchQuery('landscape'); }}>
                                    Landscape
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Empty State */}
                {artworks.length === 0 && !isLoading && !searchQuery && (
                    <div className="no-results">
                        <div className="empty-state">
                            <span className="empty-icon">🖼️</span>
                            <h3>Discover World-Class Art</h3>
                            <p>Search for artworks, artists, or styles from museums around the world</p>
                            <div className="suggestion-tags">
                                <span className="suggestion-label">Popular searches:</span>
                                <button onClick={() => { setQuery('impressionism'); setSearchQuery('impressionism'); }}>
                                    Impressionism
                                </button>
                                <button onClick={() => { setQuery('renaissance'); setSearchQuery('renaissance'); }}>
                                    Renaissance
                                </button>
                                <button onClick={() => { setQuery('abstract'); setSearchQuery('abstract'); }}>
                                    Abstract
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtPage;