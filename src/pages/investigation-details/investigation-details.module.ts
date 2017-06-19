// Angular
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
// Ionic
import { IonicModule } from 'ionic-angular';
// Leezair
import { InvestigationDetailsPageComponent } from './investigation-details.component';

const pages = [
  InvestigationDetailsPageComponent
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
export class InvestigationDetailsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: InvestigationDetailsModule
    };
  }

  constructor( @Optional() @SkipSelf() parentModule: InvestigationDetailsModule) {
    if (parentModule) {
      throw new Error(
        'InvestigationDetailsModule is already loaded. Import it in the AppModule only');
    }
  }
}
