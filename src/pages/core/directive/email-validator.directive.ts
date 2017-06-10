// Angular
import { Directive, forwardRef } from '@angular/core';
import { NG_VALIDATORS, FormControl } from '@angular/forms';

function validateEmailFactory() {
  return (formControl: FormControl) => {
    const EMAIL_REGEXP =
      /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

    return EMAIL_REGEXP.test(formControl.value) ? undefined : {
      validateEmail: {
        valid: false
      }
    };
  };
}

@Directive({
  selector: '[appValidateEmail][ngModel],[appValidateEmail][formControl]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => EmailValidatorDirective), multi: true }
  ]
})
export class EmailValidatorDirective {
  validator: Function;

  constructor() {
    this.validator = validateEmailFactory();
  }

  validate(formControl: FormControl) {
    return this.validator(formControl);
  }
}
