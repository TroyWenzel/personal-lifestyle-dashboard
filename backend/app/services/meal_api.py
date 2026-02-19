import requests

# ═══════════════════════════════════════════════════════════════
# TheMealDB API Service
# ═══════════════════════════════════════════════════════════════

BASE_URL = "https://www.themealdb.com/api/json/v1/1"

def search_meals(query):
    # ═══════════════════════════════════════════════════════════════
    # ─────────────────Search for meals by name──────────────────────
    # ═══════════════════════════════════════════════════════════════    
    if not query or not query.strip():
        return {"meals": []}
    
    try:
        response = requests.get(
            f"{BASE_URL}/search.php",
            params={"s": query.strip()},
            timeout=10
        )
        response.raise_for_status()
        return response.json()
        
    except requests.exceptions.RequestException as e:
        print(f"Meal search error: {e}")
        return {"meals": []}

def get_meal_by_id(meal_id):
    # ═══════════════════════════════════════════════════════════════
    # ─────────────Get detailed meal information by ID───────────────
    # ═══════════════════════════════════════════════════════════════    
    try:
        response = requests.get(
            f"{BASE_URL}/lookup.php",
            params={"i": meal_id},
            timeout=10
        )
        response.raise_for_status()
        return response.json()
        
    except requests.exceptions.RequestException as e:
        print(f"Meal details error: {e}")
        return {"meals": []}