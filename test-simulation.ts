import { SimulationEngine } from './services/simulation/engine';

console.log("Starting Simulation Test...");

const engine = new SimulationEngine((frame) => {
  console.log(`[Frame ${frame.frame_id}] Players: ${frame.players.length}, Events: ${frame.events.length}`);
  if (frame.events.length > 0) {
    console.log("Events detected:", frame.events.map(e => e.type).join(", "));
  }
});

engine.play();

// Stop after 5 seconds
setTimeout(() => {
  engine.pause();
  console.log("Simulation Test Complete.");
  process.exit(0);
}, 5000);
