from . import db
from datetime import datetime, timezone, timedelta

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
    custom_frequency_days = db.Column(db.Integer, nullable=True)
    start_date = db.Column(db.DateTime, nullable=False, default=datetime.now)
    last_completed = db.Column(db.DateTime)
    do_next_by = db.Column(db.DateTime)
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
    
    def update_next_due_date(self):
        """Update the 'do_next_by' field based on the frequency and start date."""
        if not self.start_date:
            self.start_date = datetime.now()

        if self.frequency == 'daily':
            self.do_next_by = self.start_date + timedelta(days=1)
        elif self.frequency == 'weekly':
            self.do_next_by = self.start_date + timedelta(weeks=1)
        elif self.frequency == 'custom' and self.custom_frequency_days:
            self.do_next_by = self.start_date + timedelta(days=self.custom_frequency_days)
        else:
            self.do_next_by = None