import { useState } from "react";
import { searchWeather } from "../api/weatherService";
import { saveLocation } from "../api/contentService";

const WeatherPage = () => {
    // State for weather search and display
    const [location, setLocation] = useState(""); // City search input
    const [weather, setWeather] = useState(null); // Weather data from API
    const [loading, setLoading] = useState(false); // Loading state
    const [error, setError] = useState(""); // Error message display

    // Format location string for display
    const formatLocation = (weatherData) => {
        if (!weatherData || !weatherData.location) return "";
        
        const { name, region, country } = weatherData.location;
        const parts = [];

        if (name) parts.push(name);
        
        // Only add region if it's meaningful and different from city name
        if (region && region !== name && region !== "Region" && region !== "N/A") {
            parts.push(region);
        }
        
        // Only add country if it's meaningful
        if (country && country !== "Country" && country !== "N/A") {
            parts.push(country);
        }
        
        return parts.join(", ");
    };

    // Get appropriate weather emoji based on description
    const getWeatherIcon = (description) => {
        const desc = description.toLowerCase();
        if (desc.includes("sunny") || desc.includes("clear")) return "☀️";
        if (desc.includes("cloud")) return "☁️";
        if (desc.includes("rain")) return "🌧️";
        if (desc.includes("snow")) return "❄️";
        if (desc.includes("storm")) return "⛈️";
        if (desc.includes("wind")) return "💨";
        if (desc.includes("fog") || desc.includes("mist")) return "🌫️";
        return "🌤️"; // Default
    };

    // Generate mock weather data for development/demo mode
    const getMockWeatherData = (cityName) => {
        return {
            location: {
                name: cityName.charAt(0).toUpperCase() + cityName.slice(1),
                country: 'Demo',
                region: 'Demo Region'
            },
            current: {
                temperature: 20,
                feelslike: 19,
                weather_descriptions: ['Partly cloudy'],
                humidity: 65,
                wind_speed: 15,
                pressure: 1013,
                visibility: 10
            }
        };
    };

    // Search for weather data by city name
    const handleSearch = async () => {
        if (!location.trim()) {
            setError("Please enter a city name");
            return;
        }
        
        setLoading(true);
        setError("");
        setWeather(null);
        
        try {
            const data = await searchWeather(location);
            
            if (data && data.location && data.current) {
                setWeather(data);
            } else {
                setError("No weather data found for this location");
            }
        } catch (error) {
            console.error("Weather search error:", error);
            
            // User-friendly error messages based on error type
            if (error.message.includes('API key') || error.message.includes('subscription')) {
                setError("Weather service is currently unavailable. Using demo data.");
                // Fallback to mock data for demo
                const mockData = getMockWeatherData(location);
                setWeather(mockData);
            } else if (error.message.includes('network') || error.message.includes('Network')) {
                setError("Network error. Please check your connection.");
            } else {
                setError("Failed to fetch weather data. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Save current weather location to user's collection
    const handleSave = async () => {
        if (!weather) return;
        
        try {
            await saveLocation(weather);
            alert(`✅ Saved ${formatLocation(weather)} to your dashboard!`);
        } catch (error) {
            console.error("Error saving location:", error);
            alert("Failed to save location. Please try again.");
        }
    };

    // Handle Enter key press in search input
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="weather-theme page-content">
            <div className="container">
                <div className="page-header">
                    <h2>🌤️ Weather Tracker</h2>
                    <p className="subtitle">Search for weather in any city and save your favorite locations</p>
                </div>
                
                {/* Search section */}
                <div className="search-section">
                    <div className="search-box">
                        <input 
                            type="text"
                            value={location} 
                            onChange={e => setLocation(e.target.value)} 
                            onKeyDown={handleKeyPress}
                            placeholder="Enter city name (e.g., Chicago, London, Tokyo)..."
                            className="search-input"
                        />
                        <button 
                            onClick={handleSearch} 
                            disabled={loading || !location.trim()}
                            className="search-btn"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Searching...
                                </>
                            ) : '🔍 Get Weather'}
                        </button>
                    </div>
                    
                    {/* Error display */}
                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                {/* Weather results display */}
                {weather && (
                    <div className="weather-display">
                        <div className="weather-card">
                            <div className="weather-card-header">
                                <h2>{formatLocation(weather)}</h2>
                                <span className="weather-icon-large">
                                    {getWeatherIcon(weather.current.weather_descriptions[0])}
                                </span>
                            </div>
                            
                            {/* Location details */}
                            <div className="location-details">
                                <div className="detail-item">
                                    <span className="detail-label">📍 City:</span>
                                    <span className="detail-value">{weather.location.name}</span>
                                </div>
                                {weather.location.region && weather.location.region !== "Region" && (
                                    <div className="detail-item">
                                        <span className="detail-label">🗺️ Region:</span>
                                        <span className="detail-value">{weather.location.region}</span>
                                    </div>
                                )}
                                {weather.location.country && weather.location.country !== "Country" && (
                                    <div className="detail-item">
                                        <span className="detail-label">🌍 Country:</span>
                                        <span className="detail-value">{weather.location.country}</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Temperature and condition */}
                            <div className="weather-main">
                                <div className="temperature-section">
                                    <div className="current-temp">
                                        <span className="temp-value">{weather.current.temperature}</span>
                                        <span className="temp-unit">°C</span>
                                    </div>
                                    <div className="temp-feels">
                                        Feels like: {weather.current.feelslike}°C
                                    </div>
                                </div>
                                
                                <div className="weather-condition">
                                    <span className="condition-icon">
                                        {getWeatherIcon(weather.current.weather_descriptions[0])}
                                    </span>
                                    <span className="condition-text">
                                        {weather.current.weather_descriptions[0]}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Weather statistics grid */}
                            <div className="weather-stats">
                                <div className="stat-card">
                                    <div className="stat-icon">💨</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{weather.current.wind_speed} km/h</div>
                                        <div className="stat-label">Wind Speed</div>
                                    </div>
                                </div>
                                
                                <div className="stat-card">
                                    <div className="stat-icon">💧</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{weather.current.humidity}%</div>
                                        <div className="stat-label">Humidity</div>
                                    </div>
                                </div>
                                
                                <div className="stat-card">
                                    <div className="stat-icon">🌡️</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{weather.current.pressure || 1013} hPa</div>
                                        <div className="stat-label">Pressure</div>
                                    </div>
                                </div>
                                
                                <div className="stat-card">
                                    <div className="stat-icon">👁️</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{weather.current.visibility || 10} km</div>
                                        <div className="stat-label">Visibility</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Save button */}
                            <button 
                                onClick={handleSave}
                                className="save-btn"
                                title={`Save ${formatLocation(weather)} to your dashboard`}
                            >
                                <span className="save-icon">💾</span>
                                Save Location
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Empty state - shown when no search has been performed */}
                {!weather && !loading && (
                    <div className="empty-state">
                        <div className="empty-icon">🌤️</div>
                        <h3>Search for a City</h3>
                        <p>Enter a city name above to see current weather conditions</p>
                        <div className="suggestions">
                            <span className="suggestion-tag" onClick={() => setLocation("Chicago")}>
                                Chicago
                            </span>
                            <span className="suggestion-tag" onClick={() => setLocation("London")}>
                                London
                            </span>
                            <span className="suggestion-tag" onClick={() => setLocation("Tokyo")}>
                                Tokyo
                            </span>
                            <span className="suggestion-tag" onClick={() => setLocation("Sydney")}>
                                Sydney
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherPage;