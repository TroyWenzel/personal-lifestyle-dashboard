from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User, SavedItem
from app import db
from datetime import datetime

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        
        existing_user = User.query.filter_by(email=data["email"]).first()
        if existing_user:
            return jsonify(message="Email already registered"), 409
        
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
            "message": "User registered successfully",
            "user": user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {e}")
        return jsonify(message="Registration failed"), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        
        user = User.query.filter_by(email=data["email"]).first()
        
        if not user or not check_password_hash(user.password_hash, data["password"]):
            return jsonify(message="Invalid email or password"), 401
        
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        token = create_access_token(identity=str(user.id))
        
        return jsonify({
            "access_token": token,
            "user": user.to_dict()
        })
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify(message="Login failed"), 500
    
@auth_bp.route("/check-token", methods=["GET"])
@jwt_required()
def check_token():
    try:
        user_id = get_jwt_identity()
        return jsonify({
            "token_user_id": user_id,
            "message": "Token is valid"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@auth_bp.route("/delete-account", methods=["DELETE"])
@jwt_required()
def delete_account():
    try:
        user_id = get_jwt_identity()
        
        # Convert to int
        try:
            user_id = int(user_id)
        except:
            pass
            
        # Get user
        user = User.query.get(user_id)
        
        if not user:
            return jsonify(message="User not found"), 404
        
        # Delete all saved items for this user
        SavedItem.query.filter_by(user_id=user.id).delete()
        
        # Delete the user
        db.session.delete(user)
        db.session.commit()
        
        return jsonify(message="Account deleted successfully"), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Delete error: {e}")
        return jsonify(message="Failed to delete account"), 500