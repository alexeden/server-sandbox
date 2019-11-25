import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
import { LeapController } from './lib';
import { LeapPaintCanvasComponent } from './leap-paint-canvas';
import { LeapPaintService } from './leap-paint.service';
import { LeapDeviceControlsComponent } from './leap-device-controls';
import { LeapPhysicsConfigService } from './leap-physics-config.service';
import { LeapPhysicsConfigFormComponent } from './leap-physics-config-form';


@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    LeapPaintCanvasComponent,
    LeapDeviceControlsComponent,
    LeapPhysicsConfigFormComponent,
  ],
  exports: [
    LeapPaintCanvasComponent,
    LeapDeviceControlsComponent,
    LeapPhysicsConfigFormComponent,
  ],
  providers: [
    {
      provide: LeapController,
      useClass: LeapController,
      deps: [],
    },
    LeapPhysicsConfigService,
    LeapPaintService,
  ],
})
export class LeapPaintModule {}
