from flask import Blueprint, request, jsonify, current_app
from app.services.book_api import book_api

# ═══════════════════════════════════════════════════════════════
# Book Routes
# ═══════════════════════════════════════════════════════════════

book_bp = Blueprint('books', __name__, url_prefix='/api/books')

@book_bp.route('/search', methods=['GET'])
def search_books():
    # ═══════════════════════════════════════════════════════════════
    # ───────────Search for books using Open Library API─────────────
    # ═══════════════════════════════════════════════════════════════    
    # ─── Validate Input ─────────────────────────────────────────
    query = request.args.get('q', '').strip()
    
    if not query:
        return jsonify({
            "success": False,
            "error": "missing_query",
            "message": "Query parameter 'q' is required",
            "docs": []
        }), 400
    
    # ─── Fetch Data ─────────────────────────────────────────────
    try:
        limit = request.args.get('limit', 20, type=int)
        results = book_api.search_books(query, limit)
        
        return jsonify({
            "success": True,
            "docs": results.get('docs', []),
            "numFound": results.get('numFound', 0)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Book search error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "search_failed",
            "message": "Failed to search books. Please try again.",
            "docs": []
        }), 500

@book_bp.route('/details/<path:work_key>', methods=['GET'])
def get_book_details(work_key):
    # ═══════════════════════════════════════════════════════════════
    # ────────Get detailed information about a specific book─────────
    # ═══════════════════════════════════════════════════════════════    
    # ─── Format Key ─────────────────────────────────────────────
    if not work_key.startswith('/works/'):
        work_key = f'/works/{work_key}'
    
    # ─── Fetch Data ─────────────────────────────────────────────
    try:
        details = book_api.get_book_details(work_key)
        
        if details:
            return jsonify({
                "success": True,
                "data": details
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "not_found",
                "message": "Book not found"
            }), 404
            
    except Exception as e:
        current_app.logger.error(f"Book details error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "details_failed",
            "message": "Failed to fetch book details. Please try again."
        }), 500