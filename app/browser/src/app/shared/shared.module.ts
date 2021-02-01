import { NgModule } from '@angular/core';
import { VendorModule } from './vendor.module';
import { SpinDirective } from './spin.directive';
import { FunctionFormsComponent } from './function-forms';
import { LiveBufferBarComponent } from './live-buffer-bar';

@NgModule({
  imports: [VendorModule],
  declarations: [FunctionFormsComponent, LiveBufferBarComponent, SpinDirective],
  exports: [
    VendorModule,
    FunctionFormsComponent,
    LiveBufferBarComponent,
    SpinDirective,
  ],
})
export class SharedModule {}
