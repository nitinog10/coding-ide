#!/bin/bash

# Build all Docker images for code execution

echo "Building Docker images for code execution..."

cd "$(dirname "$0")/../docker-images"

echo "Building Python image..."
docker build -t code-executor-python:latest ./python

echo "Building JavaScript image..."
docker build -t code-executor-javascript:latest ./javascript

echo "Building C++ image..."
docker build -t code-executor-cpp:latest ./cpp

echo "Building Java image..."
docker build -t code-executor-java:latest ./java

echo "All images built successfully!"
echo ""
echo "Verify images:"
docker images | grep code-executor
