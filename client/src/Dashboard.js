import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import TaskItem from './TaskItem';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [startDate, setStartDate] = useState('');
    const [customFrequencyDays, setCustomFrequencyDays] = useState('');
    const [message, setMessage] = useState('');

    const token = localStorage.getItem('token');

    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    // Fetch tasks from backend
    const fetchTasks = async () => {
        try {
            const response = await axios.get('/api/tasks', config);
            setTasks(response.data);  // Update tasks state with fetched tasks
        } catch (error) {
            console.error('Error fetching tasks', error);
        }
    };

    // Call fetchTasks on component mount
    useEffect(() => {
        fetchTasks();  // Fetch tasks on load
    }, [config]);

    // Handle adding a new task
    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            const newTask = {
                title,
                description,
                frequency,
                start_date: startDate,
                custom_frequency_days: frequency === 'custom' ? customFrequencyDays : null
            };
            const response = await axios.post('/api/tasks', newTask, config);
            setMessage('Task added successfully!');
            fetchTasks();  // Re-fetch tasks after adding a task
            setTitle('');
            setDescription('');
            setStartDate('');
            setCustomFrequencyDays('');
        } catch (error) {
            setMessage('Error adding task');
        }
    };

    // Handle task completion for today
    const handleCompleteTaskForToday = async (taskId) => {
        try {
            await axios.post(`/api/tasks/${taskId}/complete`, {}, config);
            fetchTasks();  // Re-fetch tasks after completing a task
        } catch (error) {
            console.error('Error completing task:', error);
        }
    };

    // Handle deleting a task
    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`/api/tasks/${taskId}`, config);
            fetchTasks();  // Re-fetch tasks after deleting
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    // Handle editing a task
    const handleEditTask = async (taskId, updatedTitle, updatedDescription) => {
        try {
            const updatedTask = {
                title: updatedTitle,
                description: updatedDescription
            };
            await axios.put(`/api/tasks/${taskId}`, updatedTask, config);
            fetchTasks();  // Re-fetch tasks after editing
        } catch (error) {
            console.error('Error editing task:', error);
        }
    };

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];  // Get YYYY-MM-DD
    };

    return (
        <div>
            <h2>Task Dashboard</h2>
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
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom</option>
                    <option value="one-off">One-Off</option>
                </select>
                {frequency === 'custom' && (
                    <input
                        type="number"
                        placeholder="Repeat every X days"
                        value={customFrequencyDays}
                        onChange={(e) => setCustomFrequencyDays(e.target.value)}
                        required
                    />
                )}
                {/* Set the min value to prevent dates before today */}
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={getTodayDate()}
                    required
                />
                <button type="submit">Add Task</button>
            </form>
            {message && <p>{message}</p>}

            <h3>Your Tasks</h3>
            <ul>
                {tasks.map((task) => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        completeTaskForToday={handleCompleteTaskForToday}
                        deleteTask={handleDeleteTask}
                        editTask={handleEditTask}
                    />
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
