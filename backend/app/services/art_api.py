import requests
from flask import current_app

class ArtAPI:
    def __init__(self):
        # Base URL for the Art Institute of Chicago API
        self.base_url = "https://api.artic.edu/api/v1"
    
    def search_artworks(self, query, limit=12):
        try:
            # Don't make API call for empty search queries
            if not query or query.strip() == "":
                return {"data": [], "pagination": {}}

            # Make request to the Art Institute's search endpoint
            # 'fields' parameter specifies which data we want returned
            response = requests.get(
                f"{self.base_url}/artworks/search",
                params={
                    "q": query,
                    "limit": limit,
                    "fields": "id,title,artist_title,date_display,medium_display,artist_display,image_id"
                },
                timeout=10  # Don't wait more than 10 seconds
            )
            
            if response.status_code == 200:
                data = response.json()
                # Ensure data field exists even if empty
                if 'data' not in data:
                    data['data'] = []
                return data
            else:
                # Log error but return empty results (don't crash)
                current_app.logger.error(f"Art API failed: {response.status_code}")
                return {"data": [], "pagination": {}}
                
        except requests.exceptions.RequestException as e:
            # Network error, timeout, etc.
            current_app.logger.error(f"Art API connection error: {str(e)}")
            
            # Return mock data when API is unavailable
            # This helps frontend development continue even when API is down
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
                ],
                "pagination": {"total": 2, "limit": limit, "offset": 0, "total_pages": 1}
            }
        except Exception as e:
            # Catch any other unexpected errors
            current_app.logger.error(f"Art API unexpected error: {str(e)}")
            return {"data": [], "pagination": {}}

# Create a singleton instance for the application to use
art_api = ArtAPI()