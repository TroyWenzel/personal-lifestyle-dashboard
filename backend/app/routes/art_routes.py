from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from app.services.art_api import art_api

# Create blueprint for art-related routes
# All routes in this file will be prefixed with /art
art_bp = Blueprint("art", __name__, url_prefix="/art")

@art_bp.route("/search", methods=["GET"])
@jwt_required()  # User must be logged in to search for art
def search_art():
    # Get search query from URL parameter
    query = request.args.get("query", "")
    
    # Validate search query length
    if not query or len(query.strip()) < 2:
        return jsonify({
            "data": [],
            "pagination": {},
            "message": "Search query must be at least 2 characters"
        }), 200  # Return 200 even with validation error - frontend handles it
    
    # Call the art API service
    art_data = art_api.search_artworks(query)
    return jsonify(art_data), 200