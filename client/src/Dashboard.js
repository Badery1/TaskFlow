import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);

    const token = localStorage.getItem('token');
    const config = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    // Fetch tasks on component load
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('/api/tasks', config);
                setTasks(response.data);
            } catch (error) {
                console.error('Error fetching tasks', error);
            }
        };
        fetchTasks();
    }, [config]);

    // Handle adding new tasks
    const handleTaskAdded = (newTask) => {
        setTasks((prevTasks) => [...prevTasks, newTask]);
    };

    const handleToggleComplete = async (taskId, currentStatus) => {
        try {
            const response = await axios.put(`/api/tasks/${taskId}`, { completed: !currentStatus }, config);
            setTasks(tasks.map(task =>
                task.id === taskId ? { ...task, completed: response.data.completed } : task
            ));
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`/api/tasks/${taskId}`, config);
            setTasks(tasks.filter(task => task.id !== taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleEditTask = async (taskId, updatedTitle, updatedDescription) => {
        try {
            const response = await axios.put(`/api/tasks/${taskId}`, { title: updatedTitle, description: updatedDescription }, config);
            setTasks(tasks.map(task =>
                task.id === taskId ? { ...task, title: response.data.title, description: response.data.description } : task
            ));
        } catch (error) {
            console.error('Error editing task:', error);
        }
    };

    const completeTaskForToday = async (taskId) => {
        try {
            const response = await axios.post(`/api/tasks/${taskId}/complete`, {}, config);
            setTasks(tasks.map(task => 
                task.id === taskId ? { ...task, last_completed: response.data.last_completed } : task
            ));
        } catch (error) {
            console.error('Error completing task:', error);
        }
    };

    return (
        <div>
            <h2>Task Dashboard</h2>
            <TaskForm onTaskAdded={handleTaskAdded} />
            <TaskList
                tasks={tasks}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
                completeTaskForToday={completeTaskForToday}
            />
        </div>
    );
};

export default Dashboard;