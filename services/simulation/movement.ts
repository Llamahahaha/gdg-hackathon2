export interface PlayerState {
  id: string;
  team: 'A' | 'B';
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export class MovementSimulator {
  private static readonly GRID_SIZE = 100;
  private static readonly MAX_SPEED = 2.5;
  private static readonly FRICTION = 0.95;
  private static readonly FORMATION_STRENGTH = 0.05;

  // Base positions for a 4-3-3 formation
  private static readonly BASE_POSITIONS: Record<string, { x: number; y: number }> = {
    // Team A (Left to Right)
    'A1': { x: 10, y: 50 },  // GK
    'A2': { x: 30, y: 20 },  // LB
    'A3': { x: 30, y: 40 },  // CB
    'A4': { x: 30, y: 60 },  // CB
    'A5': { x: 30, y: 80 },  // RB
    'A6': { x: 50, y: 50 },  // CM
    // Team B (Right to Left)
    'B1': { x: 90, y: 50 },  // GK
    'B2': { x: 70, y: 20 },  // RB
    'B3': { x: 70, y: 40 },  // CB
    'B4': { x: 70, y: 60 },  // CB
    'B5': { x: 70, y: 80 },  // LB
    'B6': { x: 50, y: 40 },  // CM
  };

  static updatePlayer(player: PlayerState): PlayerState {
    const base = this.BASE_POSITIONS[player.id] || { x: 50, y: 50 };
    
    // 1. Formation Drift: Players want to stay near their base position
    const dx = base.x - player.x;
    const dy = base.y - player.y;
    
    player.vx += dx * this.FORMATION_STRENGTH + (Math.random() - 0.5) * 0.5;
    player.vy += dy * this.FORMATION_STRENGTH + (Math.random() - 0.5) * 0.5;

    // 2. Apply Physics
    player.x += player.vx;
    player.y += player.vy;
    
    player.vx *= this.FRICTION;
    player.vy *= this.FRICTION;

    // 3. Speed Limit
    const speed = Math.sqrt(player.vx ** 2 + player.vy ** 2);
    if (speed > this.MAX_SPEED) {
      player.vx = (player.vx / speed) * this.MAX_SPEED;
      player.vy = (player.vy / speed) * this.MAX_SPEED;
    }

    // 4. Boundary Constraints
    if (player.x < 0) { player.x = 0; player.vx *= -0.5; }
    if (player.x > 100) { player.x = 100; player.vx *= -0.5; }
    if (player.y < 0) { player.y = 0; player.vy *= -0.5; }
    if (player.y > 100) { player.y = 100; player.vy *= -0.5; }

    return { ...player };
  }

  static updateBall(ball: { x: number; y: number }, targetPlayer: PlayerState): { x: number; y: number } {
    // Ball follows the target player with slight lag for smoothness
    return {
      x: ball.x + (targetPlayer.x - ball.x) * 0.2,
      y: ball.y + (targetPlayer.y - ball.y) * 0.2,
    };
  }
}
