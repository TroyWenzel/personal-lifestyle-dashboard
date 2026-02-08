from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from .config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Import models here so Flask-Migrate can detect them
    from app.models import User, SavedItem
    
    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import user_bp 
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    
    return app