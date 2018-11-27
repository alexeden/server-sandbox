import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
import { LeapController } from '@app/leap';
import { LeapPaintComponent } from './leap-paint.component';
import { LeapPaintCanvasComponent } from './leap-paint-canvas';
import { LeapPaintService } from './leap-paint.service';
import { LeapDeviceControlsComponent } from './leap-device-controls';


@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    LeapPaintComponent,
    LeapPaintCanvasComponent,
    LeapDeviceControlsComponent,
  ],
  providers: [
    {
      provide: LeapController,
      useClass: LeapController,
      deps: [],
    },
    LeapPaintService,
  ],
})
export class LeapPaintModule {}
export { LeapPaintComponent } from './leap-paint.component';
