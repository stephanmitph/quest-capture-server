# Quest Capture Server
The Quest Capture Server enables you to capture your device's camera feed along with various tracking data, and store it on a remote server. You can create collections with custom prompts to guide users and begin collecting data from users efficiently.

The Quest App can be found here: [Quest Capture Client](https://github.com/stephanmitph/quest-capture-client). Download the APK and install it on your Quest device.

This server is still in development and manually tested. If you encounter any issues or bugs, please feel free to contribute!

## Features
- Capture raw image and tracking data from Quest (3 and 3S) devices
- Web interface for content visualization
- Docker support for easy deployment for self-hosting

## Demo

## Quick start  

### Prerequisites (locally)
- ffmpeg and awk: `apk add  ffmpeg gawk`
- pm2: `npm i -g pm2`

### Using docker (recommended)
```bash
# Clone the repository
git clone https://github.com/stephanmitph/quest-capture-server.git
cd quest-capture-server
mkdir data
# Start the server
docker-compose up -d
```
### Manual installation
```bash
# Clone the repository
git clone https://github.com/yourusername/quest-capture-server.git
cd quest-capture-server

# Make data folder
mkdir data

# Install dependencies
cd server && npm install --force && cd ..
cd web && npm install --force && cd ..

# Build both apps
cd web && npm run build && cd ..
cd server && npm run build && cd ..

# Adjust ecosystem.config.js env variables (JWT_SECRET and ABSOLUTE_DATA_PATH). Docker env should be ok

pm2 start ecosystem.config.js

```

### System Architecture
The Quest Capture Server consists of:

1. TCP Server (Port 8080) - Handles raw data streaming from Quest devices
2. API Server (Port 8081, TCP Server Port + 1) - Provides REST endpoints for client
3. Web Interface (Port 3000) - User interface for system management
4. File Storage - Where capture data will be stored. Also acts as the DB for the web app. Make sure the data folder is on same level as docker-compose.yml

## Contributing

Contributions are welcome. If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.