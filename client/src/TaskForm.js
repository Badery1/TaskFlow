import React, { useState } from 'react';
import axios from 'axios';

const TaskForm = ({ onTaskAdded }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState('one-off');
    const [message, setMessage] = useState('');

    const token = localStorage.getItem('token');
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/tasks', { title, description, frequency }, config);
            onTaskAdded(response.data);
            setTitle('');
            setDescription('');
            setFrequency('one-off');
            setMessage('Task added successfully!');
        } catch (error) {
            setMessage('Error adding task');
            console.error('Error adding task:', error);
        }
    };

    return (
        <div>
            <form onSubmit={handleAddTask}>
                <input
                    type="text"
                    placeholder="Task Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Task Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <label>Frequency:</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                    <option value="one-off">One-off</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                </select>
                <button type="submit">Add Task</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default TaskForm;
