// Angular
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
// Ionic
import { IonicModule } from 'ionic-angular';
// SnapApp
import {
  EmailValidatorDirective,
  HideKeyboardOnGoDirective
} from './directive';
import {
  StorageService,
  ToastService
} from './service';

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
      ngModule: CoreModule,
      providers: [
        StorageService,
        ToastService
      ]
    };
  }

  constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
