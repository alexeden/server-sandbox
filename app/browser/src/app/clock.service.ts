import { Injectable } from '@angular/core';
import {
  animationFrameScheduler,
  BehaviorSubject,
  EMPTY,
  interval,
  Observable,
} from 'rxjs';
import {
  distinctUntilChanged,
  map,
  scan,
  share,
  switchMap,
} from 'rxjs/operators';

@Injectable()
export class ClockService {
  private readonly running$ = new BehaviorSubject(true);

  readonly running: Observable<boolean>;
  readonly t: Observable<Readonly<[t: number, dt: number]>>;
  readonly fps: Observable<number>;

  constructor() {
    this.running = this.running$.asObservable();

    this.t = this.running.pipe(
      distinctUntilChanged(),
      switchMap(running =>
        !running
          ? EMPTY
          : (startTime =>
              interval(0, animationFrameScheduler).pipe(
                map(() => performance.now()),
                map(now => [now, now - startTime] as const)
              ))(performance.now())
      ),
      share()
    );

    this.fps = this.t.pipe(
      scan((fps, [, dt]) => Math.floor((fps + 1000 / dt) / 2), 0),
      share()
    );
  }

  get isRunning() {
    return this.running$.value;
  }

  pause() {
    this.running$.next(false);
  }

  resume() {
    this.running$.next(true);
  }
}
