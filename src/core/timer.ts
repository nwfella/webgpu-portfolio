/** Frame timing utilities */
export class Timer {
  private lastTime = 0;
  public delta = 0;           // seconds since last frame
  public elapsed = 0;         // total seconds since start
  public frameCount = 0;

  tick(): void {
    const now = performance.now() / 1000;
    if (this.lastTime === 0) this.lastTime = now;
    this.delta = Math.min(now - this.lastTime, 0.1); // cap to 100ms
    this.lastTime = now;
    this.elapsed += this.delta;
    this.frameCount++;
  }
}
