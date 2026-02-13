from app import db
from datetime import datetime

class SavedItem(db.Model):
    
    __tablename__ = 'saved_items'
    
    # ----- Primary Fields -----
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # ----- Content Classification -----
    category = db.Column(db.String(50), nullable=False)  # e.g., 'food', 'art', 'travel'
    content_type = db.Column(db.String(50), nullable=False, default='item')  # e.g., 'meal', 'artwork'
    external_id = db.Column(db.String(100), nullable=True)  # ID from external API
    
    # ----- Content Data -----
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    user_notes = db.Column(db.Text, nullable=True)  # Personal notes added by user
    
    # ----- Flexible Data Storage -----
    # JSON field allows storing API-specific data without changing schema
    item_metadata = db.Column(db.JSON, nullable=True, default=dict)
    
    # ----- Timestamps -----
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ----- Relationships -----
    user = db.relationship('User', backref='saved_items', lazy=True)

    # ----- Constraints -----
    # Prevent duplicate saves of the same content by the same user
    __table_args__ = (
        db.UniqueConstraint('user_id', 'external_id', 'content_type', 
                        name='unique_user_content'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'category': self.category,
            'type': self.content_type,
            'external_id': self.external_id,
            'title': self.title,
            'description': self.description,
            'user_notes': self.user_notes,
            'metadata': self.item_metadata if self.item_metadata else {},
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<SavedItem {self.id}: {self.title}>'