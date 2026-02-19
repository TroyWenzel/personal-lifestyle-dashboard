import requests
from flask import current_app

# ═══════════════════════════════════════════════════════════════
# TheCocktailDB API Service
# ═══════════════════════════════════════════════════════════════

class DrinkAPI:
    # ═══════════════════════════════════════════════════════════════
    # ──────Handles all communication with TheCocktailDB API─────────
    # ═══════════════════════════════════════════════════════════════    
    def __init__(self):
        self.base_url = "https://www.thecocktaildb.com/api/json/v1/1"
    
    def search_cocktails(self, query):
        # ═══════════════════════════════════════════════════════════════
        # ───────────────Search for cocktails by name────────────────────
        # ═══════════════════════════════════════════════════════════════        
        # ─── Validate Input ─────────────────────────────────────
        if not query or not query.strip():
            return {"drinks": None}
        
        # ─── Make API Request ───────────────────────────────────
        try:
            response = requests.get(
                f"{self.base_url}/search.php",
                params={"s": query.strip()},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            
            current_app.logger.error(f"Drink API error: {response.status_code}")
            return {"drinks": None}
                
        except requests.exceptions.Timeout:
            current_app.logger.error("Drink API timeout")
            return self._get_mock_data()
            
        except requests.exceptions.ConnectionError:
            current_app.logger.error("Drink API connection error")
            return self._get_mock_data()
            
        except Exception as e:
            current_app.logger.error(f"Drink API error: {str(e)}")
            return {"drinks": None}
    
    def get_random_cocktail(self):
        # ═══════════════════════════════════════════════════════════════
        # ───────────────────Get a random cocktail───────────────────────
        # ═══════════════════════════════════════════════════════════════        
        try:
            response = requests.get(
                f"{self.base_url}/random.php",
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            
            return {"drinks": None}
                
        except Exception as e:
            current_app.logger.error(f"Random cocktail error: {str(e)}")
            return {"drinks": None}
    
    def get_cocktail_by_id(self, drink_id):
        # ═══════════════════════════════════════════════════════════════
        # ──────────Get detailed cocktail information by ID──────────────
        # ═══════════════════════════════════════════════════════════════        
        try:
            response = requests.get(
                f"{self.base_url}/lookup.php",
                params={"i": drink_id},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            
            return {"drinks": None}
                
        except Exception as e:
            current_app.logger.error(f"Cocktail details error: {str(e)}")
            return {"drinks": None}
    
    def _get_mock_data(self):
        # ═══════════════════════════════════════════════════════════════
        # ──Return mock data for development when API is unavailable─────
        # ═══════════════════════════════════════════════════════════════ 
        return {
            "drinks": [
                {
                    "idDrink": "11007",
                    "strDrink": "Margarita",
                    "strCategory": "Ordinary Drink",
                    "strAlcoholic": "Alcoholic",
                    "strGlass": "Cocktail glass",
                    "strInstructions": "Rub the rim of the glass with the lime slice...",
                    "strDrinkThumb": "https://www.thecocktaildb.com/images/media/drink/5noda61589575158.jpg",
                    "strIngredient1": "Tequila",
                    "strIngredient2": "Triple sec",
                    "strIngredient3": "Lime juice",
                    "strMeasure1": "1 1/2 oz",
                    "strMeasure2": "1/2 oz",
                    "strMeasure3": "1 oz"
                }
            ]
        }

# ─── Singleton Instance ────────────────────────────────────────
drink_api = DrinkAPI()