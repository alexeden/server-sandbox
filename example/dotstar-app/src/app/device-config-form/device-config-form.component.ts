import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil, tap, filter, take, map, startWith } from 'rxjs/operators';
import { APA102C } from 'dotstar-node/dist/apa102c';
import { DotstarConstants } from '../lib';
import { SocketService } from '../socket.service';
import { DotstarDeviceConfigService } from '../device-config.service';

@Component({
  selector: 'dotstar-config-form',
  templateUrl: './device-config-form.component.html',
  styleUrls: ['./device-config-form.component.scss'],
})
export class DeviceConfigFormComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  readonly connected: Observable<boolean>;
  readonly configForm: FormGroup;
  readonly devicePath: Observable<string>;
  readonly devicePaths: Observable<string[]>;

  readonly txpsControl: FormControl;
  readonly txpsMin = DotstarConstants.txpsMin;
  readonly txpsMax = DotstarConstants.txpsMax;

  constructor(
    private fb: FormBuilder,
    private configService: DotstarDeviceConfigService,
    private socketService: SocketService
  ) {
    this.connected = this.socketService.connected$.asObservable();

    this.devicePaths = this.configService.devicePaths;

    this.devicePath = this.configService.deviceConfig.pipe(
      map(config => config.devicePath)
    );

    this.configForm = this.fb.group({
      url: this.fb.control(DotstarConstants.url),
      devicePath: this.fb.control(null, [
        Validators.required,
        Validators.minLength(1),
        Validators.pattern(/^\//),
      ]),
      length: this.fb.control(144),
      clockSpeed: this.fb.control(APA102C.CLK_MAX, [
        Validators.min(APA102C.CLK_MIN),
        Validators.max(APA102C.CLK_MAX),
      ]),
      startFrames: this.fb.control(1),
      endFrames: this.fb.control(4),
    });

    this.txpsControl = this.fb.control(60, [
      Validators.min(this.txpsMin),
      Validators.max(this.txpsMax),
    ]);
  }

  get connectionUrl() {
    const { url, ...params } = this.configForm.value;
    const query = Object.entries(params || {}).map(([k, v]) => `${k}=${v}`).join('&');
    return `${url}?${query}`;
  }

  ngOnInit() {
    this.configForm.valueChanges.pipe(
      takeUntil(this.unsubscribe$),
      filter(() => this.configForm.valid),
      tap(config => this.configService.updateConfig(config))
    )
    .subscribe();

    this.socketService.connected$.asObservable().pipe(
      takeUntil(this.unsubscribe$),
      tap(connected => connected ? this.configForm.disable() : this.configForm.enable())
    )
    .subscribe();

    this.configService.deviceConfig.pipe(take(1)).subscribe(config => {
      this.configForm.patchValue(config);
    });

    this.txpsControl.valueChanges.pipe(
      takeUntil(this.unsubscribe$),
      startWith(this.txpsControl.value),
      filter(() => this.txpsControl.valid)
    )
    .subscribe(txps => this.socketService.setTxps(txps));

    this.configService.getAvailableDevicePaths();
  }

  disconnect() {
    this.socketService.disconnect();
  }

  connect() {
    this.socketService.connect(this.configForm.get('url')!.value);
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
