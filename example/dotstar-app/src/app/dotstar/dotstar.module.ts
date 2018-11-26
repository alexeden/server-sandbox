import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared';
import { AnimationClockService } from './animation-clock.service';
import { DotstarDeviceConfigService } from './device-config.service';
import { DotstarSocketService } from './dotstar-socket.service';
import { DotstarMainComponent } from './dotstar-main.component';
import { DotstarSocketNotifierComponent } from './dotstar-notifiers.component';
import { DotstarInputCanvasComponent } from './input-canvas';
import { DotstarVisualizerComponent } from './visualizer/visualizer.component';
import {
  DotstarConfigFormComponent,
  DotstarOpenConfigFormDirective,
} from './config-form';
import { DotstarBufferService } from './dotstar-buffer.service';
import { DotstarSamplerFormComponent } from './sampler-form/sampler-form.component';
import { DotstarControlBarComponent } from './control-bar/control-bar.component';
import { DotstarRoutingModule } from './dotstar-routing.module';
import { DotstarPhysicsFormComponent } from './physics-form/physics-form.component';
import { DotstarPointerParticlesComponent } from './pointer-particles/pointer-particles.component';
import { DotstarColorspaceFunctionsComponent } from './colorspace-functions/colorspace-functions.component';

@NgModule({
  declarations: [
    DotstarMainComponent,
    DotstarSamplerFormComponent,
    DotstarConfigFormComponent,
    DotstarInputCanvasComponent,
    DotstarOpenConfigFormDirective,
    DotstarSocketNotifierComponent,
    DotstarVisualizerComponent,
    DotstarControlBarComponent,
    DotstarPhysicsFormComponent,
    DotstarPointerParticlesComponent,
    DotstarColorspaceFunctionsComponent,
  ],
  imports: [
    SharedModule,
    DotstarRoutingModule,
  ],
  exports: [
    DotstarMainComponent,
  ],
  entryComponents: [
    DotstarConfigFormComponent,
  ],
  providers: [
    AnimationClockService,
    DotstarBufferService,
    DotstarDeviceConfigService,
    DotstarSocketService,
  ],
})
export class DotstarModule { }
