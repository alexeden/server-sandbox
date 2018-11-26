import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { DotstarBufferService } from '../dotstar-buffer.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { DotstarDeviceConfigService } from '../device-config.service';
import { DotstarSocketService } from '../dotstar-socket.service';
import { AnimationClockService } from '../animation-clock.service';
import { Subject, Observable } from 'rxjs';
import { DotstarConstants } from '../lib';
import { map, takeUntil, startWith, filter } from 'rxjs/operators';

@Component({
  selector: 'dotstar-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.scss'],
})
export class DotstarControlBarComponent implements OnInit, OnDestroy {
  @HostBinding('attr.class') classes = 'row gap-40';
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
