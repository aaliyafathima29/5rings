import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'http://localhost:5000';

let socket = null;

/** Get (or create) the shared socket instance. */
export const getSocket = () => {
  if (!socket) {
    // Auth is handled via HttpOnly cookie (server-side); the socket connection
    // itself is unauthenticated — room joining via `connectSocket` identifies the user.
    socket = io(SOCKET_URL, {
      autoConnect: false,
    });
  }
  return socket;
};

/**
 * Connect socket and announce the user's role + id so the server
 * places them in the correct room.
 * Waits for the `connect` event before emitting `join` to avoid
 * the race condition where emit fires before the handshake completes.
 */
export const connectSocket = (role, userId) => {
  const s = getSocket();
  const emitJoin = () => s.emit('join', { role, userId });

  if (s.connected) {
    emitJoin();
  } else {
    s.once('connect', emitJoin);
    if (!s.connecting) s.connect();
  }
  return s;
};

/** Disconnect and destroy the singleton (call on logout). */
export const resetSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const disconnectSocket = resetSocket;

