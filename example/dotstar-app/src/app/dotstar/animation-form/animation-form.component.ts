// tslint:disable no-eval
import { Component, OnInit, OnDestroy, Output, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, ValidatorFn, FormControl } from '@angular/forms';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, filter, map, startWith } from 'rxjs/operators';
import { ChannelAnimationFns, animationFnHead } from '../lib';

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
  selector: 'dotstar-animation-form',
  templateUrl: './animation-form.component.html',
  styleUrls: ['./animation-form.component.scss'],
})
export class DotstarAnimationFormComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() functionUpdate = new BehaviorSubject<ChannelAnimationFns>({
    r: () => 0,
    g: () => 0,
    b: () => 0,
  });

  private readonly unsubscribe$ = new Subject<any>();
  readonly animationFnHead = animationFnHead;
  readonly animationForm: FormGroup;

  constructor(
    private fb: FormBuilder
  ) {
    this.animationForm = this.fb.group({
      r: this.fb.control('4 * i', [functionBodyValidator(animationFnHead)]),
      g: this.fb.control('30', [functionBodyValidator(animationFnHead)]),
      b: this.fb.control('80', [functionBodyValidator(animationFnHead)]),
    });

    this.animationForm.valueChanges.pipe(
      takeUntil(this.unsubscribe$),
      startWith(this.animationForm.value),
      filter(() => this.animationForm.valid),
      map(({ r, g, b }): ChannelAnimationFns => ({
        r: eval(`${animationFnHead}${r}`),
        g: eval(`${animationFnHead}${g}`),
        b: eval(`${animationFnHead}${b}`),
      }))
    )
    .subscribe(this.functionUpdate);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.functionUpdate.next(this.functionUpdate.getValue());
    // setTimeout(() => this.functionUpdate.next(this.functionUpdate.getValue()), 1000);
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
