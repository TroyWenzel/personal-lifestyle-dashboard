from app import db

class SavedItem(db.Model):
    """
    SavedItem model representing content saved by users.
    
    Note: We use 'item_metadata' in the database because 'metadata'
    is a reserved name in SQLAlchemy's Declarative API.
    """
    
    __tablename__ = 'saved_items'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    external_id = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    item_metadata = db.Column(db.JSON, nullable=True)  # Can't use 'metadata' - reserved
    user_notes = db.Column(db.Text, default="")
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relationship to User model
    user = db.relationship('User', backref=db.backref('saved_items', lazy=True))
    
    def __repr__(self):
        return f'<SavedItem {self.id}: {self.title}>'