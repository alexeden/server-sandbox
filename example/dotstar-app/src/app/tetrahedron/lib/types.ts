import { Vector3 } from 'three';

export interface TetrahedronConfig {
  /**
   * The number of pixels per unit distance
   */
  density: number;
  /**
   * The amount of space (unit distance) along an edge between a vertex and the nearest pixel
   */
  edgePixelPadding: number;
  /**
   * The total length of an edge, in unit distance
   * Includes the pixel padding, `edgePixelPadding`
   */
  edgeLength: number;
}


export interface Tetrahedron extends TetrahedronConfig {
  /**
   * The number of pixels along a single edge
   */
  pixelsPerEdge: number;
  /**
   * The distance between pixels along an edge
   */
  pixelSpacing: number;
  /**
   * The distance between an edge midpoint and the origin
   */
  midpointRadius: number;
  /**
   * The distance between a vertex and the origin
   */
  vertexRadius: number;
  /**
   * Vectors representing the position of each edge's midpoint,
   * the direction also represents the normal of the pixels along that edge
   */
  midpoint: Vector3;
  /**
   * Vectors representing the position of the vertices
   */
  vertices: Vector3;
}
