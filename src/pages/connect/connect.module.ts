// Angular
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
// Ionic
import { IonicModule } from 'ionic-angular';
// Leezair
import { ConnectPageComponent } from './connect.component';
import { ConnectService } from './connect.service';

const pages = [
  ConnectPageComponent
];

@NgModule({
  imports: [
    IonicModule
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
export class ConnectModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ConnectModule,
      providers: [
        ConnectService
      ]
    };
  }

  constructor( @Optional() @SkipSelf() parentModule: ConnectModule) {
    if (parentModule) {
      throw new Error(
        'ConnectModule is already loaded. Import it in the AppModule only');
    }
  }
}
