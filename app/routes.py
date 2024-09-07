from flask import request, jsonify
from . import app, db
from .models import User, Task
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from datetime import datetime, timedelta, timezone

bcrypt = Bcrypt(app)

# Register a user
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"message": "Invalid data"}), 400

    username = data['username']
    password = data['password']

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


# Login a user
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"message": "Invalid data"}), 400

    username = data['username']
    password = data['password']

    # Find the user by username
    user = User.query.filter_by(username=username).first()

    # Check if the user exists and the password matches
    if user and bcrypt.check_password_hash(user.password, password):
        # Create JWT token
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200

    return jsonify({"message": "Invalid credentials"}), 401


# Create a task
@app.route('/api/tasks', methods=['POST'])
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    data = request.get_json()

    title = data['title']
    description = data.get('description', '')
    frequency = data.get('frequency', 'one-off')
    custom_frequency_days = data.get('custom_frequency_days')

    # Ensure start_date is a proper datetime object
    start_date_str = data.get('start_date', None)
    if start_date_str:
        try:
            # Parse the string into a datetime object
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').replace(tzinfo=timezone.utc)
        except ValueError:
            return jsonify({"message": "Invalid start date format. Use YYYY-MM-DD."}), 400
    else:
        start_date = datetime.now(timezone.utc)  # Default to current datetime if none is provided

    new_task = Task(
        title=title,
        description=description,
        frequency=frequency,
        custom_frequency_days=custom_frequency_days,
        start_date=start_date,
        user_id=user_id
    )

    # Only set do_next_by for recurring tasks (like daily or custom), not for weekly tasks at creation
    if frequency == 'daily':
        new_task.do_next_by = start_date + timedelta(days=1)
    elif frequency == 'custom' and custom_frequency_days:
        new_task.do_next_by = start_date + timedelta(days=custom_frequency_days)

    db.session.add(new_task)
    db.session.commit()

    return jsonify({
        'message': 'Task created',
        'task': new_task.id,
        'do_next_by': new_task.do_next_by.strftime('%Y-%m-%d') if new_task.do_next_by else None,
        'start_date': new_task.start_date.strftime('%Y-%m-%d')
    })

# Mark a task as completed for the current period
@app.route('/api/tasks/<int:task_id>/complete', methods=['POST'])
@jwt_required()
def complete_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()

    if not task:
        return jsonify({'message': 'Task not found'}), 404

    current_time = datetime.now(timezone.utc)

    # Set last_completed for all task types
    task.last_completed = current_time

    if task.frequency == 'one-off':
        task.completed = True
    else:
        # Simplified logic for weekly and custom frequencies
        if task.frequency == 'daily':
            task.do_next_by = task.do_next_by + timedelta(days=1) if task.do_next_by else current_time + timedelta(days=1)
        elif task.frequency == 'weekly':
            task.do_next_by = task.do_next_by + timedelta(days=7) if task.do_next_by else current_time + timedelta(days=7)
        elif task.frequency == 'custom' and task.custom_frequency_days:
            task.do_next_by = task.do_next_by + timedelta(days=task.custom_frequency_days) if task.do_next_by else current_time + timedelta(days=task.custom_frequency_days)

    db.session.commit()

    # Make sure to always return do_next_by
    return jsonify({
        'message': 'Task completed',
        'task': task.id,
        'last_completed': task.last_completed.strftime('%Y-%m-%d') if task.last_completed else None,
        'do_next_by': task.do_next_by.strftime('%Y-%m-%d') if task.do_next_by else None  # Ensure do_next_by is returned
    })

# Get all tasks for the logged-in user
@app.route('/api/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()
    tasks = Task.query.filter_by(user_id=user_id).all()

    return jsonify([{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'completed': task.completed,
        'start_date': task.start_date.strftime('%Y-%m-%d'),  # Include start date
        'do_next_by': task.do_next_by.strftime('%Y-%m-%d') if task.do_next_by else None,  # Include do_next_by if present
        'frequency': task.frequency
    } for task in tasks]), 200


# Delete a task
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()

    if not task:
        return jsonify({'message': 'Task not found'}), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({'message': 'Task deleted successfully'}), 200


# Edit a task
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()

    if not task:
        return jsonify({'message': 'Task not found'}), 404

    data = request.get_json()

    if not data:
        return jsonify({'message': 'Invalid data'}), 400

    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.completed = data.get('completed', task.completed)

    db.session.commit()
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'completed': task.completed
    })
