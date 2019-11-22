import { Injectable } from '@angular/core';
import { DotstarDeviceConfigService } from './device-config.service';
import { Observable, BehaviorSubject, combineLatest, empty } from 'rxjs';
import { map, share, switchAll, take } from 'rxjs/operators';
import { Sample, ChannelSampler, clamp, range } from './lib';
import { AnimationClockService } from './animation-clock.service';

@Injectable()
export class BufferService {
  private readonly selectedBufferStream$ = new BehaviorSubject<Observable<Sample[]>>(empty());
  readonly values: Observable<Sample[]>;

  constructor(
    private configService: DotstarDeviceConfigService,
    private clock: AnimationClockService
  ) {
    this.values = this.selectedBufferStream$.asObservable().pipe(
      switchAll(),
      share()
    );
  }

  setBufferStream(source: Observable<Sample[]>) {
    this.selectedBufferStream$.next(source);
  }

  setBufferStreamFromSampler(sampler: ChannelSampler) {
    const source = combineLatest(
      this.clock.t,
      this.configService.length.pipe(map(l => range(0, l))),
      (t, emptyBuffer) =>
        emptyBuffer.map((_, i) =>
          sampler(t, i, emptyBuffer.length).map(clamp(0x00, 0xff)) as Sample
        )
    );

    this.selectedBufferStream$.next(source);
  }
}
