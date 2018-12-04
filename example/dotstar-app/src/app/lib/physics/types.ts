import { vec3 } from 'gl-matrix';
import { Particle } from './particle';

export interface ParticleState {
  t: number;
  V: vec3;
  X0: vec3;
  X: vec3;
}

export type Force = (p: Particle) => vec3;

export type Constraint = (state: ParticleState) => ParticleState;
