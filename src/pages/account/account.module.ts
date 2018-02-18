// Angular
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
// Ionic
import { IonicModule } from 'ionic-angular';
// SnapApp
import { SigninPageComponent } from './signin';
import { SignupPageComponent } from './signup';
import { AccountService } from './account.service';
import { CoreModule } from '../core/core.module';

const pages = [
  SigninPageComponent,
  SignupPageComponent
];

@NgModule({
  imports: [
    IonicModule,
    CoreModule
  ],
  declarations: [
    ...pages
  ],
  entryComponents: [
    ...pages
  ],
  exports: [
    ...pages
  ]
})
export class AccountModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AccountModule,
      providers: [
        AccountService
      ]
    };
  }

  constructor( @Optional() @SkipSelf() parentModule: AccountModule) {
    if (parentModule) {
      throw new Error(
        'AccountModule is already loaded. Import it in the AppModule only');
    }
  }
}