import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { UiConstants } from './lib';

@Injectable()
export class DotstarUiConfigService {
  private readonly fps$ = new BehaviorSubject<number>(10);
  readonly fps: Observable<number>;
  readonly clock: Observable<number>;

  constructor(

  ) {
    this.fps = this.fps$.asObservable().pipe(
      map(fps => Math.min(UiConstants.fpsMin, Math.max(UiConstants.fpsMax, fps)))
    );

    this.clock = this.fps.pipe(
      switchMap(fps => interval(1000 / fps))
    );
  }

  setFps(fps: number) {
    this.fps$.next(fps);
  }
}
