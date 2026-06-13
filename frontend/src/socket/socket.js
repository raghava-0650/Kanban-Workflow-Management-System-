import { io } from 'socket.io-client';

// Use environment variable for backend URL, fallback to localhost for development
const SOCKET_URL = "https://kanban-workflow-management-system.onrender.com";

export const socket = io(SOCKET_URL);
