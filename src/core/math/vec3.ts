/** Minimal 3D vector math — hand-rolled, no dependencies */
export class Vec3 {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public z: number = 0
  ) {}

  static zero(): Vec3 { return new Vec3(0, 0, 0); }
  static up(): Vec3 { return new Vec3(0, 1, 0); }
  static forward(): Vec3 { return new Vec3(0, 0, -1); }

  clone(): Vec3 { return new Vec3(this.x, this.y, this.z); }

  add(v: Vec3): Vec3 { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
  sub(v: Vec3): Vec3 { return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
  scale(s: number): Vec3 { return new Vec3(this.x * s, this.y * s, this.z * s); }

  dot(v: Vec3): number { return this.x * v.x + this.y * v.y + this.z * v.z; }
  cross(v: Vec3): Vec3 {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  length(): number { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
  normalize(): Vec3 {
    const len = this.length();
    if (len < 1e-8) return new Vec3();
    return this.scale(1 / len);
  }

  lerp(v: Vec3, t: number): Vec3 {
    return new Vec3(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t,
      this.z + (v.z - this.z) * t
    );
  }

  toArray(): Float32Array { return new Float32Array([this.x, this.y, this.z]); }
  toArray4(w: number = 1): Float32Array { return new Float32Array([this.x, this.y, this.z, w]); }
}
