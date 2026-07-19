# ⚽ FieldTheory AI (VisionPlay): Spatio-Temporal Graph Intelligence Engine

**FieldTheory AI (VisionPlay)** is an elite-tier tactical intelligence platform designed for high-stakes sports analytics. Moving beyond traditional event-based statistics (like pass completion or distance covered), FieldTheory AI models the sporting pitch as a **dynamic spatio-temporal graph**, quantifying the invisible architecture of team coordination, defensive stability, and tactical entropy in real-time.

---

## 🔬 Core Methodology: Sports as a Network Coordination Problem

At the heart of the platform is the paradigm shift that team sports are fundamentally a network coordination problem. We extract player kinematics via Computer Vision and translate them into a mathematical graph representation.

*   **Nodes ($V$)**: Represent individual players on the pitch.
*   **Edges ($E$)**: Represent tactical relationships between players (spatial proximity, pass probability, velocity alignment).
*   **Weights ($W$)**: Dynamic values that fluctuate based on the structural integrity between two nodes.

By mapping a football match into a temporal weighted graph $G(V, E, W, t)$, we can apply advanced graph theory algorithms to measure "structural health" and predict tactical collapses before they occur.

---

## 🧮 Applied Computer Science & Algorithms

The intelligence engine utilizes several core computer science algorithms to derive actionable insights from the graph data.

### 1. The Graph Laplacian & Spectral Entropy
*   **Feature**: **Formation Entropy Engine**
*   **Concept**: We utilize the **Graph Laplacian matrix** ($L = D - A$, where $D$ is the degree matrix and $A$ is the adjacency matrix) to evaluate the overall stability of the team.
*   **Application**: By analyzing the eigenvalues (specifically the algebraic connectivity or Fiedler value), we calculate **Formation Entropy**. A lower Fiedler value indicates that the graph is becoming disconnected (i.e., the formation is stretching or breaking). The engine visualizes this in real-time, coloring stable zones blue and unstable/chaotic zones red. It predicts overload risks when entropy breaches a defined threshold.

### 2. Tarjan’s Algorithm for Biconnected Components
*   **Feature**: **Lynchpin / Articulation Point Detection**
*   **Concept**: In graph theory, an **Articulation Point** (or cut vertex) is a node whose removal increases the number of connected components in the graph. 
*   **Application**: Using Tarjan's Algorithm (via NetworkX), the system identifies which player is holding the formation together at any given millisecond. If removing "Player #8" splits the defense from the midfield, Player #8 is flagged as a critical lynchpin. This is crucial for interactive neutralization simulations.

### 3. Floyd-Warshall Algorithm
*   **Feature**: **Team Diameter & Connectivity**
*   **Concept**: The Floyd-Warshall algorithm computes the shortest paths between all pairs of nodes in a weighted graph. The maximum shortest path represents the **Graph Diameter**.
*   **Application**: In sports context, the graph diameter represents **Team Compactness** or tactical spread. If the diameter expands too rapidly, it indicates that the defensive or offensive block is losing its compactness, exposing passing lanes to the opposition.

### 4. Spatio-Temporal Weighting Heuristics
*   **Application**: Edge weights are calculated using a combination of Euclidean distance, Delaunay triangulation (for natural passing lanes), and velocity vectors. The dynamic weighting system ensures the graph accurately reflects real-world tactical trust and spatial pressure, rather than just static coordinates.

---

## ⚙️ Technical Architecture

The platform is designed to emulate an enterprise-grade tactical operating system, combining real-time streaming with cinematic UI elements.

### Frontend (Mission Control)
*   **Framework**: **Next.js 16 (App Router)** with **TypeScript**, running on the **Bun** runtime (using Webpack bundler).
*   **Styling**: **Tailwind CSS** for a dark, premium, military-grade UI (glassmorphism, vibrant accents).
*   **Animations**: **Framer Motion** to provide fluid transitions, kinetic ghosting effects, and micro-animations that make the interface feel alive.
*   **Data Visualization**: **Recharts** for real-time temporal stability analysis, displaying telemetry graphs and entropy spikes over time.
*   **State Management**: Context API (`TacticalContext`, `AuthContext`) for managing WebSocket payloads, timeline scrubbing, and mock authentication (bypassing suspended Firebase keys for demo purposes).

### Backend (Intelligence Engine)
*   **Framework**: **FastAPI** (Python) for asynchronous, high-performance data processing.
*   **Streaming**: **WebSockets** stream processed kinematic and graph data to the frontend at high frame rates, giving the illusion of a live tactical feed.
*   **Graph Engine**: **NetworkX** handles all complex graph computations (Laplacian, Articulation Points, Dijkstra/Floyd-Warshall) continuously on the server side.

### Computer Vision Pipeline (Pre-processing)
*   **Detection**: **YOLOv8** identifies and tracks players and the ball across frames.
*   **Processing**: **OpenCV** extracts bounding boxes, calculates centroids, and performs team classification based on color histograms (e.g., Green vs. White).
*   *Note: For the purpose of hackathon demonstrations, raw video is preprocessed, and the telemetry is cached and streamed "live" via WebSockets to ensure zero latency and a flawless cinematic presentation.*

### Database & Cloud
*   **Storage**: **Supabase** (PostgreSQL) is used to persist match telemetry (`match_telemetry` table). When a live session is halted, the engine automatically saves the entire temporal array of frames, allowing for later analysis in the Replay Lab.

---

## 🕹️ Platform Features

1.  **Live Intelligence Engine**: A high-fidelity tactical HUD. As footage plays, the system overlays the dynamic graph, visualizing nodes, edges, and real-time entropy. It identifies Phase Changes (High Press, Mid Block, Low Block) based on the center of mass of the nodes.
2.  **Command Center (Dashboard)**: The enterprise overview featuring high-level KPIs like Synergy Index, Uptime, Active Nodes, and comparative bar charts for home/away formation variance.
3.  **Tactical Sandbox (Interactive Neutralization)**: A "What-If" simulator. Analysts can click to "neutralize" a lynchpin player. The system recalculates the graph in real-time, showing how the connectivity drops and the formation fractures without that node.
4.  **Replay Lab**: Post-match forensics. A scrubbable timeline of the match where analysts can seek to specific points of structural collapse (entropy spikes) and analyze the exact positioning that led to the vulnerability.

---

## 🚀 Deployment & Running Locally

### 1. Launching the Backend (Python / FastAPI)
The Python engine runs the WebSocket server and processes the simulated graph data.
```bash
# Ensure Python 3.10+ is installed. Activate your virtual environment if preferred.
bash dev-python.sh
# The Uvicorn server will start on http://0.0.0.0:8000
```

### 2. Launching the Frontend (Next.js / Bun)
The frontend connects to the local WebSocket server to stream the tactical data.
```bash
# Install dependencies
bun install

# Start the Next.js development server (using Webpack to avoid Turbopack panics)
bun run dev
```

*The application will be available at `http://localhost:3000`.*
