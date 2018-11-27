import { Directive, HostListener } from '@angular/core';
import { MatBottomSheet } from '@angular/material';
import { ConfigFormComponent } from './config-form.component';

@Directive({
  selector: '[configFormTrigger]',
})
export class OpenConfigFormDirective {
  constructor(private bottomSheet: MatBottomSheet) {}

  @HostListener('click', [])
  open() {
    this.bottomSheet.open(ConfigFormComponent, {
      autoFocus: true,
      closeOnNavigation: true,
    });
  }
}
