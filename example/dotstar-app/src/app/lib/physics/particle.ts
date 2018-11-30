// tslint:disable variable-name
import { vec3 } from 'gl-matrix';
import { Force, Constraint } from './types';
import { V3 } from './utils';

export class Particle {
  i = 0;
  _a = vec3.create();
  _step = 0;
  _x: vec3;
  _netF = vec3.create();

  constructor(
    public x = vec3.create(),
    public mass = 1
  ) {
    this._x = vec3.clone(this.x);
  }

  next(step: number, fs: Force[] = [], constraints: Constraint[] = []) {
    if (this._step < 1) this._step = step;

    const netF = V3.sum(fs.map(f => f(this)));
    const a = V3.scale(1 / this.mass, netF);

    const x = V3.sum([
      this.x,
      V3.scale(step / this._step, V3.diff([this.x, this._x])),
      V3.scale((step / 2) * (step + this._step), a),
    ]);

    // Update iteration state
    this._a = a;
    this._netF = netF;
    this._step = step;
    this._x = this.x;
    this.x = x;
    this.i++;
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
particle.next(1, forces);
console.log(JSON.stringify(particle, null, 4));
particle.next(1, forces);
console.log(JSON.stringify(particle, null, 4));
particle.next(1, forces);
console.log(JSON.stringify(particle, null, 4));
particle.next(1, forces);
console.log(JSON.stringify(particle, null, 4));
particle.next(1, forces);
console.log(JSON.stringify(particle, null, 4));
