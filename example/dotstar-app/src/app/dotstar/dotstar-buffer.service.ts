import { Injectable } from '@angular/core';
import { DotstarConfigService } from './dotstar-config.service';
import { Observable, ConnectableObservable, Subject, BehaviorSubject, interval, combineLatest } from 'rxjs';
import { publishReplay, map, switchMap } from 'rxjs/operators';
import { range, ChannelSamplers, DotstarConstants, Channels, Sampler } from './lib';
import { Num } from 'pts';

@Injectable()
export class DotstarBufferService {
  // Time
  private readonly fps$ = new BehaviorSubject<number>(5);
  readonly fps: Observable<number>;
  readonly clock: Observable<number>;

  // Samplers
  private readonly samplers$ = new BehaviorSubject<ChannelSamplers>({ r: () => 0, g: () => 0, b: () => 0 });
  readonly samplers: Observable<ChannelSamplers>;

  // Values
  readonly channelValues: Observable<Record<Channels | 'rgb', number[]>>;
  readonly buffer: ConnectableObservable<number[]>;
  readonly colorStrings: Observable<string[]>;

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
      map(([t, emptyBuffer, fns]) => {
        t /= 1000;
        const r = emptyBuffer.map((_, i) => fns.r(t, i, emptyBuffer.length));
        const g = emptyBuffer.map((_, i) => fns.g(t, i, emptyBuffer.length));
        const b = emptyBuffer.map((_, i) => fns.b(t, i, emptyBuffer.length));
        const rgb = emptyBuffer.map((_, i) => (r[i] << 16) | (g[i] << 8) | b[i]);
        (window as any).rgb = rgb;
        return { r, g, b, rgb };
      })
    );

    this.colorStrings = this.channelValues.pipe(
      map(({ r, g, b }) =>
        range(0, r.length).map((_, i) => `rgb(${r[i]}, ${g[i]}, ${b[i]})`)
      )
    );


    this.buffer = this.configService.length.pipe(
      map(length => range(0, length).fill(0)),
      publishReplay(1)
    ) as ConnectableObservable<number[]>;

    this.buffer.connect();
  }

  updateSamplers({ r, g, b }: ChannelSamplers) {
    const clampWrap = (fn: Sampler) => (...args: Parameters<Sampler>) => Math.floor(Num.clamp(fn(...args), 0x00, 0xff));
    this.samplers$.next({
      r: clampWrap(r),
      g: clampWrap(g),
      b: clampWrap(b),
    });
  }

  setFps(fps: number) {
    console.log('setting FPS to ', fps);
    this.fps$.next(fps);
  }
}
