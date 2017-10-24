// Angular
import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { HttpModule } from "@angular/http";
// Ionic
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { IonicStorageModule } from "@ionic/storage";
import { BLE } from "@ionic-native/ble";
import { Keyboard } from "@ionic-native/keyboard";
import { Network } from "@ionic-native/network";
import { File } from '@ionic-native/file';
// SnapLabApp
import { SnapLabApp } from "./app.component";
import { AccountModule } from "../pages/account/account.module";
import { CoreModule } from "../pages/core/core.module";
import { ConnectModule } from "../pages/connect/connect.module";
import { HomeModule } from "../pages/home/home.module";
import { InvestigationsModule } from "../pages/investigations/investigations.module";
import { InvestigationDetailsModule } from "../pages/investigation-details/investigation-details.module";
import { AppShellPageComponent } from "../pages/app-shell/app-shell.component";
import { DownloadInvestigationsModule } from "../pages/download-investigations/download-investigations.module";

@NgModule({
  declarations: [SnapLabApp, AppShellPageComponent],
  imports: [
    BrowserModule,
    HttpModule,
    // Ionic
    IonicModule.forRoot(SnapLabApp, {
      backButtonText: ""
    }),
    IonicStorageModule.forRoot(),

    // SnapLabs
    AccountModule.forRoot(),
    ConnectModule.forRoot(),
    CoreModule.forRoot(),
    DownloadInvestigationsModule.forRoot(),
    HomeModule.forRoot(),
    InvestigationDetailsModule.forRoot(),
    InvestigationsModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [SnapLabApp, AppShellPageComponent],
  providers: [
    BLE,
    Keyboard,
    SplashScreen,
    StatusBar,
    Network,
    File,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule {}
