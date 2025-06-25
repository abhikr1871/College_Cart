import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  transports: ['websocket'], // 💥 Forces websocket
  upgrade: false,            // ⛔ disables polling fallback (optional)
  withCredentials: true,
});

export default socket;
