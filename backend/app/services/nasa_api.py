import requests
import os
from datetime import datetime
from flask import current_app

class NASAAPI:

    def __init__(self):
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
    
    def get_space_backgrounds(self, count=10):
        """Get multiple APODs for rotating backgrounds"""
        if not self.api_key:
            current_app.logger.error("NASA API key is missing!")
            return {
                'error': 'api_key_missing',
                'message': 'NASA API key is not configured.'
            }
        
        try:
            # Instead of using count parameter (which might not work),
            # fetch recent APODs from the past days
            from datetime import datetime, timedelta
            
            images = []
            today = datetime.now()
            
            current_app.logger.info(f"Fetching {count} NASA backgrounds from recent days...")
            
            # Try to fetch APOD from the last 15 days to get 10 images
            for i in range(15):
                if len(images) >= count:
                    break
                    
                date = (today - timedelta(days=i)).strftime('%Y-%m-%d')
                
                params = {
                    'api_key': self.api_key,
                    'date': date
                }
                
                try:
                    current_app.logger.info(f"Fetching APOD for {date}...")
                    response = requests.get(
                        f"{self.base_url}/planetary/apod",
                        params=params,
                        timeout=10
                    )
                    
                    current_app.logger.info(f"APOD {date} status: {response.status_code}")
                    
                    if response.status_code == 200:
                        apod = response.json()
                        media_type = apod.get('media_type')
                        current_app.logger.info(f"APOD {date} media type: {media_type}")
                        # Only add if it's an image (not video)
                        if media_type == 'image':
                            images.append(apod)
                            current_app.logger.info(f"Added image from {date}, total: {len(images)}")
                    else:
                        current_app.logger.error(f"APOD {date} failed: {response.text}")
                except Exception as e:
                    current_app.logger.error(f"Failed to fetch APOD for {date}: {str(e)}")
                    continue
            
            current_app.logger.info(f"Successfully fetched {len(images)} background images")
            
            return {
                'success': True,
                'images': images
            }
                
        except Exception as e:
            current_app.logger.error(f"NASA backgrounds error: {str(e)}")
            import traceback
            current_app.logger.error(traceback.format_exc())
            return {
                'error': 'internal_error',
                'message': f'Failed to fetch NASA data: {str(e)}'
            }

nasa_api = NASAAPI()