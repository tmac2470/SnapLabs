import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { SnapLabApp } from './app.component';
import { HomePageComponent } from '../pages/home';

@NgModule({
  declarations: [
    SnapLabApp,
    HomePageComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(SnapLabApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    SnapLabApp,
    HomePageComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
