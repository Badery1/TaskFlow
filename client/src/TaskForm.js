import React, { useState } from 'react';
import axios from 'axios';

const TaskForm = ({ onTaskAdded }) => {
    // Get today's date in yyyy-mm-dd format to set as the minimum selectable date
    const todayDate = new Date().toLocaleDateString('en-CA');  // Use locale to get YYYY-MM-DD
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState('one-off');
    const [customFrequencyDays, setCustomFrequencyDays] = useState(null);
    const [startDate, setStartDate] = useState(todayDate);  // Use today's date in correct format
    const [message, setMessage] = useState('');

    const token = localStorage.getItem('token');
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
    
        console.log("Submitted start date:", startDate);  // Check the value being submitted
    
        const customDays = frequency === 'custom' ? parseInt(customFrequencyDays, 10) : null;
    
        if (customDays && customDays < 1) {
            setMessage('Custom frequency must be a whole number greater than 0');
            return;
        }
    
        try {
            const response = await axios.post('/api/tasks', {
                title,
                description,
                frequency,
                custom_frequency_days: customDays,
                start_date: startDate  // Submit the start date in yyyy-mm-dd format
            }, config);
            onTaskAdded(response.data);  // Notify parent to update the task list
            setTitle('');
            setDescription('');
            setFrequency('one-off');
            setCustomFrequencyDays(null);
            setStartDate(todayDate);  // Reset the date picker to today
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

                <label>Start Date:</label>
                <input
                    type="date"
                    value={startDate}
                    min={todayDate}  // Disable past dates by setting today's date as the minimum
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                />

                <label>Frequency:</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                    <option value="one-off">One-off</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom</option>
                </select>
                {frequency === 'custom' && (
                    <input
                        type="number"
                        placeholder="Repeat every X days"
                        value={customFrequencyDays}
                        onChange={(e) => setCustomFrequencyDays(e.target.value)}
                        min="1"
                        required
                    />
                )}
                <button type="submit">Add Task</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default TaskForm;
