# AI-Powered Coding IDE Platform

A next-generation AI-powered coding IDE that provides a structured, guided coding environment with integrated AI assistance, multi-language execution in Docker containers, and gamification elements.

## Features

- **Multi-Language Support**: Execute code in C++, Python, Java, and JavaScript
- **AI-Powered Assistance**: Integrated Claude AI for code explanation, debugging, optimization, and conversion
- **Secure Execution**: Docker-based sandboxed code execution with resource limits
- **Monaco Editor**: Professional code editor with syntax highlighting and autocomplete
- **Gamification**: XP system, levels, and achievements to motivate learning
- **Project Management**: Save, load, and manage your coding projects
- **Real-time Output**: See execution results with stdout, stderr, execution time, and memory usage

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- Docker for secure code execution
- AWS DynamoDB for data persistence
- Claude AI (Anthropic) for AI assistance
- JWT authentication with bcrypt

### Frontend
- React + TypeScript
- Tailwind CSS for styling
- Monaco Editor for code editing
- Axios for API communication
- React Router for navigation

## Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- AWS account (for production) or DynamoDB Local (for development)
- Claude API key from Anthropic

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd ai-coding-ide
```

### 2. Set up environment variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env and add your configuration
```

Required environment variables:
- `JWT_SECRET`: Your secret key for JWT tokens
- `CLAUDE_API_KEY`: Your Claude API key from Anthropic
- `AWS_REGION`: AWS region (default: us-east-1)
- `DYNAMODB_ENDPOINT`: http://localhost:8000 for local development

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env
```

### 3. Build Docker images for code execution

```bash
cd backend/docker-images

# Build all language images
docker build -t code-executor-python:latest ./python
docker build -t code-executor-javascript:latest ./javascript
docker build -t code-executor-cpp:latest ./cpp
docker build -t code-executor-java:latest ./java
```

### 4. Start the development environment

```bash
# From project root
docker-compose up -d
```

This will start:
- DynamoDB Local on port 8000
- Backend API on port 3000
- Frontend on port 5173

### 5. Initialize the database

```bash
cd backend
npm install
npm run init-db
```

### 6. Access the application

Open your browser and navigate to:
```
http://localhost:5173
```

## Development Setup (Without Docker Compose)

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
ai-coding-ide/
├── backend/
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic services
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   ├── config/          # Configuration files
│   │   └── types/           # TypeScript type definitions
│   ├── docker-images/       # Dockerfiles for code execution
│   ├── scripts/             # Setup and utility scripts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API client services
│   │   └── types/           # TypeScript type definitions
│   └── package.json
└── docker-compose.yml
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Code Execution
- `POST /api/code/execute` - Execute code

### AI Assistance
- `POST /api/ai/assist` - Get AI code assistance

### Projects
- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### User
- `GET /api/user/stats` - Get user stats (XP, level, achievements)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Docker container isolation for code execution
- No network access in execution containers
- Resource limits (CPU, memory, disk)
- 30-second execution timeout
- Code size limits (100KB)
- Rate limiting on API endpoints
- Input validation and sanitization

## Gamification System

- **XP System**: Earn experience points for code execution
- **Levels**: Progress through levels based on total XP
- **Achievements**: Unlock achievements for milestones
- **Language Skills**: Track proficiency in each language

## Deployment

### Production Deployment

1. Set up AWS DynamoDB table
2. Configure environment variables for production
3. Build Docker images and push to registry
4. Deploy backend and frontend to your hosting platform
5. Ensure Docker is available on the backend server

### Environment Variables for Production

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=<strong-secret-key>
CLAUDE_API_KEY=<your-claude-api-key>
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
DYNAMODB_TABLE_NAME=CodingIDETable
CORS_ORIGIN=https://your-frontend-domain.com
```

## Troubleshooting

### Docker containers not starting
- Ensure Docker daemon is running
- Check if ports 3000, 5173, 8000 are available
- Verify Docker images are built correctly

### Code execution fails
- Verify Docker images are built for all languages
- Check Docker socket is accessible: `/var/run/docker.sock`
- Ensure sufficient system resources

### AI assistance not working
- Verify Claude API key is set correctly
- Check API rate limits
- Ensure network connectivity to Anthropic API

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API documentation

## Roadmap

- [ ] Add more programming languages (Go, Rust, Ruby)
- [ ] Implement collaborative coding features
- [ ] Add code templates and snippets
- [ ] Implement code review AI features
- [ ] Add mobile responsive design
- [ ] Implement dark/light theme toggle
- [ ] Add code sharing and embedding
- [ ] Implement leaderboards
- [ ] Add coding challenges and tutorials

---

Built with ❤️ for developers who want to learn and code better with AI assistance.
