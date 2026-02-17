from flask import Blueprint, request, jsonify
from app.services.drink_api import drink_api

drink_bp = Blueprint('drinks', __name__, url_prefix='/api/drinks')

@drink_bp.route('/search', methods=['GET'])
def search_cocktails():
    """Search for cocktails using TheCocktailDB API"""
    query = request.args.get('q', '')
    
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
    
    results = drink_api.search_cocktails(query)
    return jsonify(results)

@drink_bp.route('/random', methods=['GET'])
def get_random_cocktail():
    """Get a random cocktail"""
    result = drink_api.get_random_cocktail()
    return jsonify(result)

@drink_bp.route('/<drink_id>', methods=['GET'])
def get_cocktail_details(drink_id):
    """Get detailed information about a specific cocktail"""
    details = drink_api.get_cocktail_by_id(drink_id)
    
    if details and details.get('drinks'):
        return jsonify(details)
    else:
        return jsonify({"error": "Drink not found"}), 404