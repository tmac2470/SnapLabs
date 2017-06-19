// Angular
import { AfterViewInit, Component, ViewChild } from '@angular/core';
// Ionic
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// SnapLabs
import { HomePageComponent } from '../pages/home';
import { AppShellPageComponent } from '../pages/app-shell';

@Component({
  templateUrl: 'app.html'
})
export class SnapLabApp implements AfterViewInit {
  rootPage: any = AppShellPageComponent;
  @ViewChild(Nav) nav: Nav;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if (platform.is('cordova')) {
        statusBar.styleDefault();
        splashScreen.hide();
      }
    });
  }

  // Component lifecycles
  ngAfterViewInit(): void {
    this.nav.setRoot(HomePageComponent);
  }
}

