/** Unified mouse/touch input */
export interface InputState {
  x: number;
  y: number;
  dx: number;
  dy: number;
  down: boolean;
  justPressed: boolean;
  scroll: number;
}

export class InputManager {
  private _x = 0;
  private _y = 0;
  private _prevX = 0;
  private _prevY = 0;
  private _down = false;
  private _justPressed = false;
  private _scroll = 0;
  private _prevScroll = 0;

  private onMouseMove = (e: MouseEvent) => {
    this._prevX = this._x;
    this._prevY = this._y;
    this._x = e.clientX;
    this._y = e.clientY;
  };

  private onMouseDown = () => { this._down = true; this._justPressed = true; };
  private onMouseUp = () => { this._down = false; };
  private onWheel = (e: WheelEvent) => { this._scroll += e.deltaY * 0.001; };
  private onTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 0) return;
    const t = e.touches[0];
    this._prevX = this._x;
    this._prevY = this._y;
    this._x = t.clientX;
    this._y = t.clientY;
  };
  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 0) return;
    this._down = true;
    this._justPressed = true;
    const t = e.touches[0];
    this._x = t.clientX;
    this._y = t.clientY;
    this._prevX = this._x;
    this._prevY = this._y;
  };
  private onTouchEnd = () => { this._down = false; };

  attach(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('mousemove', this.onMouseMove);
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('wheel', this.onWheel, { passive: true });
    canvas.addEventListener('touchmove', this.onTouchMove, { passive: true });
    canvas.addEventListener('touchstart', this.onTouchStart, { passive: true });
    canvas.addEventListener('touchend', this.onTouchEnd);
  }

  detach(canvas: HTMLCanvasElement): void {
    canvas.removeEventListener('mousemove', this.onMouseMove);
    canvas.removeEventListener('mousedown', this.onMouseDown);
    canvas.removeEventListener('mouseup', this.onMouseUp);
    canvas.removeEventListener('wheel', this.onWheel);
    canvas.removeEventListener('touchmove', this.onTouchMove);
    canvas.removeEventListener('touchstart', this.onTouchStart);
    canvas.removeEventListener('touchend', this.onTouchEnd);
  }

  /** Call once per frame after reading input */
  endFrame(): void {
    this._justPressed = false;
    this._prevScroll = this._scroll;
  }

  get state(): InputState {
    return {
      x: this._x, y: this._y,
      dx: this._x - this._prevX,
      dy: this._y - this._prevY,
      down: this._down,
      justPressed: this._justPressed,
      scroll: this._scroll - this._prevScroll,
    };
  }
}
