import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Adjust if using a different port or domain
export default socket;
