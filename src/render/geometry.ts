/** Procedural geometry generation — sphere, torus, icosahedron, torus knot */
export interface Mesh {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint16Array;
  vertexCount: number;
  indexCount: number;
}

/** Generate a sphere */
export function createSphere(radius: number, widthSegs: number, heightSegs: number): Mesh {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let y = 0; y <= heightSegs; y++) {
    const v = y / heightSegs;
    const phi = v * Math.PI;
    for (let x = 0; x <= widthSegs; x++) {
      const u = x / widthSegs;
      const theta = u * Math.PI * 2;
      const px = radius * Math.sin(phi) * Math.cos(theta);
      const py = radius * Math.cos(phi);
      const pz = radius * Math.sin(phi) * Math.sin(theta);
      positions.push(px, py, pz);
      normals.push(px / radius, py / radius, pz / radius);
      uvs.push(u, v);
    }
  }

  for (let y = 0; y < heightSegs; y++) {
    for (let x = 0; x < widthSegs; x++) {
      const a = y * (widthSegs + 1) + x;
      const b = a + widthSegs + 1;
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
    vertexCount: positions.length / 3,
    indexCount: indices.length,
  };
}

/** Generate a torus */
export function createTorus(radius: number, tube: number, radialSegs: number, tubularSegs: number): Mesh {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= radialSegs; j++) {
    const v = j / radialSegs;
    const phi = v * Math.PI * 2;
    for (let i = 0; i <= tubularSegs; i++) {
      const u = i / tubularSegs;
      const theta = u * Math.PI * 2;
      const cx = radius * Math.cos(theta);
      const cz = radius * Math.sin(theta);
      const nx = Math.cos(theta) * Math.cos(phi);
      const ny = Math.sin(phi);
      const nz = Math.sin(theta) * Math.cos(phi);
      positions.push(cx + tube * nx, tube * ny, cz + tube * nz);
      normals.push(nx, ny, nz);
      uvs.push(u, v);
    }
  }

  for (let j = 0; j < radialSegs; j++) {
    for (let i = 0; i < tubularSegs; i++) {
      const a = j * (tubularSegs + 1) + i;
      const b = a + tubularSegs + 1;
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
    vertexCount: positions.length / 3,
    indexCount: indices.length,
  };
}

/** Generate a torus knot */
export function createTorusKnot(radius: number, tube: number, p: number, q: number, segments: number): Mesh {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= segments; j++) {
    const v = j / segments;
    const phi = v * Math.PI * 2;
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      const theta = u * Math.PI * 2;

      const r = radius + tube * Math.cos(q * theta);
      const px = r * Math.cos(p * theta);
      const py = tube * Math.sin(q * theta);
      const pz = r * Math.sin(p * theta);

      // Approximate normal
      const eps = 0.01;
      const r2 = radius + tube * Math.cos(q * (theta + eps));
      const tx = (r2 * Math.cos(p * (theta + eps)) - px) / eps;
      const ty = (tube * Math.sin(q * (theta + eps)) - py) / eps;
      const tz = (r2 * Math.sin(p * (theta + eps)) - pz) / eps;
      const tLen = Math.sqrt(tx*tx + ty*ty + tz*tz) || 1;

      const bx = (Math.cos(p * theta) * (-tube * q * Math.sin(q * theta)) - r * p * Math.sin(p * theta));
      const bz = (Math.sin(p * theta) * (-tube * q * Math.sin(q * theta)) + r * p * Math.cos(p * theta));
      const bLen = Math.sqrt(bx*bx + bz*bz) || 1;

      const nx = tx * bz - tz * bx;
      const ny = ty * bz - tz * 0;
      const nz = tz * bx - tx * bz;
      const nLen = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;

      positions.push(px, py, pz);
      normals.push(nx/nLen, ny/nLen, nz/nLen);
      uvs.push(u, v);
    }
  }

  for (let j = 0; j < segments; j++) {
    for (let i = 0; i < segments; i++) {
      const a = j * (segments + 1) + i;
      const b = a + segments + 1;
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
    vertexCount: positions.length / 3,
    indexCount: indices.length,
  };
}

/** Generate a ground plane */
export function createGround(size: number, segs: number): Mesh {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const half = size / 2;

  for (let y = 0; y <= segs; y++) {
    const v = y / segs;
    for (let x = 0; x <= segs; x++) {
      const u = x / segs;
      positions.push(-half + u * size, 0, -half + v * size);
      normals.push(0, 1, 0);
      uvs.push(u, v);
    }
  }

  for (let y = 0; y < segs; y++) {
    for (let x = 0; x < segs; x++) {
      const a = y * (segs + 1) + x;
      const b = a + segs + 1;
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
    vertexCount: positions.length / 3,
    indexCount: indices.length,
  };
}
