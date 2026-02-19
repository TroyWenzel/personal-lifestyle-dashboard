from app import db
from datetime import datetime

class User(db.Model):
    
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=True)
    display_name = db.Column(db.String(120), nullable=True)
    birthday = db.Column(db.String(20), nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)
    photo_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # This is the ONLY relationship
    saved_items = db.relationship('SavedItem', backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.email}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'displayName': self.display_name,
            'birthday': self.birthday,
            'phoneNumber': self.phone_number,
            'photoURL': self.photo_url,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'lastLogin': self.last_login.isoformat() if self.last_login else None
        }