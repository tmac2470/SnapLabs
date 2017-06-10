// Angular
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
// Ionic
import { IonicModule } from 'ionic-angular';
// Leezair
import { HomePageComponent } from './home.component';

const pages = [
  HomePageComponent
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
export class HomeModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: HomeModule
    };
  }

  constructor( @Optional() @SkipSelf() parentModule: HomeModule) {
    if (parentModule) {
      throw new Error(
        'HomeModule is already loaded. Import it in the AppModule only');
    }
  }
}
