import requests
from flask import current_app

# ═══════════════════════════════════════════════════════════════
# Art Institute of Chicago API Service
# ═══════════════════════════════════════════════════════════════

class ArtAPI:
    # ═════════════════════════════════════════════════════════════════
    # ─Handles all communication with the Art Institute of Chicago API─
    # ═════════════════════════════════════════════════════════════════    
    def __init__(self):
        self.base_url = "https://api.artic.edu/api/v1"
    
    def search_artworks(self, query, limit=12):
        # ═══════════════════════════════════════════════════════════════
        # ────────────Search for artworks by query string────────────────
        # ═══════════════════════════════════════════════════════════════         
        # ─── Validate Input ─────────────────────────────────────
        if not query or not query.strip():
            return {"data": [], "pagination": {}}
        
        # ─── Make API Request ───────────────────────────────────
        try:
            response = requests.get(
                f"{self.base_url}/artworks/search",
                params={
                    "q": query.strip(),
                    "limit": limit,
                    "fields": "id,title,artist_title,date_display,medium_display,artist_display,image_id"
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                # Ensure data field exists
                if 'data' not in data:
                    data['data'] = []
                return data
            
            # Log error but return empty results
            current_app.logger.error(f"Art API error: {response.status_code}")
            return {"data": [], "pagination": {}}
                
        except requests.exceptions.Timeout:
            current_app.logger.error("Art API timeout")
            return self._get_mock_data(limit)
            
        except requests.exceptions.ConnectionError:
            current_app.logger.error("Art API connection error")
            return self._get_mock_data(limit)
            
        except Exception as e:
            current_app.logger.error(f"Art API unexpected error: {str(e)}")
            return {"data": [], "pagination": {}}
    
    def _get_mock_data(self, limit=12):
    # ═══════════════════════════════════════════════════════════════
    # ───Return mock data for development when API is unavailable────
    # ═══════════════════════════════════════════════════════════════ 
        return {
            "data": [
                {
                    "id": 1,
                    "title": "Water Lilies",
                    "artist_title": "Claude Monet",
                    "date_display": "1916",
                    "medium_display": "Oil on canvas",
                    "image_id": "abc123"
                },
                {
                    "id": 2,
                    "title": "The Starry Night",
                    "artist_title": "Vincent van Gogh",
                    "date_display": "1889",
                    "medium_display": "Oil on canvas",
                    "image_id": "def456"
                }
            ][:limit],
            "pagination": {"total": 2, "limit": limit, "offset": 0, "total_pages": 1}
        }

# ─── Singleton Instance ────────────────────────────────────────
art_api = ArtAPI()