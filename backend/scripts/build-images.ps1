# PowerShell script to build all Docker images for code execution

Write-Host "Building Docker images for code execution..." -ForegroundColor Green

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$dockerImagesPath = Join-Path (Split-Path -Parent $scriptPath) "docker-images"

Set-Location $dockerImagesPath

Write-Host "Building Python image..." -ForegroundColor Yellow
docker build -t code-executor-python:latest ./python

Write-Host "Building JavaScript image..." -ForegroundColor Yellow
docker build -t code-executor-javascript:latest ./javascript

Write-Host "Building C++ image..." -ForegroundColor Yellow
docker build -t code-executor-cpp:latest ./cpp

Write-Host "Building Java image..." -ForegroundColor Yellow
docker build -t code-executor-java:latest ./java

Write-Host "All images built successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Verify images:" -ForegroundColor Cyan
docker images | Select-String "code-executor"
