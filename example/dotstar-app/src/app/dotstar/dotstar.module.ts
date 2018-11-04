import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared.module';
import { DotstarConfigService } from './dotstar-config.service';
import { DotstarSocketService } from './dotstar-socket.service';
import { DotstarMainComponent } from './dotstar-main.component';
import { DotstarConfigComponent } from './dotstar-config/dotstar-config.component';
import { DotstarSocketNotifierComponent } from './dotstar-notifiers.component';
import { DotstarVisualizerComponent } from './visualizer/visualizer.component';

@NgModule({
  declarations: [
    DotstarMainComponent,
    DotstarConfigComponent,
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
    DotstarConfigService,
    DotstarSocketService,
  ],
})
export class DotstarModule { }
