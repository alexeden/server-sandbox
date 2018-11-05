import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ValidatorFn, FormControl } from '@angular/forms';

const functionBodyValidator = (args: string): ValidatorFn => {
  return (control: FormControl): {[key: string]: any} | null => {
    try {
      // tslint:disable-next-line:no-eval
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
export class DotstarAnimationFormComponent implements OnInit {
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
  }

  ngOnInit() {
  }

}
