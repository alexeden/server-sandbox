import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DotstarMainComponent } from './dotstar-main.component';
import { DotstarSamplerFormComponent } from './sampler-form/sampler-form.component';
import { DotstarInputCanvasComponent } from './input-canvas';

const dotstarRoutes: Routes = [
  {
    path: 'dotstar',
    component: DotstarMainComponent,
    children: [
      {
        path: 'functions',
        component: DotstarSamplerFormComponent,
        data: {
          label: 'Colorspace Functions',
        },
      },
      {
        path: 'particles',
        component: DotstarInputCanvasComponent,
        data: {
          label: 'Particles',
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
