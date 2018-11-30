import { vec3 } from 'gl-matrix';

export interface ParticleSnapshot {
  i: number;
  a: vec3;
  step: number;
  mass: number;
  netF: vec3;
  x: vec3;
}

export type Force = (p: ParticleSnapshot) => vec3;
