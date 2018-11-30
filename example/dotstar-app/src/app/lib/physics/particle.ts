// tslint:disable variable-name
import { vec3 } from 'gl-matrix';
import { Force, ParticleLike } from './types';
import { PhysicsUtils } from './utils';

export class Particle implements ParticleLike {
  // _ prefix indicates "previous" value
  private _dt = 0;
  private _x: vec3;

  constructor(
    public x: vec3 = vec3.create(),
    public mass = 1
  ) {
    this._x = vec3.clone(this.x);
  }

  next(dt: number, fs: Force[]) {
    const netF = PhysicsUtils.sum(...fs.map(f => f(this)));
    const a = vec3.scale(vec3.create(), netF, 1 / this.mass);
    const dx = vec3.subtract(vec3.create(), this.x, this._x);

    // x + vt + att
    const att = vec3.scale(a, a, (dt / 2) * (dt + this._dt));
    const vt = vec3.scale(dx, dx, dt / this._dt);
    const x = vec3.clone(this.x);

    // Update iteration state
    this._dt = dt;
    this._x = this.x;

    this.x = PhysicsUtils.sum(x, vt, att);
  }
}
