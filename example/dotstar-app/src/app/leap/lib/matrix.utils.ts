import { Matrix3 } from 'three';
import { Triple } from './types';


export class MatrixUtils {
  static matrixFromTriplets([
    [m00, m01, m02],
    [m10, m11, m12],
    [m20, m21, m22],
  ]: Triple<Triple<number>>): Matrix3 {
    return new Matrix3().set(m00, m01, m02, m10, m11, m12, m20, m21, m22);
  }
}
