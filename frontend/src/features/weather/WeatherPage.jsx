import { useState } from "react";
import { searchWeather } from "../../api/weatherService";
import { saveLocation } from "../../api/contentService";

const WeatherPage = () => {
    const [location, setLocation] = useState("");
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await searchWeather(location);
            setWeather(data);
        } catch (error) {
            console.error("Weather search error:", error);
            alert("Failed to fetch weather data");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!weather) return;
        
        try {
            const itemData = {
                category: "weather",
                external_id: `${weather.location.name}-${Date.now()}`,
                title: `Weather in ${weather.location.name}`,
                metadata: {
                    location: weather.location.name,
                    temperature: weather.current.temperature,
                    description: weather.current.weather_descriptions[0],
                    humidity: weather.current.humidity,
                    wind_speed: weather.current.wind_speed
                }
            };
            
            await saveLocation(itemData);
            alert("Location saved successfully!");
        } catch (error) {
            console.error("Error saving location:", error);
            alert("Failed to save location");
        }
    };

    return (
        <div className="weather-container">
            <h1>Weather Tracker</h1>
            <p>Search for weather in any city and save your favorite locations.</p>
            
            <div className="search-section">
                <input 
                    value={location} 
                    onChange={e => setLocation(e.target.value)} 
                    placeholder="Enter city name..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} disabled={loading}>
                    {loading ? 'Searching...' : 'Get Weather'}
                </button>
            </div>

            {weather && (
                <div className="weather-card">
                    <h2>{weather.location.name}, {weather.location.country}</h2>
                    <div className="weather-details">
                        <div className="temp-section">
                            <span className="temperature">{weather.current.temperature}°C</span>
                            <span className="feels-like">Feels like: {weather.current.feelslike}°C</span>
                        </div>
                        <div className="conditions">
                            <p>{weather.current.weather_descriptions[0]}</p>
                            <p>Humidity: {weather.current.humidity}%</p>
                            <p>Wind: {weather.current.wind_speed} km/h</p>
                        </div>
                        <button onClick={handleSave} className="save-button">
                            Save Location
                        </button>
                    </div>
                </div>
            )}
            
            <div className="saved-locations">
                <h3>Your Saved Locations</h3>
                <p>Saved locations will appear on your dashboard</p>
            </div>
        </div>
    );
};

export default WeatherPage;