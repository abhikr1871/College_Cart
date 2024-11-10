import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  transports: ["websocket"], // Use only WebSocket to avoid polling
  reconnectionAttempts: 5,    // Optional: Limit reconnection attempts
  timeout: 10000              // Optional: Set timeout for connection attempts
});

export default socket;
