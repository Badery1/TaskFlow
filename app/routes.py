from flask import request, jsonify
from . import app, db
from .models import User, Task
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from datetime import datetime

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
    data = request.get_json()

    if not data or 'title' not in data:
        return jsonify({"message": "Title is required"}), 400

    new_task = Task(
        title=data['title'],
        description=data.get('description', ''),
        frequency=data.get('frequency', 'one-off'),
        user_id=get_jwt_identity()
    )
    db.session.add(new_task)
    db.session.commit()

    return jsonify({
        'id': new_task.id,
        'title': new_task.title,
        'description': new_task.description,
        'completed': new_task.completed,
        'frequency': new_task.frequency
    }), 201

# Mark a task as completed for the current period (e.g., daily task completed today)
@app.route('/api/tasks/<int:task_id>/complete', methods=['POST'])
@jwt_required()
def complete_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()

    if not task:
        return jsonify({'message': 'Task not found'}), 404

    if task.frequency == 'one-off':
        task.completed = True
    else:
        task.last_completed = datetime.now()

    db.session.commit()

    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'completed': task.completed,
        'frequency': task.frequency,
        'last_completed': task.last_completed
    }), 200

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
        'completed': task.completed
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
