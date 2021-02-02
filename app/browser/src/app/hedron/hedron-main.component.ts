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
import { Led } from './lib';

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
  readonly bufferStreamGenerator: BufferStreamGenerator<Led>;
  readonly samplerTemplate: SamplerTemplate;

  constructor(
    private geoService: GeometryService,
    private clock: ClockService
  ) {
    this.samplerTemplate = body => `
      (t, i, led) => {
        // const ts = t / 1000;
        // const n = led.leds.length;
        // const ei = led.edgeIndex;

        return ${body};
      }
    `;

    this.bufferStreamGenerator = sampler =>
      this.clock.t.pipe(
        withLatestFrom(this.geoService.model, ([t], model) =>
          model.leds.map(
            (led, i) =>
              sampler(t, i, led.data).map(clamp(0x00, 0xff)) as Sample
          )
        )
      );
  }
}

// 330
// [330, 240, 120, 25, 9, 0][Math.floor(Math.abs(6*Math.sin(ts / 2) + 6*i/n)) % 6]
// [330, 240, 120, 25, 9, 0][Math.floor(Math.abs(6*Math.sin(ts) + pixel.dMidpoint))]
// 0.5
// 2 * Math.sin(-1 * Math.PI * ts + pixel.y - pixel.x) - 1.5
