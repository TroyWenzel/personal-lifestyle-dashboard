from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import ShoppingListItem
from app import db

# ═══════════════════════════════════════════════════════════════
# Shopping List Routes
# ═══════════════════════════════════════════════════════════════

shopping_bp = Blueprint("shopping", __name__, url_prefix="/api/shopping")

@shopping_bp.route("/", methods=["GET"])
@jwt_required()
def get_list():
    # ═══════════════════════════════════════════════════════════════
    # ───────Get all shopping list items for the current user────────
    # ═══════════════════════════════════════════════════════════════ 
    try:
        user_id = int(get_jwt_identity())
        items = ShoppingListItem.query.filter_by(user_id=user_id)\
                    .order_by(ShoppingListItem.created_at.asc()).all()
        result = { 'food': [], 'drinks': [] }
        for item in items:
            result[item.section].append(item.to_dict())
        return jsonify({ 'success': True, 'list': result }), 200
    except Exception as e:
        current_app.logger.error(f"Get shopping list error: {str(e)}")
        return jsonify({ 'success': False, 'message': 'Failed to fetch shopping list' }), 500

@shopping_bp.route("/", methods=["POST"])
@jwt_required()
def add_item():
    # ════════════════════════════════════════════════════════════════════
    # ─Add an item to the shopping list (prevents duplicates per section)─
    # ════════════════════════════════════════════════════════════════════ 
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        section = data.get('section', 'food')
        name    = data.get('name', '').strip()
        measure = data.get('measure', '').strip()

        if not name:
            return jsonify({ 'success': False, 'message': 'Name is required' }), 400

        # Prevent duplicates
        existing = ShoppingListItem.query.filter_by(
            user_id=user_id, section=section
        ).filter(db.func.lower(ShoppingListItem.name) == name.lower()).first()

        if existing:
            return jsonify({ 'success': True, 'item': existing.to_dict(), 'duplicate': True }), 200

        item = ShoppingListItem(user_id=user_id, section=section, name=name, measure=measure)
        db.session.add(item)
        db.session.commit()
        return jsonify({ 'success': True, 'item': item.to_dict() }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Add shopping item error: {str(e)}")
        return jsonify({ 'success': False, 'message': 'Failed to add item' }), 500

@shopping_bp.route("/<int:item_id>/toggle", methods=["PUT"])
@jwt_required()
def toggle_item(item_id):
    # ═══════════════════════════════════════════════════════════════
    # ───────────────Toggle checked status of an item────────────────
    # ═══════════════════════════════════════════════════════════════ 
    try:
        user_id = int(get_jwt_identity())
        item = ShoppingListItem.query.get_or_404(item_id)
        if item.user_id != user_id:
            return jsonify({ 'success': False, 'message': 'Unauthorized' }), 403
        item.checked = not item.checked
        db.session.commit()
        return jsonify({ 'success': True, 'item': item.to_dict() }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({ 'success': False, 'message': 'Failed to toggle item' }), 500

@shopping_bp.route("/<int:item_id>", methods=["DELETE"])
@jwt_required()
def delete_item(item_id):
    # ═══════════════════════════════════════════════════════════════
    # ──────────────Delete a single shopping list item───────────────
    # ═══════════════════════════════════════════════════════════════ 
    try:
        user_id = int(get_jwt_identity())
        item = ShoppingListItem.query.get_or_404(item_id)
        if item.user_id != user_id:
            return jsonify({ 'success': False, 'message': 'Unauthorized' }), 403
        db.session.delete(item)
        db.session.commit()
        return jsonify({ 'success': True }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({ 'success': False, 'message': 'Failed to delete item' }), 500

@shopping_bp.route("/clear-checked", methods=["DELETE"])
@jwt_required()
def clear_checked():
    # ═══════════════════════════════════════════════════════════════
    # ────────Remove all checked items for the current user──────────
    # ═══════════════════════════════════════════════════════════════ 
    try:
        user_id = int(get_jwt_identity())
        section = request.args.get('section')
        query = ShoppingListItem.query.filter_by(user_id=user_id, checked=True)
        if section:
            query = query.filter_by(section=section)
        query.delete()
        db.session.commit()
        return jsonify({ 'success': True }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({ 'success': False, 'message': 'Failed to clear items' }), 500