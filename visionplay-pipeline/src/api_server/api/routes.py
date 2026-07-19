from fastapi import APIRouter
from api_server.algorithms.graph_builder import build_graph
from api_server.algorithms.articulation import get_articulation_points
from api_server.algorithms.metrics import compute_diameter, compute_avg_shortest_path, compute_centrality
from api_server.algorithms.entropy import compute_entropy
from api_server.algorithms.recommendations import get_recommendations
from validation import run_all_validations

router = APIRouter()


@router.post("/validate")
def validate(config: dict = None):
    """
    Run all Tier 1 and Tier 2 validation tests with optional configuration.
    Returns a dict of test IDs to result objects with status PASS/FAIL.
    """
    if config is None:
        config = {}
        
    results = run_all_validations(config)
    total = len(results)
    passed = sum(1 for r in results.values() if r.get("status") == "PASS")
    return {
        "summary": {
            "total": total,
            "passed": passed,
            "failed": total - passed,
            "pass_rate": round(passed / total * 100, 1) if total > 0 else 0
        },
        "tests": results
    }


@router.post("/analyze")
def analyze(data: dict):
    """
    Core graph analysis endpoint.

    Accepts a JSON payload: { "players": [ { "id": str, "x": float, "y": float }, ... ] }

    Returns:
        - entropy: formation disorder index (0–1)
        - stability: "stable" or "critical"
        - diameter: graph diameter (longest shortest path)
        - avg_shortest_path: mean path length across all pairs
        - articulation_points: list of lynchpin player IDs
        - central_players: top 3 players by degree centrality
        - edges: all graph edges with weights
        - recommendations: list of tactical suggestions
    """
    players = data.get("players", [])

    G = build_graph(players)

    entropy = compute_entropy(players)
    diameter = compute_diameter(G)
    avg_path = compute_avg_shortest_path(G)
    articulation = get_articulation_points(G)
    central = compute_centrality(G)

    recs = get_recommendations(entropy, diameter)

    edges = [
        {
            "source": u,
            "target": v,
            "weight": round(d["weight"], 4)
        }
        for u, v, d in G.edges(data=True)
    ]

    return {
        "entropy": entropy,
        "stability": "critical" if entropy > 0.7 else "stable",
        "diameter": diameter,
        "avg_shortest_path": avg_path,
        "articulation_points": articulation,
        "central_players": central,
        "edges": edges,
        "recommendations": recs
    }
