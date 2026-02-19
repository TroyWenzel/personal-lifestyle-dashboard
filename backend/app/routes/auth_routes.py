from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User, SavedItem
from app import db
from datetime import datetime

# ═══════════════════════════════════════════════════════════════
# Authentication Routes
# ═══════════════════════════════════════════════════════════════

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    # ═══════════════════════════════════════════════════════════════
    # ──────────────────Register a new user account──────────────────
    # ═══════════════════════════════════════════════════════════════    
    # ─── Validate Input ─────────────────────────────────────────
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({
            "success": False,
            "error": "missing_fields",
            "message": "Email and password are required"
        }), 400
    
    # ─── Check for Existing User ────────────────────────────────
    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({
            "success": False,
            "error": "email_exists",
            "message": "Email already registered"
        }), 409
    
    # ─── Create User ────────────────────────────────────────────
    try:
        hashed_pw = generate_password_hash(data["password"])
        
        user = User(
            email=data["email"],
            password_hash=hashed_pw,
            username=data.get("username") or data.get("displayName"),
            display_name=data.get("displayName") or data.get("username"),
            birthday=data.get("birthday"),
            phone_number=data.get("phoneNumber"),
            photo_url=data.get("photoURL"),
            created_at=datetime.utcnow(),
            last_login=datetime.utcnow()
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "user": user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Registration error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "registration_failed",
            "message": "Registration failed. Please try again."
        }), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    # ═══════════════════════════════════════════════════════════════
    # ────────────Authenticate user and return JWT token─────────────
    # ═══════════════════════════════════════════════════════════════    
    # ─── Validate Input ─────────────────────────────────────────
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({
            "success": False,
            "error": "missing_fields",
            "message": "Email and password are required"
        }), 400
    
    # ─── Authenticate ───────────────────────────────────────────
    user = User.query.filter_by(email=data["email"]).first()
    
    if not user or not check_password_hash(user.password_hash, data["password"]):
        return jsonify({
            "success": False,
            "error": "invalid_credentials",
            "message": "Invalid email or password"
        }), 401
    
    # ─── Update Last Login ──────────────────────────────────────
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # ─── Generate Token ─────────────────────────────────────────
    token = create_access_token(identity=str(user.id))
    
    return jsonify({
        "success": True,
        "access_token": token,
        "user": user.to_dict()
    }), 200
    
@auth_bp.route("/check-token", methods=["GET"])
@jwt_required()
def check_token():
    # ═══════════════════════════════════════════════════════════════
    # ──────────Verify that the current JWT token is valid───────────
    # ═══════════════════════════════════════════════════════════════
    try:
        user_id = get_jwt_identity()
        return jsonify({
            "success": True,
            "token_user_id": user_id,
            "message": "Token is valid"
        }), 200
    except Exception as e:
        current_app.logger.error(f"Token check error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "invalid_token",
            "message": "Token is invalid or expired"
        }), 401
    
@auth_bp.route("/delete-account", methods=["DELETE"])
@jwt_required()
def delete_account():
    # ═══════════════════════════════════════════════════════════════
    # ────Permanently delete user account and all associated data────
    # ═══════════════════════════════════════════════════════════════
    # ─── Get User ───────────────────────────────────────────────
    user_id = get_jwt_identity()
    
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                "success": False,
                "error": "user_not_found",
                "message": "User not found"
            }), 404
        
        # ─── Delete All User Data ────────────────────────────────
        # Saved items cascade automatically due to relationship
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Account deleted successfully"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Delete account error: {str(e)}")
        return jsonify({
            "success": False,
            "error": "delete_failed",
            "message": "Failed to delete account. Please try again."
        }), 500