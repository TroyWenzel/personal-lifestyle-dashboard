from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import SavedItem
from app import db

content_bp = Blueprint("content", __name__, url_prefix="/content")

@content_bp.route("/", methods=["POST"])
@jwt_required()
def create_item():
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    
    data = request.get_json()

    item = SavedItem(
        user_id=user_id,
        category=data["category"],
        external_id=data["external_id"],
        title=data["title"],
        item_metadata=data.get("metadata"),
        user_notes=data.get("user_notes", "")
    )

    db.session.add(item)
    db.session.commit()

    return jsonify(message="Item saved", id=item.id), 201


@content_bp.route("/", methods=["GET"])
@jwt_required()
def get_items():
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    
    items = SavedItem.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            "id": i.id,
            "category": i.category,
            "external_id": i.external_id,
            "title": i.title,
            "user_notes": i.user_notes,
            "metadata": i.item_metadata if i.item_metadata else {}
        } for i in items
    ])


@content_bp.route("/<int:item_id>", methods=["PUT"])
@jwt_required()
def update_item(item_id):
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    
    item = SavedItem.query.get_or_404(item_id)

    if item.user_id != user_id:
        return jsonify(message="Unauthorized"), 403

    data = request.get_json()
    item.user_notes = data.get("user_notes", item.user_notes)
    db.session.commit()

    return jsonify(message="Item updated")


@content_bp.route("/<int:item_id>", methods=["DELETE"])
@jwt_required()
def delete_item(item_id):
    user_id_str = get_jwt_identity()
    user_id = int(user_id_str)
    
    item = SavedItem.query.get_or_404(item_id)

    if item.user_id != user_id:
        return jsonify(message="Unauthorized"), 403

    db.session.delete(item)
    db.session.commit()

    return jsonify(message="Item deleted")