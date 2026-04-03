# Setup Guide - AI-Powered Coding IDE

This guide will walk you through setting up the complete AI-powered coding IDE platform from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v20 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - Verify: `docker --version` and `docker-compose --version`

3. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/
   - Verify: `git --version`

4. **Claude API Key**
   - Sign up at: https://console.anthropic.com/
   - Create an API key from the dashboard

## Step-by-Step Setup

### Step 1: Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables

#### Backend Configuration

Create `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and configure:

```env
# Server
PORT=3000
NODE_ENV=development

# Database (for local development)
AWS_REGION=us-east-1
DYNAMODB_ENDPOINT=http://localhost:8000

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h

# AI Service
CLAUDE_API_KEY=your-claude-api-key-here
CLAUDE_MODEL=claude-sonnet-4-20250514

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Important**: Replace `your-claude-api-key-here` with your actual Claude API key!

#### Frontend Configuration

Create `.env` file in the `frontend` directory:

```bash
cd frontend
cp .env.example .env
```

The default configuration should work:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Step 3: Build Docker Images for Code Execution

These images are used to execute user code securely in isolated containers.

#### On Windows (PowerShell):
```powershell
cd backend/scripts
./build-images.ps1
```

#### On Linux/Mac:
```bash
cd backend/scripts
chmod +x build-images.sh
./build-images.sh
```

This will build 4 Docker images:
- `code-executor-python:latest`
- `code-executor-javascript:latest`
- `code-executor-cpp:latest`
- `code-executor-java:latest`

Verify images are built:
```bash
docker images | grep code-executor
```

### Step 4: Start DynamoDB Local

DynamoDB Local is used for development. In production, you'll use AWS DynamoDB.

```bash
docker-compose up -d dynamodb-local
```

Verify it's running:
```bash
docker ps | grep dynamodb
```

### Step 5: Initialize Database

Create the DynamoDB table:

```bash
cd backend
npm run init-db
```

You should see: "Table CodingIDETable created successfully"

### Step 6: Start the Backend Server

```bash
cd backend
npm run dev
```

The backend should start on http://localhost:3000

You should see:
```
Server running on port 3000 in development mode
```

### Step 7: Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend should start on http://localhost:5173

### Step 8: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the login page!

## First Time Usage

### 1. Register an Account

- Click "Sign up" on the login page
- Enter username, email, and password
- Password must be at least 8 characters with uppercase, lowercase, and numbers
- Click "Create Account"

### 2. Login

- Enter your username and password
- Click "Sign In"

### 3. Start Coding!

- Select a programming language from the dropdown
- Write your code in the Monaco Editor
- Click "Run Code" to execute
- See output in the console panel

### 4. Try AI Assistance

- Click "AI Assist" button in the header
- Select an action (Explain, Debug, Optimize, etc.)
- Ask a question about your code
- Get AI-powered suggestions!

### 5. Save Your Projects

- Click "Projects" button in the header
- Click "Save Current Code"
- Enter a project name
- Your code is saved and can be loaded later

## Troubleshooting

### Port Already in Use

If ports 3000, 5173, or 8000 are already in use:

**Backend (port 3000):**
- Edit `backend/.env` and change `PORT=3000` to another port
- Update `frontend/.env` to match: `VITE_API_BASE_URL=http://localhost:YOUR_PORT/api`

**Frontend (port 5173):**
- Edit `frontend/vite.config.ts` and change the port in server config

**DynamoDB (port 8000):**
- Edit `docker-compose.yml` and change the port mapping

### Docker Permission Denied

On Linux, you may need to add your user to the docker group:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Code Execution Fails

1. Verify Docker images are built:
   ```bash
   docker images | grep code-executor
   ```

2. Check Docker is running:
   ```bash
   docker ps
   ```

3. Verify Docker socket is accessible:
   ```bash
   ls -la /var/run/docker.sock
   ```

### AI Assistance Not Working

1. Verify Claude API key is set in `backend/.env`
2. Check API key is valid at https://console.anthropic.com/
3. Check backend logs for API errors
4. Verify you haven't exceeded rate limits

### Database Connection Issues

1. Verify DynamoDB Local is running:
   ```bash
   docker ps | grep dynamodb
   ```

2. Check `backend/.env` has correct endpoint:
   ```env
   DYNAMODB_ENDPOINT=http://localhost:8000
   ```

3. Re-initialize database:
   ```bash
   cd backend
   npm run init-db
   ```

## Development Tips

### Hot Reloading

Both backend and frontend support hot reloading:
- Backend: Changes to `.ts` files automatically restart the server
- Frontend: Changes to `.tsx` files automatically refresh the browser

### Viewing Logs

**Backend logs:**
- Console output shows all requests and errors
- Check `backend/logs/` directory for detailed logs

**Frontend logs:**
- Open browser DevTools (F12)
- Check Console tab for errors

### Testing Code Execution

Try these sample codes to test each language:

**Python:**
```python
print("Hello from Python!")
for i in range(5):
    print(f"Count: {i}")
```

**JavaScript:**
```javascript
console.log("Hello from JavaScript!");
for (let i = 0; i < 5; i++) {
    console.log(`Count: ${i}`);
}
```

**C++:**
```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello from C++!" << endl;
    for (int i = 0; i < 5; i++) {
        cout << "Count: " << i << endl;
    }
    return 0;
}
```

**Java:**
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        for (int i = 0; i < 5; i++) {
            System.out.println("Count: " + i);
        }
    }
}
```

## Next Steps

- Explore the AI assistance features
- Try saving and loading projects
- Check your XP and level progress
- Experiment with different programming languages

## Production Deployment

For production deployment instructions, see the main README.md file.

## Getting Help

If you encounter issues:
1. Check this troubleshooting guide
2. Review backend and frontend logs
3. Check Docker container status
4. Verify all environment variables are set correctly
5. Open an issue on GitHub with detailed error messages

Happy coding! 🚀
