// tslint:disable variable-name
import { Force, Constraint, ParticleState } from './types';
import { Vector3 } from './vector3';

export class Particle implements ParticleState {
  X: Vector3;
  X0: Vector3;
  // readonly V: Vector3;
  A: Vector3;
  // readonly delta: number;
  readonly mass: number;

  constructor(state: Partial<ParticleState> = {}) {
    this.X = state.X || Vector3.of(0, 0, 0);
    this.X0 = this.X.clone();
    // this.V = state.V || Vector3.empty();
    this.A = Vector3.of(0, 0, 0); // state.A || Vector3.empty();
    this.mass = 1; // state.mass || 1;
    // this.t = state.t || 1;
  }

  // get state(): ParticleState {
  //   return {
  //     X: this.X,
  //     X0: this.X0,
  //     // V: this.V,
  //     A: this.A,
  //     // t: this.t,
  //     mass: this.mass,
  //   };
  // }

  next(delta: number, fs: Force[] = [], constraints: Constraint[] = []) {
    // A = ∑F / mass
    // V = V0 + A·t
    // X = X0 + (V0 + V) · ∆t/2
    // const dt = delta;

    const X = this.X; // .clone();
    const F = fs.reduce((net, f) => net.plus(f(this)), Vector3.empty());
    this.A = F.divide(this.mass).times(delta * delta); // .settle();
    this.X = X.times(2).minus(this.X0).plus(this.A); // .setX(0);
    this.X0 = X;
    // const mass = this.mass;
    // const V0 = this.V;
    // const V = V0.plus(A.times(dt)); // .settle();
    // const X = X0.add(V0.add(V).times(dt / 2)); // .settle();

    constraints.forEach(constraint => constraint(this));
    // const nextValues = constraints.reduce(
    //   (next, c) => c(this.state, next),
    //   { X, V, A, mass, delta }
    // );

    // return new Particle(nextValues);
  }
}
