import { vec3, mat3, mat4 } from 'gl-matrix';
import { MatrixUtils } from './matrix.utils';
import { BoneType, Triple } from './types';

export class LeapBone {
  readonly length: number;
  readonly left: boolean;
  readonly center: vec3;
  readonly matrix: mat4;
  readonly basisMatrix: mat3;
  readonly direction: vec3;

  constructor(
    readonly type: BoneType,
    readonly basis: Triple<vec3>,
    readonly prevJoint: vec3,
    readonly nextJoint: vec3,
    readonly width: number
  ) {
    const difference = vec3.subtract(vec3.create(), this.nextJoint, this.prevJoint);
    this.length = vec3.length(difference);
    this.basisMatrix = MatrixUtils.matrixFromTriplets([
      this.basis[0].toArray() as Triple<number>,
      this.basis[1].toArray() as Triple<number>,
      this.basis[2].toArray() as Triple<number>,
    ]);
    this.left = this.basisMatrix.determinant() < 0;
    this.center = new Vector3().lerpVectors(this.prevJoint, this.nextJoint, 0.5);
    this.direction = LeapBone.createBoneDirection(this.basisMatrix);
    this.matrix = LeapBone.createBoneMatrix(this.basisMatrix, this.center, this.left);
  }

  lerp(out: vec3, t: number) {
    return out.lerpVectors(this.prevJoint, this.nextJoint, t);
  }

  static createBoneDirection({ elements }: Matrix3): vec3 {
    return vec3.fromValues(
      elements[6] * -1,
      elements[7] * -1,
      elements[8] * -1
    );
  }

  static createBoneMatrix(
    basis: Matrix3,
    center: Vector3,
    isLeft: boolean
  ): Matrix4 {
    const { elements } = basis.clone();
    const t = new Matrix4();
    const c = center.clone();

    t[0] = elements[0];
    t[1] = elements[1];
    t[2]  = elements[2];
    t[3] = c[0];
    t[4] = elements[3];
    t[5] = elements[4];
    t[6]  = elements[5];
    t[7] = c[1];
    t[8] = elements[6];
    t[9] = elements[7];
    t[10] = elements[8];
    t[11] = c[2];

    // flip the basis to be right-handed
    if (isLeft) {
      t[0] *= -1;
      t[1] *= -1;
      t[2] *= -1;
    }

    return t;
  }
}
