// tslint:disable no-eval
import { pathOr } from 'ramda';
import { Subject, BehaviorSubject, Observable, empty } from 'rxjs';
import { takeUntil, filter, map, startWith, tap, switchMap, distinctUntilChanged, pairwise } from 'rxjs/operators';
import { Component, OnDestroy, OnInit, Input, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { samplerFnHead, DotstarConstants, RGB, HSL, Sampler, Triplet, SamplerUtils, Colorspace, ChannelSampler, BufferStreamGenerator } from '../lib';
import { LocalStorage } from '@app/shared';
import { BufferService } from '../buffer.service';
import { functionBodyValidator } from './function-body.validator';

@Component({
  selector: 'dotstar-channel-function-forms',
  templateUrl: './channel-function-forms.component.html',
  styleUrls: ['./channel-function-forms.component.scss'],
})
export class ChannelFunctionFormsComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly fnValidator = functionBodyValidator(samplerFnHead, [0, 0, 1]);
  private readonly channelSampler: Observable<ChannelSampler>;
  readonly selectedColorspace$: BehaviorSubject<Colorspace>;
  readonly samplerForm: FormGroup;

  @Input() bufferStreamGenerator: BufferStreamGenerator;

  @LocalStorage()
  private savedSelectedColorspace: Colorspace;

  @LocalStorage()
  private savedSamplers: Record<RGB | HSL, Sampler>;

  constructor(
    private fb: FormBuilder,
    private bufferService: BufferService
  ) {
    (window as any).channelFunctionFormsComponent = this;

    this.selectedColorspace$ = new BehaviorSubject<Colorspace>(this.savedSelectedColorspace || Colorspace.HSL);

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

    this.channelSampler = this.selectedColorspace$.pipe(
      tap(mode => this.savedSelectedColorspace = mode),
      switchMap(mode => {
        const formGroup = this.samplerForm.get(mode);

        return formGroup!.valueChanges.pipe(
          startWith(formGroup!.value),
          filter(() => formGroup!.valid),
          tap(samplerStrs => this.savedSamplers = { ...this.savedSamplers, ...samplerStrs }),
          map(samplerStrs => Object.values(samplerStrs).map(body => eval(`${samplerFnHead}${body}`)) as Triplet<Sampler>),
          map(SamplerUtils.samplerCombinatorFromColorspace(mode))
        );
      })
    );
  }

  ngOnInit() {
    /**
     * Manage the enabling and disabling of the colorspace-specific forms
     */
    this.selectedColorspace$.pipe(
      takeUntil(this.unsubscribe$),
      distinctUntilChanged(),
      startWith(this.selectedColorspace$.getValue() === Colorspace.HSL ? Colorspace.RGB : Colorspace.HSL),
      pairwise()
    )
    .subscribe(([newMode, oldMode]) => {
      this.samplerForm.get(oldMode)!.enable();
      this.samplerForm.get(newMode)!.disable();
    });

    /**
     * Send the samplers to the buffer service for buffer stream generation.
     */
    this.channelSampler.pipe(
      takeUntil(this.unsubscribe$),
      map(samplers => this.bufferStreamGenerator(samplers))
    )
    .subscribe(stream => this.bufferService.setBufferStream(stream));
  }

  setMode(mode: Colorspace) {
    this.selectedColorspace$.next(mode);
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
    this.selectedColorspace$.unsubscribe();
    this.bufferService.resetBufferStream();
  }
}
