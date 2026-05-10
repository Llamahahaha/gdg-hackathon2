# ⚽ VisionPlay AI: Tactical Graph Intelligence Engine

**VisionPlay AI** is an elite-tier tactical intelligence platform designed for high-stakes football analytics. Unlike traditional statistics that focus on individual actions, VisionPlay AI models the pitch as a **dynamic spatio-temporal graph**, quantifying the invisible architecture of team coordination and defensive stability in real-time.

---

## 🚀 The Winning Strategy
VisionPlay AI transforms raw video footage into actionable structural insights. By analyzing the "structural health" of a formation using advanced graph theory, the platform allows analysts to identify tactical fractures and lynchpin players before they impact the scoreboard.

### 🧠 Core Algorithms & Tactical Meaning
| Algorithm | Strategic Intelligence |
| :--- | :--- |
| **Graph Laplacian** | **Formation Entropy**: Measures the "chaos" vs. "order" of the team structure. |
| **Tarjan’s Algorithm** | **Lynchpin Isolation**: Identifies the single "Articulation Point" player whose neutralization fractures the team. |
| **Floyd-Warshall** | **Team Diameter**: Audits global compactness and spacing in real-time. |
| **Spectral Entropy** | **Stability Index**: Predicts the probability of defensive collapse during transitions. |

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 15 (App Router), **Bun Runtime**, Tailwind CSS, **Framer Motion** (Cinematic UI), **Recharts** (Data Visualization).
- **Computer Vision**: Python 3.10+, **YOLOv8** (Object Detection), OpenCV (Frame Processing).
- **Mathematical Engine**: **NetworkX** (Graph Theory), NumPy, SciPy.
- **Backend API**: FastAPI (High-performance WebSocket streaming).

---

## 🕹️ Platform Modules

### 1. Command Center (Dashboard) 🖥️
The nerve center of the platform. Features a **Live Player Intelligence Engine** table that cross-references YOLO kinematics with graph metrics.
- **Real-time Metrics**: Speed, Fatigue, Synergy Index, and Decision Quality.
- **Predictive Analytics**: Automated risk assessment for structural fractures.

### 2. Live Engine 📡
A high-fidelity tactical HUD that processes match footage in real-time.
- ** HUD Overlays**: Team classification (Green vs. White) and unique Node IDs.
- **Temporal Stability Analysis**: A dynamic timeline tracking Formation Entropy with variance stretching for precise anomaly detection.

### 3. Forensic Replay Lab 🔍
A tool for post-match audits that allows analysts to scrub through footage with frame-accurate precision.
- **Automated Event Detection**: Scans the timeline for entropy spikes and articulation vulnerabilities.
- **Audit Reports**: Instant generation of tactical intelligence reports based on AI-identified critical moments.

### 4. Tactical Sandbox (Simulations) 🏗️
An interactive environment where analysts can drag-and-drop players to test "what-if" scenarios.
- **Live Graph Feedback**: Formation Entropy updates in real-time as nodes are moved.
- **Ghost Formations**: Compare current positioning against the "original" YOLO-detected tactical setup.

### 5. Intelligence Reports 📄
A deep-dive audit tool for structural symmetry and formation flow.
- **Laplacian Eigenvalue Timelines**: Visualizes the stability of the match over time.
- **Articulation Node Audit**: A historical breakdown of which players acted as structural lynchpins.

---

## ⚡ Developer Setup

### 1. Frontend (Next.js + Bun)
```bash
# Install dependencies
bun install

# Start the dev server (includes automatic port cleanup)
bun dev
```

### 2. Vision Pipeline (Python)
```bash
cd visionplay-pipeline
# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run the detection pipeline to generate tactical data
python src/main.py
```

---

## 📁 Project Structure
```text
├── app/                  # Next.js App Router (Dashboard, Live, Replay, etc.)
├── components/           # Reusable UI components (Navbar, Glassmorphism cards)
├── public/
│   ├── data/             # AI-generated tactical_data.json
│   └── videos/           # Processed YOLO output videos
└── visionplay-pipeline/  # Core AI Engine
    ├── src/              # YOLO & Graph algorithms
    ├── input_videos/     # Raw match footage
    └── models/           # YOLOv8n weights
```

---

*Built with passion for the GDG Hackathon by Noah Menezes.*
