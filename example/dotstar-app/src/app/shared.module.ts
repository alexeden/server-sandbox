import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatCheckboxModule } from '@angular/material';

@NgModule({
  exports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
})
export class SharedModule { }
