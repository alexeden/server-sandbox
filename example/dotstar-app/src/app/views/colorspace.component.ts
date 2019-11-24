import { Component } from '@angular/core';
import { BufferStreamGenerator, range, clamp, Sample } from '@app/lib';
import { AnimationClockService } from '@app/animation-clock.service';
import { DotstarDeviceConfigService } from '@app/device-config.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  template: `
    <div class="column gap-10 p-20">
      <dotstar-function-forms [bufferStreamGenerator]="bufferStreamGenerator">
      </dotstar-function-forms>
      <mat-card>
        <dotstar-visualizer></dotstar-visualizer>
      </mat-card>
    </div>
  `,
})
export class ColorspaceFunctionsComponent {
  bufferStreamGenerator: BufferStreamGenerator<number>;

  constructor(
    private configService: DotstarDeviceConfigService,
    private clock: AnimationClockService
  ) {
    this.bufferStreamGenerator = sampler =>
      combineLatest(
        this.clock.t,
        this.configService.length.pipe(map(l => range(0, l))),
        (t, emptyBuffer) =>
          emptyBuffer.map((_, i) =>
            sampler(t, i, emptyBuffer.length).map(clamp(0x00, 0xff)) as Sample
          )
      );
  }
}
