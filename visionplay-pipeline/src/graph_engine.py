import networkx as nx
import numpy as np
import logging
import os
import json
import httpx
from dotenv import load_dotenv

logger = logging.getLogger("graph-engine")

# Load environment variables
load_dotenv()

from ai_service import AIService

logger = logging.getLogger("graph-engine")

# ─── Stabilization Layers ───────────────────────────────────────────────────

class TacticalStabilizer:
    """
    Handles mathematical stabilization of the tactical entropy pipeline to reduce
    frame-to-frame jitter and improve tactical interpretability.
    """
    def __init__(self):
        self.prev_adj = None
        self.prev_entropy = 0.42
        self.gamma = 0.7  # Adjacency persistence
        self.alpha = 0.2  # Entropy smoothing
        self.k = 5.0      # Spectral Softmax k-factor
        self.beta = 0.15  # Compactness modulation factor

    def apply_adjacency_persistence(self, A_new):
        """A_t = gamma * A_prev + (1 - gamma) * A_new"""
        if self.prev_adj is None or self.prev_adj.shape != A_new.shape:
            self.prev_adj = A_new
            return A_new
        A_t = self.gamma * self.prev_adj + (1 - self.gamma) * A_new
        self.prev_adj = A_t
        return A_t

    def apply_temporal_smoothing(self, H_new):
        """H_smooth_t = alpha * H_t + (1 - alpha) * H_smooth_(t-1)"""
        H_smooth = self.alpha * H_new + (1 - self.alpha) * self.prev_entropy
        self.prev_entropy = H_smooth
        return H_smooth

    def spectral_softmax(self, eigenvalues):
        """p_i = exp(k * lambda_i) / sum(exp(k * lambda_j))"""
        # Subtract max for numerical stability (avoid Overflow)
        shifted_eigs = self.k * (eigenvalues - np.max(eigenvalues))
        exp_eigs = np.exp(shifted_eigs)
        return exp_eigs / (np.sum(exp_eigs) + 1e-10)

    def compute_compactness(self, player_positions):
        """C = 1 / (1 + spatial_variance)"""
        if len(player_positions) < 2: return 1.0
        pos_array = np.array(player_positions)
        variance = np.mean(np.var(pos_array, axis=0))
        # Normalize variance to pitch-relative scale (assuming 1920x1080)
        norm_variance = variance / 50000 
        return 1.0 / (1.0 + norm_variance)

    def calibrate_output(self, H_smooth, compactness):
        """H_adj = H_smooth * (1 - beta * C) with safe normalization"""
        H_adj = H_smooth * (1.0 - self.beta * compactness)
        # Smooth scaling to target tactical ranges
        # Organized: 0.2-0.45 | Neutral: 0.45-0.7 | Chaotic: >0.7
        return np.clip(H_adj, 0.1, 1.0)

stabilizer = TacticalStabilizer()

