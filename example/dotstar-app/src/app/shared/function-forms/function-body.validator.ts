// tslint:disable no-eval
import { ValidatorFn, FormControl } from '@angular/forms';

export const functionBodyValidator = (templateFn: (body: string) => any, testArgs: any[]): ValidatorFn => {
  return (control: FormControl): {[key: string]: any} | null => {
    try {
      // console.log(templateFn);
      const fn = eval(`${templateFn(control.value as string)}`);
      if (typeof fn !== 'function') return { notAFunction: true };
      // if (typeof fn(...testArgs) !== 'number' || isNaN(fn(...testArgs))) return { invalidReturnValue: true };
      return null;
    }
    catch (error) {
      console.log(error);
      return { unknownError: true };
    }
  };
};
