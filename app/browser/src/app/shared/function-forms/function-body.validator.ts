import { ValidatorFn, AbstractControl } from '@angular/forms';

export const functionBodyValidator = (templateFn: (body: string) => any): ValidatorFn =>
  (control: AbstractControl): {[key: string]: any} | null => {
    try {
      // eslint-disable-next-line no-eval
      const fn = eval(`${templateFn(control.value as string)}`);
      if (typeof fn !== 'function') return { notAFunction: true };
      return null;
    }
    catch (error) {
      return { unknownError: true };
    }
  };
