import { Vector3 } from 'three';

export enum VertexId {
  A,
  B,
  C,
  D,
}

type EdgeRouteSegment = [VertexId, VertexId];
export type EdgeRoute = [EdgeRouteSegment, EdgeRouteSegment, EdgeRouteSegment, EdgeRouteSegment, EdgeRouteSegment, EdgeRouteSegment];

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
  position: Vector3;
}

export interface Edge {
  v0: Vertex;
  v1: Vertex;
  index: number;
  midpoint: Vector3;
}

export interface Pixel {
  position: Vector3;
  edge: Edge;
  index: number;
  /** Normalized x-coordinate wrt the tetrahedron center */
  x: number;
  /** Normalized y-coordinate wrt the tetrahedron center */
  y: number;
  /** Normalized z-coordinate wrt the tetrahedron center */
  z: number;
  /** Normalized distance from the tetrahedron center */
  dOrigin: number;
  /** Normalized distance from this pixel's edge midpoint */
  dMidpoint: number;
}
