import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatSliderModule,
  MatSnackBarModule,
} from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  exports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatSnackBarModule,
  ],
})
export class SharedModule { }
