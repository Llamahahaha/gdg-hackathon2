#!/usr/bin/env bash
# Starts both the WebSocket telemetry server and the Graph Analysis API.
# Called by `npm run dev` via concurrently.
set -e

cd "$(dirname "$0")/visionplay-pipeline"

PYTHON=".venv/bin/python"

# Start the Graph Analysis API server (port 8001) in the background.
echo "[visionplay] Starting Graph Analysis API on :8001..."
PYTHONPATH=src "$PYTHON" -m uvicorn api_server.main:app \
  --host 0.0.0.0 --port 8001 &
API_PID=$!

# Start the main WebSocket telemetry server (port 8000) in foreground.
echo "[visionplay] Starting WebSocket telemetry server on :8000..."
"$PYTHON" src/server.py

# If the telemetry server exits, kill the API too.
kill "$API_PID" 2>/dev/null || true
