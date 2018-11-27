import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared';
import { AnimationClockService } from './animation-clock.service';
import { DotstarDeviceConfigService } from './device-config.service';
import { DotstarSocketService } from './dotstar-socket.service';
import { DotstarMainComponent } from './dotstar-main.component';
import { SocketNotifierComponent } from './dotstar-notifiers.component';
import { InputCanvasComponent } from './input-canvas';
import { VisualizerComponent } from './visualizer';
import { ConfigFormComponent, OpenConfigFormDirective } from './config-form';
import { DotstarBufferService } from './dotstar-buffer.service';
import { SamplerFormComponent } from './sampler-form';
import { ControlBarComponent } from './control-bar';
import { DotstarRoutingModule } from './dotstar-routing.module';
import { PhysicsFormComponent } from './physics-form';
import { PointerParticlesComponent } from './pointer-particles';
import { ColorspaceFunctionsComponent } from './colorspace-functions';
import { LeapPaintModule } from './leap-paint';
import { LiveBufferBarComponent } from './live-buffer-bar';

@NgModule({
  declarations: [
    DotstarMainComponent,
    ColorspaceFunctionsComponent,
    ConfigFormComponent,
    ControlBarComponent,
    InputCanvasComponent,
    LiveBufferBarComponent,
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
