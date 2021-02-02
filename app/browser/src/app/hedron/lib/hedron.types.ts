import { Vector3 } from 'three';

export interface Hedron {
  name: string;
  edges: Edge[];
  /** The total number of LEDs comprising this polyhedron */
  n: number;
}

export interface Edge {
  v0: Vector3;
  v1: Vector3;
  index: number;
  leds: Led[];
  midpoint: Vector3;
  /** The number of LEDs along this edge */
  edgeN: number;
  /** The total number of LEDs comprising this polyhedron */
  n: number;
}

export interface Led {
  position: Vector3;
  edgeIndex: number;
  /** Global index */
  index: number;
  /** Distance from the hedron center */
  dOrigin: number;
  /** Distance from this pixel's edge midpoint */
  dMidpoint: number;
  /** The total number of LEDs comprising this polyhedron */
  n: number;
}
