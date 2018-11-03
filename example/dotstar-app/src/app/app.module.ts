import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppMaterialModule } from './material.module';
import { AppComponent } from './app.component';
import { DotstarService } from './dotstar.service';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    AppMaterialModule,
  ],
  providers: [
    DotstarService,
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
