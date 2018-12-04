// tslint:disable variable-name
import { vec3 } from 'gl-matrix';
import { Force, Constraint, ParticleState } from './types';
import { V3 } from './utils';

export class Particle {
  i = 0;
  _dt = 0;
  _X: vec3;
  netF: vec3;

  constructor(
    public X = vec3.create(),
    public mass = 1
  ) {
    this._X = vec3.clone(this.X);
  }

  apply({ dt, _X, X }: ParticleState): number {
    this._dt = dt;
    this._X = _X;
    this.X = X;
    return this.i++;
  }

  next(dt: number, fs: Force[] = [], constraints: Constraint[] = []): ParticleState {
    if (this._dt < 1) this._dt = dt;

    const netF = this.netF = V3.sum(fs.map(f => f(this)));
    const A = V3.scale(0.1 / this.mass, netF);

    const X = V3.sum([
      this.X,
      V3.scale(dt / this._dt, V3.diff([this.X, this._X])),
      V3.scale((dt / 2) * (dt + this._dt), A),
    ]);

    const next = { dt, _X: vec3.clone(this.X), X };
    return constraints.reduce((state, constraint) => constraint(state), next);
  }
}
