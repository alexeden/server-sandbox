import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DotstarMainComponent } from './dotstar-main.component';
import { DotstarColorspaceFunctionsComponent } from './colorspace-functions';
import { DotstarPointerParticlesComponent } from './pointer-particles';

const dotstarRoutes: Routes = [
  {
    path: 'dotstar',
    component: DotstarMainComponent,
    children: [
      {
        path: 'functions',
        component: DotstarColorspaceFunctionsComponent,
        data: {
          label: 'Colorspace Functions',
        },
      },
      {
        path: 'particles',
        component: DotstarPointerParticlesComponent,
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
