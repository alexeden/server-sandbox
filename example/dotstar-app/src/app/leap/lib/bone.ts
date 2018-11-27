import { vec3, mat3, mat4 } from 'gl-matrix';
import { BoneType, Triple } from './types';

export class Bone {
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
    this.basisMatrix = mat3.fromValues(
      this.basis[0][0], this.basis[0][1], this.basis[0][2],
      this.basis[1][0], this.basis[1][1], this.basis[1][2],
      this.basis[2][0], this.basis[2][1], this.basis[2][2]
    );
    this.left = mat3.determinant(this.basisMatrix) < 0;
    this.center = vec3.lerp(vec3.create(), this.prevJoint, this.nextJoint, 0.5);
    this.direction = Bone.createBoneDirection(this.basisMatrix);
    this.matrix = Bone.createBoneMatrix(this.basisMatrix, this.center, this.left);
  }

  lerp(out: vec3, t: number) {
    return vec3.lerp(out, this.prevJoint, this.nextJoint, t);
  }

  static createBoneDirection(basis: mat3): vec3 {
    return vec3.fromValues(
      basis[6] * -1,
      basis[7] * -1,
      basis[8] * -1
    );
  }

  static createBoneMatrix(
    basis: mat3,
    center: vec3,
    isLeft: boolean
  ): mat4 {
    const t = mat4.fromValues(
      basis[0], basis[1], basis[2], center[0],
      basis[3], basis[4], basis[5], center[1],
      basis[6], basis[7], basis[8], center[2],
      0,        0,        0,        0
    );

    // flip the basis to be right-handed
    if (isLeft) {
      t[0] *= -1;
      t[1] *= -1;
      t[2] *= -1;
    }

    return t;
  }
}
