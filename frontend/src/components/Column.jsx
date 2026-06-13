import './Column.css';

import React from 'react';

import { useDrop } from 'react-dnd';

import { socket } from '../socket/socket';
import TaskCard from './TaskCard';

const ItemTypes = {
  TASK: "task"
};

export default function Column({ title, status, tasks, onUpload  }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item) => {
      if (item.status !== status) {
        socket.emit("task:move", { taskId: item.id, newStatus: status });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }));

  return (
    <div
      ref={drop}
      className={`column ${isOver ? 'column-hover' : ''}`}
    >
      <h3 className="column-header">
        {title} <span className="task-count">{tasks.length}</span>
      </h3>

      <div className="column-content">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onUpload={onUpload} />
        ))}
        
        {tasks.length === 0 && (
          <div className="empty-column">Drop tasks here</div>
        )}
      </div>
    </div>
  );
}
