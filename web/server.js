"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const next_1 = __importDefault(require("next"));
const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const dir = path_1.default.join(__dirname);
const app = (0, next_1.default)({ dev, dir });
const handle = app.getRequestHandler();
app.prepare().then(() => {
    const server = (0, express_1.default)();
    // Serve /data folder statically
    const dataPath = path_1.default.join(process.cwd(), "../data");
    console.log("Serving data from:", dataPath);
    server.use("/data", express_1.default.static(dataPath));
    // Handle everything else with Next.js
    server.use((req, res) => {
        const parsedUrl = (0, url_1.parse)(req.url, true);
        handle(req, res, parsedUrl);
    });
    server.listen(port);
    console.log(`> Server listening at http://localhost:${port} as ${dev ? 'development' : process.env.NODE_ENV}`);
});
