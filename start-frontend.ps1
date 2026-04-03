# AI Coding IDE - Frontend Startup Script

Write-Host "Starting AI Coding IDE Frontend..." -ForegroundColor Green

# Navigate to frontend directory
Set-Location "D:\Ticket issue\frontend"

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the server
Write-Host "Starting frontend server on port 5173..." -ForegroundColor Green
npm run dev
