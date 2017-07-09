// Angular
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
// Ionic
import { IonicModule } from 'ionic-angular';
// Snapapp
import { InvestigationsPageComponent } from './investigations.component';
import { InvestigationsService } from './investigations.service';

const pages = [
  InvestigationsPageComponent
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
export class InvestigationsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: InvestigationsModule,
      providers: [
        InvestigationsService
      ]
    };
  }

  constructor( @Optional() @SkipSelf() parentModule: InvestigationsModule) {
    if (parentModule) {
      throw new Error(
        'InvestigationsModule is already loaded. Import it in the AppModule only');
    }
  }
}
