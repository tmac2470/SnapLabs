// Angular
import { Component } from '@angular/core';
// Ionic
import { NavController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
// SnapApp
import { ConnectPageComponent } from '../connect';

@Component({
  selector: 'home-page-component',
  templateUrl: 'home.view.html'
})
export class HomePageComponent {
  connectPageComponent = ConnectPageComponent;

  constructor(
    private _navCtrl: NavController
  ) { }

  // Helper to open a given page
  openPage(page: any) {
    this._navCtrl.push(page);
  }
}
