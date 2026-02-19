from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

# ═══════════════════════════════════════════════════════════════
# User Routes
# ═══════════════════════════════════════════════════════════════

user_bp = Blueprint("user", __name__, url_prefix="/user")

@user_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    # ═══════════════════════════════════════════════════════════════
    # ────────────Get current user's ID from JWT token───────────────
    # ═══════════════════════════════════════════════════════════════     
    user_id = get_jwt_identity()
    
    return jsonify({
        "success": True,
        "user_id": user_id
    }), 200