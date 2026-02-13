import requests
import os
from flask import current_app

class WeatherAPI:

    def __init__(self):
        # Get API key from environment variable - now using your real key!
        self.api_key = os.getenv('WEATHERSTACK_API_KEY')
        self.base_url = "http://api.weatherstack.com"
        
        # Warn if API key is not set (shouldn't happen now that you have one)
        if not self.api_key:
            print("ERROR: WEATHERSTACK_API_KEY environment variable not set!")
            print("Please add it to your .env file or environment variables.")
    
    def get_current_weather(self, city):

        # Check if API key is configured
        if not self.api_key:
            current_app.logger.error("Weather API key not configured")
            return {
                'error': 'api_key_missing',
                'message': 'Weather service is not configured properly.'
            }
        
        try:
            # Make request to WeatherStack current weather endpoint
            response = requests.get(
                f"{self.base_url}/current",
                params={
                    "access_key": self.api_key,
                    "query": city,
                    "units": "m"  # Metric units (Celsius, km/h, mm)
                },
                timeout=10
            )
            
            # Check if request was successful
            if response.status_code == 200:
                data = response.json()
                
                # Check if API returned an error
                if 'error' in data:
                    error_code = data['error'].get('code', 'unknown')
                    error_info = data['error'].get('info', 'Unknown error')
                    
                    # Handle specific error codes
                    if '404' in str(error_code):
                        return {
                            'error': 'location_not_found',
                            'message': f"Could not find weather data for '{city}'. Please check the city name."
                        }
                    else:
                        return {
                            'error': 'api_error',
                            'message': error_info
                        }
                
                # Success! Format city name properly
                if 'location' in data and 'name' in data['location']:
                    data['location']['name'] = data['location']['name'].title()
                
                return data
            else:
                # Log unsuccessful status codes
                current_app.logger.error(f"Weather API returned status code: {response.status_code}")
                return {
                    'error': 'api_unavailable',
                    'message': 'Weather service is currently unavailable.'
                }
                
        except requests.exceptions.ConnectionError:
            current_app.logger.error("Weather API connection failed - check internet connection")
            return {
                'error': 'connection_error',
                'message': 'Could not connect to weather service. Please check your internet connection.'
            }
            
        except requests.exceptions.Timeout:
            current_app.logger.error("Weather API request timed out")
            return {
                'error': 'timeout',
                'message': 'Weather service took too long to respond. Please try again.'
            }
            
        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Weather API request failed: {str(e)}")
            return {
                'error': 'request_failed',
                'message': 'Failed to fetch weather data. Please try again.'
            }
            
        except Exception as e:
            current_app.logger.error(f"Weather API unexpected error: {str(e)}")
            return {
                'error': 'internal_error',
                'message': 'An unexpected error occurred.'
            }

weather_api = WeatherAPI()