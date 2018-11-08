import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'dotstar-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.scss'],
})
export class DotstarControlBarComponent {
  @HostBinding('class.gap-20') gap = true;
  @HostBinding('class.row') row = true;
}
