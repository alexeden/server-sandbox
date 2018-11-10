// tslint:disable no-eval
import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, ValidatorFn, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, filter, map, startWith, tap } from 'rxjs/operators';
import { ChannelSamplers, samplerFnHead, DotstarConstants, RGB, HSL, Sampler } from '../lib';
import { LocalStorage } from '@app/shared';
import { DotstarBufferService } from '../dotstar-buffer.service';
import { MatSlideToggleChange } from '@angular/material';
import pathOr from 'ramda/es/pathOr';

const functionBodyValidator = (fnHead: string, args: any[]): ValidatorFn => {
  return (control: FormControl): {[key: string]: any} | null => {
    try {
      const fn = eval(`${fnHead} ${control.value}`);
      if (typeof fn !== 'function') return { notAFunction: true };
      if (typeof fn(...args) !== 'number' || isNaN(fn(...args))) return { invalidReturnValue: true };
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
  readonly channelToggleForm: FormGroup;
  readonly rgbSamplerForm: FormGroup;

  @LocalStorage() savedSamplers: Record<RGB | HSL, Sampler>;

  constructor(
    private fb: FormBuilder,
    private bufferService: DotstarBufferService
  ) {
    (window as any).DotstarSamplerFormComponent = this;

    this.channelToggleForm = this.fb.group({ r: [true], g: [true], b: [true] });

    const fnValidator = functionBodyValidator(samplerFnHead, [0, 0, 1]);

    this.rgbSamplerForm = this.fb.group({
      r: [pathOr(DotstarConstants.rSampler, ['r'], this.savedSamplers), [fnValidator]],
      g: [pathOr(DotstarConstants.gSampler, ['g'], this.savedSamplers), [fnValidator]],
      b: [pathOr(DotstarConstants.bSampler, ['b'], this.savedSamplers), [fnValidator]],
    });

    this.rgbSamplerForm.valueChanges.pipe(
      takeUntil(this.unsubscribe$),
      startWith(this.rgbSamplerForm.value),
      filter(() => this.rgbSamplerForm.valid || this.rgbSamplerForm.disabled),
      map(samplers => this.rgbSamplerForm.disabled ? {} : samplers),
      tap(({ r, g, b }) => r && b && g && (this.savedSamplers = { ...this.savedSamplers, r, g, b })),
      map(({ r, g, b }): ChannelSamplers => [
        eval(`${samplerFnHead}${r || 0}`),
        eval(`${samplerFnHead}${g || 0}`),
        eval(`${samplerFnHead}${b || 0}`),
      ])
    )
    .subscribe(samplers => this.bufferService.updateSamplers(samplers));
  }

  toggleChannel({ checked }: MatSlideToggleChange, channel: string) {
    this.rgbSamplerForm.get(channel)[checked ? 'enable' : 'disable']();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
