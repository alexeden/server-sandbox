import { Hand } from './hand';
import { Pointable } from './pointable';
import { Finger } from './finger';
import { vec3, mat3 } from 'gl-matrix';
import { InteractionBox } from './interaction-box';
import { FrameMessage } from './types';
import { sortBy } from 'ramda';
import { Assertions } from './assertions';

export class Frame {
  readonly type = 'frame';
  readonly id: number;
  readonly timestamp: number;
  readonly interactionBox: InteractionBox;
  readonly currentFrameRate: number;
  readonly hands: Hand[] = [];
  readonly pointables: Pointable[];
  readonly fingers: Finger[];
  readonly translation: vec3;
  readonly rotation: mat3;
  readonly scaleFactor: number;

  constructor(
    data: FrameMessage
  ) {
    this.timestamp = data.timestamp || 0;
    this.interactionBox = new InteractionBox(
      vec3.fromValues(...data.interactionBox.center),
      vec3.fromValues(...data.interactionBox.size)
    );
    this.translation = vec3.fromValues(...data.t);
    this.rotation = mat3.fromValues(
      data.r[0][0], data.r[0][1], data.r[0][2],
      data.r[1][0], data.r[1][1], data.r[1][2],
      data.r[2][0], data.r[2][1], data.r[2][2]
    );
    this.scaleFactor = data.s;
    this.currentFrameRate = data.currentFrameRate || 0;

    // Create the hands
    this.hands = data.hands.map(Hand.fromData);

    // Create the fingers
    this.fingers =
      data.pointables
        .filter(Assertions.pointableDataIsFinger)
        .map(Finger.fromData);

    this.pointables = sortBy(pointable => pointable.id, [...this.fingers ]);

    // Add the fingers to the hands
    this.hands.forEach(hand =>
      this.fingers
        .filter(({ handId }) => hand.containsFinger(handId))
        .forEach(finger => hand.addFinger(finger))
    );
  }

  getFingerById(id: number): Finger | null {
    return this.fingers.find(finger => finger.id === id) || null;
  }

  getHandById(id: number): Hand | null {
    return this.hands.find(hand => hand.id === id) ||  null;
  }

  toString() {
    // tslint:disable-next-line:max-line-length
    let str = `Frame [ id:${  this.id  } | timestamp:${  this.timestamp  } | Hand count:(${  this.hands.length  }) | Pointable count:(${  this.pointables.length  })`;
    return str += ' ]';
  }
}
