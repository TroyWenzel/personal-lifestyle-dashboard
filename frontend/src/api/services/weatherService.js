import apiClient from "../client";

// Fetch current weather for a location
export const searchWeather = async (location) => {
    try {
        const response = await apiClient.get(`/api/weather/current?location=${encodeURIComponent(location)}`);
        
        if (response.error) {
            throw new Error(response.error);
        }
        
        return response;
    } catch (error) {
        console.error('Error fetching weather:', error);

        // Provide mock data in development mode for easier testing
        if (import.meta.env.DEV) {
            console.log('Using mock weather data for development');
            return getMockWeatherData(location);
        }

        throw error;
    }
};

// Fetch weather forecast for multiple days
export const getWeatherForecast = async (location, days = 3) => {
    try {
        const response = await apiClient.get(`/api/weather/forecast?location=${encodeURIComponent(location)}&days=${days}`);
        
        if (response.error) {
            throw new Error(response.error);
        }
        
        return response;
    } catch (error) {
        console.error('Error fetching weather forecast:', error);
        throw error;
    }
};

// Mock weather data for development/testing
const getMockWeatherData = (location) => {
    const locations = {
        'chicago': { temp: 2, feelslike: -1, desc: 'Partly cloudy', humidity: 65, wind: 15, lat: 41.85, lon: -87.65 },
        'london': { temp: 8, feelslike: 6, desc: 'Light rain', humidity: 80, wind: 10, lat: 51.5074, lon: -0.1278 },
        'tokyo': { temp: 12, feelslike: 11, desc: 'Sunny', humidity: 50, wind: 8, lat: 35.6762, lon: 139.6503 },
        'sydney': { temp: 25, feelslike: 27, desc: 'Clear', humidity: 40, wind: 12, lat: -33.8688, lon: 151.2093 },
        'new york': { temp: 5, feelslike: 2, desc: 'Cloudy', humidity: 70, wind: 18, lat: 40.7128, lon: -74.0060 },
        'los angeles': { temp: 18, feelslike: 17, desc: 'Sunny', humidity: 30, wind: 5, lat: 34.0522, lon: -118.2437 },
        'paris': { temp: 10, feelslike: 9, desc: 'Cloudy', humidity: 75, wind: 12, lat: 48.8566, lon: 2.3522 },
        'miami': { temp: 28, feelslike: 30, desc: 'Sunny', humidity: 65, wind: 8, lat: 25.7617, lon: -80.1918 }
    };
    
    const locKey = location.toLowerCase();
    const weatherData = locations[locKey] || { 
        temp: 15, 
        feelslike: 14, 
        desc: 'Partly cloudy',
        humidity: 60,
        wind: 10,
        lat: 41.85,
        lon: -87.65
    };
    
    return {
        location: {
            name: location.charAt(0).toUpperCase() + location.slice(1),
            region: 'Mock Region',
            country: 'Mock Country',
            lat: weatherData.lat,
            lon: weatherData.lon,
            timezone_id: 'America/Chicago',
            localtime: new Date().toISOString().split('T')[0] + ' 14:45',
        },
        current: {
            observation_time: '08:45 PM',
            temperature: weatherData.temp,
            weather_code: 116,
            weather_icons: ['https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png'],
            weather_descriptions: [weatherData.desc],
            wind_speed: weatherData.wind,
            wind_degree: 200,
            wind_dir: 'SSW',
            pressure: 1013,
            precip: 0,
            humidity: weatherData.humidity,
            cloudcover: 25,
            feelslike: weatherData.feelslike,
            uv_index: 5,
            visibility: 10
        }
    };
};

// Re-export save function for consistent import pattern
export { saveLocation } from './contentService';

// Aliases for TanStack Query compatibility
export const getCurrentWeather = searchWeather;
export const searchLocation = searchWeather;