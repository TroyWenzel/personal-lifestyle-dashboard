from datetime import timedelta

# ═══════════════════════════════════════════════════════════════
# Application Configuration
# ═══════════════════════════════════════════════════════════════

class Config:
    """Centralized configuration for the Flask application"""
    
    # ─── Database Configuration ─────────────────────────────────
    SQLALCHEMY_DATABASE_URI = "sqlite:///app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # ─── Security Configuration ─────────────────────────────────
    # TODO: Move these to environment variables in production
    SECRET_KEY = "dev-secret-change-in-production"
    JWT_SECRET_KEY = "jwt-secret-change-in-production"
    
    # ─── JWT Configuration ──────────────────────────────────────
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)  # Session lasts 24 hours
    JWT_TOKEN_LOCATION = ["headers"]                 # Standard Bearer token
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"