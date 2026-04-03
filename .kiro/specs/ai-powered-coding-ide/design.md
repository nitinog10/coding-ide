# Design Document: AI-Powered Coding IDE

## Overview

A next-generation AI-powered coding IDE that provides a structured, guided coding environment with integrated AI assistance, multi-language execution in Docker containers, and gamification elements. Unlike traditional IDEs, this system organizes coding into structured sections (Problem, Approach, Code, Output, Optimization) and provides real-time AI guidance for explanation, debugging, optimization, and language conversion.

## Main Architecture Workflow

```mermaid
sequenceDiagram
    participant User
    participant Frontend as React Frontend
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant AI as AI Service
    participant Exec as Execution Service
    participant DB as DynamoDB
    participant Docker as Docker Engine
    
    User->>Frontend: Write code
    Frontend->>Gateway: Submit code execution
    Gateway->>Auth: Validate token
    Auth-->>Gateway: Token valid
    Gateway->>Exec: Execute code request
    Exec->>Docker: Create container
    Docker->>Docker: Run code in sandbox
    Docker-->>Exec: Execution result
    Exec->>DB: Store execution log
    Exec-->>Gateway: Return output
    Gateway-->>Frontend: Display result
    
    User->>Frontend: Ask AI for help
    Frontend->>Gateway: AI request
    Gateway->>AI: Process query
    AI->>DB: Fetch code context
    AI->>AI: Generate response
    AI-->>Gateway: AI response
    Gateway-->>Frontend: Display AI response
