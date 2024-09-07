import React, { useState, useEffect } from 'react';

const TaskItem = ({ task, completeTaskForToday, deleteTask, editTask }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [updatedTitle, setUpdatedTitle] = useState(task.title);
    const [updatedDescription, setUpdatedDescription] = useState(task.description);
    const [nextDueDate, setNextDueDate] = useState(task.do_next_by);
    const [lastCompleted, setLastCompleted] = useState(task.last_completed || null);

    const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString('en-CA') : '';
    };

    const isTaskDueToday = () => {
        const today = new Date().toLocaleDateString('en-CA');
        const dueDate = nextDueDate ? formatDate(nextDueDate) : null;
        return today === dueDate;
    };

    const getTaskDueMessage = () => {
        if (task.frequency === 'one-off' && task.completed && lastCompleted) {
            return `This task was completed on ${formatDate(lastCompleted)}.`;
        }

        const today = new Date().toLocaleDateString('en-CA');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toLocaleDateString('en-CA');
        const dueDate = nextDueDate ? formatDate(nextDueDate) : null;

        if (dueDate === today) return "Task is due today";
        if (dueDate === tomorrowStr) return "Task is due tomorrow";
        if (dueDate && dueDate > tomorrowStr) return `Task is scheduled for ${new Date(nextDueDate).toLocaleDateString()}`;
        return '';
    };

    const handleCompleteForToday = async () => {
        try {
            const response = await completeTaskForToday(task.id);
        
            if (response && response.last_completed) {
                setLastCompleted(response.last_completed);
            } else {
                setLastCompleted(null);
            }
    
            if (response && response.do_next_by) {
                setNextDueDate(response.do_next_by);
            } else {
                setNextDueDate(null);
            }
        } catch (error) {
            console.error("Error completing task: ", error);
        }
    };

    useEffect(() => {
        setNextDueDate(task.do_next_by);
        setLastCompleted(task.last_completed || null);
    }, [task]);

    const handleSaveTask = () => {
        editTask(task.id, updatedTitle, updatedDescription);
        setIsEditing(false);
    };

    return (
        <li>
            {isEditing ? (
                <>
                    <input
                        type="text"
                        value={updatedTitle}
                        onChange={(e) => setUpdatedTitle(e.target.value)}
                        disabled={task.completed}
                    />
                    <textarea
                        value={updatedDescription}
                        onChange={(e) => setUpdatedDescription(e.target.value)}
                        disabled={task.completed}
                    ></textarea>
                    {!task.completed && (
                        <>
                            <button onClick={handleSaveTask}>Save</button>
                            <button onClick={() => setIsEditing(false)}>Cancel</button>
                        </>
                    )}
                </>
            ) : (
                <>
                    {task.frequency === 'one-off' && !task.completed && (
                        <button onClick={handleCompleteForToday}>Complete</button>
                    )}

                    {task.frequency !== 'one-off' && isTaskDueToday() && !task.completed && (
                        <button onClick={handleCompleteForToday}>Complete for Today</button>
                    )}

                    {task.title} - {task.description}
                    <span>{getTaskDueMessage()}</span>

                    {!task.completed ? (
                        <>
                            <button onClick={() => setIsEditing(true)}>Edit</button>
                        </>
                    ) : (
                        <span> (Task completed, cannot edit) </span>
                    )}

                    <button onClick={() => deleteTask(task.id)}>Delete</button>
                </>
            )}
        </li>
    );
};

export default TaskItem;
