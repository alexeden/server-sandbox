import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSlideToggleChange } from '@angular/material';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LeapController } from '../lib';
import { LeapPaintService } from '../leap-paint.service';

@Component({
  selector: 'dotstar-leap-device-controls',
  templateUrl: './leap-device-controls.component.html',
  styleUrls: [ './leap-device-controls.component.scss' ],
})
export class LeapDeviceControlsComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();

  readonly connectSwitch: FormControl;

  constructor(
    readonly paintService: LeapPaintService,
    readonly controller: LeapController
  ) {
    (window as any).LeapDeviceControlsComponent = this;
    this.connectSwitch = new FormControl(false);

    setTimeout(() => this.controller.start(), 1500);
  }

  ngOnInit() {
    this.controller.socketConnected.pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe(connected => {
      this.connectSwitch.setValue(connected);
      this.connectSwitch.disabled && this.connectSwitch.enable();
    });

  }

  async switchFlipped({ checked }: MatSlideToggleChange) {
    this.connectSwitch.disable();
    if (checked) {
      this.controller.start();
    }
    else {
      this.controller.stop();
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
