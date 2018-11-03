import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { DotstarModule } from './dotstar/dotstar.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  bootstrap: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DotstarModule,
  ],
})
export class AppModule { }
