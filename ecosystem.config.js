// PM2 configuration file for managing Node.js applications
// pm2 start ecosystem.config.js
module.exports = {
    apps: [
        {
            name: "NextJS Server",
            script: "server.js",
            watch: ["web"],
            cwd: "./web",
            env: {
                "PORT": 3000,
                "NODE_ENV": "production",
                "JWT_SECRET": "fcbec2ce5256aa0132e0907e82288180c75f618597646a3303d2cd470eb11564",
                "ABSOLUTE_DATA_PATH": "/Users/stephanbueler/ba/quest-capture-server/data"
            },
        },
        {
            name: "TCP Server",
            script: "server/build/server/src/server.js",
            watch: ["server"],
            env_production: {
                "PORT": 8080,
                "NODE_ENV": "production",
                "ABSOLUTE_DATA_PATH": "/Users/stephanbueler/ba/quest-capture-server/data"
            }
        }
    ]
}