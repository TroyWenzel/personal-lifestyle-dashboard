from flask import Blueprint, request, jsonify, current_app
from app.services.drink_api import drink_api

# ═══════════════════════════════════════════════════════════════
# Drink Routes
# ═══════════════════════════════════════════════════════════════

drink_bp = Blueprint('drinks', __name__, url_prefix='/api/drinks')

@drink_bp.route('/search', methods=['GET'])
def search_cocktails():
    # ═══════════════════════════════════════════════════════════════
    # ─────────Search for cocktails using TheCocktailDB API──────────
    # ═══════════════════════════════════════════════════════════════    
    # ─── Validate Input ─────────────────────────────────────────
    query = request.args.get('q', '').strip()
    
    if not query:
        return jsonify({
            "success": False,
            "error": "missing_query",
            "message": "Query parameter 'q' is required",
            "drinks": []
        }), 400
    
    # ─── Fetch Data ─────────────────────────────────────────────
    try:
        results = drink_api.search_cocktails(query)
        
        return jsonify({
            "success": True,
            "drinks": results.get('drinks', [])
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Drink search error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "search_failed",
            "message": "Failed to search cocktails. Please try again.",
            "drinks": []
        }), 500

@drink_bp.route('/random', methods=['GET'])
def get_random_cocktail():
    # ═══════════════════════════════════════════════════════════════
    # ─────────────────Get a random cocktail─────────────────────────
    # ═══════════════════════════════════════════════════════════════    
    try:
        result = drink_api.get_random_cocktail()
        
        return jsonify({
            "success": True,
            "drinks": result.get('drinks', [])
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Random drink error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "random_failed",
            "message": "Failed to fetch random cocktail. Please try again.",
            "drinks": []
        }), 500

@drink_bp.route('/<drink_id>', methods=['GET'])
def get_cocktail_details(drink_id):
    # ═══════════════════════════════════════════════════════════════
    # ──────Get detailed information about a specific cocktail───────
    # ═══════════════════════════════════════════════════════════════    
    try:
        details = drink_api.get_cocktail_by_id(drink_id)
        
        if details and details.get('drinks'):
            return jsonify({
                "success": True,
                "drinks": details.get('drinks', [])
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "not_found",
                "message": "Cocktail not found"
            }), 404
            
    except Exception as e:
        current_app.logger.error(f"Drink details error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "details_failed",
            "message": "Failed to fetch cocktail details. Please try again."
        }), 500