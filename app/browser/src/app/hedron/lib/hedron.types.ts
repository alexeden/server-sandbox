import { Vector3 } from 'three';

export interface Hedron {
  name: string;
  edges: Edge[];
  /**
   * The total number of LEDs comprising this polyhedron
   */
  n: number;
}

export interface Edge {
  v0: Vector3;
  v1: Vector3;
  index: number;
  leds: Led[];
  midpoint: Vector3;
  /**
   * The number of LEDs along this edge
   */
  n: number;
}

export interface Led {
  position: Vector3;
  // edge: Edge;
  edgeIndex: number;
  /** Global index */
  hedronIndex: number;
  // /** X-coordinate wrt the hedron center */
  // x: number;
  // /** Y-coordinate wrt the hedron center */
  // y: number;
  // /** Z-coordinate wrt the hedron center */
  // z: number;
  /** Distance from the hedron center */
  dOrigin: number;
  /** Distance from this pixel's edge midpoint */
  dMidpoint: number;
}
