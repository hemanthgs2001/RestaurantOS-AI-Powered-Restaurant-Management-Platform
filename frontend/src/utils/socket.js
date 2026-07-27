import { io } from 'socket.io-client';

// IMPORTANT: this must be the server's ORIGIN (protocol + host + port),
// not a REST API base path. Your backend runs on port 5001
// (confirmed from API calls like http://localhost:5001/api/inventory/...),
// so the previous fallback of port 5000 here was pointing at the wrong
// server entirely - the socket connection was silently failing, which is
// why notifications only ever showed up after a refresh (via the REST
// fetch) and never arrived live.
const DEFAULT_SOCKET_URL = 'http://localhost:5001';

// If REACT_APP_API_URL is set but includes a path like "/api" (common for
// REST base URLs), Socket.IO would try to connect to that as a namespace
// instead of the server root, which also fails silently. Strip any path
// so we're left with just the origin.
const rawUrl = process.env.REACT_APP_API_URL || DEFAULT_SOCKET_URL;
const socketUrl = rawUrl.replace(/\/api\/?$/i, '').replace(/\/+$/, '');

const socket = io(socketUrl, {
  // Allow falling back to polling if a websocket connection can't be
  // established immediately (proxies, some dev environments, etc.).
  // Restricting to websocket-only can prevent the initial connection
  // from ever succeeding.
  transports: ['websocket', 'polling'],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

// Lightweight connection diagnostics - safe to leave in, only logs to
// the browser console, helps confirm the socket is actually connected
// (open devtools console and look for "Socket connected" after loading
// any page that mounts Header).
socket.on('connect', () => {
  console.log('Socket connected:', socket.id, '->', socketUrl);
});

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err.message);
});

socket.on('disconnect', (reason) => {
  console.warn('Socket disconnected:', reason);
});

export default socket;