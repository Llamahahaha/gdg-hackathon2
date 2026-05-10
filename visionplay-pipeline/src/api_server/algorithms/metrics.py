import networkx as nx


def compute_diameter(G):
    """
    Graph diameter = longest shortest path between any two nodes.
    Returns 0 if the graph is not connected (no valid path spans the full team).
    """
    if nx.is_connected(G):
        return nx.diameter(G)
    return 0


def compute_avg_shortest_path(G):
    """
    Average shortest path length across all connected pairs.
    Lower = more compact passing network.
    Returns 0 if graph is not connected.
    """
    if nx.is_connected(G):
        return nx.average_shortest_path_length(G)
    return 0


def compute_centrality(G):
    """
    Degree centrality for each node, sorted descending.
    Returns the top 3 most-connected (central) players.
    """
    centrality = nx.degree_centrality(G)
    return [
        {"id": k, "score": round(v, 4)}
        for k, v in sorted(centrality.items(), key=lambda x: -x[1])[:3]
    ]
