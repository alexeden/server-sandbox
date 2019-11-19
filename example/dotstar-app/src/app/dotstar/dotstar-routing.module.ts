import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DotstarMainComponent } from './dotstar-main.component';
import { ColorspaceFunctionsComponent } from './colorspace-functions';
import { LeapPaintComponent } from './leap-paint';

const dotstarRoutes: Routes = [
  {
    path: 'dotstar',
    component: DotstarMainComponent,
    children: [
      {
        path: 'functions',
        component: ColorspaceFunctionsComponent,
        data: {
          label: 'Colorspace Functions',
        },
      },
      {
        path: 'leap-paint',
        component: LeapPaintComponent,
        data: {
          label: 'Leap Paint',
        },
      },
      {
        path: '',
        redirectTo: 'functions',
        pathMatch: 'full',
      },
    ],
  },
];


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(dotstarRoutes),
  ],
  exports: [
    RouterModule,
  ],
})
export class DotstarRoutingModule { }
