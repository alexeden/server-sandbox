// tslint:disable no-eval
import { pathOr } from 'ramda';
import { Subject, BehaviorSubject, Observable, empty } from 'rxjs';
import { takeUntil, filter, map, startWith, tap, switchMap, distinctUntilChanged, pairwise, retryWhen, take, catchError } from 'rxjs/operators';
import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import {
  DotstarConstants,
  Sampler,
  Triplet,
  SamplerUtils,
  Colorspace,
  BufferStreamGenerator,
  SamplerTemplate,
  CombinedSampler,
} from '@app/lib';
import { LocalStorage } from '../web-storage.decorators';
import { BufferService } from '@app/buffer.service';
import { functionBodyValidator } from './function-body.validator';

@Component({
  selector: 'dotstar-function-forms',
  templateUrl: './function-forms.component.html',
  styleUrls: ['./function-forms.component.scss'],
})
export class FunctionFormsComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly combinedSampler: Observable<CombinedSampler<any>>;
  readonly errorCaught = new Subject<boolean>();
  readonly selectedColorspace$: BehaviorSubject<Colorspace>;
  readonly samplerForm: FormGroup;

  @Input() bufferStreamGenerator: BufferStreamGenerator<any>;
  @Input() samplerTemplate: SamplerTemplate;

  @LocalStorage()
  private savedSelectedColorspace: Colorspace;

  @LocalStorage()
  private savedSamplers: Record<'r' | 'g' | 'b' | 'h' | 's' | 'l', Sampler<any>>;

  constructor(
    private fb: FormBuilder,
    private bufferService: BufferService
  ) {
    (window as any).channelFunctionFormsComponent = this;

    this.selectedColorspace$ = new BehaviorSubject<Colorspace>(this.savedSelectedColorspace || Colorspace.HSL);
    this.samplerForm = this.fb.group({ });

    this.combinedSampler = this.selectedColorspace$.pipe(
      tap(mode => this.savedSelectedColorspace = mode),
      switchMap(mode => {
        const formGroup = this.samplerForm.get(mode);

        return formGroup!.valueChanges.pipe(
          startWith(formGroup!.value),
          filter(() => formGroup!.valid),
          /** Clear the error caught stream  */
          tap(() => this.errorCaught.next(false)),
          /** Save the changed form values to session */
          tap(samplerStrs => this.savedSamplers = { ...this.savedSamplers, ...samplerStrs }),
          /** Generate the sampler function triplet */
          map(samplerStrs =>
            Object.values(samplerStrs).map(body =>
              eval(`${this.samplerTemplate(body as string)}`)
            ) as Triplet<Sampler<any>>
          ),
          /** Merge the samplers */
          map(SamplerUtils.samplerCombinatorFromColorspace(mode))
        );
      })
    );
  }

  ngOnInit() {
    const fnValidator = functionBodyValidator(this.samplerTemplate);

    this.samplerForm.addControl('rgb', this.fb.group({
      r: [pathOr(DotstarConstants.rSampler, ['r'], this.savedSamplers), [fnValidator]],
      g: [pathOr(DotstarConstants.gSampler, ['g'], this.savedSamplers), [fnValidator]],
      b: [pathOr(DotstarConstants.bSampler, ['b'], this.savedSamplers), [fnValidator]],
    }));

    this.samplerForm.addControl('hsl', this.fb.group({
      h: [pathOr(DotstarConstants.hSampler, ['h'], this.savedSamplers), [fnValidator]],
      s: [pathOr(DotstarConstants.sSampler, ['s'], this.savedSamplers), [fnValidator]],
      l: [pathOr(DotstarConstants.lSampler, ['l'], this.savedSamplers), [fnValidator]],
    }));

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
     * Generate a buffer stream from the samplers and send to the buffer service.
     */
    this.combinedSampler.pipe(
      takeUntil(this.unsubscribe$),
      map(samplers =>
        this.bufferStreamGenerator(samplers).pipe(
          catchError(() => {
            /** Notifiy that an error was caught, it'll be cleared on form change */
            this.errorCaught.next(true);
            return empty();
          })
        )
      )
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
