// tslint:disable no-eval
import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, ValidatorFn, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, filter, map, startWith, tap } from 'rxjs/operators';
import { ChannelSamplers, samplerFnHead, DotstarConstants } from '../lib';
import { LocalStorage } from '@app/shared';
import { DotstarBufferService } from '../dotstar-buffer.service';
import { MatSlideToggleChange } from '@angular/material';
import pathOr from 'ramda/es/pathOr';

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
  readonly channelToggleForm: FormGroup;
  readonly rgbSamplerForm: FormGroup;

  @LocalStorage() rgbSamplers: Partial<ChannelSamplers>;

  constructor(
    private fb: FormBuilder,
    private bufferService: DotstarBufferService
  ) {
    (window as any).DotstarSamplerFormComponent = this;

    this.channelToggleForm = this.fb.group({
      r: this.fb.control(true),
      g: this.fb.control(true),
      b: this.fb.control(true),
    });

    this.rgbSamplerForm = this.fb.group({
      r: this.fb.control(pathOr(DotstarConstants.rSampler, [0], this.rgbSamplers), [
        functionBodyValidator(samplerFnHead),
      ]),
      g: this.fb.control(pathOr(DotstarConstants.gSampler, [1], this.rgbSamplers), [
        functionBodyValidator(samplerFnHead),
      ]),
      b: this.fb.control(pathOr(DotstarConstants.bSampler, [2], this.rgbSamplers), [
        functionBodyValidator(samplerFnHead),
      ]),
    });

    this.rgbSamplerForm.valueChanges.pipe(
      takeUntil(this.unsubscribe$),
      startWith(this.rgbSamplerForm.value),
      tap(value => console.log('value changed: ', value)),
      filter(() => this.rgbSamplerForm.valid || this.rgbSamplerForm.disabled),
      tap(({ r, g, b }) => r && b && g && (this.rgbSamplers = [r, g, b])),
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
