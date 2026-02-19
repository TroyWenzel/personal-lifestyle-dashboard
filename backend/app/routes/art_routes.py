from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from app.services.art_api import art_api

# ═══════════════════════════════════════════════════════════════
# Art Routes
# ═══════════════════════════════════════════════════════════════

art_bp = Blueprint("art", __name__, url_prefix="/art")

@art_bp.route("/search", methods=["GET"])
@jwt_required()
def search_art():
    # ═══════════════════════════════════════════════════════════════
    # ───Search for artworks from the Art Institute of Chicago API───
    # ═══════════════════════════════════════════════════════════════
    
    # ─── Validate Input ─────────────────────────────────────────
    query = request.args.get("query", "").strip()
    
    if not query or len(query) < 2:
        return jsonify({
            "success": False,
            "error": "invalid_query",
            "message": "Search query must be at least 2 characters",
            "data": []
        }), 400
    
    # ─── Fetch Data ─────────────────────────────────────────────
    try:
        art_data = art_api.search_artworks(query)
        
        return jsonify({
            "success": True,
            "data": art_data.get('data', []),
            "pagination": art_data.get('pagination', {})
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Art search error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "search_failed",
            "message": "Failed to search artworks. Please try again.",
            "data": []
        }), 500