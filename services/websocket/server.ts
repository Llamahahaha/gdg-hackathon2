import { SimulationEngine } from '../simulation/engine';
import { MatchFrame } from '../simulation/generator';

const clients = new Set<any>();
const engine = new SimulationEngine((frame: MatchFrame) => {
  const message = JSON.stringify({ type: 'FRAME_UPDATE', data: frame });
  for (const client of clients) {
    client.send(message);
  }
});

const server = Bun.serve({
  port: 8080,
  fetch(req, server) {
    if (server.upgrade(req)) {
      return;
    }
    return new Response("FieldTheory Simulation Server");
  },
  websocket: {
    open(ws) {
      console.log("Client connected to simulation");
      clients.add(ws);
      ws.send(JSON.stringify({ type: 'STATUS', data: engine.getStatus() }));
    },
    message(ws, message) {
      const command = JSON.parse(message as string);
      console.log("Command received:", command.type);

      switch (command.type) {
        case 'PLAY':
          engine.play();
          break;
        case 'PAUSE':
          engine.pause();
          break;
        case 'RESET':
          engine.reset();
          break;
        case 'SEEK':
          engine.seek(command.index);
          break;
        default:
          console.warn("Unknown command:", command.type);
      }
      
      ws.send(JSON.stringify({ type: 'STATUS', data: engine.getStatus() }));
    },
    close(ws) {
      console.log("Client disconnected");
      clients.delete(ws);
    },
  },
});

console.log(`🚀 Simulation WebSocket server running at ws://localhost:${server.port}`);
