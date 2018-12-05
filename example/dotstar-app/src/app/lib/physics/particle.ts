// tslint:disable variable-name
import { Force, Constraint, ParticleState } from './types';
import { Vector3 } from './vector3';

export class Particle implements ParticleState {
  readonly P: Vector3;
  readonly V: Vector3;
  readonly t: number;

  constructor(
    readonly mass = 1,
    inits: Partial<ParticleState> = {}
  ) {
    this.P = inits.P || Vector3.empty();
    this.V = inits.V || Vector3.empty();
    this.t = inits.t || 1;
  }

  get state(): ParticleState {
    return {
      t: this.t,
      V: this.V,
      P: this.P,
    };
  }

  next(t: number, fs: Force[] = [], constraints: Constraint[] = []) {
    // A = ∑F / m
    // V = V0 + A·t
    // P = X0 + (V0 + V) · ∆t/2
    const dt = t - this.t;
    const netF = fs.reduce((net, f) => net.plus(f(this)), Vector3.empty());
    const A = netF.divide(this.mass);
    const V = this.V.plus(A.times(dt));
    const P = this.P.add(this.V.add(V).times(dt / 2));

    const nextValues = constraints.reduce(
      (next, c) => c(this.state, next),
      { t, V, P }
    );

    return new Particle(this.mass, nextValues);
  }
}
