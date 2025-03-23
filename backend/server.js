const http = require('http');
const app = require('./app');
const setupWebSocket = require('./api/chat/socket'); // Import WebSocket setup

const PORT = process.env.PORT || 5000;
const server = http.createServer(app); // Create HTTP server

setupWebSocket(server); // Attach WebSocket to the server

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
