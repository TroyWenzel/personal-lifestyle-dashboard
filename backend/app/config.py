from datetime import timedelta

class Config:
    """
    Application configuration settings.
    
    This class holds all configuration variables for the Flask application.
    In a production environment, these would be loaded from environment variables.
    """
    
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = "sqlite:///app.db"  # SQLite database file
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Disable modification tracking for performance
    
    # Security Configuration
    SECRET_KEY = "dev-secret-change-in-production"  # For session security
    JWT_SECRET_KEY = "jwt-secret-change-in-production"  # For JWT token signing
    
    # JWT Configuration
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)  # Token expiration time
    JWT_TOKEN_LOCATION = ["headers"]  # Where to look for JWT tokens
    JWT_HEADER_NAME = "Authorization"  # Header name for JWT
    JWT_HEADER_TYPE = "Bearer"  # Token type in header