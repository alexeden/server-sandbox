import { Bone } from './bone';
import { Finger } from './finger';
import { Pointable } from './pointable';
import { vec3, mat3 } from 'gl-matrix';
import { Triple, HandData, BoneType } from './types';

export class Hand {

  readonly armBasis: Triple<vec3>;
  readonly armWidth: number;
  readonly confidence: number;
  readonly direction: vec3;
  readonly elbow: vec3;
  readonly grabStrength: number;
  readonly id: number;
  readonly palmNormal: vec3;
  readonly palmPosition: vec3;
  readonly palmVelocity: vec3;
  readonly palmWidth: number;
  readonly pinchStrength: number;
  readonly r: mat3;
  readonly s: number;
  readonly sphereCenter: vec3;
  readonly sphereRadius: number;
  readonly stabilizedPalmPosition: vec3;
  readonly t: vec3;
  readonly timeVisible: number;
  readonly type: 'left' | 'right';
  readonly wrist: vec3;

  readonly pitch: number;
  readonly yaw: number;
  readonly roll: number;

  readonly arm: Bone;
  fingers: { [fingerType: string]: Finger | null };
  pointables: Pointable[];

  static fromData(data: HandData) {
    return new Hand(data);
  }

  private constructor(
    data: HandData
  ) {
    this.armBasis = data.armBasis.map(basis => vec3.fromValues(...basis)) as Triple<vec3>;
    this.armWidth = data.armWidth;
    this.confidence = data.confidence;
    this.direction = vec3.fromValues(...data.direction);
    this.elbow = vec3.fromValues(...data.elbow);
    this.grabStrength = data.grabStrength;
    this.id = data.id;
    this.palmNormal = vec3.fromValues(...data.palmNormal);
    this.palmPosition = vec3.fromValues(...data.palmPosition);
    this.palmVelocity = vec3.fromValues(...data.palmVelocity);
    this.palmWidth = data.palmWidth;
    this.pinchStrength = data.pinchStrength;
    this.r = mat3.fromValues(
      data.r[0][0], data.r[0][1], data.r[0][2],
      data.r[1][0], data.r[1][1], data.r[1][2],
      data.r[2][0], data.r[2][1], data.r[2][2]
    );
    this.s = data.s;
    this.sphereCenter = vec3.fromValues(...data.sphereCenter);
    this.sphereRadius = data.sphereRadius;
    this.stabilizedPalmPosition = vec3.fromValues(...data.stabilizedPalmPosition);
    this.t = vec3.fromValues(...data.t);
    this.timeVisible = data.timeVisible;
    this.type = data.type;
    this.wrist = vec3.fromValues(...data.wrist);


    this.pointables = [];
    this.fingers = {};

    this.arm = new Bone(
      BoneType.arm,
      this.armBasis,
      this.elbow,
      this.wrist,
      this.armWidth
    );

    this.pitch = Math.atan2(this.direction[1], -this.direction[2]);
    this.yaw = Math.atan2(this.direction[0], -this.direction[2]);
    this.roll = Math.atan2(this.palmNormal[0], -this.palmNormal[1]);
  }

  containsFinger(handId: number): boolean {
    return handId === this.id;
  }

  addFinger(finger: Finger): Finger {
    if (!this.containsFinger(finger.handId)) {
      throw new Error(`Attempted to add a finger to the wrong hand!`);
    }
    this.fingers = { ...this.fingers, [finger.type]: finger };
    return finger;
  }

  toString() {
    // tslint:disable-next-line:max-line-length
    return `Hand (${  this.type  }) [ id: ${  this.id  } | palm velocity:${  this.palmVelocity  } | sphere center:${  this.sphereCenter  } ] `;
  }
}
