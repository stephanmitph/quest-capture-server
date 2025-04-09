// PM2 configuration file for managing Node.js applications
// pm2 start ecosystem.config.js --env production
module.exports = {
    apps: [
        {
            name: "NextJS Server",
            script: "/build/server.js",
            watch: true,
            env: {
                "PORT": 3000,
                "NODE_ENV": "development"
            },
            env_production: {
                "PORT": 3000,
                "NODE_ENV": "production",
            }
        }
    ]
}