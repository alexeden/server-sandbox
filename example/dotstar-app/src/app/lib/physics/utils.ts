import { vec3 } from 'gl-matrix';

export class PhysicsUtils {
  static sum(...vecs: vec3[]): vec3 {
    return vecs.reduce((sum, v) => vec3.add(sum, sum, v), vec3.create());
  }
}
