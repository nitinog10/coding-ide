# Quick Start Guide - AI Coding IDE (No Claude API Key Required!)

You can use this platform **without a Claude API key**! The AI features will work in mock mode for testing.

## Prerequisites

- **Node.js 20+** - [Download here](https://nodejs.org/)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)

## 5-Minute Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### 2. Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
```

**Edit `backend/.env`** and set a JWT secret (any random string):
```env
JWT_SECRET=my-super-secret-key-12345
```

Leave `CLAUDE_API_KEY` as is - the platform will use mock AI responses.

```bash
# Frontend
cd frontend
cp .env.example .env
```

### 3. Build Docker Images

**Windows (PowerShell):**
```powershell
cd backend/scripts
./build-images.ps1
```

**Linux/Mac:**
```bash
cd backend/scripts
chmod +x build-images.sh
./build-images.sh
```

This takes 2-3 minutes. You'll see 4 images built:
- code-executor-python
- code-executor-javascript
- code-executor-cpp
- code-executor-java

### 4. Start DynamoDB Local

```bash
# From project root
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local
```

### 5. Initialize Database

```bash
cd backend
npm run init-db
```

You should see: "Table CodingIDETable created successfully"

### 6. Start Backend

```bash
cd backend
npm run dev
```

Wait for: "Server running on port 3000"

### 7. Start Frontend

**In a new terminal:**
```bash
cd frontend
npm run dev
```

### 8. Open the App

Go to: **http://localhost:5173**

## First Steps

1. **Register**: Click "Sign up" and create an account
2. **Login**: Sign in with your credentials
3. **Write Code**: Select a language and start coding!
4. **Run Code**: Click the "Run Code" button
5. **Try AI**: Click "AI Assist" (uses mock responses without API key)

## Test Code Examples

### Python
```python
print("Hello, World!")
for i in range(5):
    print(f"Count: {i}")
```

### JavaScript
```javascript
console.log("Hello, World!");
for (let i = 0; i < 5; i++) {
    console.log(`Count: ${i}`);
}
```

### C++
```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
```

### Java
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

## Features Available Without Claude API

✅ **Code Execution** - All 4 languages work perfectly  
✅ **Project Management** - Save, load, delete projects  
✅ **XP System** - Earn points and level up  
✅ **Monaco Editor** - Full syntax highlighting  
✅ **Mock AI Responses** - Test the AI interface  
✅ **Authentication** - Full user system  

## Want Real AI?

To enable real Claude AI assistance:

1. Sign up at https://console.anthropic.com/
2. Get your API key
3. Edit `backend/.env`:
   ```env
   CLAUDE_API_KEY=sk-ant-your-actual-key-here
   ```
4. Restart backend: `npm run dev`

## Troubleshooting

### "Port already in use"
- Backend (3000): Change `PORT` in `backend/.env`
- Frontend (5173): Change port in `frontend/vite.config.ts`
- DynamoDB (8000): Use different port in docker run command

### "Docker images not found"
Run the build script again:
```bash
cd backend/scripts
./build-images.ps1  # or ./build-images.sh
```

### "Cannot connect to Docker"
- Make sure Docker Desktop is running
- Check: `docker ps`

### Code execution fails
1. Verify images: `docker images | grep code-executor`
2. Check Docker is running: `docker ps`
3. Restart Docker Desktop

## What's Next?

- Explore all 4 programming languages
- Save your favorite code snippets as projects
- Try the AI assistance (mock mode)
- Earn XP and level up!
- When ready, add your Claude API key for real AI

## Need Help?

Check the full documentation:
- **SETUP.md** - Detailed setup guide
- **README.md** - Complete documentation
- **Troubleshooting** - Common issues and solutions

Happy coding! 🚀
