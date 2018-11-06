import { Injectable } from '@angular/core';
import { DotstarConfigService } from './dotstar-config.service';
import { Observable, ConnectableObservable, BehaviorSubject, interval, combineLatest } from 'rxjs';
import { publishReplay, map, switchMap } from 'rxjs/operators';
import { range, ChannelSamplers, DotstarConstants, Sampler, Sample } from './lib';
import { Num } from 'pts';

@Injectable()
export class DotstarBufferService {
  // Time
  private readonly fps$ = new BehaviorSubject<number>(5);
  readonly fps: Observable<number>;
  readonly clock: Observable<number>;

  // Samplers
  private readonly samplers$ = new BehaviorSubject<ChannelSamplers>([ () => 0, () => 0, () => 0 ]);
  readonly samplers: Observable<ChannelSamplers>;

  // Values
  readonly channelValues: Observable<Sample[]>;
  readonly buffer: ConnectableObservable<number[]>;

  constructor(
    private configService: DotstarConfigService
  ) {
    (window as any).DotstarBufferService = this;
    this.fps = this.fps$.asObservable().pipe(
      map(fps => Math.min(DotstarConstants.fpsMax, Math.max(DotstarConstants.fpsMin, fps)))
    );

    this.clock = this.fps.pipe(switchMap(fps => interval(1000 / fps)));

    this.samplers = this.samplers$.asObservable();

    this.channelValues = combineLatest(
      this.clock,
      this.configService.length.pipe(map(n => range(0, n).fill(0))),
      this.samplers
    ).pipe(
      map(([t, emptyBuffer, [r, g, b]]) => {
        t /= 1000;
        return emptyBuffer.map<Sample>((_, i) => [
          r(t, i, emptyBuffer.length),
          g(t, i, emptyBuffer.length),
          b(t, i, emptyBuffer.length),
        ]);
      })
    );

    this.buffer = this.configService.length.pipe(
      map(length => range(0, length).fill(0)),
      publishReplay(1)
    ) as ConnectableObservable<number[]>;

    this.buffer.connect();
  }

  updateSamplers([ r, g, b ]: ChannelSamplers) {
    const clampWrap = (fn: Sampler) => (...args: Parameters<Sampler>) => Math.floor(Num.clamp(fn(...args), 0x00, 0xff));
    this.samplers$.next([
      clampWrap(r),
      clampWrap(g),
      clampWrap(b),
    ]);
  }

  setFps(fps: number) {
    console.log('setting FPS to ', fps);
    this.fps$.next(fps);
  }
}
