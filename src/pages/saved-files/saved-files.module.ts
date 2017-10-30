// Angular
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
// Ionic
import { IonicModule } from 'ionic-angular';
// SnapApp
import { SavedFilesPageComponent } from './saved-files.component';

const pages = [
  SavedFilesPageComponent
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
export class SavedFilesModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SavedFilesModule
    };
  }

  constructor( @Optional() @SkipSelf() parentModule: SavedFilesModule) {
    if (parentModule) {
      throw new Error(
        'SavedFilesModule is already loaded. Import it in the AppModule only');
    }
  }
}
