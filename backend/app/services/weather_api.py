import requests
import os
from flask import current_app

# ═══════════════════════════════════════════════════════════════
# WeatherStack API Service
# ═══════════════════════════════════════════════════════════════

class WeatherAPI:
    # ═══════════════════════════════════════════════════════════════
    # ──────Handles all communication with WeatherStack API──────────
    # ═══════════════════════════════════════════════════════════════    
    def __init__(self):
        self.api_key = os.getenv('WEATHERSTACK_API_KEY')
        self.base_url = "http://api.weatherstack.com"
        
        if not self.api_key:
            current_app.logger.error("WEATHERSTACK_API_KEY environment variable not set")
    
    def get_current_weather(self, city):
        # ═══════════════════════════════════════════════════════════════
        # ──────────────Get current weather for a city───────────────────
        # ═══════════════════════════════════════════════════════════════        
        # ─── Validate API Key ───────────────────────────────────
        if not self.api_key:
            return self._error_response(
                'api_key_missing',
                'Weather service is not configured properly'
            )
        
        # ─── Make API Request ───────────────────────────────────
        try:
            response = requests.get(
                f"{self.base_url}/current",
                params={
                    "access_key": self.api_key,
                    "query": city,
                    "units": "m"  # Metric units
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for API error
                if 'error' in data:
                    error_code = data['error'].get('code', 'unknown')
                    
                    if '404' in str(error_code):
                        return self._error_response(
                            'location_not_found',
                            f"Could not find weather data for '{city}'"
                        )
                    
                    return self._error_response(
                        'api_error',
                        data['error'].get('info', 'Weather service error')
                    )
                
                # Format city name
                if 'location' in data and 'name' in data['location']:
                    data['location']['name'] = data['location']['name'].title()
                
                return data
            
            current_app.logger.error(f"Weather API error: {response.status_code}")
            return self._error_response(
                'api_unavailable',
                'Weather service is currently unavailable'
            )
                
        except requests.exceptions.Timeout:
            current_app.logger.error("Weather API timeout")
            return self._error_response(
                'timeout',
                'Weather service took too long to respond'
            )
            
        except requests.exceptions.ConnectionError:
            current_app.logger.error("Weather API connection error")
            return self._error_response(
                'connection_error',
                'Could not connect to weather service'
            )
            
        except Exception as e:
            current_app.logger.error(f"Weather API error: {str(e)}")
            return self._error_response(
                'internal_error',
                'Failed to fetch weather data'
            )
    
    def _error_response(self, error_code, message):
        # ═══════════════════════════════════════════════════════════════
        # ────────Helper to create consistent error responses────────────
        # ═══════════════════════════════════════════════════════════════
        return {
            'error': error_code,
            'message': message
        }

# ─── Singleton Instance ────────────────────────────────────────
weather_api = WeatherAPI()