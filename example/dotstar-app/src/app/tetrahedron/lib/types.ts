import { Vector3, Line3 } from 'three';

export enum VertexId {
  A = 'a',
  B = 'b',
  C = 'c',
  D = 'd',
}

type EdgeRouteSegment = [VertexId, VertexId];
type EdgeRoute = [EdgeRouteSegment, EdgeRouteSegment, EdgeRouteSegment, EdgeRouteSegment, EdgeRouteSegment, EdgeRouteSegment];

export interface TetrahedronConfigOptions {
  /**
   * The path, from vertex to vertex, defining the edges of the tetrahedron;
   * the pixel buffer will be mapped onto the edge route
   */
  edgeRoute: EdgeRoute;
  /**
   * The number of pixels along a single edge
   */
  pixelsPerEdge: number;
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


export interface TetrahedronConfig extends TetrahedronConfigOptions {
  /**
   * The unpadded length of an edge,
   * the distance between pixel 0 and pixel N
   */
  edgeLength: number;
  /**
   * The total number of pixels across the tetrahedron structure
   */
  pixelsTotal: number;
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
}

export interface Vertex {
  // label: VertexId;
  pos: Vector3;
}

export interface Edge {
  v0: Vertex;
  v1: Vertex;
  i: number;
  norm: Vector3;
  // label: EdgeId;
}

export interface Pixel {
  pos: Vector3;
  edge: Edge;
  i: number;
  // next: Pixel | undefined;
}

// export interface Tetrahedron extends TetrahedronConfig {
//   /**
//    *
//    */
//   vertices: Vertex[];
//   /**
//    *
//    */
//   edges: Edge[];
//   /**
//    *
//    */
//   pixels: Pixel[];
// }
