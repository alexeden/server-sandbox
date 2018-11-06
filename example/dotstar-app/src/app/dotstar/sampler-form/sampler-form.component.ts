// tslint:disable no-eval
import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, ValidatorFn, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, filter, map, startWith, tap } from 'rxjs/operators';
import { ChannelSamplers, samplerFnHead, DotstarConstants } from '../lib';
import { LocalStorage } from '@app/shared';
import { DotstarBufferService } from '../dotstar-buffer.service';

const functionBodyValidator = (args: string): ValidatorFn => {
  return (control: FormControl): {[key: string]: any} | null => {
    try {
      const fn = eval(`${args}${control.value}`);
      if (typeof fn !== 'function') return { notAFunction: true };
      if (typeof fn(0, 0) !== 'number') return { invalidReturnValue: true };
      return null;
    }
    catch (error) {
      return { unknownError: true };
    }
  };
};

@Component({
  selector: 'dotstar-sampler-form',
  templateUrl: './sampler-form.component.html',
  styleUrls: ['./sampler-form.component.scss'],
})
export class DotstarSamplerFormComponent implements OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();

  readonly samplerFnHead = samplerFnHead;
  readonly animationForm: FormGroup;
  readonly fpsControl: FormControl;
  readonly fpsMin = DotstarConstants.fpsMin;
  readonly fpsMax = DotstarConstants.fpsMax;

  @LocalStorage() rFn: string;
  @LocalStorage() gFn: string;
  @LocalStorage() bFn: string;

  constructor(
    private fb: FormBuilder,
    private bufferService: DotstarBufferService
  ) {
    this.fpsControl = this.fb.control(5, [
      Validators.min(this.fpsMin),
      Validators.max(this.fpsMax),
    ]);

    this.animationForm = this.fb.group({
      r: this.fb.control(this.rFn || '4 * i', [functionBodyValidator(samplerFnHead)]),
      g: this.fb.control(this.gFn || '30', [functionBodyValidator(samplerFnHead)]),
      b: this.fb.control(this.bFn || '80', [functionBodyValidator(samplerFnHead)]),
    });

    this.animationForm.valueChanges.pipe(
      takeUntil(this.unsubscribe$),
      startWith(this.animationForm.value),
      filter(() => this.animationForm.valid),
      tap(({ r, g, b }) => {
        this.rFn = r;
        this.gFn = g;
        this.bFn = b;
      }),
      map(({ r, g, b }): ChannelSamplers => [
        eval(`${samplerFnHead}${r}`),
        eval(`${samplerFnHead}${g}`),
        eval(`${samplerFnHead}${b}`),
      ])
    )
    .subscribe(samplers => this.bufferService.updateSamplers(samplers));

    this.fpsControl.valueChanges.pipe(
      takeUntil(this.unsubscribe$),
      startWith(this.fpsControl.value),
      filter(() => this.fpsControl.valid)
    )
    .subscribe(fps => this.bufferService.setFps(fps));

  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
