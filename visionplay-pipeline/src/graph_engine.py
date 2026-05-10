import networkx as nx
import numpy as np
import logging
import os
import json
from google import generativeai as genai
from dotenv import load_dotenv

logger = logging.getLogger("graph-engine")

# Load environment variables from .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
else:
    model = None

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
    
    # Add edges based on proximity (threshold: 300 pixels on 1080p roughly translates to tactical proximity)
    threshold = 300
    for i, n1 in enumerate(team_a_nodes):
        for n2 in team_a_nodes[i+1:]:
            p1 = G.nodes[n1]['pos']
            p2 = G.nodes[n2]['pos']
            dist = np.linalg.norm(np.array(p1) - np.array(p2))
            if dist < threshold:
                G.add_edge(n1, n2, weight=1/dist if dist > 0 else 1)

    # 2. Formation Entropy (Laplacian Eigenvalues)
    entropy = 0
    if len(subG.nodes) > 1:
        try:
            L = nx.laplacian_matrix(subG).toarray()
            eigs = np.linalg.eigvals(L)
            # Filter zero eigenvalues and compute normalized entropy
            eigs = eigs[eigs > 1e-10]
            if len(eigs) > 0:
                normalized_eigs = eigs / np.sum(eigs)
                entropy = -np.sum(normalized_eigs * np.log2(normalized_eigs))
                entropy = min(1.0, entropy / 2.0) # Scale to 0-1 range for HUD
        except Exception as e:
            logger.error(f"Entropy calculation failed: {e}")

    # 3. Articulation Points (Tarjan's)
    articulation_points = []
    if len(subG.nodes) > 2:
        articulation_points = list(nx.articulation_points(subG))

    # 4. Team Diameter (Floyd-Warshall)
    diameter = 0
    diameter_nodes = []
    if len(subG.nodes) > 1:
        try:
            # Floyd-Warshall for all pairs shortest paths
            path_lengths = dict(nx.all_pairs_dijkstra_path_length(subG, weight='weight'))
            
            max_d = 0
            for u, targets in path_lengths.items():
                for v, d in targets.items():
                    if d > max_d and d != float('inf'):
                        max_d = d
                        diameter_nodes = [u, v]
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
    Calls Gemini API to get a tactical recommendation based on metrics.
    """
    if not model:
        # Fallback if no API key
        if metrics['entropy'] > 0.7:
            return "Formation entropy critical. Compress defensive lines immediately."
        if metrics['articulation_points']:
            return f"Lynchpin detected (Node {metrics['articulation_points'][0]}). Protect passing lanes."
        return "Tactical structure stable. Maintain current pressing intensity."

    prompt = f"""
    You are an elite football tactical AI. Analyze these metrics:
    - Formation Entropy: {metrics['entropy']:.2f} (0=perfect, 1=chaos)
    - Articulation Points (Lynchpins): {metrics['articulation_points']}
    - Team Diameter: {metrics['diameter']:.2f}
    
    Provide a one-sentence, high-impact tactical recommendation in uppercase.
    Example: 'COMPRESS MIDFIELD SPACING TO REDUCE PASSING LANE DISTANCE.'
    """
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        # Dynamic fallbacks based on real data
        entropy = metrics.get('entropy', 0)
        diameter = metrics.get('diameter', 0)
        aps = metrics.get('articulation_points', [])
        
        recs = []
        if entropy > 0.6:
            recs.append(f"HIGH ENTROPY ({entropy:.2f}): COMPRESS DEFENSIVE LINES TO NEUTRALIZE OVERLOAD.")
            recs.append("SYSTEM CHAOTIC: RE-ESTABLISH MIDFIELD SHAPE IMMEDIATELY.")
        else:
            recs.append(f"STABLE ENTROPY ({entropy:.2f}): MAINTAIN PRESSING INTENSITY.")
            recs.append("STRUCTURE SECURE: INITIATE FLANK OVERLOADS.")
            
        if aps:
            recs.append(f"LYNCHPIN VULNERABILITY AT NODE {aps[0]}: PROTECT CENTRAL PASSING LANES.")
            recs.append(f"STRUCTURAL FRACTURE RISK: REINFORCE SUPPORT AROUND PLAYER {aps[0]}.")
            
        if diameter > 500:
            recs.append(f"TEAM DIAMETER CRITICAL ({diameter:.1f}px): CLOSE DOWN INTER-LINE SPACES.")
        elif diameter > 0:
            recs.append(f"COMPACTNESS OPTIMAL ({diameter:.1f}px): PREPARE FOR RAPID TRANSITIONS.")
            
        import random
        return random.choice(recs)
