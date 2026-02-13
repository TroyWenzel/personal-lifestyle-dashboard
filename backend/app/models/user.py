from app import db

class User(db.Model):
    
    __tablename__ = 'user'
    
    # ----- User Identification -----
    id = db.Column(db.Integer, primary_key=True)
    
    # Email must be unique across all users
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    # Password hash (never store plain text passwords!)
    # Using String(256) to accommodate common hash algorithms
    password_hash = db.Column(db.String(256), nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'