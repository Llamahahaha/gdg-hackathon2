import networkx as nx
import math

# Distance threshold for connecting players in the adjacency graph.
# Players within this pixel-space radius are treated as having a passing link.
DIST_THRESHOLD = 30

def build_graph(players):
    """
    Build a proximity-based adjacency graph from a list of player dicts.
    Each player must have keys: id, x, y
    An edge is added between two players if their Euclidean distance < DIST_THRESHOLD.
    Edge weight = 1 / distance (closer = stronger connection).
    """
    G = nx.Graph()

    for p in players:
        G.add_node(p["id"], pos=(p["x"], p["y"]))

    for i in players:
        for j in players:
            if i["id"] == j["id"]:
                continue

            dist = math.dist((i["x"], i["y"]), (j["x"], j["y"]))

            if dist < DIST_THRESHOLD:
                weight = 1 / (dist + 1e-5)  # avoid division by zero
                G.add_edge(i["id"], j["id"], weight=weight)

    return G
