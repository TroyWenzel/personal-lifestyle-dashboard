from datetime import timedelta

class Config:
    
    # ---------- Database Configuration ----------
    SQLALCHEMY_DATABASE_URI = "sqlite:///app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # ---------- Security Configuration ----------
    SECRET_KEY = "dev-secret-change-in-production"
    JWT_SECRET_KEY = "jwt-secret-change-in-production"
    
    # ---------- JWT Configuration ----------
    # Tokens expire after 24 hours - users need to login again
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    # Look for token in Authorization header (standard practice)
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"