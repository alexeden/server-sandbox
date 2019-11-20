import { TetrahedronConfig, Tetrahedron } from './types';

const sqrt2 = Math.sqrt(2);
const sqrt6 = Math.sqrt(6);

export class TetrahedronUtils {
  static computeFromConfig(config: TetrahedronConfig): Tetrahedron {
    const { paddedEdgeLength, edgePadding, density } = config;
    const edgeLength = paddedEdgeLength - 2 * edgePadding;
    const pixelsPerEdge = density / edgeLength;
    const pixelSpacing = edgeLength / pixelsPerEdge;
    const circumRadius = paddedEdgeLength / 4 * sqrt6;
    const midRadius = paddedEdgeLength / 4 * sqrt2;

    return {
      ...config,
      edgeLength,
      pixelsPerEdge,
      pixelSpacing,
      circumRadius,
      midRadius,
    };
  }
}
