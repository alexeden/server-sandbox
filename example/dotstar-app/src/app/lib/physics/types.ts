import { Particle } from './particle';
import { Vector3 } from './vector3';

export type Force = (p: Particle) => Vector3;

export interface ParticleState {
  P: Vector3;
  V: Vector3;
  t: number;
}

export type Constraint = (initial: ParticleState, next: ParticleState) => ParticleState;
