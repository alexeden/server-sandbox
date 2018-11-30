import { vec3 } from 'gl-matrix';
import { Force, ParticleLike } from './force';

export class Particle implements ParticleLike {
  private dt = 0;

  constructor(
    public x: vec3,
    public mass = 1
  ) {

  }

  next(dt: number, fs: Force[]) {

  }

}
