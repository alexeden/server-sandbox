import { Injectable } from '@angular/core';
import { LeapController, Frame } from '@app/leap';
import { ConnectableObservable, Observable } from 'rxjs';
import { publishReplay, shareReplay, map, startWith } from 'rxjs/operators';
import { Hand } from '@app/leap/lib/hand';

@Injectable()
export class LeapPaintService {
  readonly latestFrame: Observable<Frame>;
  readonly hands: Observable<Hand[]>;
  readonly handCount: Observable<number>;

  constructor(
    readonly controller: LeapController
  ) {
    (window as any).LeapPaintService = this;
    this.latestFrame = this.controller.frameEventsByType('newFrame').pipe(
      shareReplay(1)
    );

    this.hands = this.latestFrame.pipe(map(frame => frame.hands));
    this.handCount = this.hands.pipe(
      map(hands => hands.length),
      startWith(0)
    );

  }

}
