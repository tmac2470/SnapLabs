// Angular
import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from "@angular/core";
// Ionic
import { IonicModule } from "ionic-angular";
// SnapApp
import { SharePageComponent } from "./share.component";
import { ShareService } from "./share.service";

const pages = [SharePageComponent];

@NgModule({
  imports: [IonicModule],
  declarations: [...pages],
  entryComponents: [...pages],
  exports: [...pages]
})
export class ShareModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ShareModule,
      providers: [ShareService]
    };
  }

  constructor(
    @Optional()
    @SkipSelf()
    parentModule: ShareModule
  ) {
    if (parentModule) {
      throw new Error(
        "ShareModule is already loaded. Import it in the AppModule only"
      );
    }
  }
}
