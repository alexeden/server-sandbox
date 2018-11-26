import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DotstarMainComponent } from './dotstar-main.component';
import { DotstarSamplerFormComponent } from './sampler-form/sampler-form.component';

const dotstarRoutes: Routes = [
  {
    path: 'dotstar',
    component: DotstarMainComponent,
    children: [
      {
        path: 'functions',
        component: DotstarSamplerFormComponent,
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
