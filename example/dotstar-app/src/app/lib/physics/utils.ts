import { vec3 } from 'gl-matrix';
import { curry, transpose } from 'ramda';
import { Constraint } from './types';

type MultiValueOp = (...values: number[]) => number;

export class V3 {
  private static readonly vectorOp = curry((op: MultiValueOp, vecs: vec3[]): vec3 => {
    const [xs, ys, zs] = transpose<number>(vecs as any);
    return vec3.fromValues(
      op(...xs),
      op(...ys),
      op(...zs)
    );
  });

  static readonly diff = V3.vectorOp((first = 0, ...values) => values.reduce((d, v) => d - v, first));
  static readonly sum = V3.vectorOp((first = 0, ...values) => values.reduce((d, v) => d + v, first));
  static readonly scale = curry((s: number, v: vec3) => vec3.fromValues(v[0] * s, v[1] * s, v[2] * s));
  static readonly floor = (v: vec3) => vec3.floor(vec3.create(), v);
  static readonly ceil = (v: vec3) => vec3.ceil(vec3.create(), v);
  static readonly round = (v: vec3) => vec3.round(vec3.create(), v);
  static readonly add = (v1: vec3, v2: vec3) => vec3.add(vec3.create(), v1, v2);
  static readonly subtract = (v1: vec3, v2: vec3) => vec3.subtract(vec3.create(), v1, v2);
  static readonly multiply = (v1: vec3, v2: vec3) => vec3.multiply(vec3.create(), v1, v2);
}

export class PhysicsUtils {
  static readonly verticalWall = (wallX: number): Constraint => {
    return ({ X, _X, dt }) => {
      const xi = _X[0];
      const xf = X[0];
      const collision = wallX < Math.max(xi, xf) && wallX >= Math.min(xi, xf);
      return {
        _X: !collision ? _X : V3.add(_X, vec3.fromValues(2 * (wallX - xi), 0, 0)),
        X: !collision ? X : V3.add(X, vec3.fromValues(2 * (wallX - xf), 0, 0)),
        dt,
      };
    };
  }

  static readonly horizontalWall = (wallY: number): Constraint => {
    return ({ X, _X, dt }) => {
      const yi = _X[1];
      const yf = X[1];
      const collision = wallY < Math.max(yi, yf) && wallY >= Math.min(yi, yf);
      return {
        _X: !collision ? _X : V3.add(_X, vec3.fromValues(0, 2 * (wallY - yi), 0)),
        X: !collision ? X : V3.add(X, vec3.fromValues(0, 2 * (wallY - yf), 0)),
        dt,
      };
    };
  }
}

/**
 * Apply to a class property with a backup key. When the property is set,
 * its current value will be moved into the object kept at the backup key.
 */
export function backup(backupKey: string): PropertyDecorator {
  return (target: {}, propertyName: string): void => {
    let value: any;
    let firstSet = true;

    Object.defineProperty(target, propertyName, {
      get() {
        return value;
      },
      set(newValue: any) {
        if (firstSet) {
          target[backupKey] = target[backupKey] || {};
          target[backupKey][propertyName] = newValue;
          firstSet = false;
        }
        else {
          target[backupKey][propertyName] = value;
        }
        value = newValue;
      },
    });
  };
}
