import { io } from 'socket.io-client';
import { FRONTEND_URL } from './environment';

const socket = io(FRONTEND_URL); // Adjust if using a different port or domain
export default socket;
