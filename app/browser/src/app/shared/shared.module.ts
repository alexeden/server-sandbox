import { NgModule } from '@angular/core';
import { VendorModule } from './vendor.module';
import { SpinDirective } from './spin.directive';
import { FunctionFormsComponent } from './function-forms';

@NgModule({
  imports: [
    VendorModule,
  ],
  declarations: [
    FunctionFormsComponent,
    SpinDirective,
  ],
  exports: [
    VendorModule,
    SpinDirective,
    FunctionFormsComponent,
  ],
})
export class SharedModule { }
