import React from 'react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onToggleComplete, onDeleteTask, onEditTask, completeTaskForToday }) => {
    return (
        <ul>
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onDeleteTask={onDeleteTask}
                    onEditTask={onEditTask}
                    completeTaskForToday={completeTaskForToday}
                />
            ))}
        </ul>
    );
};

export default TaskList;