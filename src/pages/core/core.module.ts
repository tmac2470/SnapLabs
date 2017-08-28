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
import {
  OrderByPipe
} from './pipe';

const directives = [
  EmailValidatorDirective,
  HideKeyboardOnGoDirective
];

const pipes = [
  OrderByPipe
];

@NgModule({
  imports: [
    IonicModule
  ],
  declarations: [
    ...directives,
    ...pipes
  ],
  entryComponents: [
  ],
  exports: [
    ...directives,
    ...pipes
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
