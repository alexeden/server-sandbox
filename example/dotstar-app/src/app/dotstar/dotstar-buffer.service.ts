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
import { ChannelSamplers, DotstarConstants, Sampler, Sample, RGB } from './lib';
import { Num } from 'pts';
import { clamp, range } from 'ramda';

@Injectable()
export class DotstarBufferService {
  private readonly running$ = new BehaviorSubject<boolean>(true);
  private readonly samplerFunctions$ = new BehaviorSubject<ChannelSamplers>([ () => 0, () => 0, () => 0 ]);

  readonly running: Observable<boolean>;
  readonly clock: Observable<number>;
  readonly samplerFunctions: Observable<ChannelSamplers>;
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
      this.configService.length.pipe(map(range(0))),
      this.samplerFunctions
    ).pipe(
      map(([t, emptyBuffer, [r, g, b]]) => {
        const { length: n } = emptyBuffer;
        return emptyBuffer.map((_, i) =>
          [ r(t, i, n), g(t, i, n), b(t, i, n) ].map(clamp(0x00, 0xff)) as Sample
        );
      }),
      share()
    );
  }

  updateSamplers([ r, g, b ]: ChannelSamplers) {
    console.log('updating samplers: ', r, g, b);
    this.samplerFunctions$.next([ r, g, b]);
  }

  pause() {
    this.running$.next(false);
  }

  resume() {
    this.running$.next(true);
  }
}
