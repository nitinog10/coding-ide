FROM openjdk:21-slim

# Create non-root user
RUN groupadd -r coderunner && useradd -r -g coderunner coderunner

# Set working directory
WORKDIR /code

# Change ownership
RUN chown -R coderunner:coderunner /code

# Switch to non-root user
USER coderunner

# Default command
CMD ["java"]
