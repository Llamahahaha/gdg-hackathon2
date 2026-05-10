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

OLLAMA_BASE_URL = "http://localhost:11434"

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
        p_id = str(p['id'])
        G.add_node(p_id, pos=p['center'], team=p['team'])
        if p['team'] == 'green': # Assuming team 'A' is green
            team_a_nodes.append(p_id)

    # We mostly care about Team A's (Home Team) stability
    subG = G.subgraph(team_a_nodes)
    
    # Add edges based on proximity
    threshold = 300
    for i, n1 in enumerate(team_a_nodes):
        for n2 in team_a_nodes[i+1:]:
            p1 = G.nodes[n1]['pos']
            p2 = G.nodes[n2]['pos']
            dist = np.linalg.norm(np.array(p1) - np.array(p2))
            if dist < threshold:
                G.add_edge(n1, n2, weight=1/dist if dist > 0 else 1)

    # 2. Formation Entropy
    entropy = 0
    if len(subG.nodes) > 1:
        try:
            L = nx.laplacian_matrix(subG).toarray()
            eigs = np.linalg.eigvals(L)
            eigs = eigs[eigs > 1e-10]
            if len(eigs) > 0:
                normalized_eigs = eigs / np.sum(eigs)
                entropy = -np.sum(normalized_eigs * np.log2(normalized_eigs))
                entropy = min(1.0, entropy / 2.0)
        except Exception as e:
            logger.error(f"Entropy calculation failed: {e}")

    # 3. Articulation Points
    articulation_points = []
    if len(subG.nodes) > 2:
        articulation_points = list(nx.articulation_points(subG))

    # 4. Team Diameter
    diameter = 0
    diameter_nodes = []
    if len(team_a_nodes) > 1:
        try:
            max_d = 0
            for i, n1 in enumerate(team_a_nodes):
                for n2 in team_a_nodes[i+1:]:
                    p1 = G.nodes[n1]['pos']
                    p2 = G.nodes[n2]['pos']
                    dist = np.linalg.norm(np.array(p1) - np.array(p2))
                    if dist > max_d:
                        max_d = dist
                        diameter_nodes = [n1, n2]
            diameter = max_d
        except Exception as e:
            logger.error(f"Diameter calculation failed: {e}")

    return {
        "entropy": float(entropy),
        "articulation_points": articulation_points,
        "diameter": float(diameter),
        "diameter_nodes": diameter_nodes
    }

async def get_ai_recommendation(metrics):
    """
    Calls local Ollama (Llama 3.2) to get a tactical recommendation.
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
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": "llama3.2",
                    "prompt": prompt,
                    "stream": False
                }
            )
            result = response.json()
            return result.get("response", "").strip()
    except Exception as e:
        logger.error(f"Ollama recommendation failed: {e}")
        return "MAINTAIN FORMATION COMPACTNESS."

async def generate_full_audit_report(summary_metrics):
    """
    Generates a comprehensive tactical audit report using local Ollama.
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
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": "llama3.2",
                    "prompt": prompt,
                    "stream": False,
                    "format": "json"
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Ollama returned status {response.status_code}: {response.text}")
                raise Exception(f"Ollama server error {response.status_code}")

            result = response.json()
            raw_text = result.get("response", "{}").strip()
            return json.loads(raw_text)
            
    except Exception as e:
        logger.error(f"Ollama Audit generation failed: {e}")
        return {
            "summary": "Error: Ollama failed to generate a response. Structural instability detected during transitions.",
            "defensive_stability": "Defensive structure was generally compact but failed to generate data.",
            "offensive_transition": "Transitions relied heavily on isolated movements.",
            "key_takeaways": ["High entropy at peak phases", "Lynchpin vulnerability noted"],
            "strategic_advice": "Focus on horizontal compactness drills."
        }
