import { Component, OnInit, OnDestroy, Optional } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil, tap, filter, take } from 'rxjs/operators';
import { APA102C } from 'dotstar-node/dist/apa102c';
import { DotstarConstants } from '../lib';
import { DotstarSocketService } from '../dotstar-socket.service';
import { DotstarConfigService } from '../dotstar-config.service';
import { MatBottomSheetRef } from '@angular/material';

@Component({
  selector: 'dotstar-config-form',
  templateUrl: './config-form.component.html',
  styleUrls: ['./config-form.component.scss'],
})
export class DotstarConfigFormComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  readonly connected: Observable<boolean>;
  readonly configForm: FormGroup;
  readonly devicePaths: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private configService: DotstarConfigService,
    private socketService: DotstarSocketService,
    @Optional()
    public bottomSheetRef: MatBottomSheetRef<DotstarConfigFormComponent>
  ) {
    (window as any).DotstarConfigFormComponent = this;
    this.connected = this.socketService.connected$.asObservable();

    this.devicePaths = this.configService.devicePaths;

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

    this.configService.getAvailableDevicePaths();
  }

  disconnect() {
    this.socketService.disconnect();
  }

  connect() {
    this.socketService.connect(this.configForm.get('url').value);
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
