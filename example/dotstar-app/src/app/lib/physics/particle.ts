// tslint:disable variable-name
import { vec3 } from 'gl-matrix';
import { Force, Constraint, ParticleState } from './types';
import { V3 } from './utils';

export class Particle {
  i = 0;
  V0: vec3 = vec3.create();
  X0: vec3;
  netF: vec3;

  constructor(
    public X = vec3.create(),
    public mass = 1
  ) {
    this.X0 = vec3.clone(this.X);
  }

  next(t: number, fs: Force[] = [], constraints: Constraint[] = []) {
    const netF = this.netF = V3.sum(fs.map(f => f(this)));
    const a = V3.scale(1 / this.mass, netF);
    // const a = V3.scale(Math.pow(t, 2) / 2, A);
    const v_t = V3.scale(t / 2, V3.sum([this.V0, this.V0, V3.scale(t, a)]));
    // const v = V3.scale(t, this.V0);
    // const x = vec3.clone(this.X);
    const X = V3.sum([this.X, v_t]);
    // V3.add(this.X, V3.scale(t / 2, V3.add(V, this.V)));

    this.X0 = this.X;
    this.X = X;
    this.V0 = v_t;
    // return {
    //   X,
    //   X0: vec3.clone(this.X),
    //   V: v,
    //   t,
    // };
    // const next = {
    //   X,
    //   X0: vec3.clone(this.X),
    //   V,
    //   t,
    // };
    // return constraints.reduce((state, constraint) => constraint(state), next);
  }
}
