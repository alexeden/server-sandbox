import { vec3 } from 'gl-matrix';
import { curry, transpose } from 'ramda';

type SingleValueOp = (value: number) => number;
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

  private static readonly scalarOp = curry((op: SingleValueOp, vec: vec3): vec3 => {
    return vec3.fromValues(
      op(vec[0]),
      op(vec[1]),
      op(vec[2])
    );
  });

  static readonly diff = V3.vectorOp((first = 0, ...values) => values.reduce((d, v) => d - v, first));
  static readonly sum = V3.vectorOp((first = 0, ...values) => values.reduce((d, v) => d + v, first));
  static readonly scale = (s: number, vec: vec3) => V3.scalarOp(value => s * value, vec);
}

export class PhysicsUtils {
  static sum(...vecs: vec3[]): vec3 {
    console.log('summing these: ', ...vecs);
    return vecs.reduce((sum, v) => vec3.add(sum, sum, v), vec3.create());
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
