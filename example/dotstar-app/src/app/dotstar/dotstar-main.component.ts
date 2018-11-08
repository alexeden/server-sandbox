import { Component, OnInit, OnDestroy } from '@angular/core';
import { DotstarBufferService } from './dotstar-buffer.service';
import { DotstarConfigService } from './dotstar-config.service';
import { DotstarSocketService } from './dotstar-socket.service';
import { DotstarConstants } from './lib';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { takeUntil, startWith, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'dotstar-main',
  templateUrl: './dotstar-main.component.html',
  styleUrls: ['./dotstar-main.component.scss'],
})
export class DotstarMainComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();

  readonly fpsControl: FormControl;
  readonly fpsMin = DotstarConstants.fpsMin;
  readonly fpsMax = DotstarConstants.fpsMax;


  constructor(
    private fb: FormBuilder,
    readonly bufferService: DotstarBufferService,
    readonly configService: DotstarConfigService,
    readonly socketService: DotstarSocketService
  ) {
    this.fpsControl = this.fb.control(5, [
      Validators.min(this.fpsMin),
      Validators.max(this.fpsMax),
    ]);
  }

  ngOnInit() {
    this.fpsControl.valueChanges.pipe(
      takeUntil(this.unsubscribe$),
      startWith(this.fpsControl.value),
      filter(() => this.fpsControl.valid)
    )
    .subscribe(fps => this.socketService.setFps(fps));
  }


  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }

}
