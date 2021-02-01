import { Component } from '@angular/core';
import { ClockService } from '@app/clock.service';
import {
  BufferStreamGenerator,
  clamp,
  Sample,
  SamplerTemplate,
} from '@app/lib';
import { withLatestFrom } from 'rxjs/operators';
import { GeometryService } from './geometry.service';
import { TetrahedronGroup } from './lib';

@Component({
  template: `
    <div class="column gap-10 p-20">
      <mat-card class="p-0" style="overflow: hidden">
        <hedron-canvas></hedron-canvas>
      </mat-card>
      <dotstar-function-forms
        [bufferStreamGenerator]="bufferStreamGenerator"
        [samplerTemplate]="samplerTemplate"
      >
      </dotstar-function-forms>
    </div>
  `,
})
export class HedronMainComponent {
  readonly bufferStreamGenerator: BufferStreamGenerator<TetrahedronGroup>;
  readonly samplerTemplate: SamplerTemplate;

  constructor(
    private geoService: GeometryService,
    private clock: ClockService
  ) {
    this.samplerTemplate = body => `
      (t, i, tetra) => {
        const ts = t / 1000;
        const n = tetra.pixels.length;
        const pixel = tetra.pixels[i];
        const ei = pixel.edge.index;

        return ${body};
      }
    `;

    this.bufferStreamGenerator = sampler =>
      this.clock.t.pipe(
        withLatestFrom(this.geoService.tetraModel, ([t], tetra) =>
          tetra.pixels.map(
            (_, i) => sampler(t, i, tetra).map(clamp(0x00, 0xff)) as Sample
          )
        )
      );
  }
}
