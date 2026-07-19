// graphMath.ts
// Real graph-theoretic implementations backing the Tactical Sandbox.
// Replaces the placeholder "spread / 50" entropy and the hardcoded
// Max Path / Centrality formulas with actual computations.

export interface Node2D {
  id: string | number;
  x: number;
  y: number;
}

const K_SOFTMAX = 2.0;          // spectral softmax temperature

export interface GraphConfig {
  pixelsPerMeterX: number;
  pixelsPerMeterY: number;
  proximityThresholdM: number;
}

// ── 1. Build a weighted proximity adjacency matrix ──────────────────
// Edge weight = 1/distance (closer players = stronger structural link),
// only for pairs within PROXIMITY_THRESHOLD_M (an unconnected pair has weight 0).
export function buildAdjacency(nodes: Node2D[], config: GraphConfig): number[][] {
  const n = nodes.length;
  const A = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dxM = (nodes[i].x - nodes[j].x) / config.pixelsPerMeterX;
      const dyM = (nodes[i].y - nodes[j].y) / config.pixelsPerMeterY;
      const dM = Math.hypot(dxM, dyM);
      if (dM > 0 && dM <= config.proximityThresholdM) {
        const w = 1 / dM;
        A[i][j] = w;
        A[j][i] = w;
      }
    }
  }
  return A;
}

// ── 2. Graph Laplacian L = D - A ─────────────────────────────────────
function buildLaplacian(A: number[][]): number[][] {
  const n = A.length;
  const L = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    let degree = 0;
    for (let j = 0; j < n; j++) {
      degree += A[i][j];
      if (i !== j) L[i][j] = -A[i][j];
    }
    L[i][i] = degree;
  }
  return L;
}

// ── 3. Eigenvalues of a symmetric matrix via the Jacobi method ──────
// Fine for n <= ~22 (one team, or both teams); converges in a handful
// of sweeps for well-conditioned Laplacians.
export function jacobiEigenvalues(matrixIn: number[][], maxSweeps = 100, tol = 1e-9): number[] {
  const n = matrixIn.length;
  const M = matrixIn.map((row) => [...row]);

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let offDiagSum = 0;
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) offDiagSum += M[i][j] * M[i][j];
    if (offDiagSum < tol) break;

    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(M[p][q]) < 1e-12) continue;
        const theta = (M[q][q] - M[p][p]) / (2 * M[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;

        const Mpp = M[p][p], Mqq = M[q][q], Mpq = M[p][q];
        M[p][p] = c * c * Mpp - 2 * s * c * Mpq + s * s * Mqq;
        M[q][q] = s * s * Mpp + 2 * s * c * Mpq + c * c * Mqq;
        M[p][q] = 0;
        M[q][p] = 0;

        for (let i = 0; i < n; i++) {
          if (i !== p && i !== q) {
            const Mip = M[i][p], Miq = M[i][q];
            M[i][p] = c * Mip - s * Miq;
            M[p][i] = M[i][p];
            M[i][q] = s * Mip + c * Miq;
            M[q][i] = M[i][q];
          }
        }
      }
    }
  }
  return M.map((row, i) => row[i]);
}

// ── 4. Spectral softmax → Shannon entropy, normalized to [0,1] ──────
export function laplacianEntropy(nodes: Node2D[], config: GraphConfig): number {
  const n = nodes.length;
  if (n < 2) return 0;

  const A = buildAdjacency(nodes, config);
  const L = buildLaplacian(A);
  const eigenvalues = jacobiEigenvalues(L);

  const maxEig = Math.max(...eigenvalues, 1e-9);
  const expTerms = eigenvalues.map((lam) => Math.exp(K_SOFTMAX * (lam / maxEig))); // scaled for numerical stability
  const sumExp = expTerms.reduce((a, b) => a + b, 0);
  const p = expTerms.map((e) => e / sumExp);

  const H = -p.reduce((acc, pi) => acc + (pi > 0 ? pi * Math.log2(pi) : 0), 0);
  const Hmax = Math.log2(n); // theoretical ceiling for n eigenvalues
  return Math.min(1, H / Hmax); // normalized 0 = ordered, 1 = maximally disordered
}

// ── 5. Team diameter via Floyd-Warshall on the proximity graph ──────
// Returns the graph eccentricity-based diameter in METERS.
// If the graph is disconnected, returns the diameter of the largest
// connected component (fragmentation itself should be flagged separately).
export function floydWarshallDiameter(nodes: Node2D[], config: GraphConfig): number {
  const n = nodes.length;
  if (n < 2) return 0;

  const A = buildAdjacency(nodes, config);
  const INF = Infinity;
  const dist = Array.from({ length: n }, () => new Array(n).fill(INF));
  for (let i = 0; i < n; i++) {
    dist[i][i] = 0;
    for (let j = 0; j < n; j++) {
      if (A[i][j] > 0) dist[i][j] = 1 / A[i][j]; // weight was 1/distance, invert back to distance (meters)
    }
  }

  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (dist[i][k] + dist[k][j] < dist[i][j]) dist[i][j] = dist[i][k] + dist[k][j];

  let diameter = 0;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (isFinite(dist[i][j]) && dist[i][j] > diameter) diameter = dist[i][j];

  return diameter; // meters
}

// ── 6. Eigenvector centrality via power iteration ───────────────────
// Returns per-node centrality scores normalized so the max = 1.
export function eigenvectorCentrality(nodes: Node2D[], config: GraphConfig, iterations = 100): number[] {
  const n = nodes.length;
  if (n < 2) return nodes.map(() => 0);

  const A = buildAdjacency(nodes, config);
  let v = new Array(n).fill(1 / Math.sqrt(n));

  for (let iter = 0; iter < iterations; iter++) {
    const next = new Array(n).fill(0);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) next[i] += A[i][j] * v[j];

    const norm = Math.sqrt(next.reduce((acc, x) => acc + x * x, 0)) || 1;
    v = next.map((x) => x / norm);
  }

  const maxV = Math.max(...v, 1e-9);
  return v.map((x) => x / maxV); // normalize so top player = 1.0
}

export function topCentrality(nodes: Node2D[], config: GraphConfig): number {
  const scores = eigenvectorCentrality(nodes, config);
  return scores.length ? Math.max(...scores) : 0;
}
