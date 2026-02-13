import requests
import os
from datetime import datetime
from flask import current_app

class NASAAPI:

    def __init__(self):
        # Get NASA API key from environment variable
        self.api_key = os.getenv('NASA_API_KEY')
        self.base_url = "https://api.nasa.gov"
        
        if not self.api_key:
            print("ERROR: NASA_API_KEY environment variable not set!")
            print("Please add it to your .env file or environment variables.")
    
    def get_apod(self, date=None):

        if not self.api_key:
            return {
                'error': 'api_key_missing',
                'message': 'NASA API key is not configured.'
            }
        
        try:
            params = {
                'api_key': self.api_key
            }
            
            if date:
                params['date'] = date
            
            response = requests.get(
                f"{self.base_url}/planetary/apod",
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                current_app.logger.error(f"NASA APOD API error: {response.status_code}")
                return {
                    'error': 'api_error',
                    'message': 'Failed to fetch Astronomy Picture of the Day.'
                }
                
        except Exception as e:
            current_app.logger.error(f"NASA APOD error: {str(e)}")
            return {
                'error': 'internal_error',
                'message': 'Failed to fetch NASA data.'
            }
    
    def get_mars_rover_photos(self, rover='curiosity', earth_date=None, page=1):

        if not self.api_key:
            return {'error': 'api_key_missing'}
        
        try:
            params = {
                'api_key': self.api_key,
                'page': page
            }
            
            if earth_date:
                params['earth_date'] = earth_date
            else:
                # Default to today's date
                params['earth_date'] = datetime.now().strftime('%Y-%m-%d')
            
            response = requests.get(
                f"{self.base_url}/mars-photos/api/v1/rovers/{rover}/photos",
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {'error': 'api_error', 'photos': []}
                
        except Exception as e:
            current_app.logger.error(f"Mars Rover API error: {str(e)}")
            return {'error': 'internal_error', 'photos': []}

nasa_api = NASAAPI()