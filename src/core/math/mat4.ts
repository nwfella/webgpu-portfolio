/** 4x4 matrix math — column-major, for direct GPU uniform buffer upload */
export class Mat4 {
  private data: Float32Array;

  constructor(data?: Float32Array) {
    this.data = data ?? new Float32Array(16);
  }

  static identity(): Mat4 {
    const m = new Mat4();
    m.data[0] = 1; m.data[5] = 1; m.data[10] = 1; m.data[15] = 1;
    return m;
  }

  /** Perspective projection matrix */
  static perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
    const f = 1 / Math.tan(fovY / 2);
    const nf = 1 / (near - far);
    const m = new Mat4();
    m.data[0] = f / aspect;
    m.data[5] = f;
    m.data[10] = (far + near) * nf;
    m.data[11] = -1;
    m.data[14] = 2 * far * near * nf;
    return m;
  }

  /** Look-at view matrix */
  static lookAt(eye: {x:number,y:number,z:number}, center: {x:number,y:number,z:number}, up: {x:number,y:number,z:number}): Mat4 {
    let fwd = { x: center.x - eye.x, y: center.y - eye.y, z: center.z - eye.z };
    const fwdLen = Math.sqrt(fwd.x*fwd.x + fwd.y*fwd.y + fwd.z*fwd.z);
    if (fwdLen > 1e-8) { fwd.x /= fwdLen; fwd.y /= fwdLen; fwd.z /= fwdLen; }

    let side = {
      x: fwd.y * up.z - fwd.z * up.y,
      y: fwd.z * up.x - fwd.x * up.z,
      z: fwd.x * up.y - fwd.y * up.x
    };
    const sideLen = Math.sqrt(side.x*side.x + side.y*side.y + side.z*side.z);
    if (sideLen > 1e-8) { side.x /= sideLen; side.y /= sideLen; side.z /= sideLen; }

    let up2 = {
      x: side.y * fwd.z - side.z * fwd.y,
      y: side.z * fwd.x - side.x * fwd.z,
      z: side.x * fwd.y - side.y * fwd.x
    };

    const m = new Mat4();
    m.data[0] = side.x;   m.data[1] = up2.x;  m.data[2] = -fwd.x;  m.data[3] = 0;
    m.data[4] = side.y;   m.data[5] = up2.y;  m.data[6] = -fwd.y;  m.data[7] = 0;
    m.data[8] = side.z;   m.data[9] = up2.z;  m.data[10] = -fwd.z; m.data[11] = 0;
    m.data[12] = -(side.x*eye.x + side.y*eye.y + side.z*eye.z);
    m.data[13] = -(up2.x*eye.x + up2.y*eye.y + up2.z*eye.z);
    m.data[14] = fwd.x*eye.x + fwd.y*eye.y + fwd.z*eye.z;
    m.data[15] = 1;
    return m;
  }

  /** Translate matrix */
  static translate(tx: number, ty: number, tz: number): Mat4 {
    const m = Mat4.identity();
    m.data[12] = tx; m.data[13] = ty; m.data[14] = tz;
    return m;
  }

  /** Rotate around X axis (radians) */
  static rotateX(angle: number): Mat4 {
    const c = Math.cos(angle), s = Math.sin(angle);
    const m = Mat4.identity();
    m.data[5] = c; m.data[6] = s; m.data[9] = -s; m.data[10] = c;
    return m;
  }

  /** Rotate around Y axis */
  static rotateY(angle: number): Mat4 {
    const c = Math.cos(angle), s = Math.sin(angle);
    const m = Mat4.identity();
    m.data[0] = c; m.data[2] = -s; m.data[8] = s; m.data[10] = c;
    return m;
  }

  /** Scale matrix */
  static scale(sx: number, sy: number, sz: number): Mat4 {
    const m = new Mat4();
    m.data[0] = sx; m.data[5] = sy; m.data[10] = sz; m.data[15] = 1;
    return m;
  }

  /** Multiply this * b */
  multiply(b: Mat4): Mat4 {
    const a = this.data, d = b.data;
    const result = new Float32Array(16);
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += a[k * 4 + row] * d[col * 4 + k];
        }
        result[col * 4 + row] = sum;
      }
    }
    return new Mat4(result);
  }

  /** Transpose */
  transpose(): Mat4 {
    const d = this.data;
    return new Mat4(new Float32Array([
      d[0], d[4], d[8], d[12],
      d[1], d[5], d[9], d[13],
      d[2], d[6], d[10], d[14],
      d[3], d[7], d[11], d[15]
    ]));
  }

  /** Invert (for 4x4 affine transforms) */
  invert(): Mat4 {
    const m = this.data;
    const inv = new Float32Array(16);
    inv[0] = m[5]*(m[10]*m[15]-m[11]*m[14])-m[9]*(m[6]*m[15]-m[7]*m[14])-m[13]*(m[6]*m[11]-m[7]*m[10]);
    inv[1] = -(m[1]*(m[10]*m[15]-m[11]*m[14])-m[9]*(m[2]*m[15]-m[3]*m[14])-m[13]*(m[2]*m[11]-m[3]*m[10]));
    inv[2] = m[1]*(m[6]*m[15]-m[7]*m[14])-m[5]*(m[2]*m[15]-m[3]*m[14])-m[13]*(m[2]*m[7]-m[3]*m[6]);
    inv[3] = -(m[1]*(m[6]*m[11]-m[7]*m[10])-m[5]*(m[2]*m[11]-m[3]*m[10])-m[9]*(m[2]*m[7]-m[3]*m[6]));
    inv[4] = -(m[4]*(m[10]*m[15]-m[11]*m[14])-m[8]*(m[6]*m[15]-m[7]*m[14])-m[12]*(m[6]*m[11]-m[7]*m[10]));
    inv[5] = m[0]*(m[10]*m[15]-m[11]*m[14])-m[8]*(m[2]*m[15]-m[3]*m[14])-m[12]*(m[2]*m[11]-m[3]*m[10]);
    inv[6] = -(m[0]*(m[6]*m[15]-m[7]*m[14])-m[4]*(m[2]*m[15]-m[3]*m[14])-m[12]*(m[2]*m[7]-m[3]*m[6]));
    inv[7] = m[0]*(m[6]*m[11]-m[7]*m[10])-m[4]*(m[2]*m[11]-m[3]*m[10])-m[8]*(m[2]*m[7]-m[3]*m[6]);
    inv[8] = m[4]*(m[9]*m[15]-m[11]*m[13])-m[8]*(m[5]*m[15]-m[7]*m[13])-m[12]*(m[5]*m[11]-m[7]*m[9]);
    inv[9] = -(m[0]*(m[9]*m[15]-m[11]*m[13])-m[8]*(m[1]*m[15]-m[3]*m[13])-m[12]*(m[1]*m[11]-m[3]*m[9]));
    inv[10] = m[0]*(m[5]*m[15]-m[7]*m[13])-m[4]*(m[1]*m[15]-m[3]*m[13])-m[12]*(m[1]*m[7]-m[3]*m[5]);
    inv[11] = -(m[0]*(m[5]*m[11]-m[7]*m[9])-m[4]*(m[1]*m[11]-m[3]*m[9])-m[8]*(m[1]*m[7]-m[3]*m[5]));
    inv[12] = -(m[4]*(m[9]*m[14]-m[10]*m[13])-m[8]*(m[5]*m[14]-m[6]*m[13])-m[12]*(m[5]*m[10]-m[6]*m[9]));
    inv[13] = m[0]*(m[9]*m[14]-m[10]*m[13])-m[8]*(m[1]*m[14]-m[2]*m[13])-m[12]*(m[1]*m[10]-m[2]*m[9]);
    inv[14] = -(m[0]*(m[5]*m[14]-m[6]*m[13])-m[4]*(m[1]*m[14]-m[2]*m[13])-m[12]*(m[1]*m[6]-m[2]*m[5]));
    inv[15] = m[0]*(m[5]*m[10]-m[6]*m[9])-m[4]*(m[1]*m[10]-m[2]*m[9])-m[8]*(m[1]*m[6]-m[2]*m[5]);
    const det = m[0]*inv[0]+m[4]*inv[1]+m[8]*inv[2]+m[12]*inv[3];
    if (Math.abs(det) < 1e-10) return Mat4.identity();
    const invDet = 1/det;
    for (let i = 0; i < 16; i++) inv[i] *= invDet;
    return new Mat4(inv);
  }

  /** Build a TRS matrix (translate * rotateY * rotateX * scale) */
  static trs(tx: number, ty: number, tz: number, ry: number, rx: number, sx: number, sy: number, sz: number): Mat4 {
    return Mat4.translate(tx, ty, tz)
      .multiply(Mat4.rotateY(ry))
      .multiply(Mat4.rotateX(rx))
      .multiply(Mat4.scale(sx, sy, sz));
  }

  get buffer(): Float32Array { return this.data; }
}
