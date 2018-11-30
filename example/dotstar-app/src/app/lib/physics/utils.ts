import { vec3 } from 'gl-matrix';

export class PhysicsUtils {
  static sum(...vecs: vec3[]): vec3 {
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
