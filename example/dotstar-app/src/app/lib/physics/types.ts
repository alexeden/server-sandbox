import { Particle } from './particle';
import { Vector3 } from './vector3';

export type Force = (p: Particle) => Vector3;

export interface ParticleState {
  X: Vector3;
  V: Vector3;
  A: Vector3;
  mass: number;
  t: number;
}

export type Constraint = (initial: ParticleState, next: ParticleState) => ParticleState;
