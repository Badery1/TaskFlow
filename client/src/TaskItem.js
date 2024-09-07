import React, { useState } from 'react';

const TaskItem = ({ task, onToggleComplete, onDeleteTask, onEditTask, completeTaskForToday }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [updatedTitle, setUpdatedTitle] = useState(task.title);
    const [updatedDescription, setUpdatedDescription] = useState(task.description);

    return (
        <li>
            {task.frequency === 'one-off' ? (
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleComplete(task.id, task.completed)}
                />
            ) : (
                <button onClick={() => completeTaskForToday(task.id)}>Complete for Today</button>
            )}
            
            {!isEditing ? (
                <>
                    {task.title} - {task.description}
                    {task.completed && task.frequency === 'one-off' && ' (Completed)'}
                    {task.frequency !== 'one-off' && task.last_completed && ` (Last completed: ${new Date(task.last_completed).toLocaleDateString()})`}
                    <button onClick={() => onDeleteTask(task.id)}>Delete</button>
                    <button onClick={() => setIsEditing(true)}>Edit</button>
                </>
            ) : (
                <>
                    <input
                        type="text"
                        value={updatedTitle}
                        onChange={(e) => setUpdatedTitle(e.target.value)}
                    />
                    <textarea
                        value={updatedDescription}
                        onChange={(e) => setUpdatedDescription(e.target.value)}
                    ></textarea>
                    <button onClick={() => {
                        onEditTask(task.id, updatedTitle, updatedDescription);
                        setIsEditing(false);
                    }}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                </>
            )}
        </li>
    );
};

export default TaskItem;
