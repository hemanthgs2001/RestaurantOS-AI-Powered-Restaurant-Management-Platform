import { io } from 'socket.io-client';

const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const socket = io(socketUrl, {
  transports: ['websocket'],
  withCredentials: true,
});

export default socket;
