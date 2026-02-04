from app import db

class SavedItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    external_id = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    item_metadata = db.Column(db.JSON) 
    user_notes = db.Column(db.Text)