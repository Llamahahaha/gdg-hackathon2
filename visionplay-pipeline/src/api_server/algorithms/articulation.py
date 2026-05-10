import networkx as nx


def get_articulation_points(G):
    """
    Returns articulation points (cut vertices / 'lynchpin' players) of the graph
    using NetworkX's implementation of Tarjan's algorithm.
    These are nodes whose removal would disconnect the team's passing network.
    """
    return list(nx.articulation_points(G))
