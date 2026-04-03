FROM python:3.12-alpine

# Create non-root user
RUN addgroup -S coderunner && adduser -S coderunner -G coderunner

# Set working directory
WORKDIR /code

# Change ownership
RUN chown -R coderunner:coderunner /code

# Switch to non-root user
USER coderunner

# Default command
CMD ["python3"]
