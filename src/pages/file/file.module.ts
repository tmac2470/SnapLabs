// Angular
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
// Ionic
import { IonicModule } from 'ionic-angular';
// SnapApp
import { FilePageComponent } from './file.component';

const pages = [
  FilePageComponent
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
export class FileModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FileModule
    };
  }

  constructor( @Optional() @SkipSelf() parentModule: FileModule) {
    if (parentModule) {
      throw new Error(
        'FileModule is already loaded. Import it in the AppModule only');
    }
  }
}
