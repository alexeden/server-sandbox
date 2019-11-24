import { Component } from '@angular/core';
import { BufferStreamGenerator, clamp, Sample, SamplerTemplate } from '@app/lib';
import { AnimationClockService } from '@app/animation-clock.service';
import { map, withLatestFrom } from 'rxjs/operators';
import { GeometryService } from './geometry.service';
import { Tetrahedron } from './lib';
@Component({
  template: `
    <div class="column gap-10 p-20">
      <dotstar-function-forms
        [bufferStreamGenerator]="bufferStreamGenerator"
        [samplerTemplate]="samplerTemplate">
      </dotstar-function-forms>
      <mat-card class="p-0" style="overflow: hidden">
        <dotstar-tetra-canvas></dotstar-tetra-canvas>
      </mat-card>
    </div>
  `,
})
export class TetraMainComponent {
  readonly bufferStreamGenerator: BufferStreamGenerator<Tetrahedron>;
  readonly samplerTemplate: SamplerTemplate;

  constructor(
    private geoService: GeometryService,
    private clock: AnimationClockService
  ) {
    this.samplerTemplate = body => `
      (t, i, tetra) => {
        const n = tetra.pixels.length;
        return ${body};
      }
    `;

    this.bufferStreamGenerator = sampler =>
      this.clock.t.pipe(
        withLatestFrom(this.geoService.tetra, (t, tetra) =>
          tetra.pixels.map((_, i) =>
            sampler(t, i, tetra).map(clamp(0x00, 0xff)) as Sample
          )
        )
      );
  }
}
