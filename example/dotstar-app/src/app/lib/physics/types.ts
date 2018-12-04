import { Particle } from './particle';
import { Vector3 } from './vector3';

export interface ParticleState {
  t: number;
  V: Vector3;
  X0: Vector3;
  X: Vector3;
}

export type Force = (p: Particle) => Vector3;

export type Constraint = (state: ParticleState) => ParticleState;
