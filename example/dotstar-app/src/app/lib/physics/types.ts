import { vec3 } from 'gl-matrix';
import { Particle } from './particle';

export interface ParticleState {
  dt: number;
  _X: vec3;
  X: vec3;
}

export type Force = (p: Particle) => vec3;

export type Constraint = (state: ParticleState) => ParticleState;
