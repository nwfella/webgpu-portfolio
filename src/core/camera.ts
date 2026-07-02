import { Vec3 } from './math/vec3';
import { Mat4 } from './math/mat4';
import { InputState } from './input';

/** Orbital camera with smooth interpolation */
export class Camera {
  // Spherical coordinates
  private theta = 0;       // horizontal angle
  private phi = Math.PI / 4;  // vertical angle (π/2 = top-down)
  private radius = 6;

  // Target look-at point
  public target = new Vec3(0, 0, 0);

  // Computed matrices
  public viewMatrix = Mat4.identity();
  public projMatrix = Mat4.identity();
  public viewProjMatrix = Mat4.identity();
  public position = new Vec3(0, 0, 0);

  // Smooth interpolation targets
  private targetTheta = 0;
  private targetPhi = Math.PI / 4;
  private targetRadius = 6;
  private targetLookAt = new Vec3(0, 0, 0);
  private smoothFactor = 0.08;

  // Animation state
  private animTheta = 0;
  private animPhi = Math.PI / 4;
  private animRadius = 6;
  private animating = false;
  private animTime = 0;
  private animDuration = 1.5;
  private startTheta = 0;
  private startPhi = 0;
  private startRadius = 0;
  private startTarget = new Vec3(0, 0, 0);
  private animTargetTheta = 0;
  private animTargetPhi = 0;
  private animTargetRadius = 0;
  private animTargetLookAt = new Vec3(0, 0, 0);

  // Auto-orbit speed
  private autoOrbitSpeed = 0.15; // radians per second

  constructor() {
    this.update();
  }

  /** Update from input */
  updateInput(input: InputState, delta: number): void {
    if (!this.animating) {
      // User input
      if (input.down) {
        this.targetTheta -= input.dx * 0.005;
        this.targetPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, this.targetPhi + input.dy * 0.005));
      }
      this.targetRadius = Math.max(2, Math.min(20, this.targetRadius - input.scroll * 3));
    }

    // Auto-orbit when not interacted with (after idle period)
    if (!input.down) {
      this.targetTheta += this.autoOrbitSpeed * delta;
    }

    // Smooth interpolation
    this.theta += (this.targetTheta - this.theta) * this.smoothFactor;
    this.phi += (this.targetPhi - this.phi) * this.smoothFactor;
    this.radius += (this.targetRadius - this.radius) * this.smoothFactor;
    this.target = this.target.lerp(this.target, 0.02);

    // Handle animation
    if (this.animating) {
      this.animTime += delta;
      const t = Math.min(1, this.animTime / this.animDuration);
      const e = this.easeInOutCubic(t);

      this.radius = this.startRadius + (this.animTargetRadius - this.startRadius) * e;
      this.theta = this.startTheta + (this.animTargetTheta - this.startTheta) * e;
      this.phi = this.startPhi + (this.animTargetPhi - this.startPhi) * e;
      this.target = new Vec3(
        this.startTarget.x + (this.animTargetLookAt.x - this.startTarget.x) * e,
        this.startTarget.y + (this.animTargetLookAt.y - this.startTarget.y) * e,
        this.startTarget.z + (this.animTargetLookAt.z - this.startTarget.z) * e,
      );

      if (t >= 1) {
        this.animating = false;
        this.targetTheta = this.theta;
        this.targetPhi = this.phi;
        this.targetRadius = this.radius;
      }
    }

    this.update();
  }

  /** Animate camera to a specific position */
  animateTo(theta: number, phi: number, radius: number, target: Vec3, duration: number = 1.5): void {
    this.startTheta = this.theta;
    this.startPhi = this.phi;
    this.startRadius = this.radius;
    this.startTarget = this.target.clone();
    this.animTargetTheta = theta;
    this.animTargetPhi = phi;
    this.animTargetRadius = radius;
    this.animTargetLookAt = target.clone();
    this.animDuration = duration;
    this.animTime = 0;
    this.animating = true;
  }

  /** Recompute view/projection matrices */
  private update(): void {
    const eye = new Vec3(
      this.radius * Math.sin(this.phi) * Math.cos(this.theta),
      this.radius * Math.cos(this.phi),
      this.radius * Math.sin(this.phi) * Math.sin(this.theta),
    );
    this.position = eye;
    this.viewMatrix = Mat4.lookAt(
      { x: eye.x, y: eye.y, z: eye.z },
      { x: this.target.x, y: this.target.y, z: this.target.z },
      { x: 0, y: 1, z: 0 }
    );
    this.viewProjMatrix = this.projMatrix.multiply(this.viewMatrix);
  }

  /** Update projection (call on resize) */
  updateProjection(fov: number, aspect: number, near: number, far: number): void {
    this.projMatrix = Mat4.perspective(fov, aspect, near, far);
    this.update();
  }

  /** Get camera uniforms for GPU */
  getUniforms(): Float32Array {
    // Pack viewProjection, position, time
    const vp = this.viewProjMatrix.buffer;
    const pos = this.position;
    const out = new Float32Array(20);
    out.set(vp, 0);      // 16 floats: view-projection
    out[16] = pos.x;
    out[17] = pos.y;
    out[18] = pos.z;
    out[19] = 0;         // padding
    return out;
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
