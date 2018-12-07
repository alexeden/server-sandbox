import { Force } from './types';

export class Forces {
  /**
   * The `density` of water is 1,000; air is 1.2
   * `area` is the cross sectional area of an object (default is sphere with radius of 1)
   * The `drag` coeefficient of a sphere is 0.47
   */
  static drag(density: number, area = Math.PI, drag = 0.47): Force {
    const coeff = (density * drag * area) / 2;
    return p => p.V.squared().multiply(coeff);
  }
}
