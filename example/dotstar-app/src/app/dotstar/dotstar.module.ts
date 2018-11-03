import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared.module';
import { DotstarService } from './dotstar.service';
import { DotstarMainComponent } from './dotstar-main.component';
import { DotstarConfigComponent } from './dotstar-config/dotstar-config.component';

@NgModule({
  declarations: [
    DotstarMainComponent,
    DotstarConfigComponent,
  ],
  imports: [
    SharedModule,
  ],
  exports: [
    DotstarMainComponent,
  ],
  providers: [
    DotstarService,
  ],
})
export class DotstarModule { }
