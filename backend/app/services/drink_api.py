import requests
from flask import current_app

class DrinkAPI:
    def __init__(self):
        # TheCocktailDB API - free tier, no key needed!
        self.base_url = "https://www.thecocktaildb.com/api/json/v1/1"
    
    def search_cocktails(self, query):
        try:
            if not query or query.strip() == "":
                return {"drinks": None}

            response = requests.get(
                f"{self.base_url}/search.php",
                params={"s": query},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data
            else:
                current_app.logger.error(f"Drink API failed: {response.status_code}")
                return {"drinks": None}
                
        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Drink API connection error: {str(e)}")
            # Return mock data
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
    
    def get_random_cocktail(self):
        """Get a random cocktail"""
        try:
            response = requests.get(
                f"{self.base_url}/random.php",
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"drinks": None}
                
        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Error getting random cocktail: {str(e)}")
            return {"drinks": None}
    
    def get_cocktail_by_id(self, drink_id):
        """Get detailed cocktail information by ID"""
        try:
            response = requests.get(
                f"{self.base_url}/lookup.php",
                params={"i": drink_id},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"drinks": None}
                
        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Error fetching cocktail details: {str(e)}")
            return {"drinks": None}

drink_api = DrinkAPI()