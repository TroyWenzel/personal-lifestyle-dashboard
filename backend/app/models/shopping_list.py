from app import db
from datetime import datetime

# ═══════════════════════════════════════════════════════════════
# ShoppingListItem Model
# ═══════════════════════════════════════════════════════════════

class ShoppingListItem(db.Model):
    __tablename__ = 'shopping_list_items'

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    section    = db.Column(db.String(20), nullable=False, default='food')  # 'food' or 'drinks'
    name       = db.Column(db.String(200), nullable=False)
    measure    = db.Column(db.String(100), nullable=True, default='')
    checked    = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':         self.id,
            'section':    self.section,
            'name':       self.name,
            'measure':    self.measure or '',
            'checked':    self.checked,
            'createdAt':  self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f'<ShoppingListItem {self.id}: {self.name}>'