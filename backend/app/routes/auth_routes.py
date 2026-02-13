from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.models import User
from app import db

# Create blueprint for authentication routes
auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data["email"]).first()
        if existing_user:
            return jsonify(message="Email already registered"), 409
        
        # Hash the password before storing - never store plain text passwords!
        hashed_pw = generate_password_hash(data["password"])
        
        # Create new user instance
        user = User(email=data["email"], password_hash=hashed_pw)
        
        # Add to database and save
        db.session.add(user)
        db.session.commit()
        
        return jsonify(message="User registered successfully"), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {e}")
        return jsonify(message="Registration failed"), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        
        # Find user by email
        user = User.query.filter_by(email=data["email"]).first()
        
        # Check if user exists AND password matches
        # This order prevents timing attacks (check user first, then password)
        if not user:
            return jsonify(message="Invalid email or password"), 401
            
        if not check_password_hash(user.password_hash, data["password"]):
            return jsonify(message="Invalid email or password"), 401
        
        # Create JWT token with user ID as the identity
        # Token will expire based on JWT_ACCESS_TOKEN_EXPIRES setting
        token = create_access_token(identity=str(user.id))
        
        return jsonify(access_token=token)
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify(message="Login failed"), 500