from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import SavedItem
from app import db
from datetime import datetime
from sqlalchemy import func

# ═══════════════════════════════════════════════════════════════
# Content Routes (Saved Items)
# ═══════════════════════════════════════════════════════════════

content_bp = Blueprint("content", __name__, url_prefix="/api/content")

# ─── Helper Functions ──────────────────────────────────────────

def get_content_stats(user_id):
    # ═══════════════════════════════════════════════════════════════
    # ─────────Generate statistics about user's saved content────────
    # ═══════════════════════════════════════════════════════════════    
    # Query counts grouped by content_type
    stats = db.session.query(
        SavedItem.content_type,
        func.count(SavedItem.id).label('count')
    ).filter(
        SavedItem.user_id == user_id
    ).group_by(
        SavedItem.content_type
    ).all()

    # Initialize with zeros
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

    # Map database values to frontend-friendly keys
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
    
    # Update counts
    for content_type, count in stats:
        if content_type in type_mapping:
            formatted_stats[type_mapping[content_type]] = count
    
    return formatted_stats

# ─── Routes ───────────────────────────────────────────────────

@content_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    # ═══════════════════════════════════════════════════════════════
    # ────Get statistics about user's saved content for dashboard────
    # ═══════════════════════════════════════════════════════════════    
    try:
        user_id = int(get_jwt_identity())
        stats = get_content_stats(user_id)
        
        return jsonify({
            "success": True,
            "stats": stats
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Stats error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "stats_failed",
            "message": "Failed to fetch dashboard statistics"
        }), 500

@content_bp.route("/", methods=["POST"])
@jwt_required()
def create_item():
    # ═══════════════════════════════════════════════════════════════
    # ──────────────Save a new item to user's collection─────────────
    # ═══════════════════════════════════════════════════════════════    
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        # ─── Validate Required Fields ───────────────────────────
        required_fields = ['category', 'type', 'title']
        missing = [field for field in required_fields if field not in data]
        
        if missing:
            return jsonify({
                "success": False,
                "error": "missing_fields",
                "message": f"Missing required fields: {', '.join(missing)}"
            }), 400

        # ─── Check for Duplicates ───────────────────────────────
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
                    "success": False,
                    "error": "duplicate",
                    "message": "This item is already saved",
                    "content": existing.to_dict()
                }), 409

        # ─── Create Item ────────────────────────────────────────
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
        
        return jsonify({
            "success": True,
            "content": item.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Create item error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "create_failed",
            "message": "Failed to save item"
        }), 500

@content_bp.route("/", methods=["GET"])
@jwt_required()
def get_items():
    # ═══════════════════════════════════════════════════════════════
    # ────────────Get user's saved items with pagination─────────────
    # ═══════════════════════════════════════════════════════════════    
    try:
        user_id = int(get_jwt_identity())

        # ─── Parse Query Parameters ─────────────────────────────
        content_type = request.args.get('type')
        limit = min(int(request.args.get('limit', 20)), 50)
        page = int(request.args.get('page', 1))
        offset = (page - 1) * limit

        # ─── Build Query ────────────────────────────────────────
        query = SavedItem.query.filter_by(user_id=user_id)
        
        if content_type:
            query = query.filter_by(content_type=content_type)

        # ─── Get Results ────────────────────────────────────────
        total = query.count()
        items = query.order_by(
            SavedItem.created_at.desc()
        ).offset(offset).limit(limit).all()

        # ─── Format Response ────────────────────────────────────
        return jsonify({
            "success": True,
            "content": [item.to_dict() for item in items],
            "pagination": {
                "currentPage": page,
                "totalPages": (total + limit - 1) // limit,
                "totalItems": total,
                "hasNextPage": page * limit < total,
                "hasPreviousPage": page > 1
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Fetch items error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "fetch_failed",
            "message": "Failed to fetch saved items"
        }), 500

@content_bp.route("/<int:item_id>", methods=["PUT"])
@jwt_required()
def update_item(item_id):
    # ═══════════════════════════════════════════════════════════════
    # ───────Update user notes or metadata for a saved item──────────
    # ═══════════════════════════════════════════════════════════════    
    try:
        user_id = int(get_jwt_identity())
        
        # ─── Find Item ──────────────────────────────────────────
        item = SavedItem.query.get_or_404(item_id)
        
        if item.user_id != user_id:
            return jsonify({
                "success": False,
                "error": "unauthorized",
                "message": "You don't have permission to update this item"
            }), 403
        
        # ─── Update Fields ──────────────────────────────────────
        data = request.get_json()
        
        if 'user_notes' in data:
            item.user_notes = data['user_notes']
        
        if 'metadata' in data:
            current_metadata = item.item_metadata or {}
            current_metadata.update(data['metadata'])
            item.item_metadata = current_metadata
        
        item.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "success": True,
            "content": item.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Update item error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "update_failed",
            "message": "Failed to update item"
        }), 500

@content_bp.route("/<int:item_id>", methods=["DELETE"])
@jwt_required()
def delete_item(item_id):
    # ═══════════════════════════════════════════════════════════════
    # ──────────────────────Delete a saved item──────────────────────
    # ═══════════════════════════════════════════════════════════════    
    try:
        user_id = int(get_jwt_identity())
        
        # ─── Find Item ──────────────────────────────────────────
        item = SavedItem.query.get_or_404(item_id)
        
        if item.user_id != user_id:
            return jsonify({
                "success": False,
                "error": "unauthorized",
                "message": "You don't have permission to delete this item"
            }), 403
        
        # ─── Delete ─────────────────────────────────────────────
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Item deleted successfully"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Delete item error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "delete_failed",
            "message": "Failed to delete item"
        }), 500