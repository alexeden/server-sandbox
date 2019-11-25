// tslint:disable no-eval
import { ValidatorFn, FormControl } from '@angular/forms';

export const functionBodyValidator = (templateFn: (body: string) => any): ValidatorFn => {
  return (control: FormControl): {[key: string]: any} | null => {
    try {
      const fn = eval(`${templateFn(control.value as string)}`);
      if (typeof fn !== 'function') return { notAFunction: true };
      return null;
    }
    catch (error) {
      return { unknownError: true };
    }
  };
};
