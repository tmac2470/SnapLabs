// Angular
import { Component } from '@angular/core';
// Ionic
import { NavController } from 'ionic-angular';
// SnapApp
import { ConnectPageComponent } from '../connect';
import { SigninPageComponent } from '../account';

@Component({
  selector: 'home-page-component',
  templateUrl: 'home.view.html',
  styles: ['./home.styles.scss']
})
export class HomePageComponent {
  connectPageComponent = ConnectPageComponent;
  signinPageComponent = SigninPageComponent;

  constructor(
    private _navCtrl: NavController
  ) { }

  // Helper to open a given page
  openPage(page: any) {
    this._navCtrl.push(page);
  }
}
