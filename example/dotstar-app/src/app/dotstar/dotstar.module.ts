import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared.module';
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
    DotstarSocketService,
  ],
})
export class DotstarModule { }
