import { jacobiEigenvalues } from './visionplay-pipeline/src/graphMath.ts';

function computeH(eigenvalues: number[], K: number) {
  const n = eigenvalues.length;
  const maxEig = Math.max(...eigenvalues, 1e-9);
  const expTerms = eigenvalues.map((lam) => Math.exp(K * (lam / maxEig)));
  const sumExp = expTerms.reduce((a, b) => a + b, 0);
  const p = expTerms.map((e) => e / sumExp);
  const H = -p.reduce((acc, pi) => acc + (pi > 0 ? pi * Math.log2(pi) : 0), 0);
  const Hmax = Math.log2(n);
  return H / Hmax;
}

// Complete graph of 11 nodes (all non-zero eigenvalues are 11, one is 0)
// Actually, Laplacian of unweighted complete graph: eigenvalues are n (x n-1) and 0.
const eigsComplete = Array(10).fill(11);
eigsComplete.push(0);

// Star graph of 11 nodes: eigenvalues are 11 (x1), 1 (x9), 0 (x1)
const eigsStar = [11, ...Array(9).fill(1), 0];

// Path graph of 11 nodes: eigenvalues are 2 - 2*cos(pi * k / n) for k=0..n-1
const eigsPath = Array.from({length: 11}, (_, k) => 2 - 2 * Math.cos(Math.PI * k / 11));

console.log("K_SOFTMAX = 2.0:");
console.log("Complete Graph:", computeH(eigsComplete, 2.0));
console.log("Star Graph:", computeH(eigsStar, 2.0));
console.log("Path Graph:", computeH(eigsPath, 2.0));

console.log("\nK_SOFTMAX = 5.0:");
console.log("Complete Graph:", computeH(eigsComplete, 5.0));
console.log("Star Graph:", computeH(eigsStar, 5.0));
console.log("Path Graph:", computeH(eigsPath, 5.0));
