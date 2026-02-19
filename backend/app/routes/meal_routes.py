from flask import Blueprint, request, jsonify, current_app
from app.services.meal_api import search_meals, get_meal_by_id

# ═══════════════════════════════════════════════════════════════
# Meal Routes
# ═══════════════════════════════════════════════════════════════

meal_bp = Blueprint("meal", __name__, url_prefix="/meals")

@meal_bp.route("/search", methods=["GET"])
def search():
    # ═══════════════════════════════════════════════════════════════
    # ──────────────────Search for meals by name─────────────────────
    # ═══════════════════════════════════════════════════════════════    
    # ─── Validate Input ─────────────────────────────────────────
    query = request.args.get("q", "").strip()
    
    if not query:
        return jsonify({
            "success": False,
            "error": "missing_query",
            "message": "Query parameter 'q' is required",
            "meals": []
        }), 400
    
    # ─── Fetch Data ─────────────────────────────────────────────
    try:
        results = search_meals(query)
        
        return jsonify({
            "success": True,
            "meals": results.get('meals', [])
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Meal search error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "search_failed",
            "message": "Failed to search meals. Please try again.",
            "meals": []
        }), 500

@meal_bp.route("/<meal_id>", methods=["GET"])
def detail(meal_id):
    # ═══════════════════════════════════════════════════════════════
    # ────────Get detailed information about a specific meal─────────
    # ═══════════════════════════════════════════════════════════════    
    try:
        results = get_meal_by_id(meal_id)
        
        if results and results.get('meals'):
            return jsonify({
                "success": True,
                "meals": results.get('meals', [])
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "not_found",
                "message": "Meal not found"
            }), 404
            
    except Exception as e:
        current_app.logger.error(f"Meal details error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "details_failed",
            "message": "Failed to fetch meal details. Please try again."
        }), 500