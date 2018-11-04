import { Subject } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DotstarSocketService } from '../dotstar-socket.service';
import { DotstarConstants } from '../lib';
import { APA102C } from 'dotstar-node/dist/apa102c';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'dotstar-config',
  templateUrl: './dotstar-config.component.html',
  styleUrls: ['./dotstar-config.component.scss'],
})
export class DotstarConfigComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();

  readonly configForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dotstarService: DotstarSocketService
  ) {
    this.configForm = this.fb.group({
      url: this.fb.control(DotstarConstants.url),
      devicePath: this.fb.control(DotstarConstants.devicePath),
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
    this.dotstarService.connected.pipe(
      takeUntil(this.unsubscribe$),
      tap(connected =>
        connected
        ? this.configForm.disable()
        : this.configForm.enable()
      )
    )
    .subscribe();
  }

  disconnect() {
    this.dotstarService.disconnect();
  }

  connect() {
    this.dotstarService.connect(this.connectionUrl);
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
