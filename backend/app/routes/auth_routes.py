from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.models import User
from app import db

# Create authentication blueprint
auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user.
    
    Request JSON:
        email (str): User's email address
        password (str): User's password
    
    Returns:
        JSON: Success message with 201 status code
    """
    data = request.get_json()
    
    # Create new user with hashed password
    hashed_pw = generate_password_hash(data["password"])
    user = User(email=data["email"], password_hash=hashed_pw)
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify(message="User registered successfully"), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate user and return JWT token.
    
    Request JSON:
        email (str): User's email
        password (str): User's password
    
    Returns:
        JSON: JWT access token for authenticated requests
    """
    data = request.get_json()
    
    # Find user by email
    user = User.query.filter_by(email=data["email"]).first()
    
    # Validate credentials
    if not user or not check_password_hash(user.password_hash, data["password"]):
        return jsonify(message="Invalid email or password"), 401
    
    # Create JWT token with user ID as identity
    token = create_access_token(identity=str(user.id))
    
    return jsonify(access_token=token)