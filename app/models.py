from . import db
from datetime import datetime, timezone

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    tasks = db.relationship('Task', backref='owner', lazy=True)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    completed = db.Column(db.Boolean, default=False)
    frequency = db.Column(db.String(20), default='one-off')
    last_completed = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def is_due(self):
        """Determine if the task is due based on its frequency."""
        if self.frequency == 'one-off':
            return not self.completed
        elif self.frequency == 'daily':
            return not self.last_completed or self.last_completed.date() < datetime.now().date()
        elif self.frequency == 'weekly':
            return not self.last_completed or (datetime.now() - self.last_completed).days >= 7
        return False