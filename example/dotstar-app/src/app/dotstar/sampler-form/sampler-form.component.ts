// tslint:disable no-eval
import { pathOr } from 'ramda';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, filter, map, startWith, tap, switchMap } from 'rxjs/operators';
import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material';
import { samplerFnHead, DotstarConstants, RGB, HSL, Sampler, ChannelSamplers } from '../lib';
import { LocalStorage } from '@app/shared';
import { DotstarBufferService } from '../dotstar-buffer.service';
import { functionBodyValidator } from './function-body.validator';

@Component({
  selector: 'dotstar-sampler-form',
  templateUrl: './sampler-form.component.html',
  styleUrls: ['./sampler-form.component.scss'],
})
export class DotstarSamplerFormComponent implements OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly fnValidator = functionBodyValidator(samplerFnHead, [0, 0, 1]);
  readonly mode$ = new BehaviorSubject<'rgb' | 'hsl'>('rgb');
  readonly samplerFnHead = samplerFnHead;
  readonly channelToggleForm: FormGroup;
  readonly rgbSamplerForm: FormGroup;
  readonly samplerForm: FormGroup;

  @LocalStorage()
  private savedSamplers: Record<RGB | HSL, Sampler>;

  constructor(
    private fb: FormBuilder,
    private bufferService: DotstarBufferService
  ) {
    (window as any).DotstarSamplerFormComponent = this;

    this.channelToggleForm = this.fb.group({ r: [true], g: [true], b: [true] });

    this.samplerForm = this.fb.group({
      rgb: this.fb.group({
        r: [pathOr(DotstarConstants.rSampler, ['r'], this.savedSamplers), [this.fnValidator]],
        g: [pathOr(DotstarConstants.gSampler, ['g'], this.savedSamplers), [this.fnValidator]],
        b: [pathOr(DotstarConstants.bSampler, ['b'], this.savedSamplers), [this.fnValidator]],
      }),
      hsl: this.fb.group({
        h: [pathOr('0', ['h'], this.savedSamplers), [this.fnValidator]],
        s: [pathOr('100', ['s'], this.savedSamplers), [this.fnValidator]],
        l: [pathOr('100', ['l'], this.savedSamplers), [this.fnValidator]],
      }),
    });


    this.rgbSamplerForm = this.fb.group({
      r: [pathOr(DotstarConstants.rSampler, ['r'], this.savedSamplers), [this.fnValidator]],
      g: [pathOr(DotstarConstants.gSampler, ['g'], this.savedSamplers), [this.fnValidator]],
      b: [pathOr(DotstarConstants.bSampler, ['b'], this.savedSamplers), [this.fnValidator]],
    });

    this.mode$.pipe(
      takeUntil(this.unsubscribe$),
      switchMap(mode => {
        const formGroup = this.samplerForm.get(mode);

        return formGroup.valueChanges.pipe(
          startWith(formGroup.value),
          filter(() => formGroup.valid),
          tap(samplerStrs => this.savedSamplers = { ...this.savedSamplers, ...samplerStrs }),
          map(samplerStrs => Object.values(samplerStrs).map(body => eval(`${samplerFnHead}${body}`)) as ChannelSamplers),
          map(samplers => {
            switch (mode) {
              case 'hsl':
                return DotstarSamplerFormComponent.convertToRgb(samplers);
              default:
                return samplers;
            }
          })
        );
      })
    )
    // .subscribe(console.log);
    // this.rgbSamplerForm.valueChanges.pipe(
    //   takeUntil(this.unsubscribe$),
    //   startWith(this.rgbSamplerForm.value),
    //   filter(() => this.rgbSamplerForm.valid || this.rgbSamplerForm.disabled),
    //   // map(samplerStrs => this.rgbSamplerForm.disabled ? {} : samplerStrs),
    //   tap(samplerStrs => this.savedSamplers = { ...this.savedSamplers, ...samplerStrs }),
    //   map(({ r, g, b }) => ({
    //     r: r ? eval(`${samplerFnHead}${r}`) : () => 0,
    //     g: g ? eval(`${samplerFnHead}${g}`) : () => 0,
    //     b: b ? eval(`${samplerFnHead}${b}`) : () => 0,
    //   }))
    // )
    .subscribe(samplers => this.bufferService.updateSamplers(samplers));
  }

  static convertToRgb([h, s, l]: ChannelSamplers): ChannelSamplers {
    return [h, s, l];
  }

  toggleChannel({ checked }: MatSlideToggleChange, channel: string) {
    // this.rgbSamplerForm.get(channel)[checked ? 'enable' : 'disable']();
  }

  setMode(mode: 'rgb' | 'hsl') {
    this.mode$.next(mode);
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
    this.mode$.unsubscribe();
  }
}
