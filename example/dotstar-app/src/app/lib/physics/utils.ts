import { vec3 } from 'gl-matrix';
import { curry, transpose } from 'ramda';

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
