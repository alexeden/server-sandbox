import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared.module';
import { DotstarService } from './dotstar.service';
import { DotstarMainComponent } from './dotstar-main.component';

@NgModule({
  declarations: [
    DotstarMainComponent,
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
