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

let eigsExtreme = [1, ...Array(10).fill(0)];
let eigsPath = Array.from({length: 11}, (_, k) => 2 - 2 * Math.cos(Math.PI * k / 11));

for (let k = 2; k <= 10; k += 1) {
  console.log(`K=${k} -> Extreme: ${computeH(eigsExtreme, k).toFixed(3)}, Path: ${computeH(eigsPath, k).toFixed(3)}`);
}
