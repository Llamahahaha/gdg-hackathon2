import { laplacianEntropy, buildAdjacency, jacobiEigenvalues } from './visionplay-pipeline/src/graphMath.ts';

const PITCH_CONFIG = {
  pixelsPerMeterX: 1920 / 105,
  pixelsPerMeterY: 1080 / 68,
  proximityThresholdM: 30,
};

const teamA = [
  { id: 1, x: 200, y: 500 },
  { id: 2, x: 400, y: 200 },
  { id: 3, x: 400, y: 400 },
  { id: 4, x: 400, y: 600 },
  { id: 5, x: 400, y: 800 },
  { id: 6, x: 600, y: 300 },
  { id: 7, x: 600, y: 500 },
  { id: 8, x: 600, y: 700 },
  { id: 9, x: 800, y: 200 },
  { id: 10, x: 800, y: 500 },
  { id: 11, x: 800, y: 800 },
].map(n => ({ ...n, x: n.x * 1920/800, y: n.y * 1080/400 }));

console.log("Entropy:", laplacianEntropy(teamA, PITCH_CONFIG));

const A = buildAdjacency(teamA, PITCH_CONFIG);
console.log("A matrix edges:", A.flatMap(row => row).filter(x => x > 0).length / 2);

const PITCH_CONFIG_100 = { ...PITCH_CONFIG, proximityThresholdM: 100 };
console.log("Entropy (100m):", laplacianEntropy(teamA, PITCH_CONFIG_100));
console.log("A matrix edges (100m):", buildAdjacency(teamA, PITCH_CONFIG_100).flatMap(row => row).filter(x => x > 0).length / 2);
