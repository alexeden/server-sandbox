// tslint:disable no-eval
import { Component, OnDestroy, Output, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, ValidatorFn, FormControl } from '@angular/forms';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, filter, map, startWith, tap } from 'rxjs/operators';
import { ChannelSamplers, samplerFnHead } from '../lib';
import { LocalStorage } from '@app/shared';

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
export class DotstarSamplerFormComponent implements AfterViewInit, OnDestroy {
  @Output() functionUpdate = new BehaviorSubject<ChannelSamplers>({
    r: () => 0,
    g: () => 0,
    b: () => 0,
  });

  private readonly unsubscribe$ = new Subject<any>();
  readonly samplerFnHead = samplerFnHead;
  readonly animationForm: FormGroup;

  @LocalStorage() rFn: string;
  @LocalStorage() gFn: string;
  @LocalStorage() bFn: string;

  constructor(
    private fb: FormBuilder
  ) {
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
      map(({ r, g, b }): ChannelSamplers => ({
        r: eval(`${samplerFnHead}${r}`),
        g: eval(`${samplerFnHead}${g}`),
        b: eval(`${samplerFnHead}${b}`),
      }))
    )
    .subscribe(this.functionUpdate);
  }

  ngAfterViewInit() {
    this.functionUpdate.next(this.functionUpdate.getValue());
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
