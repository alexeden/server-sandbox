import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared';
import { AnimationClockService } from './animation-clock.service';
import { DotstarDeviceConfigService } from './device-config.service';
import { SocketService } from './socket.service';
import { DotstarMainComponent } from './dotstar-main.component';
import { SocketNotifierComponent } from './dotstar-notifiers.component';
import { VisualizerComponent } from './visualizer';
import { DeviceConfigFormComponent } from './device-config-form';
import { BufferService } from './buffer.service';
import { SamplerFormComponent } from './sampler-form';
import { ControlBarComponent } from './control-bar';
import { DotstarRoutingModule } from './dotstar-routing.module';
import { ColorspaceFunctionsComponent } from './colorspace-functions';
import { LeapPaintModule } from './leap-paint';
import { LiveBufferBarComponent } from './live-buffer-bar';

@NgModule({
  declarations: [
    DotstarMainComponent,
    ColorspaceFunctionsComponent,
    DeviceConfigFormComponent,
    ControlBarComponent,
    LiveBufferBarComponent,
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
  providers: [
    AnimationClockService,
    BufferService,
    DotstarDeviceConfigService,
    SocketService,
  ],
})
export class DotstarModule { }
