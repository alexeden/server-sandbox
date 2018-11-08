import { Injectable } from '@angular/core';
import { DotstarConfigService } from './dotstar-config.service';
import {
  Observable,
  ConnectableObservable,
  BehaviorSubject,
  interval,
  combineLatest,
  Scheduler,
  animationFrameScheduler,
  empty,
} from 'rxjs';
import { publishReplay, map, switchMap, distinctUntilChanged, share } from 'rxjs/operators';
import { range, ChannelSamplers, DotstarConstants, Sampler, Sample } from './lib';
import { Num } from 'pts';

@Injectable()
export class DotstarBufferService {
  // Time
  private readonly running$ = new BehaviorSubject<boolean>(true);
  readonly running: Observable<boolean>;
  readonly clock: Observable<number>;

  // Samplers
  private readonly samplerFunctions$ = new BehaviorSubject<ChannelSamplers>([ () => 0, () => 0, () => 0 ]);
  readonly samplerFunctions: Observable<ChannelSamplers>;

  // Values
  readonly channelValues: Observable<Sample[]>;

  constructor(
    private configService: DotstarConfigService
  ) {
    (window as any).DotstarBufferService = this;
    this.running = this.running$.asObservable();

    this.clock = this.running.pipe(
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

    this.samplerFunctions = this.samplerFunctions$.asObservable();

    this.channelValues = combineLatest(
      this.clock,
      this.configService.length.pipe(map(n => range(0, n).fill(0))),
      this.samplerFunctions
    ).pipe(
      map(([t, emptyBuffer, [r, g, b]]) => {
        t /= 1000;
        return emptyBuffer.map<Sample>((_, i) => [
          r(t, i, emptyBuffer.length),
          g(t, i, emptyBuffer.length),
          b(t, i, emptyBuffer.length),
        ]);
      }),
      share()
    );
  }

  updateSamplers([ r, g, b ]: ChannelSamplers) {
    const clampWrap = (fn: Sampler) => (...args: Parameters<Sampler>) => Math.floor(Num.clamp(fn(...args), 0x00, 0xff));
    this.samplerFunctions$.next([
      clampWrap(r),
      clampWrap(g),
      clampWrap(b),
    ]);
  }

  pause() {
    this.running$.next(false);
  }

  resume() {
    this.running$.next(true);
  }
}
