import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared.module';
import { DotstarConfigService } from './dotstar-config.service';
import { DotstarSocketService } from './dotstar-socket.service';
import { DotstarMainComponent } from './dotstar-main.component';
import { DotstarSocketNotifierComponent } from './dotstar-notifiers.component';
import { DotstarVisualizerComponent } from './visualizer/visualizer.component';
import { DotstarConfigFormComponent } from './config-form/config-form.component';
import { DotstarBufferService } from './dotstar-buffer.service';
import { DotstarSamplerFormComponent } from './sampler-form/sampler-form.component';

@NgModule({
  declarations: [
    DotstarMainComponent,
    DotstarSamplerFormComponent,
    DotstarConfigFormComponent,
    DotstarSocketNotifierComponent,
    DotstarVisualizerComponent,
  ],
  imports: [
    SharedModule,
  ],
  exports: [
    DotstarMainComponent,
  ],
  providers: [
    DotstarBufferService,
    DotstarConfigService,
    DotstarSocketService,
  ],
})
export class DotstarModule { }
