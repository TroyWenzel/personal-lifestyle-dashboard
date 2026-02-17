from flask import Blueprint, request, jsonify
from app.services.book_api import book_api

book_bp = Blueprint('books', __name__, url_prefix='/api/books')

@book_bp.route('/search', methods=['GET'])
def search_books():
    """Search for books using Open Library API"""
    query = request.args.get('q', '')
    limit = request.args.get('limit', 20, type=int)
    
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400
    
    results = book_api.search_books(query, limit)
    return jsonify(results)

@book_bp.route('/details/<path:work_key>', methods=['GET'])
def get_book_details(work_key):
    """Get detailed information about a specific book"""
    # Ensure work_key starts with /works/
    if not work_key.startswith('/works/'):
        work_key = f'/works/{work_key}'
    
    details = book_api.get_book_details(work_key)
    
    if details:
        return jsonify(details)
    else:
        return jsonify({"error": "Book not found"}), 404