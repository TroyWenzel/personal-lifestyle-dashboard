from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

# Create user blueprint for user-related operations
user_bp = Blueprint("user", __name__, url_prefix="/user")


@user_bp.route("/me")
@jwt_required()
def me():
    """
    Get current user information from JWT token.
    
    Useful for frontend to verify authentication status
    and get the current user's ID.
    
    Returns:
        JSON: Current user's ID from JWT token
    """
    user_id = get_jwt_identity()
    return jsonify(user_id=user_id)