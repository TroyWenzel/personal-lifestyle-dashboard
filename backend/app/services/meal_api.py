import requests

BASE_URL = "https://www.themealdb.com/api/json/v1/1"

def search_meals(query):
    try:
        response = requests.get(f"{BASE_URL}/search.php?s={query}")
        response.raise_for_status()  # Raise exception for bad status codes
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error searching meals: {e}")
        return {"meals": []}  # Return empty result on error

def get_meal_by_id(meal_id):
    try:
        response = requests.get(f"{BASE_URL}/lookup.php?i={meal_id}")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching meal details: {e}")
        return {"meals": []}