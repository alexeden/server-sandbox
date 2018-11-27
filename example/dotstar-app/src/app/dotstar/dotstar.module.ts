import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared';
import { AnimationClockService } from './animation-clock.service';
import { DotstarDeviceConfigService } from './device-config.service';
import { DotstarSocketService } from './dotstar-socket.service';
import { DotstarMainComponent } from './dotstar-main.component';
import { SocketNotifierComponent } from './dotstar-notifiers.component';
import { InputCanvasComponent } from './input-canvas';
import { VisualizerComponent } from './visualizer/visualizer.component';
import {
  ConfigFormComponent,
  OpenConfigFormDirective,
} from './config-form';
import { DotstarBufferService } from './dotstar-buffer.service';
import { SamplerFormComponent } from './sampler-form/sampler-form.component';
import { ControlBarComponent } from './control-bar/control-bar.component';
import { DotstarRoutingModule } from './dotstar-routing.module';
import { PhysicsFormComponent } from './physics-form/physics-form.component';
import { PointerParticlesComponent } from './pointer-particles/pointer-particles.component';
import { ColorspaceFunctionsComponent } from './colorspace-functions/colorspace-functions.component';
import { LeapPaintModule } from './leap-paint';

@NgModule({
  declarations: [
    DotstarMainComponent,
    ColorspaceFunctionsComponent,
    ConfigFormComponent,
    ControlBarComponent,
    InputCanvasComponent,
    OpenConfigFormDirective,
    PhysicsFormComponent,
    PointerParticlesComponent,
    SamplerFormComponent,
    SocketNotifierComponent,
    VisualizerComponent,
  ],
  imports: [
    SharedModule,
    LeapPaintModule,
    DotstarRoutingModule,
  ],
  exports: [
    DotstarMainComponent,
  ],
  entryComponents: [
    ConfigFormComponent,
  ],
  providers: [
    AnimationClockService,
    DotstarBufferService,
    DotstarDeviceConfigService,
    DotstarSocketService,
  ],
})
export class DotstarModule { }
