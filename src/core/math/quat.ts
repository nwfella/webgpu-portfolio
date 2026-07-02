/** Quaternion utilities (for smooth camera interpolation) */
export class Quat {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public z: number = 0,
    public w: number = 1
  ) {}

  static identity(): Quat { return new Quat(0, 0, 0, 1); }

  /** Create from axis-angle */
  static fromAxisAngle(ax: number, ay: number, az: number, angle: number): Quat {
    const half = angle / 2;
    const s = Math.sin(half);
    return new Quat(ax * s, ay * s, az * s, Math.cos(half));
  }

  /** Spherical linear interpolation */
  slerp(qb: Quat, t: number): Quat {
    let cosHalfTheta = this.x*qb.x + this.y*qb.y + this.z*qb.z + this.w*qb.w;
    if (cosHalfTheta < 0) {
      qb = new Quat(-qb.x, -qb.y, -qb.z, -qb.w);
      cosHalfTheta = -cosHalfTheta;
    }
    if (Math.abs(cosHalfTheta) >= 1) return this;
    const sinHalfTheta = Math.sqrt(1 - cosHalfTheta * cosHalfTheta);
    if (sinHalfTheta < 1e-6) return new Quat(
      (this.x + qb.x) * 0.5,
      (this.y + qb.y) * 0.5,
      (this.z + qb.z) * 0.5,
      (this.w + qb.w) * 0.5
    );
    const halfA = Math.acos(cosHalfTheta);
    const ratioA = Math.sin((1 - t) * halfA) / sinHalfTheta;
    const ratioB = Math.sin(t * halfA) / sinHalfTheta;
    return new Quat(
      this.x * ratioA + qb.x * ratioB,
      this.y * ratioA + qb.y * ratioB,
      this.z * ratioA + qb.z * ratioB,
      this.w * ratioA + qb.w * ratioB
    );
  }

  /** Create from Euler angles (YXZ order) */
  static fromEuler(yaw: number, pitch: number): Quat {
    const cy = Math.cos(yaw/2), sy = Math.sin(yaw/2);
    const cp = Math.cos(pitch/2), sp = Math.sin(pitch/2);
    return new Quat(
      cy * sp,
      sy * cp,
      sy * sp - cy * cp * 0, // simplified for YXZ
      cy * cp
    );
  }

  /** Convert to rotation matrix (column-major) */
  toMat4(): Float32Array {
    const xx = this.x*this.x, yy = this.y*this.y, zz = this.z*this.z;
    const xy = this.x*this.y, xz = this.x*this.z, yz = this.y*this.z;
    const wx = this.w*this.x, wy = this.w*this.y, wz = this.w*this.z;
    return new Float32Array([
      1-2*(yy+zz), 2*(xy+wz), 2*(xz-wy), 0,
      2*(xy-wz), 1-2*(xx+zz), 2*(yz+wx), 0,
      2*(xz+wy), 2*(yz-wx), 1-2*(xx+yy), 0,
      0, 0, 0, 1
    ]);
  }
}
