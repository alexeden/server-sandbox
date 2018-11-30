import { vec3 } from 'gl-matrix';
import { Particle } from './particle';

export interface ParticleSnapshot {
  i: number;
  a: vec3;
  step: number;
  mass: number;
  netF: vec3;
  x: vec3;
}

export type Force = (p: Particle) => vec3;

export type Constraint = (next: Particle, prev: Particle) => Particle;
