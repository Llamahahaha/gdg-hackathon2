FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required by OpenCV (cv2) and Ultralytics
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from the subfolder (since Railway runs this from the repo root)
COPY visionplay-pipeline/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY visionplay-pipeline/ .

# Expose the port the server runs on
EXPOSE 8000

# PYTHONPATH=src so that api_server (and validation.py) are importable as packages
ENV PYTHONPATH=/app/src

# Run via uvicorn so async lifespan events are handled correctly
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "src"]
