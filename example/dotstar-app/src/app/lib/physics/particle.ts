// tslint:disable variable-name
import { vec3 } from 'gl-matrix';
import { Force, Constraint, ParticleState } from './types';
import { V3 } from './utils';

export class Particle {
  i = 0;
  _dt = 0;
  _x: vec3;

  constructor(
    public x = vec3.create(),
    public mass = 1
  ) {
    this._x = vec3.clone(this.x);
  }

  apply({ dt, _x, x }: ParticleState): number {
    this._dt = dt;
    this._x = _x;
    this.x = x;
    return this.i++;
  }

  next(dt: number, fs: Force[] = [], constraints: Constraint[] = []): ParticleState {
    if (this._dt < 1) this._dt = dt;

    const netF = V3.sum(fs.map(f => f(this)));
    const a = V3.scale(1 / this.mass, netF);

    const x = V3.sum([
      this.x,
      V3.scale(dt / this._dt, V3.diff([this.x, this._x])),
      V3.scale((dt / 2) * (dt + this._dt), a),
    ]);

    // Update iteration state
    return {
      dt,
      _x: vec3.clone(this.x),
      x,
    };
    // this._dt = dt;
    // this._x = this.x;
    // this.x = x;
    // this.i++;
  }
}


let particle: Particle;
console.log(particle = (window as any).particle = new Particle(vec3.fromValues(0, 100, 0), 1));
console.log(particle.x.toString());
const forces = [
  () => vec3.fromValues(0, -10, 0),
  () => vec3.fromValues(0.5, 0, 0),
];
console.log(JSON.stringify(particle, null, 4));
particle.apply(particle.next(1, forces));
console.log(JSON.stringify(particle, null, 4));
particle.apply(particle.next(1, forces));
console.log(JSON.stringify(particle, null, 4));
particle.apply(particle.next(1, forces));
console.log(JSON.stringify(particle, null, 4));
particle.apply(particle.next(1, forces));
console.log(JSON.stringify(particle, null, 4));
particle.apply(particle.next(1, forces));
console.log(JSON.stringify(particle, null, 4));
