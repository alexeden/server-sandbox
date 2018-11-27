import { LeapHand } from './hand';
import { LeapPointable } from './pointable';
import { LeapFinger } from './finger';
import { vec3, mat3 } from 'gl-matrix';
import { InteractionBox } from './interaction-box';
import { MatrixUtils } from './matrix.utils';
import * as leap from './types';
import { sortBy } from 'ramda';
import { Assertions } from './assertions';

export class LeapFrame {
  readonly type = 'frame';
  readonly id: number;
  readonly timestamp: number;
  readonly interactionBox: InteractionBox;
  readonly currentFrameRate: number;
  readonly hands: LeapHand[] = [];
  readonly pointables: LeapPointable[];
  readonly fingers: LeapFinger[];
  readonly translation: vec3;
  readonly rotation: mat3;
  readonly scaleFactor: number;

  constructor(
    data: leap.FrameMessage
  ) {
    this.timestamp = data.timestamp || 0;
    this.interactionBox = new InteractionBox(data.interactionBox);
    this.translation = vec3.fromValues(...data.t);
    this.rotation = MatrixUtils.matrixFromTriplets(data.r);
    this.scaleFactor = data.s;
    this.currentFrameRate = data.currentFrameRate || 0;
    this.hands = data.hands.map(LeapHand.fromData);

    this.fingers =
      data.pointables
        .filter(Assertions.pointableDataIsFinger)
        .map(LeapFinger.fromData);

    this.pointables = sortBy(pointable => pointable.id, [...this.fingers ]);

    this.hands.forEach(hand =>
      this.fingers
        .filter(finger => hand.containsFinger(finger))
        .forEach(finger => hand.addFinger(finger))
    );
  }

  getFingerById(id: number): LeapFinger | null {
    return this.fingers.find(finger => finger.id === id) || null;
  }

  getHandById(id: number): LeapHand | null {
    return this.hands.find(hand => hand.id === id) ||  null;
  }

  toString() {
    // tslint:disable-next-line:max-line-length
    let str = 'Frame [ id:' + this.id + ' | timestamp:' + this.timestamp + ' | LeapHand count:(' + this.hands.length + ') | LeapPointable count:(' + this.pointables.length + ')';
    return str += ' ]';
  }
}
