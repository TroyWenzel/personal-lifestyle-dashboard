from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import SavedItem
from app import db
from datetime import datetime
from sqlalchemy import func

content_bp = Blueprint("content", __name__, url_prefix="/api/content")

def get_content_stats(user_id):
    # Query database for counts grouped by content_type
    stats = db.session.query(
        SavedItem.content_type,
        func.count(SavedItem.id).label('count')
    ).filter(
        SavedItem.user_id == user_id
    ).group_by(
        SavedItem.content_type
    ).all()

    # Initialize stats object with default values (all zeros)
    formatted_stats = {
        'meals': 0,
        'journalEntries': 0,
        'activities': 0,
        'books': 0,
        'drinks': 0,
        'spacePhotos': 0,
        'locations': 0,
        'artworks': 0
    }

    # Map database content_type values to frontend-friendly keys
    type_mapping = {
        'meal': 'meals',
        'journal': 'journalEntries',
        'activity': 'activities',
        'book': 'books',
        'drink': 'drinks',
        'space': 'spacePhotos',
        'location': 'locations',
        'artwork': 'artworks'
    }
    
    # Update counts for types that exist in the database
    for content_type, count in stats:
        if content_type in type_mapping:
            formatted_stats[type_mapping[content_type]] = count
    
    return formatted_stats

@content_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    try:
        # Get user ID from JWT token
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        
        # Get stats using helper function
        stats = get_content_stats(user_id)
        return jsonify(stats), 200
        
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({'error': 'Failed to fetch dashboard statistics'}), 500

@content_bp.route("/", methods=["POST"])
@jwt_required()
def create_item():
    try:
        # Get user ID from JWT token
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        
        data = request.get_json()

        # Validate required fields
        required_fields = ['category', 'type', 'title']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Check if this item is already saved by this user
        external_id = data.get('external_id')
        content_type = data['type']
        
        if external_id:
            existing = SavedItem.query.filter_by(
                user_id=user_id,
                external_id=external_id,
                content_type=content_type
            ).first()
            
            if existing:
                return jsonify({
                    'error': 'This item is already saved',
                    'content': existing.to_dict()
                }), 409

        # Create new SavedItem instance
        item = SavedItem(
            user_id=user_id,
            category=data['category'],
            content_type=content_type,
            external_id=external_id,
            title=data['title'],
            description=data.get('description'),
            user_notes=data.get('user_notes', ''),
            item_metadata=data.get('metadata', {})
        )
        
        db.session.add(item)
        db.session.commit()
        
        return jsonify(item.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error saving item: {e}")
        return jsonify({'error': 'Failed to save item'}), 500

@content_bp.route("/", methods=["GET"])
@jwt_required()
def get_items():
    try:
        # Get user ID from JWT token
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)

        # Parse query parameters
        content_type = request.args.get('type')
        limit = min(int(request.args.get('limit', 20)), 50)  # Cap at 50
        page = int(request.args.get('page', 1))
        offset = (page - 1) * limit

        # Build query
        query = SavedItem.query.filter_by(user_id=user_id)
        
        # Apply type filter if provided
        if content_type:
            query = query.filter_by(content_type=content_type)

        # Get total count for pagination
        total = query.count()

        # Get paginated results
        items = query.order_by(
            SavedItem.created_at.desc()
        ).offset(offset).limit(limit).all()

        # Convert to dictionaries for JSON serialization
        items_list = [item.to_dict() for item in items]
        
        return jsonify({
            'content': items_list,
            'pagination': {
                'currentPage': page,
                'totalPages': (total + limit - 1) // limit,
                'totalItems': total,
                'hasNextPage': page * limit < total,
                'hasPreviousPage': page > 1
            }
        }), 200
        
    except Exception as e:
        print(f"Error fetching items: {e}")
        return jsonify({'error': 'Failed to fetch items'}), 500

@content_bp.route("/<int:item_id>", methods=["PUT"])
@jwt_required()
def update_item(item_id):
    try:
        # Get user ID from JWT token
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        
        # Find the item or return 404
        item = SavedItem.query.get_or_404(item_id)
        
        # Security check - users can only update their own items
        if item.user_id != user_id:
            return jsonify({'error': 'Unauthorized: You don\'t own this item'}), 403
        
        data = request.get_json()
        
        # Update user notes if provided
        if 'user_notes' in data:
            item.user_notes = data['user_notes']
        
        # Update metadata if provided (merge with existing)
        if 'metadata' in data:
            current_metadata = item.item_metadata or {}
            current_metadata.update(data['metadata'])
            item.item_metadata = current_metadata
        
        # Update timestamp
        item.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify(item.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating item: {e}")
        return jsonify({'error': 'Failed to update item'}), 500

@content_bp.route("/<int:item_id>", methods=["DELETE"])
@jwt_required()
def delete_item(item_id):
    try:
        # Get user ID from JWT token
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)
        
        # Find the item or return 404
        item = SavedItem.query.get_or_404(item_id)
        
        # Security check - users can only delete their own items
        if item.user_id != user_id:
            return jsonify({'error': 'Unauthorized: You don\'t own this item'}), 403
        
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({'message': 'Item deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting item: {e}")
        return jsonify({'error': 'Failed to delete item'}), 500