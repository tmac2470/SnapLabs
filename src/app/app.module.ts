import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { BLE } from '@ionic-native/ble'
import { Keyboard } from '@ionic-native/keyboard';

// SnapLabApp
import { SnapLabApp } from './app.component';
import { HomePageComponent } from '../pages/home';
import { ConnectPageComponent } from '../pages/connect';
import { AccountModule } from '../pages/account/account.module';
import { CoreModule } from '../pages/core/core.module';

@NgModule({
  declarations: [
    SnapLabApp,
    HomePageComponent,
    ConnectPageComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(SnapLabApp, {
      backButtonText: '',
    }),

    // SnapLabs
    AccountModule.forRoot(),
    CoreModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    SnapLabApp,
    HomePageComponent,
    ConnectPageComponent
  ],
  providers: [
    BLE,
    Keyboard,
    SplashScreen,
    StatusBar,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
