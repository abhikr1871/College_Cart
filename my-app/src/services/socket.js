import { io } from 'socket.io-client';
import { SOCKET_URL } from '../environment';
const socket = io(SOCKET_URL, {
  transports: ['websocket'], // 💥 Forces websocket
  upgrade: false,            // ⛔ disables polling fallback (optional)
  withCredentials: true,
});

export default socket;
