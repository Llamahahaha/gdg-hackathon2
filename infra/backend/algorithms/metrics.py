import networkx as nx
import numpy as np
import logging

logger = logging.getLogger("tactical-metrics")

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
        self.k = 2.0      # Spectral Softmax k-factor
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

    def compute_compactness(self, G):
        """C = 1 / (1 + spatial_variance)"""
        positions = [d['pos'] for n, d in G.nodes(data=True) if 'pos' in d]
        if len(positions) < 2: return 1.0
        pos_array = np.array(positions)
        variance = np.mean(np.var(pos_array, axis=0))
        # Normalize variance to pitch-relative scale (assuming 1920x1080 approx)
        norm_variance = variance / 50000 
        return 1.0 / (1.0 + norm_variance)

    def calibrate_output(self, H_smooth, compactness):
        """H_adj = H_smooth * (1 - beta * C) with safe normalization"""
        H_adj = H_smooth * (1.0 - self.beta * compactness)
        # Organized: 0.2-0.45 | Neutral: 0.45-0.7 | Chaotic: >0.7
        # Smooth scaling to keep within bounded tactical range
        return np.clip(H_adj, 0.1, 1.0)

# Global stabilizer instance
stabilizer = TacticalStabilizer()


def compute_diameter(G):
    if nx.is_connected(G):
        return nx.diameter(G)
    return 0

def compute_avg_shortest_path(G):
    if nx.is_connected(G):
        return nx.average_shortest_path_length(G)
    return 0

def compute_centrality(G):
    centrality = nx.degree_centrality(G)
    return [
        {"id": k, "score": v}
        for k, v in sorted(centrality.items(), key=lambda x: -x[1])[:3]
    ]

def compute_entropy(G):
    """
    Computes Stabilized Spectral Entropy using the tactical calibration layers.
    """
    if len(G.nodes) < 2:
        return 0.42 # Baseline ordered state

    try:
        # 1. Adjacency Persistence
        A_new = nx.to_numpy_array(G, weight='weight')
        A_stabilized = stabilizer.apply_adjacency_persistence(A_new)
        
        # 2. Construct Laplacian Matrix
        D = np.diag(np.sum(A_stabilized, axis=1))
        L = D - A_stabilized
        
        # 3. Compute Eigenvalues (Laplacian Spectrum)
        eigs = np.linalg.eigvals(L).real
        eigs = np.sort(eigs[eigs > 1e-10])
        
        if len(eigs) == 0:
            return 0.42

        # 4. Spectral Softmax Normalization
        p = stabilizer.spectral_softmax(eigs)
        
        # 5. Shannon Entropy Calculation
        raw_entropy = -np.sum(p * np.log2(p + 1e-10))
        # Normalize by log2(N) to stay in 0-1 range before calibration
        raw_entropy = min(1.0, raw_entropy / (np.log2(len(eigs)) + 1e-10))
        
        # 6. Temporal Smoothing
        H_smooth = stabilizer.apply_temporal_smoothing(raw_entropy)
        
        # 7. Compactness Modulation
        compactness = stabilizer.compute_compactness(G)
        
        # 8. Safe Output Normalization
        entropy = stabilizer.calibrate_output(H_smooth, compactness)
        
        return round(float(entropy), 4)

    except Exception as e:
        logger.error(f"Entropy calibration failed: {e}")
        return 0.5 # Safe neutral fallback