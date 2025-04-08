import { createTcpServer } from "./tcp-server";
import { ensureDirectoriesExist } from "./file-storage";

const PORT = process.env.TCP_SERVER_PORT || 8080;

const server = createTcpServer();
ensureDirectoriesExist();

server.listen(8080, () => {
    console.log("TCP server listening on port " + PORT);
})