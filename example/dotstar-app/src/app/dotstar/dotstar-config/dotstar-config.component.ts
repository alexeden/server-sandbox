import { Subject } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DotstarSocketService } from '../dotstar-socket.service';
import { DotstarConstants } from '../lib';
import { FormGroup, FormBuilder } from '@angular/forms';
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
