// tslint:disable no-eval
import { pathOr } from 'ramda';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, filter, map, startWith, tap, switchMap, distinctUntilChanged, pairwise } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material';
import { samplerFnHead, DotstarConstants, RGB, HSL, Sampler, Triplet, SamplerUtils, Colorspace, ChannelSampler } from '../lib';
import { LocalStorage } from '@app/shared';
import { DotstarBufferService } from '../dotstar-buffer.service';
import { functionBodyValidator } from './function-body.validator';

@Component({
  selector: 'dotstar-sampler-form',
  templateUrl: './sampler-form.component.html',
  styleUrls: ['./sampler-form.component.scss'],
})
export class SamplerFormComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly fnValidator = functionBodyValidator(samplerFnHead, [0, 0, 1]);
  private readonly channelSampler: Observable<ChannelSampler>;
  readonly mode$: BehaviorSubject<Colorspace>;
  readonly samplerFnHead = samplerFnHead;

  readonly channelToggleForm: FormGroup;
  readonly samplerForm: FormGroup;

  @LocalStorage()
  private savedColorspace: Colorspace;

  @LocalStorage()
  private savedSamplers: Record<RGB | HSL, Sampler>;

  constructor(
    private fb: FormBuilder,
    private bufferService: DotstarBufferService
  ) {
    this.mode$ = new BehaviorSubject<Colorspace>(this.savedColorspace || Colorspace.HSL);

    this.channelToggleForm = this.fb.group({ r: [true], g: [true], b: [true] });

    this.samplerForm = this.fb.group({
      rgb: this.fb.group({
        r: [pathOr(DotstarConstants.rSampler, ['r'], this.savedSamplers), [this.fnValidator]],
        g: [pathOr(DotstarConstants.gSampler, ['g'], this.savedSamplers), [this.fnValidator]],
        b: [pathOr(DotstarConstants.bSampler, ['b'], this.savedSamplers), [this.fnValidator]],
      }),
      hsl: this.fb.group({
        h: [pathOr(DotstarConstants.hSampler, ['h'], this.savedSamplers), [this.fnValidator]],
        s: [pathOr(DotstarConstants.sSampler, ['s'], this.savedSamplers), [this.fnValidator]],
        l: [pathOr(DotstarConstants.lSampler, ['l'], this.savedSamplers), [this.fnValidator]],
      }),
    });

    this.channelSampler = this.mode$.pipe(
      tap(mode => this.savedColorspace = mode),
      switchMap(mode => {
        const formGroup = this.samplerForm.get(mode);

        return formGroup!.valueChanges.pipe(
          startWith(formGroup!.value),
          filter(() => formGroup!.valid),
          tap(samplerStrs => this.savedSamplers = { ...this.savedSamplers, ...samplerStrs }),
          map(samplerStrs => Object.values(samplerStrs).map(body => eval(`${samplerFnHead}${body}`)) as Triplet<Sampler>),
          map(SamplerUtils.samplersToChannelSampler(mode))
        );
      })
    );
  }

  ngOnInit() {
    this.mode$.pipe(
      takeUntil(this.unsubscribe$),
      distinctUntilChanged(),
      startWith(this.mode$.getValue() === Colorspace.HSL ? Colorspace.RGB : Colorspace.HSL),
      pairwise()
    )
    .subscribe(([newMode, oldMode]) => {
      console.log(newMode, oldMode);
      this.samplerForm.get(oldMode)!.enable();
      this.samplerForm.get(newMode)!.disable();
    });

    this.channelSampler.pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe(samplers => this.bufferService.setSourceFromSampler(samplers));
  }

  toggleChannel({ checked }: MatSlideToggleChange, channel: string) {
    // this.rgbSamplerForm.get(channel)[checked ? 'enable' : 'disable']();
  }

  setMode(mode: Colorspace) {
    this.mode$.next(mode);
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
    this.mode$.unsubscribe();
  }
}
