// tslint:disable variable-name
import { Force, Constraint, ParticleState } from './types';
import { Vector3 } from './vector3';

export class Particle implements ParticleState {
  readonly X: Vector3;
  readonly V: Vector3;
  readonly A: Vector3;
  readonly t: number;
  readonly mass: number;

  constructor(state: Partial<ParticleState> = {}) {
    this.X = state.X || Vector3.empty();
    this.V = state.V || Vector3.empty();
    this.A = state.A || Vector3.empty();
    this.mass = state.mass || 1;
    this.t = state.t || 1;
  }

  get state(): ParticleState {
    return {
      X: this.X,
      V: this.V,
      A: this.A,
      t: this.t,
      mass: this.mass,
    };
  }

  next(t: number, fs: Force[] = [], constraints: Constraint[] = []) {
    // A = ∑F / mass
    // V = V0 + A·t
    // X = X0 + (V0 + V) · ∆t/2
    const dt = t - this.t;
    const mass = this.mass;
    const A = fs.reduce((net, f) => net.plus(f(this)), Vector3.empty()).divide(mass);
    const V = this.V.plus(A.times(dt));
    const X = this.X.add(this.V.add(V).times(dt / 2));

    const nextValues = constraints.reduce(
      (next, c) => c(this.state, next),
      { X, V, A, mass, t }
    );

    return new Particle(nextValues);
  }
}
