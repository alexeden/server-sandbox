import { Constraint } from './types';

export class Constraints {
  static readonly verticalWall = (wallX: number): Constraint => {
    return (inits, { X, V, ...rest }) => {
      const xi = inits.X.x;
      const xf = X.x;
      const collision = wallX < Math.max(xi, xf) && wallX > Math.min(xi, xf);
      return {
        ...rest,
        X: !collision ? X : X.setX(xi),
        V: !collision ? V : V.negateX(),
      };
    };
  }

  static readonly horizontalWall = (wallY: number): Constraint => {
    return (inits, { X, V, ...rest }) => {
      const yi = inits.X.y;
      const yf = X.y;
      const collision = wallY < Math.max(yi, yf) && wallY > Math.min(yi, yf);
      return {
        ...rest,
        X: !collision ? X : X.setY(yi),
        V: !collision ? V : V.negateY(),
      };
    };
  }

  static readonly axisLock = (axis: 'x' | 'y' | 'z'): Constraint => {
    return (inits, { X, ...rest }) => {
      return {
        ...rest,
        X: X.setAxis(axis, inits.X[axis]),
      };
    };
  }
}
