import { Component, OnInit, OnDestroy } from '@angular/core';
import { DotstarBufferService } from './dotstar-buffer.service';
import { DotstarConfigService } from './dotstar-config.service';
import { DotstarSocketService } from './dotstar-socket.service';
import { DotstarConstants } from './lib';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { takeUntil, startWith, filter, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'dotstar-main',
  templateUrl: './dotstar-main.component.html',
  styleUrls: ['./dotstar-main.component.scss'],
})
export class DotstarMainComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();

  readonly txpsControl: FormControl;
  readonly fpsMin = DotstarConstants.fpsMin;
  readonly fpsMax = DotstarConstants.fpsMax;
  readonly devicePath: Observable<string>;


  constructor(
    private fb: FormBuilder,
    readonly bufferService: DotstarBufferService,
    readonly configService: DotstarConfigService,
    readonly socketService: DotstarSocketService
  ) {
    this.txpsControl = this.fb.control(50, [
      Validators.min(this.fpsMin),
      Validators.max(this.fpsMax),
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
