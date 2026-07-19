import math
import numpy as np

nodes = [
  (200, 500), (400, 200), (400, 400), (400, 600), (400, 800),
  (600, 300), (600, 500), (600, 700), (800, 200), (800, 500), (800, 800)
]
nodes = [(x*1920/800, y*1080/400) for x, y in nodes]

def laplacian_entropy(nodes, thresh):
    n = len(nodes)
    A = np.zeros((n, n))
    for i in range(n):
        for j in range(i+1, n):
            dxM = (nodes[i][0] - nodes[j][0]) / (1920/105)
            dyM = (nodes[i][1] - nodes[j][1]) / (1080/68)
            dM = math.hypot(dxM, dyM)
            if dM <= thresh:
                w = 1.0 / dM
                A[i][j] = A[j][i] = w
    
    L = np.diag(np.sum(A, axis=1)) - A
    eigs = np.linalg.eigvalsh(L)
    maxEig = max(max(eigs), 1e-9)
    expTerms = np.exp(2.0 * (eigs / maxEig))
    p = expTerms / np.sum(expTerms)
    
    H = -np.sum(p[p>0] * np.log2(p[p>0]))
    return min(1.0, H / math.log2(n)), np.sum(A>0)//2

print("Entropy 30m:", laplacian_entropy(nodes, 30))
print("Entropy 100m:", laplacian_entropy(nodes, 100))
