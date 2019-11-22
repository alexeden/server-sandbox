import { Observable, BehaviorSubject, empty, interval, animationFrameScheduler, Scheduler, ConnectableObservable } from 'rxjs';
import { distinctUntilChanged, switchMap, map, share, scan, pairwise, publishReplay } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable()
export class AnimationClockService {
  private readonly running$ = new BehaviorSubject(true);

  readonly running: Observable<boolean>;
  readonly t: Observable<number>;
  readonly dt: Observable<number>;
  readonly fps: Observable<number>;

  constructor() {
    (window as any).clock = this;
    this.running = this.running$.asObservable();
    this.t = this.running.pipe(
      distinctUntilChanged(),
      switchMap(running =>
        !running
        ? empty()
        : (startTime => interval(0, animationFrameScheduler).pipe(
            map(() => Scheduler.now() - startTime)
          ))(Scheduler.now())
      ),
      share()
    );

    this.dt = this.t.pipe(
      pairwise(),
      map(([t1, t2]) => t2 - t1),
      share()
    );

    this.fps = this.dt.pipe(
      scan((fps, dt) => Math.floor((fps + (1000 / dt)) / 2), 0),
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
