import React from 'react';

import io from 'socket.io-client';

import AddTask from './AddTask';
import Nav from './Nav';
import TasksContainer from './TasksContainer';

const socket = io.connect("http://localhost:5000");


function KanbanBoard() {
    // TODO: Implement state and WebSocket logic

    return (
        <div>
            <h2>Kanban Board</h2>
            <Nav />
            <AddTask socket={socket} />
            <TasksContainer socket={socket} />
        </div>
    );
}

export default KanbanBoard;
