# AI Coding IDE - Backend Startup Script

Write-Host "Starting AI Coding IDE Backend..." -ForegroundColor Green

# Navigate to backend directory
Set-Location "D:\Ticket issue\backend"

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Please edit backend/.env and set JWT_SECRET to any random string" -ForegroundColor Yellow
    Write-Host "Press any key to continue after editing .env..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the server
Write-Host "Starting backend server on port 3000..." -ForegroundColor Green
npm run dev
