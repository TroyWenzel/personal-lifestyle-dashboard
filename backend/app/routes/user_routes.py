from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

user_bp = Blueprint("user", __name__, url_prefix="/user")

@user_bp.route("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    return jsonify(user_id=user_id)
