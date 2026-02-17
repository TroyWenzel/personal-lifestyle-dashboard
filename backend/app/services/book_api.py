import requests
from flask import current_app

class BookAPI:
    def __init__(self):
        # Open Library API - completely free, no key needed!
        self.base_url = "https://openlibrary.org"
    
    def search_books(self, query, limit=20):
        try:
            if not query or query.strip() == "":
                return {"docs": [], "numFound": 0}

            response = requests.get(
                f"{self.base_url}/search.json",
                params={
                    "q": query,
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
            else:
                current_app.logger.error(f"Book API failed: {response.status_code}")
                return {"docs": [], "numFound": 0}
                
        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Book API connection error: {str(e)}")
            # Return mock data for development
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
                ],
                "numFound": 2
            }
    
    def get_book_details(self, work_key):
        """Get detailed book information"""
        try:
            response = requests.get(
                f"{self.base_url}{work_key}.json",
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return None
                
        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Error fetching book details: {str(e)}")
            return None

book_api = BookAPI()