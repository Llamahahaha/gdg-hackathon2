import os
import sys
import cv2
import base64
import json
import asyncio
import logging
import shutil
import aiofiles
import numpy as np
from pathlib import Path

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import httpx
from main import run_pipeline
from graph_engine import compute_tactical_metrics, get_ai_recommendation, generate_full_audit_report
from ai_service import AIService, OLLAMA_BASE_URL

# ─── Configuration ────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vision-server")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global State ─────────────────────────────────────────────────────────────
background_task: asyncio.Task = None
selected_video_path: str = None  # Updated by /upload-video endpoint
last_frame_stats: dict = {}       # Updated on every frame broadcast

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {str(e)}")
                # If the connection is broken, remove it
                if "closed" in str(e).lower() or "disconnected" in str(e).lower():
                    self.disconnect(connection)

manager = ConnectionManager()

# ─── Pipeline Integration ─────────────────────────────────────────────────────
def frame_to_base64(frame):
    # Downscale for live preview to prevent WebSocket congestion
    height, width = frame.shape[:2]
    new_width = 854 # 480p width
    new_height = int(height * (new_width / width))
    small_frame = cv2.resize(frame, (new_width, new_height))
    
    _, buffer = cv2.imencode('.jpg', small_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
    return base64.b64encode(buffer).decode('utf-8')

async def stream_frame(frame, stats):
    """Callback from detect_objects inside the pipeline"""
    global last_frame_stats
    from graph_engine import compute_tactical_metrics
    
    # 1. Resize for streaming performance (1280x720)
    stream_h, stream_w = 720, 1280
    h, w = frame.shape[:2]
    if w != stream_w or h != stream_h:
        frame_resized = cv2.resize(frame, (stream_w, stream_h))
    else:
        frame_resized = frame.copy()

    # 2. Add Tactical Metrics to stats if missing
    if "metrics" not in stats:
        players = stats.get("detections", [])
        stats["metrics"] = compute_tactical_metrics(players)

    b64_frame = frame_to_base64(frame_resized)
    message = {
        "type": "frame",
        "frame": b64_frame,
        "stats": stats
    }
    last_frame_stats = stats  # cache for /pause-snapshot
    await manager.broadcast(message)

@app.get("/pause-snapshot")
async def pause_snapshot():
    """Return the most recently broadcast frame stats for Replay Lab snapshot."""
    return last_frame_stats or {"error": "No data yet"}

async def stream_status(status_msg):
    """Callback for pipeline status updates"""
    await manager.broadcast({
        "type": "status",
        "message": status_msg
    })

# ─── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "VisionPlay Engine Online"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send a ready message immediately
        await websocket.send_json({"type": "ready", "message": "Connected to VisionPlay Engine"})
        
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@app.post("/upload-video")
async def upload_video(file: UploadFile = File(...)):
    """Accept a video upload and set it as the active video for the YOLO pipeline."""
    global selected_video_path
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        input_dir = os.path.join(base_dir, "input_videos")
        os.makedirs(input_dir, exist_ok=True)

        logger.info(f"Incoming upload: {file.filename}")

        # Clear old videos from input_videos to avoid stale data
        for f in os.listdir(input_dir):
            if f.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):
                try:
                    os.remove(os.path.join(input_dir, f))
                except Exception as e:
                    logger.warning(f"Could not remove old video {f}: {e}")

        dest = os.path.join(input_dir, file.filename)

        # Async chunked write — 4 MB chunks keep throughput high without
        # blocking the event loop or spiking memory on large files.
        CHUNK = 4 * 1024 * 1024  # 4 MB
        async with aiofiles.open(dest, "wb") as buffer:
            while True:
                chunk = await file.read(CHUNK)
                if not chunk:
                    break
                await buffer.write(chunk)

        selected_video_path = dest
        logger.info(f"Video saved successfully to {dest}")
        return {"status": "uploaded", "filename": file.filename, "path": dest}
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        return {"error": str(e)}, 500


