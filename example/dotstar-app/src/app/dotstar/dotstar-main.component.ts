import { Component, OnInit, OnDestroy } from '@angular/core';
import { DotstarBufferService } from './dotstar-buffer.service';
import { DotstarDeviceConfigService } from './device-config.service';
import { DotstarSocketService } from './dotstar-socket.service';
import { DotstarConstants } from './lib';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { takeUntil, startWith, filter, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { AnimationClockService } from './animation-clock.service';

@Component({
  selector: 'dotstar-main',
  templateUrl: './dotstar-main.component.html',
  styleUrls: ['./dotstar-main.component.scss'],
})
export class DotstarMainComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();

  readonly txpsControl: FormControl;
  readonly txpsMin = DotstarConstants.txpsMin;
  readonly txpsMax = DotstarConstants.txpsMax;
  readonly devicePath: Observable<string>;


  constructor(
    private fb: FormBuilder,
    readonly bufferService: DotstarBufferService,
    readonly configService: DotstarDeviceConfigService,
    readonly socketService: DotstarSocketService,
    readonly clock: AnimationClockService
  ) {
    this.txpsControl = this.fb.control(60, [
      Validators.min(this.txpsMin),
      Validators.max(this.txpsMax),
    ]);

    this.devicePath = this.configService.deviceConfig.pipe(
      map(config => config.devicePath)
    );
  }

  ngOnInit() {
    this.txpsControl.valueChanges.pipe(
      takeUntil(this.unsubscribe$),
      startWith(this.txpsControl.value),
      filter(() => this.txpsControl.valid)
    )
    .subscribe(txps => this.socketService.setTxps(txps));

    this.configService.getAvailableDevicePaths();
  }


  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }

}
