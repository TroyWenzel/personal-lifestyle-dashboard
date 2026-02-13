import { useState } from "react";
import { searchArt } from "../api/artService";
import { saveArtwork } from "../api/contentService";

const ArtPage = () => {
    const [query, setQuery] = useState("");
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await searchArt(query);
            setArtworks(data.data || []);
        } catch (error) {
            console.error("Art search error:", error);
            alert("Failed to search artworks");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (artwork) => {
        try {
            const itemData = {
                category: "art",
                external_id: artwork.id.toString(),
                title: artwork.title || "Untitled",
                metadata: {
                    artist: artwork.artist_title || "Unknown Artist",
                    date: artwork.date_display,
                    medium: artwork.medium_display,
                    thumbnail: `https://www.artic.edu/iiif/2/${artwork.image_id}/full/300,/0/default.jpg`,
                    artist_display: artwork.artist_display
                }
            };
            
            await saveArtwork(itemData);
            alert("Artwork saved successfully!");
        } catch (error) {
            console.error("Error saving artwork:", error);
            alert("Failed to save artwork");
        }
    };

    return (
        <div className="art-container">
            <h1>Art Discovery</h1>
            <p>Browse artworks from museum collections around the world.</p>
            
            <div className="search-section">
                <input 
                    value={query} 
                    onChange={e => setQuery(e.target.value)} 
                    placeholder="Search artworks, artists, or styles..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} disabled={loading}>
                    {loading ? 'Searching...' : 'Search Art'}
                </button>
            </div>

            <div className="art-grid">
                {artworks.map(artwork => (
                    <div key={artwork.id} className="art-card">
                        {artwork.image_id && (
                            <img 
                                src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/300,/0/default.jpg`}
                                alt={artwork.title}
                                className="art-image"
                            />
                        )}
                        <div className="art-info">
                            <h3>{artwork.title || "Untitled"}</h3>
                            <p className="artist">{artwork.artist_title || "Unknown Artist"}</p>
                            <p className="date">{artwork.date_display}</p>
                            <p className="medium">{artwork.medium_display}</p>
                            <button 
                                onClick={() => handleSave(artwork)}
                                className="save-button"
                            >
                                Save Artwork
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {artworks.length === 0 && !loading && query && (
                <p className="no-results">No artworks found for "{query}"</p>
            )}
        </div>
    );
};

export default ArtPage;