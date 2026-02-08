from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.models import User
from app import db

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    hashed_pw = generate_password_hash(data["password"])
    user = User(email=data["email"], password_hash=hashed_pw)
    db.session.add(user)
    db.session.commit()
    return jsonify(message="User registered"), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data["email"]).first()

    if not user or not check_password_hash(user.password_hash, data["password"]):
        return jsonify(message="Invalid credentials"), 401

    token = create_access_token(identity=str(user.id))  # ← Changed this line
    return jsonify(access_token=token)
