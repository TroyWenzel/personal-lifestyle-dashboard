import { useState } from "react";
import { useSaveLocation } from "@/api/queries";
import { searchWeather } from "@/api/services/weatherService";
import "@/styles/GlassDesignSystem.css";

const WeatherPage = () => {
    const [location, setLocation] = useState("");
    const [searchedLocation, setSearchedLocation] = useState("");
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    // 🚀 TanStack Query mutation for saving
    const saveLocationMutation = useSaveLocation();

    // Format location string for display
    const formatLocation = (weatherData) => {
        if (!weatherData || !weatherData.location) return "";
        
        const { name, region, country } = weatherData.location;
        const parts = [];

        if (name) parts.push(name);
        if (region && region !== name && region !== "Region" && region !== "N/A") {
            parts.push(region);
        }
        if (country && country !== "Country" && country !== "N/A") {
            parts.push(country);
        }
        
        return parts.join(", ");
    };

    // Get appropriate weather emoji
    const getWeatherIcon = (description) => {
        const desc = description?.toLowerCase() || "";
        if (desc.includes("sunny") || desc.includes("clear")) return "☀️";
        if (desc.includes("cloud")) return "☁️";
        if (desc.includes("rain")) return "🌧️";
        if (desc.includes("snow")) return "❄️";
        if (desc.includes("storm")) return "⛈️";
        if (desc.includes("wind")) return "💨";
        if (desc.includes("fog") || desc.includes("mist")) return "🌫️";
        return "🌤️";
    };

    const handleSearch = async () => {
        if (!location.trim()) {
            setError("Please enter a location");
            return;
        }

        setLoading(true);
        setError("");
        setSearchedLocation(location);

        try {
            const data = await searchWeather(location);
            setWeather(data);
        } catch (err) {
            console.error("Weather search error:", err);
            setError("Could not find weather data for this location. Using mock weather data for development.");
            
            // Provide mock data for development
            setWeather({
                location: {
                    name: location.charAt(0).toUpperCase() + location.slice(1),
                    country: 'Mock Country',
                    region: 'Mock Region'
                },
                current: {
                    temperature: 15,
                    feelslike: 14,
                    weather_descriptions: ['Partly cloudy'],
                    humidity: 60,
                    wind_speed: 10,
                    wind_dir: 'SW',
                    pressure: 1013,
                    visibility: 10
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (!weather) return;

        saveLocationMutation.mutate(weather, {
            onSuccess: () => {
                alert("Location saved successfully!");
            },
            onError: (error) => {
                console.error("Error saving location:", error);
                alert("Failed to save location");
            },
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="glass-page">
            <div className="glass-container">
                <div className="glass-page-header">
                    <h1>⛅ Weather Tracker</h1>
                    <p className="subtitle">Search for weather in any city and save your favorite locations</p>
                </div>

                {/* Search Section */}
                <div className="glass-search-section">
                    <div className="glass-search-box">
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter city name (e.g., London, Tokyo, New York)..."
                            className="glass-input"
                        />
                        <button 
                            onClick={handleSearch} 
                            disabled={loading}
                            className="glass-btn"
                        >
                            {loading ? 'Searching...' : '🔍 Get Weather'}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Fetching weather data for {location}...</p>
                    </div>
                )}

                {/* Weather Display */}
                {weather && !loading && (
                    <div className="weather-card">
                        <div className="weather-header">
                            <h2>{formatLocation(weather)}</h2>
                            <span className="weather-icon-large">
                                {getWeatherIcon(weather.current.weather_descriptions?.[0])}
                            </span>
                        </div>

                        <div className="weather-main">
                            <div className="temperature">
                                <span className="temp-value">{Math.round(weather.current.temperature)}°</span>
                                <span className="temp-unit">C</span>
                            </div>
                            <div className="weather-description">
                                {weather.current.weather_descriptions?.[0] || 'N/A'}
                            </div>
                            <div className="feels-like">
                                Feels like {Math.round(weather.current.feelslike)}°C
                            </div>
                        </div>

                        <div className="weather-details">
                            <div className="detail-item">
                                <span className="detail-icon">💧</span>
                                <span className="detail-label">Humidity</span>
                                <span className="detail-value">{weather.current.humidity}%</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-icon">💨</span>
                                <span className="detail-label">Wind</span>
                                <span className="detail-value">
                                    {weather.current.wind_speed} km/h {weather.current.wind_dir}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-icon">🌡️</span>
                                <span className="detail-label">Pressure</span>
                                <span className="detail-value">{weather.current.pressure} hPa</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-icon">👁️</span>
                                <span className="detail-label">Visibility</span>
                                <span className="detail-value">{weather.current.visibility} km</span>
                            </div>
                        </div>

                        <div className="weather-actions">
                            <button 
                                onClick={handleSave}
                                disabled={saveLocationMutation.isLoading}
                                className="glass-btn glass-btn-sm"
                            >
                                {saveLocationMutation.isLoading ? '💾 Saving...' : '💾 Save Location'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!weather && !loading && !error && (
                    <div className="empty-state">
                        <span className="empty-icon">🌍</span>
                        <h3>Check the Weather Anywhere</h3>
                        <p>Search for a city to see current weather conditions</p>
                        <div className="popular-cities">
                            <span className="suggestion-label">Popular cities:</span>
                            <button onClick={() => { setLocation('London'); }}>London</button>
                            <button onClick={() => { setLocation('Tokyo'); }}>Tokyo</button>
                            <button onClick={() => { setLocation('New York'); }}>New York</button>
                            <button onClick={() => { setLocation('Paris'); }}>Paris</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherPage;