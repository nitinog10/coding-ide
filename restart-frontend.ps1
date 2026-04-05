# Restart Frontend with Clean Cache

Write-Host "Restarting Frontend..." -ForegroundColor Green

Set-Location "D:\Ticket issue\frontend"

# Clean cache
Write-Host "Cleaning cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue

# Start dev server
Write-Host "Starting dev server..." -ForegroundColor Green
npm run dev