@app.post("/chat")
async def chat_endpoint(data: dict):
    """
    Accepts a user message and returns an AI-generated tactical response.
    """
    user_message = data.get("message", "")
    if not user_message:
        return {"error": "No message provided"}
    
    prompt = f"""
    You are FieldTheory AI, an elite tactical football analyst.
    A coach is asking you: "{user_message}"
    
    Provide a professional, data-driven, and high-impact response in 2-3 sentences.
    Focus on spatio-temporal graph intelligence, formation entropy, and structural stability.
    Keep the tone clinical, authoritative, and strategic.
    """
    
    try:
        response = await AIService.generate_response(prompt)
        return {"response": response if response else "Strategic Engine offline."}
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        return {"response": "Strategic Engine offline. Ensure Ollama is running with Llama 3.2."}

@app.post("/generate-audit")
async def generate_audit_endpoint(data: dict):
    """
    Accepts timeline metrics and returns an AI-generated tactical audit.
    """
    timeline = data.get("timeline", [])
    if not timeline:
        return {"error": "No timeline data provided"}
    
    # Compute summary metrics for the AI
    avg_entropy = sum(f.get("metrics", {}).get("entropy", 0) for f in timeline) / len(timeline)
    peak_diameter = max(f.get("metrics", {}).get("diameter", 0) for f in timeline)
    
    lynchpins = set()
    total_fractures = 0
    for f in timeline:
        aps = f.get("metrics", {}).get("articulation_points", [])
        if aps:
            total_fractures += 1
            for ap in aps:
                lynchpins.add(ap)
    
    summary = {
        "avg_entropy": avg_entropy,
        "peak_diameter": peak_diameter,
        "total_fractures": total_fractures,
        "lynchpins": list(lynchpins)
    }
    
    report = await generate_full_audit_report(summary)
    return report

@app.post("/generate-ideal-scenario")
async def generate_ideal_scenario():
    """
    Calls Ollama to propose a 'healthy' tactical formation (low entropy).
    """
    prompt = """
    Propose an ideal, high-stability 4-3-3 football formation for the 'Home Team'.
    Provide the (x, y) coordinates for 11 players on an 800x400 canvas.
    The response must be a RAW JSON array of objects, each with 'id', 'x', 'y', and 'role'.
    Example: [{"id": 1, "x": 50, "y": 200, "role": "GK"}, ...]
    Ensure the formation is symmetric, balanced, and has LOW entropy.
    RESPOND ONLY WITH THE JSON ARRAY.
    """
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": "llama3.2",
                    "prompt": prompt,
                    "stream": False,
                    "format": "json"
                }
            )
            result = response.json()
            raw_response = result.get("response", "[]")
            return {"nodes": json.loads(raw_response)}
    except Exception as e:
        logger.error(f"Ideal scenario generation failed: {e}")
        # Fallback to a hardcoded healthy 4-3-3 if AI fails
        fallback_nodes = [
            {"id": 1, "x": 50, "y": 200, "role": "GK"},
            {"id": 2, "x": 200, "y": 50, "role": "LB"},
            {"id": 3, "x": 180, "y": 150, "role": "CB"},
            {"id": 4, "x": 180, "y": 250, "role": "CB"},
            {"id": 5, "x": 200, "y": 350, "role": "RB"},
            {"id": 6, "x": 400, "y": 100, "role": "CM"},
            {"id": 7, "x": 380, "y": 200, "role": "CDM"},
            {"id": 8, "x": 400, "y": 300, "role": "CM"},
            {"id": 9, "x": 650, "y": 100, "role": "LW"},
            {"id": 10, "x": 700, "y": 200, "role": "ST"},
            {"id": 11, "x": 650, "y": 300, "role": "RW"},
        ]
        return {"nodes": fallback_nodes}

