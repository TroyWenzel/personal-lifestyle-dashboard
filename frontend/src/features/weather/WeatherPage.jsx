import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useWeather, useSaveLocation, useDeleteItem, useSavedItems } from "@/api/queries";
import "@/styles/GlassDesignSystem.css";
import "@/styles/features/Weather.css";

// Load Leaflet CSS and JS once globally
if (typeof window !== 'undefined' && !window.leafletLoaded) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    document.body.appendChild(script);
    
    window.leafletLoaded = true;
}

const WeatherPage = () => {
    const [searchCity, setSearchCity] = useState("");
    const [currentCity, setCurrentCity] = useState("");
    const [defaultCity, setDefaultCity] = useState(() => {
        return localStorage.getItem('defaultWeatherCity') || "";
    });
    const [mapReady, setMapReady] = useState(false);
    
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const initAttempted = useRef(false);
    
    const navigate = useNavigate();
    const { data: allSavedItems = [] } = useSavedItems();
    const saveLocationMutation = useSaveLocation();
    const deleteItemMutation = useDeleteItem();
    
    const savedLocations = allSavedItems.filter(item => item.type === 'location');
    
    const { data: weatherResponse, isLoading, error } = useWeather(currentCity, {
        enabled: !!currentCity
    });

    // Unwrap the API response - data is nested inside weatherResponse.data
    const weatherData = weatherResponse?.data;

    // Debug: Log what we receive from API
    useEffect(() => {
        if (weatherData) {
            console.log('=== RECEIVED WEATHER DATA ===');
            console.log('weatherData:', weatherData);
            console.log('weatherData.current:', weatherData.current);
            console.log('weatherData.location:', weatherData.location);
            console.log('============================');
        }
    }, [weatherData]);

    const cityStateMap = {
        'New York': 'New York',
        'Los Angeles': 'California',
        'Chicago': 'Illinois',
        'Houston': 'Texas',
        'Phoenix': 'Arizona',
        'Philadelphia': 'Pennsylvania',
        'San Antonio': 'Texas',
        'San Diego': 'California',
        'Dallas': 'Texas',
        'San Jose': 'California',
        'Austin': 'Texas',
        'Jacksonville': 'Florida',
        'Fort Worth': 'Texas',
        'Columbus': 'Ohio',
        'Charlotte': 'North Carolina',
        'San Francisco': 'California',
        'Indianapolis': 'Indiana',
        'Seattle': 'Washington',
        'Denver': 'Colorado',
        'Washington': 'District of Columbia',
        'Boston': 'Massachusetts',
        'Nashville': 'Tennessee',
        'Detroit': 'Michigan',
        'Portland': 'Oregon',
        'Las Vegas': 'Nevada',
        'Memphis': 'Tennessee',
        'Louisville': 'Kentucky',
        'Baltimore': 'Maryland',
        'Milwaukee': 'Wisconsin',
        'Albuquerque': 'New Mexico',
        'Tucson': 'Arizona',
        'Fresno': 'California',
        'Sacramento': 'California',
        'Mesa': 'Arizona',
        'Kansas City': 'Missouri',
        'Atlanta': 'Georgia',
        'Miami': 'Florida',
        'Raleigh': 'North Carolina',
        'Omaha': 'Nebraska',
        'Colorado Springs': 'Colorado',
        'Virginia Beach': 'Virginia',
        'Oakland': 'California',
        'Minneapolis': 'Minnesota',
        'Tulsa': 'Oklahoma',
        'Tampa': 'Florida',
        'Arlington': 'Texas',
        'New Orleans': 'Louisiana'
    };

    // Initialize map ONCE - only on component mount
    useEffect(() => {
        if (initAttempted.current) return;
        initAttempted.current = true;

        const initializeMap = () => {
            if (window.L && mapContainerRef.current && !mapRef.current) {
                try {
                    console.log('Initializing map for the first time...');
                    
                    mapRef.current = window.L.map(mapContainerRef.current, {
                        zoomControl: false,
                        attributionControl: false
                    }).setView([20, 0], 2);

                    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 18,
                    }).addTo(mapRef.current);

                    // Disable interactions
                    mapRef.current.dragging.disable();
                    mapRef.current.touchZoom.disable();
                    mapRef.current.doubleClickZoom.disable();
                    mapRef.current.scrollWheelZoom.disable();
                    mapRef.current.boxZoom.disable();
                    mapRef.current.keyboard.disable();

                    setMapReady(true);
                    console.log('Map initialized successfully!');
                } catch (err) {
                    console.error('Error initializing map:', err);
                }
            }
        };

        // Wait for Leaflet to load
        if (window.L) {
            initializeMap();
        } else {
            const checkLeaflet = setInterval(() => {
                if (window.L) {
                    clearInterval(checkLeaflet);
                    initializeMap();
                }
            }, 100);

            return () => clearInterval(checkLeaflet);
        }
    }, []);

    // Update marker when weather changes
    useEffect(() => {
        if (!weatherData || !weatherData.location || !mapReady || !mapRef.current || !window.L) {
            return;
        }

        console.log('=== WEATHER DATA STRUCTURE ===');
        console.log('Full data:', JSON.stringify(weatherData, null, 2));
        console.log('Current object:', weatherData.current);
        console.log('===========================');

        const location = weatherData.location;
        const lat = Number(location.lat);
        const lon = Number(location.lon);

        console.log('=== UPDATING MARKER ===');
        console.log('City:', location.name);
        console.log('Coordinates:', lat, lon);

        if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
            console.error('Invalid coordinates!');
            return;
        }

        // Remove old marker
        if (markerRef.current) {
            mapRef.current.removeLayer(markerRef.current);
        }

        // Create custom marker
        const customIcon = window.L.divIcon({
            className: 'custom-marker',
            html: '<div class="marker-pin"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        // Add new marker
        markerRef.current = window.L.marker([lat, lon], {
            icon: customIcon,
            title: location.name
        }).addTo(mapRef.current);

        // Calculate offset to show marker lower on screen
        // We want the marker to appear in the CENTER of the circle
        // Panning UP (adding to lat) makes marker appear DOWN on screen
        const latOffset = 1.8; // Increased to move marker down more into circle center
        const adjustedLat = lat + latOffset;

        // Fly to adjusted location so marker appears in circle center
        mapRef.current.flyTo([adjustedLat, lon], 6, {
            duration: 1.5,
            easeLinearity: 0.25
        });

        console.log('Map flying to adjusted position:', [adjustedLat, lon]);
        console.log('Marker will appear at:', [lat, lon]);
    }, [weatherData, mapReady]);

    useEffect(() => {
        if (defaultCity && !currentCity) {
            setCurrentCity(defaultCity);
            setSearchCity(defaultCity);
        }
    }, []);

    const handleSearch = () => {
        if (searchCity.trim()) {
            setCurrentCity(searchCity.trim());
        }
    };

    const handleSetDefault = () => {
        if (currentCity) {
            localStorage.setItem('defaultWeatherCity', currentCity);
            setDefaultCity(currentCity);
            alert(`${currentCity} set as your default city!`);
        }
    };

    const handleSaveLocation = () => {
        if (weatherData && weatherData.current && weatherData.location) {
            const locationData = {
                city: weatherData.location.name,
                region: weatherData.location.region,
                country: weatherData.location.country,
                lat: weatherData.location.lat,
                lon: weatherData.location.lon,
                temp: weatherData.current.temperature,
                condition: weatherData.current.weather_descriptions?.[0] || weatherData.current.weather_desc || 'Unknown',
                icon: weatherData.current.weather_icons?.[0] || ''
            };
            
            saveLocationMutation.mutate(locationData, {
                onSuccess: () => alert("Location saved successfully!"),
                onError: (error) => {
                    console.error("Error saving location:", error);
                    alert("Failed to save location");
                }
            });
        }
    };

    const handleDeleteLocation = (itemId) => {
        if (window.confirm('Remove this location?')) {
            deleteItemMutation.mutate(itemId, {
                onSuccess: () => alert('Location removed!'),
                onError: (error) => {
                    console.error('Error deleting:', error);
                    alert('Failed to remove location');
                }
            });
        }
    };

    const getWeatherIcon = (description) => {
        const desc = description?.toLowerCase() || '';
        if (desc.includes('sunny') || desc.includes('clear')) return '☀️';
        if (desc.includes('cloud')) return '☁️';
        if (desc.includes('rain') || desc.includes('drizzle')) return '🌧️';
        if (desc.includes('snow')) return '❄️';
        if (desc.includes('storm') || desc.includes('thunder')) return '⛈️';
        if (desc.includes('fog') || desc.includes('mist')) return '🌫️';
        if (desc.includes('wind')) return '💨';
        if (desc.includes('partly')) return '⛅';
        return '🌤️';
    };

    const toFahrenheit = (celsius) => Math.round((celsius * 9/5) + 32);

    const getLocationDisplay = (locationData) => {
        if (!locationData) return "";
        
        const { name, region, country } = locationData;
        let displayParts = [name];
        
        const hasValidRegion = region && 
                                region !== name && 
                                region !== 'Mock Region' && 
                                region !== 'Region' && 
                                region !== 'N/A';
        
        if (hasValidRegion) {
            displayParts.push(region);
        } else if (cityStateMap[name]) {
            displayParts.push(cityStateMap[name]);
        }
        
        const hasValidCountry = country && 
                                country !== 'Mock Country' && 
                                country !== 'Country' && 
                                country !== 'N/A';
        
        if (hasValidCountry && country !== 'United States of America' && !cityStateMap[name]) {
            displayParts.push(country);
        }
        
        return displayParts.join(', ');
    };

    return (
        <div className="glass-page">
            {/* World Map Background */}
            <div className="weather-map-background">
                <div ref={mapContainerRef} className="world-map-container"></div>
            </div>

            <div className="glass-container weather-content-overlay">
                <div className="glass-page-header">
                    <h2>⛅ Weather</h2>
                    <p className="subtitle">Check weather conditions around the world</p>
                </div>

                <div className="glass-search-section weather-search-section">
                    <div className="glass-search-box">
                        <input 
                            type="text"
                            value={searchCity} 
                            onChange={e => setSearchCity(e.target.value)} 
                            placeholder="Enter city name (e.g., Chicago, London, Tokyo)..."
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
                    
                    {defaultCity && (
                        <div className="weather-default-city">
                            <p>📍 Default City: <strong>{defaultCity}</strong></p>
                        </div>
                    )}
                </div>

                {isLoading && (
                    <div className="glass-loading">
                        <div className="glass-spinner"></div>
                        <p>Fetching weather data...</p>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="glass-empty-state">
                        <span className="glass-empty-icon">⚠️</span>
                        <h3>City Not Found</h3>
                        <p>We couldn't find weather data for "{currentCity}"</p>
                        <p className="weather-feels-like">Try searching for a different city</p>
                    </div>
                )}

                {weatherData && weatherData.current && !isLoading && (
                    <div className="glass-card weather-current-card">
                        <div className="weather-location-header">
                            <h2 className="weather-location-name">
                                {getLocationDisplay(weatherData.location)}
                            </h2>
                            <p className="weather-location-time">
                                {new Date().toLocaleString()}
                            </p>
                        </div>

                        <div className="weather-main-display">
                            <div className="weather-icon-section">
                                <div className="weather-icon-large">
                                    {getWeatherIcon(weatherData.current.weather_descriptions?.[0] || weatherData.current.weather_desc || 'clear')}
                                </div>
                                <p className="weather-condition-text">
                                    {weatherData.current.weather_descriptions?.[0] || weatherData.current.weather_desc || 'Clear'}
                                </p>
                            </div>
                            
                            <div className="weather-temp-section">
                                <div className="weather-temp-large">
                                    {toFahrenheit(weatherData.current.temperature)}°F
                                </div>
                                <p className="weather-feels-like">
                                    Feels like {toFahrenheit(weatherData.current.feelslike)}°F
                                </p>
                                <p className="weather-feels-like">
                                    ({weatherData.current.temperature}°C)
                                </p>
                            </div>
                        </div>

                        <div className="weather-details-grid">
                            <div className="weather-detail-card">
                                <p className="weather-detail-label">💧 Humidity</p>
                                <p className="weather-detail-value">{weatherData.current.humidity}%</p>
                            </div>

                            <div className="weather-detail-card">
                                <p className="weather-detail-label">💨 Wind Speed</p>
                                <p className="weather-detail-value">{weatherData.current.wind_speed} km/h</p>
                            </div>

                            <div className="weather-detail-card">
                                <p className="weather-detail-label">🧭 Wind Direction</p>
                                <p className="weather-detail-value">{weatherData.current.wind_dir}</p>
                            </div>

                            <div className="weather-detail-card">
                                <p className="weather-detail-label">👁️ Visibility</p>
                                <p className="weather-detail-value">{weatherData.current.visibility} km</p>
                            </div>

                            <div className="weather-detail-card">
                                <p className="weather-detail-label">🌡️ Pressure</p>
                                <p className="weather-detail-value">{weatherData.current.pressure} mb</p>
                            </div>

                            <div className="weather-detail-card">
                                <p className="weather-detail-label">☁️ Cloud Cover</p>
                                <p className="weather-detail-value">{weatherData.current.cloudcover}%</p>
                            </div>
                        </div>

                        <div className="weather-actions">
                            <button 
                                className="glass-btn"
                                onClick={handleSaveLocation}
                                disabled={saveLocationMutation.isLoading}
                            >
                                {saveLocationMutation.isLoading ? '💾 Saving...' : '💾 Save Location'}
                            </button>
                            
                            <button 
                                className={`glass-btn-secondary weather-btn-default ${currentCity === defaultCity ? 'is-default' : ''}`}
                                onClick={handleSetDefault}
                            >
                                {currentCity === defaultCity ? '✅ Default City' : '📍 Set as Default'}
                            </button>
                        </div>
                    </div>
                )}

                {savedLocations.length > 0 && (
                    <div className="weather-saved-section">
                        <h3 className="weather-saved-title">📍 Saved Locations</h3>
                        <div className="weather-saved-grid">
                            {savedLocations.map(item => (
                                <div key={item.id} className="glass-item-card weather-saved-card">
                                    <div onClick={() => {
                                        setCurrentCity(item.metadata?.city || item.title);
                                        setSearchCity(item.metadata?.city || item.title);
                                    }}>
                                        <div className="weather-saved-icon">
                                            {getWeatherIcon(item.metadata?.condition || 'clear')}
                                        </div>
                                        
                                        <h3 className="weather-saved-title-text">{item.title}</h3>
                                        
                                        {item.metadata?.temp && (
                                            <p className="weather-saved-temp">
                                                {Math.round(item.metadata.temp)}°C
                                            </p>
                                        )}
                                        
                                        {item.metadata?.condition && (
                                            <p className="weather-saved-condition">
                                                {item.metadata.condition}
                                            </p>
                                        )}
                                        
                                        <p className="weather-saved-date">
                                            Saved {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteLocation(item.id);
                                        }}
                                        className="glass-btn-secondary weather-saved-delete"
                                        disabled={deleteItemMutation.isLoading}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!weatherData && !isLoading && !error && !currentCity && (
                    <div className="glass-empty-state">
                        <span className="glass-empty-icon">⛅</span>
                        <h3>Search for a City</h3>
                        <p>Enter a city name to see current weather conditions</p>
                        <div className="glass-suggestion-tags">
                            <button onClick={() => { setSearchCity('Chicago'); setCurrentCity('Chicago'); }}>Chicago</button>
                            <button onClick={() => { setSearchCity('New York'); setCurrentCity('New York'); }}>New York</button>
                            <button onClick={() => { setSearchCity('London'); setCurrentCity('London'); }}>London</button>
                            <button onClick={() => { setSearchCity('Tokyo'); setCurrentCity('Tokyo'); }}>Tokyo</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherPage;