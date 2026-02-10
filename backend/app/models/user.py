# models/user.py
from app import db

class User(db.Model):
    """User model representing registered users."""
    
    __tablename__ = 'user'  # Explicit table name
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    
    def __repr__(self):
        return f'<User {self.email}>'