def compute_tactical_metrics(players):
    """
    Computes graph-based metrics for a set of players.
    'players' should be a list of dicts with {id, center: [x, y], team}
    """
    if not players:
        return {
            "entropy": 0,
            "articulation_points": [],
            "diameter": 0,
            "diameter_nodes": [],
            "recommendation": "Awaiting tactical data..."
        }

    # 1. Build Graph
    G = nx.Graph()
    team_a_nodes = []
    
    for p in players:
        # Skip invalid/noise detections at origin (0,0) or missing ID
        if p.get('id') is None: continue
        center = p.get('center', [0, 0])
        if center[0] <= 0 and center[1] <= 0: continue

        p_id = str(p['id'])
        team = p.get('team', 'unknown')
        G.add_node(p_id, pos=center, team=team)
        
        # Collect nodes for the active team (green or white)
        # Default to green if team is unknown but we have nodes
        if team == 'green' or team == 'white':
            team_a_nodes.append(p_id)

    # We mostly care about the primary team's stability
    # In a real scenario, this would be passed as a parameter
    subG = G.subgraph(team_a_nodes)
    
    # Add edges based on proximity
    threshold = 160
    for i, n1 in enumerate(team_a_nodes):
        for n2 in team_a_nodes[i+1:]:
            p1 = G.nodes[n1]['pos']
            p2 = G.nodes[n2]['pos']
            dist = np.linalg.norm(np.array(p1) - np.array(p2))
            if dist < threshold:
                weight=np.exp(-dist / 120)
                G.add_edge(n1, n2, weight=weight)

    # 2. Formation Entropy with Stabilization Layers
    entropy = 0
    raw_entropy = 0
    calibrated_entropy = 0
    
    if len(subG.nodes) > 1:
        try:
            # 2.1 Adjacency Persistence
            A_new = nx.to_numpy_array(subG, weight='weight')
            A_stabilized = stabilizer.apply_adjacency_persistence(A_new)
            
            # 2.2 Construct Stabilized Laplacian
            D = np.diag(np.sum(A_stabilized, axis=1))
            L = D - A_stabilized
            
            # 2.3 Compute Eigenvalues
            eigs = np.linalg.eigvals(L).real
            eigs = np.sort(eigs[eigs > 1e-10])
            
            if len(eigs) > 0:
                # 2.4 Spectral Softmax Normalization
                p = stabilizer.spectral_softmax(eigs)
                
                # 2.5 Compute Shannon Entropy
                raw_entropy = -np.sum(p * np.log2(p + 1e-10))
                # Base normalization for spectral range
                raw_entropy = min(1.0, raw_entropy / (np.log2(len(eigs)) + 1e-10))
                
                # 2.6 Temporal Smoothing
                H_smooth = stabilizer.apply_temporal_smoothing(raw_entropy)
                
                # 2.7 Compactness Modulation
                player_positions = [G.nodes[n]['pos'] for n in team_a_nodes]
                compactness = stabilizer.compute_compactness(player_positions)
                
                # 2.8 Safe Output Normalization
                calibrated_entropy = stabilizer.calibrate_output(H_smooth, compactness)
                
                # 2.9 Density Penalty
                density = nx.density(subG)
                calibrated_entropy *= (1 - 0.4 * density)
                entropy = calibrated_entropy
                
        except Exception as e:
            logger.error(f"Stabilized Entropy calculation failed: {e}")
            raw_entropy = 0.5
            calibrated_entropy = 0.5

    # 3. Structural Vulnerability (Articulation Points)
    articulation_points = []
    if len(subG.nodes) > 1:
        articulation_points = list(nx.articulation_points(subG))

    # 4. Global Connectivity (Diameter via Floyd-Warshall)
    diameter = 0
    if len(subG.nodes) > 1:
        try:
            path_lengths = dict(nx.all_pairs_dijkstra_path_length(subG))
            # Flatten dict of dicts and get max
            all_distances = [d for targets in path_lengths.values() for d in targets.values()]
            if all_distances:
                diameter = max(all_distances)
        except:
            diameter = 0

    return {
        "entropy": float(entropy),
        "raw_entropy": round(float(raw_entropy), 4),
        "calibrated_entropy": round(float(calibrated_entropy), 4),
        "articulation_points": articulation_points,
        "diameter": float(diameter),
        "diameter_nodes": [],
        "recommendation": "Maintain structure" if entropy < 0.6 else "Consolidate lines"
    }

async def get_ai_recommendation(metrics):
    """
    Calls Google Gemini to get a tactical recommendation.
    """
    prompt = f"""
    Analyze these football tactical metrics:
    - Formation Entropy: {metrics['entropy']:.2f}
    - Articulation Points: {metrics['articulation_points']}
    - Team Diameter: {metrics['diameter']:.2f}
    
    Provide a one-sentence, high-impact tactical recommendation in uppercase for a coach.
    Example: 'COMPRESS MIDFIELD SPACING TO REDUCE PASSING LANE DISTANCE.'
    """
    
    try:
        response = await AIService.generate_response(prompt)
        return response if response else "MAINTAIN FORMATION COMPACTNESS."
    except Exception as e:
        logger.error(f"AI recommendation failed: {e}")
        return "MAINTAIN FORMATION COMPACTNESS."

async def generate_full_audit_report(summary_metrics):
    """
    Generates a comprehensive tactical audit report using Google Gemini.
    """
    prompt = f"""
    Analyze these match metrics from VisionPlay AI:
    - Avg Formation Entropy: {summary_metrics['avg_entropy']:.2f}
    - Peak Team Diameter: {summary_metrics['peak_diameter']:.1f}
    - Total Structural Fractures: {summary_metrics['total_fractures']}
    - Lynchpin Nodes: {summary_metrics['lynchpins']}
    
    Provide a professional tactical forensic report in RAW JSON format. 
    Use exactly these keys:
    1. "summary": 5-sentence strategic summary.
    2. "defensive_stability": 4-sentence analysis on spatial vulnerabilities.
    3. "offensive_transition": 4-sentence analysis on lynchpin exploitation.
    4. "key_takeaways": array of 4 specific technical observations.
    5. "strategic_advice": 3-sentence recommendation for drills.
    
    RESPOND ONLY WITH VALID JSON.
    """
    
    try:
        response_text = await AIService.generate_response(prompt, json_mode=True)
        if response_text:
            return json.loads(response_text)
        raise Exception("No response from AI Service")
    except Exception as e:
        logger.error(f"AI Audit generation failed: {e}")
        return {
            "summary": "AI service unavailable. Structural instability detected during transitions.",
            "defensive_stability": "Defensive structure was generally compact but failed to generate detailed analysis.",
            "offensive_transition": "Transitions relied heavily on isolated movements.",
            "key_takeaways": ["High entropy at peak phases", "Lynchpin vulnerability noted"],
            "strategic_advice": "Focus on horizontal compactness drills."
        }
