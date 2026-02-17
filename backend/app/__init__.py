from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from .config import Config
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
     
     app = Flask(__name__)
     
     # Load configuration from Config class
     app.config.from_object(Config)
     
     # Configure CORS to allow requests from React frontend
     CORS(app, resources={r"/*": {
          "origins": [
               "https://steady-rugelach-889cba.netlify.app",
               "https://6994db2055efd1ce2777402a--steady-rugelach-889cba.netlify.app", # Current preview
               "http://localhost:5173", # For local testing
               "http://127.0.0.1:5173"
          ]
     }}, 
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
     
     # Initialize Flask extensions with this app instance
     db.init_app(app)
     migrate.init_app(app, db)
     jwt.init_app(app)
     
     # Import models so they are registered with SQLAlchemy
     from app.models import User, SavedItem
     
     # Import and register blueprints
     from app.routes.auth_routes import auth_bp
     from app.routes.user_routes import user_bp
     from app.routes.content_routes import content_bp
     from app.routes.meal_routes import meal_bp
     from app.routes.weather_routes import weather_bp
     from app.routes.art_routes import art_bp
     from app.routes.nasa_routes import nasa_bp
     from app.routes.book_routes import book_bp
     from app.routes.drink_routes import drink_bp
     
     app.register_blueprint(auth_bp)
     app.register_blueprint(user_bp)
     app.register_blueprint(content_bp)
     app.register_blueprint(meal_bp)
     app.register_blueprint(weather_bp)
     app.register_blueprint(art_bp)
     app.register_blueprint(nasa_bp)
     app.register_blueprint(book_bp)
     app.register_blueprint(drink_bp)
     
     return app