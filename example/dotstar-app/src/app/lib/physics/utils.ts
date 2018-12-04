import { vec3 } from 'gl-matrix';
import { Constraint } from './types';

export class PhysicsUtils {
  static readonly verticalWall = (wallX: number): Constraint => {
    return ({ X, X0, V, t }) => {
      const xi = X0[0];
      const xf = X[0];
      const collision = wallX < Math.max(xi, xf) && wallX >= Math.min(xi, xf);
      return {
        X0: !collision ? X0 : X, // V3.add(X0, vec3.fromValues(2 * (wallX - xi), 0, 0)),
        X: !collision ? X : X0, // V3.add(X, vec3.fromValues(2 * (wallX - xf), 0, 0)),
        // X0,
        // X,
        // V,
        V: V.times([-1, 1, 1]),
        t,
      };
    };
  }

  // static readonly horizontalWall = (wallY: number): Constraint => {
  //   return ({ X, _X, dt }) => {
  //     const yi = _X[1];
  //     const yf = X[1];
  //     const collision = wallY < Math.max(yi, yf) && wallY >= Math.min(yi, yf);
  //     return {
  //       _X: !collision ? _X : V3.add(_X, vec3.fromValues(0, 2 * (wallY - yi), 0)),
  //       X: !collision ? X : V3.add(X, vec3.fromValues(0, 2 * (wallY - yf), 0)),
  //       dt,
  //     };
  //   };
  // }
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
