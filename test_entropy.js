function computeH(eigenvalues, K) {
  const n = eigenvalues.length;
  const maxEig = Math.max(...eigenvalues, 1e-9);
  const expTerms = eigenvalues.map((lam) => Math.exp(K * (lam / maxEig)));
  const sumExp = expTerms.reduce((a, b) => a + b, 0);
  const p = expTerms.map((e) => e / sumExp);
  const H = -p.reduce((acc, pi) => acc + (pi > 0 ? pi * Math.log2(pi) : 0), 0);
  const Hmax = Math.log2(n);
  return H / Hmax;
}

let eigsComplete = Array(10).fill(11);
eigsComplete.push(0);

let eigsStar = [11, ...Array(9).fill(1), 0];
let eigsPath = Array.from({length: 11}, (_, k) => 2 - 2 * Math.cos(Math.PI * k / 11));

console.log("K_SOFTMAX = 2.0:");
console.log("Complete Graph (Highly Ordered):", computeH(eigsComplete, 2.0));
console.log("Star Graph (Centralized):", computeH(eigsStar, 2.0));
console.log("Path Graph (Spread out):", computeH(eigsPath, 2.0));
