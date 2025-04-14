// PM2 configuration file for managing Node.js applications
// pm2 start ecosystem.config.js --env production
module.exports = {
    apps: [
        {
            name: "NextJS Server",
            script: "server.js",
            watch: true,
            cwd: "./web",
            env: {
                "PORT": 3000,
                "NODE_ENV": "production"
            },
        },
        {
            name: "TCP Server",
            script: "server/build/server/src/server.js",
            watch: true,
            env_production: {
                "PORT": 8080,
                "NODE_ENV": "production",
            }
        }
    ]
}