import { createTcpServer } from "./tcp-server";

const PORT = process.env.PORT || 8080;

const server = createTcpServer();

server.listen(8080, () => {
    console.log("TCP server listening on port " + PORT);
})