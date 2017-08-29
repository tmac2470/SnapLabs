// Angular
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
// Ionic
import { IonicModule } from 'ionic-angular';
// Snapapp
import { DownloadInvestigationsPageComponent } from './download-investigations.component';
import { DownloadInvestigationsService } from './download-investigations.service';
import { CoreModule } from '../core/core.module';

const pages = [
  DownloadInvestigationsPageComponent
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
export class DownloadInvestigationsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DownloadInvestigationsModule,
      providers: [
        DownloadInvestigationsService
      ]
    };
  }

  constructor( @Optional() @SkipSelf() parentModule: DownloadInvestigationsModule) {
    if (parentModule) {
      throw new Error(
        'DownloadInvestigationsModule is already loaded. Import it in the AppModule only');
    }
  }
}
