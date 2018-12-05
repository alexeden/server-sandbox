import { Constraint } from './types';

export class Constraints {
  static readonly verticalWall = (wallX: number): Constraint => {
    return (inits, { P, V, ...rest }) => {
      const xi = inits.P.x;
      const xf = P.x;
      const collision = wallX < Math.max(xi, xf) && wallX >= Math.min(xi, xf);
      return {
        ...rest,
        P: !collision ? P : P.setX(xi),
        V: !collision ? V : V.negateX(),
      };
    };
  }

  static readonly horizontalWall = (wallY: number): Constraint => {
    return (inits, { P, V, ...rest }) => {
      const yi = inits.P.y;
      const yf = P.y;
      const collision = wallY < Math.max(yi, yf) && wallY >= Math.min(yi, yf);
      return {
        ...rest,
        P: !collision ? P : P.setY(yi),
        V: !collision ? V : V.negateY(),
      };
    };
  }
}
