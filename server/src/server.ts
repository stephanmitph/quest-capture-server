import { createTcpServer } from "./tcp-server";
import { createApiServer } from "./api-server";

const TCP_PORT = process.env.PORT || '8080';
const API_PORT = parseInt(TCP_PORT, 10) + 1;

// Initialize TCP server
const tcpServer = createTcpServer();

// Initialize Express API server
const apiServer = createApiServer();

// Start servers
tcpServer.listen(TCP_PORT, () => {
  console.log(`TCP server listening on port ${TCP_PORT}`);
}).on("error", (err) => {
  console.error("TCP Server error:", err);
  process.exit(); // Exit to restart w/ PM2
});

apiServer.listen(API_PORT, () => {
  console.log(`Express API server listening on port ${API_PORT}`);
}).on("error", (err) => {
  console.error("API Server error:", err);
  process.exit(); // Exit to restart w/ PM2
});