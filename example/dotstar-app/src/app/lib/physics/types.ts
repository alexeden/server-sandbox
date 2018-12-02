import { vec3 } from 'gl-matrix';
import { Particle } from './particle';

export interface ParticleState {
  dt: number;
  // dt: number;
  _x: vec3;
  x: vec3;
}

export type Force = (p: Particle) => vec3;

export type Constraint = (next: vec3, prev: vec3) => vec3;
