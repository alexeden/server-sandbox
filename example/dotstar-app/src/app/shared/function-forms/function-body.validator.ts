// tslint:disable no-eval
import { ValidatorFn, FormControl } from '@angular/forms';

export const functionBodyValidator = (fnHead: string, testArgs: any[]): ValidatorFn => {
  return (control: FormControl): {[key: string]: any} | null => {
    try {
      const fn = eval(`${fnHead} ${control.value}`);
      if (typeof fn !== 'function') return { notAFunction: true };
      if (typeof fn(...testArgs) !== 'number' || isNaN(fn(...testArgs))) return { invalidReturnValue: true };
      return null;
    }
    catch (error) {
      return { unknownError: true };
    }
  };
};
