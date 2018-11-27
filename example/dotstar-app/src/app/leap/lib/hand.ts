import { LeapBone } from './bone';
import { LeapFinger } from './finger';
import { LeapPointable } from './pointable';
import { Vector3, Matrix3 } from 'three';
import { MatrixUtils } from './matrix.utils';
import * as leap from './types';

export class LeapHand {

  readonly armBasis: leap.Triple<Vector3>;
  readonly armWidth: number;
  readonly confidence: number;
  readonly direction: Vector3;
  readonly elbow: Vector3;
  readonly grabStrength: number;
  readonly id: number;
  readonly palmNormal: Vector3;
  readonly palmPosition: Vector3;
  readonly palmVelocity: Vector3;
  readonly palmWidth: number;
  readonly pinchStrength: number;
  readonly r: Matrix3;
  readonly s: number;
  readonly sphereCenter: Vector3;
  readonly sphereRadius: number;
  readonly stabilizedPalmPosition: Vector3;
  readonly t: Vector3;
  readonly timeVisible: number;
  readonly type: 'left' | 'right';
  readonly wrist: Vector3;

  readonly pitch: number;
  readonly yaw: number;
  readonly roll: number;

  readonly arm: LeapBone;
  fingers: { [fingerType: string]: LeapFinger | null };
  pointables: LeapPointable[];

  static fromData(data: leap.HandData) {
    return new LeapHand(data);
  }

  private constructor(
    data: leap.HandData
  ) {
    this.armBasis = data.armBasis.map(basis => new Vector3(...basis)) as leap.Triple<Vector3>;
    this.armWidth = data.armWidth;
    this.confidence = data.confidence;
    this.direction = new Vector3(...data.direction);
    this.elbow = new Vector3(...data.elbow);
    this.grabStrength = data.grabStrength;
    this.id = data.id;
    this.palmNormal = new Vector3(...data.palmNormal);
    this.palmPosition = new Vector3(...data.palmPosition);
    this.palmVelocity = new Vector3(...data.palmVelocity);
    this.palmWidth = data.palmWidth;
    this.pinchStrength = data.pinchStrength;
    this.r = MatrixUtils.matrixFromTriplets(data.r);
    this.s = data.s;
    this.sphereCenter = new Vector3(...data.sphereCenter);
    this.sphereRadius = data.sphereRadius;
    this.stabilizedPalmPosition = new Vector3(...data.stabilizedPalmPosition);
    this.t = new Vector3(...data.t);
    this.timeVisible = data.timeVisible;
    this.type = data.type;
    this.wrist = new Vector3(...data.wrist);


    this.pointables = [];
    this.fingers = {};

    this.arm = new LeapBone(
      leap.BoneType.arm,
      this.armBasis,
      this.elbow,
      this.wrist,
      this.armWidth
    );

    this.pitch = Math.atan2(this.direction[1], -this.direction[2]);
    this.yaw = Math.atan2(this.direction[0], -this.direction[2]);
    this.roll = Math.atan2(this.palmNormal[0], -this.palmNormal[1]);
  }

  containsFinger(finger: LeapFinger): boolean {
    return finger.handId === this.id;
  }

  addFinger(finger: LeapFinger): LeapFinger {
    if (!this.containsFinger(finger)) {
      throw new Error(`Attempted to add a finger to the wrong hand!`);
    }
    this.fingers = { ...this.fingers, [finger.type]: finger };
    return finger;
  }

  toString() {
    // tslint:disable-next-line:max-line-length
    return 'Hand (' + this.type + ') [ id: ' + this.id + ' | palm velocity:' + this.palmVelocity + ' | sphere center:' + this.sphereCenter + ' ] ';
  }
}
