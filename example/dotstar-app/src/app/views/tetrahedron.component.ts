import { Component } from '@angular/core';
import { BufferStreamGenerator, range, clamp, Sample } from '@app/lib';
import { AnimationClockService } from '@app/animation-clock.service';
import { DotstarDeviceConfigService } from '@app/device-config.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
@Component({
  template: `
    <div class="column gap-10 p-20">
      <mat-card class="p-0" style="overflow: hidden">
        <dotstar-tetra-canvas></dotstar-tetra-canvas>
      </mat-card>
      <dotstar-channel-function-forms
        [bufferStreamGenerator]="bufferStreamGenerator">
      </dotstar-channel-function-forms>
    </div>
  `,
})
export class TetrahedronComponent {
  bufferStreamGenerator: BufferStreamGenerator;

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