@app.post("/start")
async def start_session():
    """Trigger the pipeline"""
    global background_task
    from shared_state import reset_stop
    reset_stop()
    
    if background_task and not background_task.done():
        logger.info("Cancelling existing vision task...")
        background_task.cancel()
        try:
            await background_task
        except asyncio.CancelledError:
            pass
            
    background_task = asyncio.create_task(run_detection_task())
    return {"status": "started"}

@app.post("/stop")
async def stop_session_endpoint():
    """Stop the pipeline"""
    global background_task
    from shared_state import request_stop
    request_stop()
    
    if background_task and not background_task.done():
        logger.info("Stopping vision task...")
        background_task.cancel()
        try:
            # Wait for task to actually stop
            await asyncio.wait_for(background_task, timeout=2.0)
        except (asyncio.CancelledError, asyncio.TimeoutError):
            pass
    return {"status": "stopped"}

async def run_detection_task():
    """
    Direct-stream mode: reads frames from the video file in real time,
    runs YOLO inline, and broadcasts each annotated frame immediately.
    No pre-extraction, no rebuild step — first frame appears in < 1 s.
    """
    try:
        from ultralytics import YOLO
        from detect_objects import (
            team_classifier, DynamicTeamClassifier,
            get_shirt_color, classify_shirt, draw_box,
            CentroidTracker, CALIBRATION_FRAMES
        )
        from shared_state import is_stopped

        base_dir   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, "models", "yolov8n.pt")

        # ── Pick video ────────────────────────────────────────────────────────
        if selected_video_path and os.path.exists(selected_video_path):
            video_path = selected_video_path
        else:
            input_dir   = os.path.join(base_dir, "input_videos")
            video_files = [f for f in os.listdir(input_dir) if f.lower().endswith(('.mp4', '.avi', '.mov'))]
            if not video_files:
                await manager.broadcast({"type": "error", "message": "No video found. Upload a video first."})
                return
            video_path = os.path.join(input_dir, video_files[0])

        logger.info(f"Direct-stream mode: {video_path}")
        await stream_status("LOADING_MODEL")

        # ── Load YOLO (non-blocking) ──────────────────────────────────────────
        model = await asyncio.to_thread(YOLO, model_path)

        # ── Open video ────────────────────────────────────────────────────────
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            await manager.broadcast({"type": "error", "message": "Could not open video file."})
            return

        src_fps    = cap.get(cv2.CAP_PROP_FPS) or 30
        target_fps = 30
        skip       = max(1, round(src_fps / target_fps))   # process every Nth frame
        frame_delay = 1.0 / target_fps

        logger.info(f"Source FPS={src_fps:.1f} | streaming at {target_fps} FPS (skip={skip})")
        await stream_status("STREAMING_LIVE")

        # ── Per-run state (fresh classifier each time) ────────────────────────
        local_classifier = DynamicTeamClassifier()
        tracker          = CentroidTracker(max_disappeared=15)
        previous_centers: dict = {}
        player_registry:  dict = {}
        idx              = 0
        frame_count      = 0
        timeline         = []
        possession_t1 = possession_t2 = 0

        main_loop = asyncio.get_running_loop()

        while True:
            if asyncio.current_task().cancelled() or is_stopped():
                break

            ok, frame = await asyncio.to_thread(cap.read)
            if not ok:
                # Loop back to start
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                local_classifier = DynamicTeamClassifier()
                tracker          = CentroidTracker(max_disappeared=15)
                previous_centers = {}
                idx              = 0
                continue

            frame_count += 1
            if frame_count % skip != 0:
                continue

            # ── Resize for fast YOLO inference (640-wide) ────────────────────
            h, w     = frame.shape[:2]
            inf_w    = 640
            inf_h    = int(h * inf_w / w)
            inf_frame = cv2.resize(frame, (inf_w, inf_h))

            # ── YOLO (non-blocking thread) ────────────────────────────────────
            results = await asyncio.to_thread(
                lambda: model(inf_frame, classes=[0, 32], verbose=False)[0]
            )

            # Scale factor back to original frame coords
            sx, sy = w / inf_w, h / inf_h

            frame_t1 = frame_t2 = 0
            ball_in_frame = False
            frame_detections = []
            current_centers  = []

            for box in results.boxes:
                cls  = int(box.cls[0])
                conf = float(box.conf[0])
                x1, y1, x2, y2 = [int(v) for v in box.xyxy[0]]
                # Scale back to display frame
                x1, x2 = int(x1 * sx), int(x2 * sx)
                y1, y2 = int(y1 * sy), int(y2 * sy)

                if cls == 32:
                    ball_in_frame = True
                    bx, by = (x1 + x2) // 2, (y1 + y2) // 2
                    cv2.circle(frame, (bx, by), 15, (0, 255, 255), 2)
                    continue

                current_centers.append((x1, y1, x2, y2))

                # Dynamic calibration
                avg_hsv = get_shirt_color(frame, x1, y1, x2, y2)
                if avg_hsv is not None:
                    if idx < CALIBRATION_FRAMES:
                        local_classifier.add_sample(avg_hsv)
                    elif idx == CALIBRATION_FRAMES and not local_classifier.calibrated:
                        local_classifier.calibrate()

                if local_classifier.calibrated:
                    team, color = local_classifier.predict(avg_hsv) if avg_hsv is not None else ("Not playing", (128, 128, 128))
                else:
                    team, color = ("Not playing", (128, 128, 128))

                if team == "Team 1":
                    frame_t1 += 1
                elif team == "Team 2":
                    frame_t2 += 1

                frame_detections.append({
                    "team":   "green" if team == "Team 1" else "white",
                    "bbox":   [x1, y1, x2, y2],
                    "conf":   round(conf, 3),
                    "center": ((x1 + x2) // 2, (y1 + y2) // 2),
                })
                draw_box(frame, x1, y1, x2, y2, team, color, conf)

            # ── Tracking ─────────────────────────────────────────────────────
            tracked = tracker.update(current_centers)
            final_detections = []
            for det in frame_detections:
                cx, cy   = det["center"]
                best_id  = -1
                min_dist = 50
                for oid, oc in tracked.items():
                    d = float(np.linalg.norm(np.array((cx, cy)) - oc))
                    if d < min_dist:
                        min_dist = d
                        best_id  = oid
                if best_id != -1:
                    det["id"] = best_id
                    if best_id not in player_registry:
                        player_registry[best_id] = {"id": best_id, "team": det["team"],
                                                     "distance": 0, "topSpeed": 0}
                    if best_id in previous_centers:
                        px, py   = previous_centers[best_id]
                        dist     = ((cx - px)**2 + (cy - py)**2) ** 0.5
                        player_registry[best_id]["distance"]  += dist * 0.05
                        player_registry[best_id]["topSpeed"]   = max(
                            player_registry[best_id]["topSpeed"], dist * 0.5)
                    previous_centers[best_id] = (cx, cy)
                    final_detections.append(det)

            possession = "team1" if frame_t1 >= frame_t2 else "team2"
            frame_stats = {
                "t1": frame_t1, "t2": frame_t2,
                "ball": ball_in_frame,
                "detections": final_detections,
                "possession": possession,
            }
            timeline.append(frame_stats)

            # ── Tactical metrics + broadcast ──────────────────────────────────
            tactical_data = compute_tactical_metrics(final_detections)
            stats = {
                "players_detected": frame_t1 + frame_t2,
                "team1_count":  frame_t1,
                "team2_count":  frame_t2,
                "ball_detected": ball_in_frame,
                "frame_id":     idx,
                "detections":   final_detections,
                "possession":   possession,
                "metrics":      tactical_data,
                "recommendation": None,
            }
            await stream_frame(frame, stats)

            idx += 1
            await asyncio.sleep(frame_delay)

        cap.release()

    except asyncio.CancelledError:
        logger.info("Detection task stopped via cancellation.")
        raise
    except Exception as e:
        logger.error(f"Error in detection task: {e}", exc_info=True)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

