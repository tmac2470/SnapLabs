// Angular
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
// Ionic
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { BLE } from '@ionic-native/ble'
import { Keyboard } from '@ionic-native/keyboard';

// SnapLabApp
import { SnapLabApp } from './app.component';
import { AccountModule } from '../pages/account/account.module';
import { CoreModule } from '../pages/core/core.module';
import { ConnectModule } from '../pages/connect/connect.module';
import { HomeModule } from '../pages/home/home.module';

@NgModule({
  declarations: [
    SnapLabApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(SnapLabApp, {
      backButtonText: '',
    }),

    // SnapLabs
    AccountModule.forRoot(),
    ConnectModule.forRoot(),
    CoreModule.forRoot(),
    HomeModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    SnapLabApp
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
