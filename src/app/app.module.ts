import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

// SnapLabApp
import { SnapLabApp } from './app.component';
import { HomePageComponent } from '../pages/home';
import { ConnectPageComponent } from '../pages/connect';

@NgModule({
  declarations: [
    SnapLabApp,
    HomePageComponent,
    ConnectPageComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(SnapLabApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    SnapLabApp,
    HomePageComponent,
    ConnectPageComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
