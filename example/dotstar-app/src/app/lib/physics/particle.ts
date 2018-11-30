// tslint:disable variable-name
import { vec3 } from 'gl-matrix';
import { Force, ParticleSnapshot } from './types';
import { PhysicsUtils, backup } from './utils';

export class Particle implements ParticleSnapshot {
  @backup('_') i = 0;
  @backup('_') a = vec3.create();
  @backup('_') step = 0;
  @backup('_') netF = vec3.create();

  // _ prefix indicates "previous" value
  private _a = vec3.create();
  private _step = 0;
  private _netF = vec3.create();
  private _x: vec3;

  private _: ParticleSnapshot;

  constructor(
    public x: vec3 = vec3.create(),
    public mass = 1
  ) {
    this._x = vec3.clone(this.x);
  }

  next(step: number, fs: Force[]) {
    const netF = PhysicsUtils.sum(...fs.map(f => f(this)));
    const a = vec3.scale(vec3.create(), netF, 1 / this.mass);
    const dx = vec3.subtract(vec3.create(), this.x, this._x);
    const x = PhysicsUtils.sum(
      this.x,
      vec3.scale(vec3.create(), dx, step / this._step),
      vec3.scale(a, a, (step / 2) * (step + this._step))
    );

    // Update iteration state
    this._step = step;
    this._x = this.x;

    this.x = x;
    this.i++;
  }
}



console.log((window as any).particle = new Particle());
