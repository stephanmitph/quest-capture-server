// PM2 configuration file for managing Node.js applications
// pm2 start ecosystem.config.js
module.exports = {
    apps: [
        {
            name: "NextJS Server",
            script: "server.js",
            watch: true,
            cwd: "./web",
            env: {
                "PORT": 3000,
                "NODE_ENV": "production",
                "JWT_SECRET": "INSERT_JWT_SECRET_HERE",
                "ABSOLUTE_DATA_PATH": "INSERT_ABSOLUTE_DATA_PATH_HERE",
            },
        },
        {
            name: "TCP Server",
            script: "server/build/server/src/server.js",
            watch: true,
            env_production: {
                "PORT": 8080,
                "NODE_ENV": "production",
                "ABSOLUTE_DATA_PATH": "INSERT_ABSOLUTE_DATA_PATH_HERE",
            }
        }
    ]
}