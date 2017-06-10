// Angular
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
// Ionic
import { IonicModule } from 'ionic-angular';
// Leezair
import {
  EmailValidatorDirective,
  HideKeyboardOnGoDirective
} from './directive';

const directives = [
  EmailValidatorDirective,
  HideKeyboardOnGoDirective
];

@NgModule({
  imports: [
    IonicModule
  ],
  declarations: [
    ...directives
  ],
  entryComponents: [
  ],
  exports: [
    ...directives
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule
    };
  }

  constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
