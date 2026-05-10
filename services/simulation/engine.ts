import { FrameGenerator, MatchFrame } from './generator';

export class SimulationEngine {
  private generator: FrameGenerator;
  private isPlaying: boolean = false;
  private intervalId: any = null;
  private frames: MatchFrame[] = [];
  private currentFrameIndex: number = -1;
  private onFrameUpdate: (frame: MatchFrame) => void;

  constructor(onFrameUpdate: (frame: MatchFrame) => void) {
    this.generator = new FrameGenerator();
    this.onFrameUpdate = onFrameUpdate;
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    this.intervalId = setInterval(() => {
      const frame = this.generator.generateNextFrame();
      this.frames.push(frame);
      this.currentFrameIndex = this.frames.length - 1;
      this.onFrameUpdate(frame);
    }, 250);
  }

  pause() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.pause();
    this.frames = [];
    this.currentFrameIndex = -1;
    this.generator = new FrameGenerator();
  }

  seek(index: number) {
    if (index >= 0 && index < this.frames.length) {
      this.currentFrameIndex = index;
      this.onFrameUpdate(this.frames[index]);
    }
  }

  getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentFrameIndex: this.currentFrameIndex,
      totalFrames: this.frames.length
    };
  }
}
