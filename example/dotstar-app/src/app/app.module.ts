// tslint:disable-next-line: no-import-side-effect
import 'hammerjs';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { DotstarModule } from './dotstar/dotstar.module';

const appRoutes: Routes = [
  { path: '',   redirectTo: '/dotstar', pathMatch: 'full' },
];

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
    RouterModule.forRoot(appRoutes),
    DotstarModule,
  ],
})
export class AppModule { }
