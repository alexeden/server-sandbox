import { Injectable } from '@angular/core';
import { DotstarConfigService } from './dotstar-config.service';
import {
  Observable,
  BehaviorSubject,
  interval,
  combineLatest,
  Scheduler,
  animationFrameScheduler,
  empty,
} from 'rxjs';
import { map, switchMap, distinctUntilChanged, share } from 'rxjs/operators';
import { Sample, ChannelSampler, clamp, range } from './lib';

@Injectable()
export class DotstarBufferService {
  private readonly running$ = new BehaviorSubject<boolean>(true);
  private readonly samplerFunction$ = new BehaviorSubject<ChannelSampler>(() => [ 0, 0, 0]);

  readonly running: Observable<boolean>;
  readonly clock: Observable<number>;
  readonly samplerFunction: Observable<ChannelSampler>;
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

    this.samplerFunction = this.samplerFunction$.asObservable();

    this.channelValues = combineLatest(
      this.clock,
      this.configService.length.pipe(map(l => range(0, l))),
      this.samplerFunction
    ).pipe(
      map(([t, emptyBuffer, sampler]) => {
        const { length: n } = emptyBuffer;
        return emptyBuffer.map((_, i) =>
          sampler(t, i, n).map(clamp(0x00, 0xff)) as Sample
        );
      }),
      share()
    );
  }

  updateSampler(s: ChannelSampler) {
    this.samplerFunction$.next(s);
  }

  pause() {
    this.running$.next(false);
  }

  resume() {
    this.running$.next(true);
  }
}
