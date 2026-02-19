import requests
from flask import current_app

# ═══════════════════════════════════════════════════════════════
# Open Library API Service
# ═══════════════════════════════════════════════════════════════

class BookAPI:
    # ═══════════════════════════════════════════════════════════════
    # ─────Handles all communication with the Open Library API───────
    # ═══════════════════════════════════════════════════════════════   
    def __init__(self):
        self.base_url = "https://openlibrary.org"
    
    def search_books(self, query, limit=20):
        # ═══════════════════════════════════════════════════════════════
        # ─────────────Search for books by query string──────────────────
        # ═══════════════════════════════════════════════════════════════        
        # ─── Validate Input ─────────────────────────────────────
        if not query or not query.strip():
            return {"docs": [], "numFound": 0}
        
        # ─── Make API Request ───────────────────────────────────
        try:
            response = requests.get(
                f"{self.base_url}/search.json",
                params={
                    "q": query.strip(),
                    "limit": limit,
                    "fields": "key,title,author_name,first_publish_year,isbn,cover_i,publisher,number_of_pages_median,subject"
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'docs' not in data:
                    data['docs'] = []
                return data
            
            current_app.logger.error(f"Book API error: {response.status_code}")
            return {"docs": [], "numFound": 0}
                
        except requests.exceptions.Timeout:
            current_app.logger.error("Book API timeout")
            return self._get_mock_data(limit)
            
        except requests.exceptions.ConnectionError:
            current_app.logger.error("Book API connection error")
            return self._get_mock_data(limit)
            
        except Exception as e:
            current_app.logger.error(f"Book API error: {str(e)}")
            return {"docs": [], "numFound": 0}
    
    def get_book_details(self, work_key):
        # ═══════════════════════════════════════════════════════════════
        # ──────Get detailed information about a specific book───────────
        # ═══════════════════════════════════════════════════════════════        
        try:
            response = requests.get(
                f"{self.base_url}{work_key}.json",
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            
            return None
                
        except Exception as e:
            current_app.logger.error(f"Book details error: {str(e)}")
            return None
    
    def _get_mock_data(self, limit=20):
    # ═══════════════════════════════════════════════════════════════
    # ───Return mock data for development when API is unavailable────
    # ═══════════════════════════════════════════════════════════════ 
        return {
            "docs": [
                {
                    "key": "/works/OL45804W",
                    "title": "To Kill a Mockingbird",
                    "author_name": ["Harper Lee"],
                    "first_publish_year": 1960,
                    "cover_i": 8228691,
                    "publisher": ["J. B. Lippincott & Co."],
                    "subject": ["Fiction", "Southern United States"]
                },
                {
                    "key": "/works/OL27258W",
                    "title": "1984",
                    "author_name": ["George Orwell"],
                    "first_publish_year": 1949,
                    "cover_i": 8231219,
                    "publisher": ["Secker & Warburg"],
                    "subject": ["Dystopia", "Political fiction"]
                }
            ][:limit],
            "numFound": 2
        }

# ─── Singleton Instance ────────────────────────────────────────
book_api = BookAPI()