import { Vector3 } from 'three';
import { GeometryData, Vertex } from './geometry.types';

export class GeometryUtils {
  static readonly GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;

  static generateIcosahedronGeometryData(n = 0): GeometryData {
    // https://en.wikipedia.org/wiki/Regular_icosahedron
    const lat = Math.atan(0.5);
    const ySpacing = (2 * Math.PI) / 5;
    const yAxis = new Vector3(0, 1, 0);
    const zAxis = new Vector3(0, 0, 1);
    const a: Vertex = [0, -1, 0];
    const d: Vertex = [0, +1, 0];
    const b = new Vector3(1, 0, 0).applyAxisAngle(zAxis, lat);
    const b0 = b.clone().toArray();
    const b1 = b
      .clone()
      .applyAxisAngle(yAxis, 1 * ySpacing)
      .toArray();
    const b2 = b
      .clone()
      .applyAxisAngle(yAxis, 2 * ySpacing)
      .toArray();
    const b3 = b
      .clone()
      .applyAxisAngle(yAxis, 3 * ySpacing)
      .toArray();
    const b4 = b
      .clone()
      .applyAxisAngle(yAxis, 4 * ySpacing)
      .toArray();
    const c = new Vector3(-1, 0, 0).applyAxisAngle(zAxis, lat);
    const c0 = c.clone().toArray();
    const c1 = c
      .clone()
      .applyAxisAngle(yAxis, 1 * ySpacing)
      .toArray();
    const c2 = c
      .clone()
      .applyAxisAngle(yAxis, 2 * ySpacing)
      .toArray();
    const c3 = c
      .clone()
      .applyAxisAngle(yAxis, 3 * ySpacing)
      .toArray();
    const c4 = c
      .clone()
      .applyAxisAngle(yAxis, 4 * ySpacing)
      .toArray();

    return {
      name: 'icosahedron',
      edges: [
        [a, b0, n],
        [a, b1, n],
        [a, b2, n],
        [a, b3, n],
        [a, b4, n],
        [b0, b1, n],
        [b1, b2, n],
        [b2, b3, n],
        [b3, b4, n],
        [b4, b0, n],
        [b0, c0, n],
        [b1, c1, n],
        [b2, c2, n],
        [b3, c3, n],
        [b4, c4, n],
        [b1, c0, n],
        [b2, c1, n],
        [b3, c2, n],
        [b4, c3, n],
        [b0, c4, n],
        [c0, c1, n],
        [c1, c2, n],
        [c2, c3, n],
        [c3, c4, n],
        [c4, c0, n],
        [c0, d, n],
        [c1, d, n],
        [c2, d, n],
        [c3, d, n],
        [c4, d, n],
      ],
    };
  }
}
