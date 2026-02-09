from datetime import timedelta

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "dev-secret"
    JWT_SECRET_KEY = "jwt-secret"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"