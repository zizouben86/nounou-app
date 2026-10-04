import { io } from 'socket.io-client';

let socket;

export const getSocket = () => {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    const token = localStorage.getItem('token');
    if (!token) return null;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => console.log('🔌 Socket connecté'));
    socket.on('connect_error', (err) => console.error('❌ Socket error', err.message));
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};