import { Vector3, Line3 } from 'three';

export type VertexId = 'A' | 'B' | 'C' | 'D';
export type EdgeId = 'AB' | 'AC' | 'AD' | 'BC' | 'BD' | 'CD';

export interface TetrahedronConfig {
  /**
   * The number of pixels per unit distance
   */
  density: number;
  /**
   * The amount of space (unit distance) along an edge between a vertex and the nearest pixel
   */
  edgePadding: number;
  /**
   * The total length of an edge, in unit distance
   * Includes the pixel padding, `edgePadding`
   */
  paddedEdgeLength: number;
}


export interface Tetrahedron extends TetrahedronConfig {
  /**
   * The unpadded length of an edge,
   * the distance between pixel 0 and pixel N
   */
  edgeLength: number;
  /**
   * The number of pixels along a single edge
   */
  pixelsPerEdge: number;
  /**
   * The distance between pixels along an edge
   */
  pixelSpacing: number;
  /**
   * The radius of the tetrahedron's midsphere
   */
  midRadius: number;
  /**
   * The radius of the tetrahedron's circumsphere
   */
  circumRadius: number;
  /**
   * Vectors representing the position of each edge's midpoint,
   * the direction also represents the normal of the pixels along that edge
   */
  // mids: Vector3[];
  /**
   * Vectors representing the position of the vertices
   */
  vertices: Record<VertexId, Vector3>;
  /**
   * Lines representing the tetrahedron's edges
   */
  edges: Record<EdgeId, Line3>;
}
