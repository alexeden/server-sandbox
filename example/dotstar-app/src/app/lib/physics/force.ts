import { vec3 } from 'gl-matrix';

export interface ParticleLike {
  mass: number;
  x: vec3;
}

export type Force = (p: ParticleLike) => vec3;
