# Quest Capture Server

The Quest Capture Server enables you to capture camera feeds and tracking data from Meta Quest devices and store it on a remote server. Create custom collections with prompts to gather egocentric video data.

**Companion App:** Download the [Quest Capture Client](https://github.com/stephanmitph/quest-capture-client) APK and install it on your Quest device.

**⚠️ Development Status:** This server is actively developed and manually tested.
## Features

### Core Capabilities
- **Device Support**: Compatible with Meta Quest 3
- **Real-time Data Capture**: Stream camera feed and tracking data
- **Custom Collections**: Create guided data collection sessions with custom prompts
- **Web Dashboard**: User interface for data management and visualization
- **Self-Hosted**: Complete control over your data and infrastructure

### Tracking Data (Per Frame)
- **Head Tracking**: Position and rotation
- **Hand Tracking**: Individual finger bone positions and rotations
- **Controller Tracking**: Position, rotation, and velocity data

## Demo

https://github.com/user-attachments/assets/00d62809-4a3a-4eda-8820-71a6f5b2d977


## 🚀 Quick Start

### Option 1: Docker (Recommended)

**Prerequisites:**
- Docker and Docker Compose installed
- At least 2GB free disk space

```bash
# Clone the repository
git clone https://github.com/stephanmitph/quest-capture-server.git
cd quest-capture-server

# Create data directory (if not present)
mkdir -p data

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps
```

**Access Points:**
- Web Interface: http://localhost:3000
- TCP Server: localhost:8080
- API Server: localhost:8081

### Option 2: Manual Installation

**Prerequisites:**
- Node.js 16+ and npm
- PM2: `npm install -g pm2`
- FFmpeg: `brew install ffmpeg` (macOS) or `apt install ffmpeg` (Ubuntu)
- AWK: Usually pre-installed on Unix systems

```bash
# Clone and setup
git clone https://github.com/stephanmitph/quest-capture-server.git
cd quest-capture-server
mkdir -p data

# Install dependencies
cd server && npm install --force && cd ..
cd web && npm install --force && cd ..

# Build applications
cd web && npm run build && cd ..
cd server && npm run build && cd ..

# Configure environment (see Configuration section below)
cp ecosystem.config.js ecosystem.config.local.js

# Edit ecosystem.config.local.js with your settings

# Start services
pm2 start ecosystem.config.local.js
pm2 logs  # View logs
```

### Configuration

**Environment Variables:**
- `JWT_SECRET`: Secure random string for authentication (generate with `openssl rand -hex 32`)
- `ABSOLUTE_DATA_PATH`: Full path to data directory
- `PORT`: Service ports (default: 3000, 8080, 8081)
- `NODE_ENV`: Environment mode (default: production)

**For manual installation, edit `ecosystem.config.js`:**
```javascript
env: {
    "JWT_SECRET": "your-secure-random-string-here",
    "ABSOLUTE_DATA_PATH": "/full/path/to/your/data/directory"
}
```

## System Overview 

![systemoverview](https://github.com/user-attachments/assets/951117ed-d48f-489d-895a-52804657cfa8)

### Explanation

**1. TCP Server (Port 8080)**
- Primary data ingestion point
- Handles streaming from Quest devices
- Manages file storage operations

**2. API Server (Port 8081)**
- Healthchecks and retrieval of collection information from the client
- Automatically starts on TCP Server Port + 1

**3. Web Interface (Port 3000)**
- Collection management and configuration
- User authentication and access control

**4. File Storage System**
- Organized by collections and recordings 

### 📁 Data Structure
```
data/
├── collection-name/
│   ├── info.json                # Collection metadata
│   └── session-timestamp/
│       ├── frame1.jpg           # Camera frames
│       ├── frame2.jpg
│       ├── ...
│       ├── info.json            # Recording metadata
│       └── tracking-data.json   # Per-frame tracking data
```

## 🔧 Troubleshooting

### Installation Issues

<details>
<summary><strong>`npm install` fails with dependency conflicts</strong></summary>

Use the `--force` flag as documented in the installation guide.

```bash
# Navigate to each directory and force install
cd server && npm install --force
cd web && npm install --force
```
</details>

<details>
<summary><strong>Docker build fails</strong></summary>

**Step 1:** Verify Docker is running and up to date
```bash
docker --version
docker-compose --version
```

**Step 2:** Clean Docker cache and rebuild
```bash
# Remove old containers and images
docker system prune -f

# Rebuild without cache
docker-compose build --no-cache

# Start services
docker-compose up -d
```

**Step 3:** Check for common issues
- Ensure you have sufficient disk space (at least 2GB free)
- Verify the `data/` directory exists: `mkdir -p data`
- Check Docker daemon is running: `docker info`
</details>


### Connection Issues

<details>
<summary><strong>Quest device can't connect to server</strong></summary>

**Step 1:** Check network connectivity
```bash
# From Quest device browser, try accessing:
http://YOUR_SERVER_IP:3000
```

**Step 2:** Verify firewall settings
```bash
# Allow required ports through firewall (Linux/macOS)
sudo ufw allow 3000
sudo ufw allow 8080  
sudo ufw allow 8081

# For macOS, also check System Preferences > Security & Privacy > Firewall
```

**Step 3:** Check server status
```bash
# Docker installation
docker-compose ps
docker-compose logs

# Manual installation  
pm2 status
pm2 logs
```

**Step 4:** Network troubleshooting
- Ensure Quest and server are on the same network
- Try accessing from another device on the network
- Check router settings for device isolation
- Verify server IP address: `hostname -I` (Linux) or `ipconfig getifaddr en0` (macOS)
</details>

<details>
<summary><strong>Web interface shows connection errors</strong></summary>

**Step 1:** Verify API server is running
```bash
curl http://localhost:8081/health
# Should return server status information
```

**Step 2:** Check browser console for errors
1. Open browser developer tools (F12)
2. Look for network errors or JavaScript exceptions
3. Check the Network tab for failed requests
4. Verify JWT token is valid (look for 401/403 errors)

**Step 3:** Verify environment configuration
```bash
# Check if JWT_SECRET is set
echo $JWT_SECRET

# For Docker, check environment variables
docker-compose exec app env | grep JWT_SECRET
```
</details>

<details>
<summary><strong>Data not being saved</strong></summary>

**Step 1:** Check data directory permissions
```bash
ls -la data/
# Directory should be writable by application user
chmod 755 data/
```

**Step 2:** Verify ABSOLUTE_DATA_PATH configuration
```bash
# Check ecosystem.config.js or Docker environment
echo $ABSOLUTE_DATA_PATH

# For Docker installation
docker-compose exec app echo $ABSOLUTE_DATA_PATH
```

**Step 3:** Check write permissions and path existence
```bash
# Test write access
touch data/test-write.txt && rm data/test-write.txt

# Verify path in configuration matches actual directory
realpath data/
```
</details>

## Contributing

Contributions are welcome. If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License
This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
