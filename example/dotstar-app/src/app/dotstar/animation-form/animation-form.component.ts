// tslint:disable no-eval
import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { FormGroup, FormBuilder, ValidatorFn, FormControl } from '@angular/forms';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, filter, map } from 'rxjs/operators';
import { AnimationFunctions } from './types';

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
export class DotstarAnimationFormComponent implements OnInit, OnDestroy {
  @Output() functionUpdate = new BehaviorSubject<AnimationFunctions>({
    r: () => 0,
    g: () => 0,
    b: () => 0,
  });

  private readonly unsubscribe$ = new Subject<any>();

  readonly animationForm: FormGroup;
  readonly functionHead = '(t, i) =>';

  constructor(
    private fb: FormBuilder
  ) {
    this.animationForm = this.fb.group({
      r: this.fb.control(0, [functionBodyValidator(this.functionHead)]),
      g: this.fb.control(0, [functionBodyValidator(this.functionHead)]),
      b: this.fb.control(0, [functionBodyValidator(this.functionHead)]),
    });

    this.animationForm.valueChanges.pipe(
      takeUntil(this.unsubscribe$),
      filter(() => this.animationForm.valid),
      map(({ r, g, b }): AnimationFunctions => ({
        r: eval(`${this.functionHead}${r}`),
        g: eval(`${this.functionHead}${g}`),
        b: eval(`${this.functionHead}${b}`),
      }))
    )
    .subscribe(this.functionUpdate);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
