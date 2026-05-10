import { PlayerState } from './movement';

export interface GameEvent {
  type: 'pass' | 'pressure' | 'overload';
  players: string[];
}

export class EventDetector {
  static detectEvents(players: PlayerState[], ball: { x: number; y: number }): GameEvent[] {
    const events: GameEvent[] = [];

    // 1. Detect Pressure (Opponent close to ball carrier)
    const ballCarrier = this.getBallCarrier(players, ball);
    if (ballCarrier) {
      const opponents = players.filter(p => p.team !== ballCarrier.team);
      const presser = opponents.find(p => this.getDistance(p, ballCarrier) < 8);
      if (presser) {
        events.push({ type: 'pressure', players: [ballCarrier.id, presser.id] });
      }
    }

    // 2. Detect Overload (Teammates clustering)
    const teams = ['A', 'B'] as const;
    teams.forEach(team => {
      const teamPlayers = players.filter(p => p.team === team);
      teamPlayers.forEach(p => {
        const neighbors = teamPlayers.filter(n => n.id !== p.id && this.getDistance(p, n) < 10);
        if (neighbors.length >= 2) {
          events.push({ 
            type: 'overload', 
            players: [p.id, ...neighbors.map(n => n.id)] 
          });
        }
      });
    });

    // 3. Random Pass Event (Visual only for now)
    if (Math.random() > 0.95 && ballCarrier) {
      const teammates = players.filter(p => p.team === ballCarrier.team && p.id !== ballCarrier.id);
      const receiver = teammates[Math.floor(Math.random() * teammates.length)];
      if (receiver) {
        events.push({ type: 'pass', players: [ballCarrier.id, receiver.id] });
      }
    }

    return events;
  }

  private static getBallCarrier(players: PlayerState[], ball: { x: number; y: number }): PlayerState | null {
    return players.find(p => this.getDistance(p, ball) < 3) || null;
  }

  private static getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }
}
