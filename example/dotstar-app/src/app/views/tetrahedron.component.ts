import { Component } from '@angular/core';

@Component({
  template: `
    <div class="column gap-10 p-20">
      <mat-card class="p-0" style="overflow: hidden">
        <dotstar-tetra-canvas></dotstar-tetra-canvas>
      </mat-card>
    </div>
  `,
})
export class TetrahedronComponent {}
