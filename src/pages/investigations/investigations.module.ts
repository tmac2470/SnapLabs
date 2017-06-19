// Angular
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
// Ionic
import { IonicModule } from 'ionic-angular';
// Leezair
import { InvestigationsPageComponent } from './investigations.component';

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
      ngModule: InvestigationsModule
    };
  }

  constructor( @Optional() @SkipSelf() parentModule: InvestigationsModule) {
    if (parentModule) {
      throw new Error(
        'InvestigationsModule is already loaded. Import it in the AppModule only');
    }
  }
}
