import { laplacianEntropy, floydWarshallDiameter, topCentrality, Node2D, GraphConfig } from './visionplay-pipeline/src/graphMath';

const PITCH_CONFIG: GraphConfig = {
  pixelsPerMeterX: 1920 / 105,
  pixelsPerMeterY: 1080 / 68,
  proximityThresholdM: 30,
};

// Simulate 11 players spread over half the field
const teamA: Node2D[] = [
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
];

console.log("Entropy:", laplacianEntropy(teamA, PITCH_CONFIG));
console.log("Diameter:", floydWarshallDiameter(teamA, PITCH_CONFIG));

// Try with larger threshold
const PITCH_CONFIG_LARGE = { ...PITCH_CONFIG, proximityThresholdM: 100 };
console.log("Entropy (100m):", laplacianEntropy(teamA, PITCH_CONFIG_LARGE));

// Try with old bug (nodes mapped to 800x400 space but passed to old math)
const teamA_bug: Node2D[] = teamA.map(n => ({ ...n, x: n.x * (800/1920), y: n.y * (400/1080) }));
console.log("Entropy (Bug):", laplacianEntropy(teamA_bug, PITCH_CONFIG));
