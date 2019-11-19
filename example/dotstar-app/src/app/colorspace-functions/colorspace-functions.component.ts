import { Component } from '@angular/core';

@Component({
  template: `
    <div class="column gap-10 p-20">
      <dotstar-channel-function-forms></dotstar-channel-function-forms>
      <mat-card>
        <dotstar-visualizer></dotstar-visualizer>
      </mat-card>
    </div>
  `,
})
export class ColorspaceFunctionsComponent { }
