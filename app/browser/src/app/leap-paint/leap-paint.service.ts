import { Injectable } from '@angular/core';
import { LeapController, Frame } from './lib';
import { Observable } from 'rxjs';
import { shareReplay, map, startWith, tap } from 'rxjs/operators';
import { Hand } from '@app/leap-paint/lib/leap/hand';

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
      tap(frame => (window as any).frame = frame),
      shareReplay(1)
    );

    this.hands = this.latestFrame.pipe(map(frame => frame.hands));
    this.handCount = this.hands.pipe(
      map(hands => hands.length),
      startWith(0)
    );

  }

}
