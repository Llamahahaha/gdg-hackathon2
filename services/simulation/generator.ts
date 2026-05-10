import { PlayerState, MovementSimulator } from './movement';
import { GameEvent, EventDetector } from './events';

export interface MatchFrame {
  frame_id: number;
  timestamp: number;
  players: PlayerState[];
  ball: { x: number; y: number };
  events: GameEvent[];
}

export class FrameGenerator {
  private players: PlayerState[];
  private ball: { x: number; y: number };
  private frameCount: number = 0;
  private currentBallCarrierId: string = 'A6';

  constructor() {
    this.players = [
      { id: 'A1', team: 'A', x: 10, y: 50, vx: 0, vy: 0 },
      { id: 'A2', team: 'A', x: 30, y: 20, vx: 0, vy: 0 },
      { id: 'A3', team: 'A', x: 30, y: 40, vx: 0, vy: 0 },
      { id: 'A4', team: 'A', x: 30, y: 60, vx: 0, vy: 0 },
      { id: 'A5', team: 'A', x: 30, y: 80, vx: 0, vy: 0 },
      { id: 'A6', team: 'A', x: 50, y: 50, vx: 0, vy: 0 },
      { id: 'B1', team: 'B', x: 90, y: 50, vx: 0, vy: 0 },
      { id: 'B2', team: 'B', x: 70, y: 20, vx: 0, vy: 0 },
      { id: 'B3', team: 'B', x: 70, y: 40, vx: 0, vy: 0 },
      { id: 'B4', team: 'B', x: 70, y: 60, vx: 0, vy: 0 },
      { id: 'B5', team: 'B', x: 70, y: 80, vx: 0, vy: 0 },
      { id: 'B6', team: 'B', x: 50, y: 40, vx: 0, vy: 0 },
    ];
    this.ball = { x: 50, y: 50 };
  }

  generateNextFrame(): MatchFrame {
    this.frameCount++;
    
    // Update players
    this.players = this.players.map(p => MovementSimulator.updatePlayer(p));

    // Update ball carrier logic (randomly switch occasionally)
    if (Math.random() > 0.98) {
      const randomPlayer = this.players[Math.floor(Math.random() * this.players.length)];
      this.currentBallCarrierId = randomPlayer.id;
    }

    const carrier = this.players.find(p => p.id === this.currentBallCarrierId)!;
    this.ball = MovementSimulator.updateBall(this.ball, carrier);

    // Detect events
    const events = EventDetector.detectEvents(this.players, this.ball);

    return {
      frame_id: this.frameCount,
      timestamp: Date.now(),
      players: [...this.players],
      ball: { ...this.ball },
      events
    };
  }
}
