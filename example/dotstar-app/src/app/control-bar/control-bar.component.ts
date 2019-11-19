import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { BufferService } from '../buffer.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { DotstarDeviceConfigService } from '../device-config.service';
import { SocketService } from '../socket.service';
import { AnimationClockService } from '../animation-clock.service';
import { Subject, Observable } from 'rxjs';
import { DotstarConstants } from '../lib';
import { map, takeUntil, startWith, filter } from 'rxjs/operators';

@Component({
  selector: 'dotstar-control-bar',
  templateUrl: './control-bar.component.html',
  styleUrls: ['./control-bar.component.scss'],
})
export class ControlBarComponent implements OnDestroy {
  @HostBinding('attr.class') classes = 'row gap-40';
  private readonly unsubscribe$ = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    readonly bufferService: BufferService,
    readonly configService: DotstarDeviceConfigService,
    readonly socketService: SocketService,
    readonly clock: AnimationClockService
  ) {
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
