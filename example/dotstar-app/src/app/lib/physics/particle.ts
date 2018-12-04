// tslint:disable variable-name
import { Force } from './types';
import { Vector3 } from './vector3';

(window as any).Vector3 = Vector3;

interface InitialValues {
  P0: Vector3;
  V0: Vector3;
  t0: number;
}

export class Particle implements InitialValues {
  readonly P0: Vector3;
  readonly V0: Vector3;
  readonly t0: number;

  constructor(
    readonly mass = 1,
    private inits: Partial<InitialValues> = {}
  ) {
    this.P0 = this.inits.P0 || Vector3.empty();
    this.V0 = this.inits.V0 || Vector3.empty();
    this.t0 = this.inits.t0 || 1;
    (window as any).particle = this;
  }

  // static v_t(a: Vector3, v0: Vector3): FnOfTime {
  //   return (t: number) => V3.sum([v0, V3.scale(t, a)]);
  // }

  // static p_t(a: Vector3, v0: Vector3, p0: Vector3): FnOfTime {
  //   return t => {
  //     const at2 = Vector3.scale(Vector3.create(), a, Math.pow(t, 2) / 2);
  //     const vt = Vector3.scale(Vector3.create(), v0, t);
  //     return V3.sum([p0, vt, at2])
  //   };
  // }

  next(_t: number, fs: Force[] = []) {
    const dt = _t - this.t0;
    const netF = fs.reduce((net, f) => net.plus(f(this)), Vector3.empty());
    const A = netF.divide(this.mass);
    const V = this.V0.plus(A.times(dt));
    const P = this.P0
      .add(this.V0.times(dt))
      .add(A.times(Math.pow(dt, 2) / 2));

    return new Particle(this.mass, {
      P0: P,
      V0: V,
      t0: _t,
    });

    // const v = this.v = Particle.v_t(a, this.V0)(dt);
    // const v_t = V3.scale(dt / 2, V3.sum([this.V0, this.V0, V3.scale(dt, a)]));
    // const X = V3.sum([this.X, v_t]);

    // this.t0 = t;
    // this.X0 = this.X;
    // this.X = X;
    // this.V0 = v_t;
  }
}
