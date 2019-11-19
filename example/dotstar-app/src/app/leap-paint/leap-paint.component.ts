import { Component } from '@angular/core';

@Component({
  template: `
    <div class="column gap-10 p-20">
      <mat-card>
        <dotstar-leap-device-controls></dotstar-leap-device-controls>
      </mat-card>
      <mat-card>
        <dotstar-leap-paint-canvas></dotstar-leap-paint-canvas>
      </mat-card>
      <mat-card>
        <dotstar-leap-physics-config-form></dotstar-leap-physics-config-form>
      </mat-card>
    </div>
  `,
})
export class LeapPaintComponent {}
