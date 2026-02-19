import requests
import os
from datetime import datetime, timedelta
from flask import current_app

# ═══════════════════════════════════════════════════════════════
# NASA API Service
# ═══════════════════════════════════════════════════════════════

class NASAAPI:
    # ═══════════════════════════════════════════════════════════════
    # ─────────Handles all communication with NASA APIs─────────────
    # ═══════════════════════════════════════════════════════════════    
    def __init__(self):
        self.api_key = os.getenv('NASA_API_KEY')
        self.base_url = "https://api.nasa.gov"
        
        if not self.api_key:
            current_app.logger.error("NASA_API_KEY environment variable not set")
    
    def get_apod(self, date=None):
        # ═══════════════════════════════════════════════════════════════
        # ──────────────Get Astronomy Picture of the Day─────────────────
        # ═══════════════════════════════════════════════════════════════        
        if not self.api_key:
            return self._error_response('api_key_missing', 'NASA API key is not configured')
        
        try:
            params = {'api_key': self.api_key}
            if date:
                params['date'] = date
            
            response = requests.get(
                f"{self.base_url}/planetary/apod",
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            
            current_app.logger.error(f"NASA APOD error: {response.status_code}")
            return self._error_response('api_error', 'Failed to fetch Astronomy Picture of the Day')
                
        except requests.exceptions.Timeout:
            current_app.logger.error("NASA APOD timeout")
            return self._error_response('timeout', 'NASA API request timed out')
            
        except requests.exceptions.ConnectionError:
            current_app.logger.error("NASA APOD connection error")
            return self._error_response('connection_error', 'Could not connect to NASA API')
            
        except Exception as e:
            current_app.logger.error(f"NASA APOD error: {str(e)}")
            return self._error_response('internal_error', 'Failed to fetch NASA data')
    
    def get_mars_rover_photos(self, rover='curiosity', earth_date=None, page=1):
        # ═══════════════════════════════════════════════════════════════
        # ────────────────Get photos from Mars rovers────────────────────
        # ═══════════════════════════════════════════════════════════════        
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
                params['earth_date'] = datetime.now().strftime('%Y-%m-%d')
            
            response = requests.get(
                f"{self.base_url}/mars-photos/api/v1/rovers/{rover}/photos",
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            
            return {'error': 'api_error', 'photos': []}
                
        except Exception as e:
            current_app.logger.error(f"Mars Rover error: {str(e)}")
            return {'error': 'internal_error', 'photos': []}
    
    def get_space_backgrounds(self, count=10):
        # ═══════════════════════════════════════════════════════════════
        # ────────Get multiple APODs for rotating backgrounds────────────
        # ═══════════════════════════════════════════════════════════════        
        if not self.api_key:
            return self._error_response('api_key_missing', 'NASA API key is not configured')
        
        try:
            images = []
            today = datetime.now()
            
            # Fetch APOD from recent days
            for i in range(min(count * 2, 30)):  # Try up to 30 days
                if len(images) >= count:
                    break
                    
                date = (today - timedelta(days=i)).strftime('%Y-%m-%d')
                
                params = {
                    'api_key': self.api_key,
                    'date': date
                }
                
                try:
                    response = requests.get(
                        f"{self.base_url}/planetary/apod",
                        params=params,
                        timeout=10
                    )
                    
                    if response.status_code == 200:
                        apod = response.json()
                        if apod.get('media_type') == 'image':
                            images.append(apod)
                            
                except Exception:
                    continue
            
            return {
                'success': True,
                'images': images
            }
                
        except Exception as e:
            current_app.logger.error(f"NASA backgrounds error: {str(e)}")
            return self._error_response('internal_error', 'Failed to fetch NASA backgrounds')
    
    def _error_response(self, error_code, message):
        # ═══════════════════════════════════════════════════════════════
        # ────────Helper to create consistent error responses────────────
        # ═══════════════════════════════════════════════════════════════ 
        return {
            'error': error_code,
            'message': message
        }

# ─── Singleton Instance ────────────────────────────────────────
nasa_api = NASAAPI()