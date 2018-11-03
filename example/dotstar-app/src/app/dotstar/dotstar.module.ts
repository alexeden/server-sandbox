import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared.module';
import { DotstarService } from './dotstar.service';

@NgModule({
  declarations: [
  ],
  imports: [
    SharedModule,
  ],
  providers: [
    DotstarService,
  ],
})
export class DotstarModule { }
