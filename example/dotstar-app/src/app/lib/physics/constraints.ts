import { Constraint } from './types';
import { Vector3 } from './vector3';

export class Constraints {
  static readonly epsilon = 0.0001;

  static readonly verticalWall = (wallX: number, dampen = 0.9): Constraint => {
    return (inits, { X, V, ...rest }) => {
      const xi = inits.X.x;
      const xf = X.x;
      const collision = wallX < Math.max(xi, xf) && wallX > Math.min(xi, xf);
      return {
        ...rest,
        X: !collision ? X : X.setX(xi),
        V: !collision ? V : V.multiply([-dampen, 1, 1]),
      };
    };
  }

  static readonly horizontalWall = (wallY: number, dampen = 0.9): Constraint => {
    return (inits, { X, V, ...rest }) => {
      const yi = inits.X.y;
      const yf = X.y;
      const collision = wallY <= Math.max(yi, yf) && wallY > Math.min(yi, yf);
      return {
        ...rest,
        X: !collision ? X : X.setY(yi),
        V: !collision ? V : V.multiply([1, -dampen, 1]),
      };
    };
  }

  static readonly axisLock = (axis: 'x' | 'y' | 'z'): Constraint => {
    return (inits, { V, ...rest }) => {
      return {
        ...rest,
        V: V.setAxis(axis, 0), // Vector3.empty().setAxis(axis, V[axis]),
        // V: Vector3.empty().setAxis(axis, V[axis]),
        // V.setAxis(),
        // X,
        // X: X.setAxis(axis, inits.X[axis]),
      };
    };
  }
}
