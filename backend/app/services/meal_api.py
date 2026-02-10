import requests

BASE_URL = "https://www.themealdb.com/api/json/v1/1"

def search_meals(query):
    res = requests.get(f"{BASE_URL}/search.php?s={query}")
    return res.json()

def get_meal_by_id(meal_id):
    res = requests.get(f"{BASE_URL}/lookup.php?i={meal_id}")
    return res.json()
