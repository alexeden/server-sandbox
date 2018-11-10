import { Directive, HostListener } from '@angular/core';
import { MatBottomSheet } from '@angular/material';
import { DotstarConfigFormComponent } from './config-form.component';

@Directive({
  selector: '[configFormTrigger]',
})
export class DotstarOpenConfigFormDirective {
  constructor(private bottomSheet: MatBottomSheet) {}

  @HostListener('click', [])
  open() {
    this.bottomSheet.open(DotstarConfigFormComponent, {
      autoFocus: true,
      closeOnNavigation: true,
    });
  }
}
