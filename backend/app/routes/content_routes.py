from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import SavedItem
from app import db

content_bp = Blueprint("content", __name__, url_prefix="/content")

@content_bp.route("/", methods=["POST"])
@jwt_required()
def create_item():
    """
    Create a new saved item for the authenticated user.
    
    JSON uses 'metadata' field, but database stores it as 'item_metadata'
    because 'metadata' is a reserved SQLAlchemy name.
    """
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    
    data = request.get_json()
    
    item = SavedItem(
        user_id=user_id,
        category=data["category"],
        external_id=data["external_id"],
        title=data["title"],
        item_metadata=data.get("metadata"),  # JSON 'metadata' → DB 'item_metadata'
        user_notes=data.get("user_notes", "")
    )
    
    db.session.add(item)
    db.session.commit()
    
    return jsonify(message="Item saved successfully", id=item.id), 201


@content_bp.route("/", methods=["GET"])
@jwt_required()
def get_items():
    """
    Get all saved items for the authenticated user.
    
    Database 'item_metadata' is returned as 'metadata' in JSON.
    """
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    
    items = SavedItem.query.filter_by(user_id=user_id).all()
    
    items_list = [
        {
            "id": item.id,
            "category": item.category,
            "external_id": item.external_id,
            "title": item.title,
            "user_notes": item.user_notes,
            "metadata": item.item_metadata if item.item_metadata else {}  # DB → JSON
        }
        for item in items
    ]
    
    return jsonify(items_list)


@content_bp.route("/<int:item_id>", methods=["PUT"])
@jwt_required()
def update_item(item_id):
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    
    item = SavedItem.query.get_or_404(item_id)
    
    if item.user_id != user_id:
        return jsonify(message="Unauthorized: You don't own this item"), 403
    
    data = request.get_json()
    if "user_notes" in data:
        item.user_notes = data["user_notes"]
    
    db.session.commit()
    
    return jsonify(message="Item updated successfully")


@content_bp.route("/<int:item_id>", methods=["DELETE"])
@jwt_required()
def delete_item(item_id):
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    
    item = SavedItem.query.get_or_404(item_id)
    
    if item.user_id != user_id:
        return jsonify(message="Unauthorized: You don't own this item"), 403
    
    db.session.delete(item)
    db.session.commit()
    
    return jsonify(message="Item deleted successfully")