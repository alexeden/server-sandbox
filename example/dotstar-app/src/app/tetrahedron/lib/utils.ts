import { TetrahedronConfig, Tetrahedron } from './types';
import { Vector3, Line3 } from 'three';
import { Line } from 'pts';

const sqrt2 = Math.sqrt(2);
const sqrt6 = Math.sqrt(6);
const dihedralAngle = Math.acos(1 / 3);
const tetrahedralAngle = Math.acos(-1 / 3);

export class TetrahedronUtils {
  static computeFromConfig(config: TetrahedronConfig): Tetrahedron {
    const { paddedEdgeLength, edgePadding, density } = config;
    const edgeLength = paddedEdgeLength - 2 * edgePadding;
    const pixelsPerEdge = density * edgeLength;
    const pixelSpacing = edgeLength / pixelsPerEdge;
    const circumRadius = paddedEdgeLength / 4 * sqrt6;
    const midRadius = paddedEdgeLength / 4 * sqrt2;

    const A = new Vector3(0, circumRadius, 0);
    const B = A.clone().applyAxisAngle(new Vector3(1, 0, 0), tetrahedralAngle);
    const C = B.clone().applyAxisAngle(new Vector3(0, 1, 0), 2 * Math.PI / 3);
    const D = C.clone().applyAxisAngle(new Vector3(0, 1, 0), 2 * Math.PI / 3);

    return {
      ...config,
      edgeLength,
      pixelsPerEdge,
      pixelSpacing,
      circumRadius,
      midRadius,
      vertices: { A, B, C, D },
      edges: {
        AB: new Line3(A, B),
        AC: new Line3(A, C),
        AD: new Line3(A, D),
        BC: new Line3(B, C),
        BD: new Line3(B, D),
        CD: new Line3(C, D),
      },
    };
  }
}
