import { Injectable } from '@angular/core';
import { DotstarDeviceConfigService } from './device-config.service';
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
import { AnimationClockService } from './animation-clock.service';

@Injectable()
export class DotstarBufferService {
  private readonly samplerFunction$ = new BehaviorSubject<ChannelSampler>(() => [ 0, 0, 0]);

  readonly running: Observable<boolean>;
  readonly samplerFunction: Observable<ChannelSampler>;
  readonly channelValues: Observable<Sample[]>;

  constructor(
    private configService: DotstarDeviceConfigService,
    private clock: AnimationClockService
  ) {
    (window as any).DotstarBufferService = this;
    this.running = this.clock.running;

    this.samplerFunction = this.samplerFunction$.asObservable();

    this.channelValues = combineLatest(
      this.clock.t,
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
    this.clock.pause();
  }

  resume() {
    this.clock.resume();
  }
}
