import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared';
import { LeapController } from '@app/leap';
import { LeapPaintComponent } from './leap-paint.component';
import { LeapPaintCanvasComponent } from './leap-paint-canvas';
import { LeapPaintService } from './leap-paint.service';


@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    LeapPaintComponent,
    LeapPaintCanvasComponent,
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
