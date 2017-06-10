// Angular
import { Component } from '@angular/core';
// Ionic
import { NavController } from 'ionic-angular';

@Component({
  selector: 'signin-page-component',
  templateUrl: 'signin.view.html'
})
export class SigninPageComponent {
  credentials: any = {
    email: '',
    password: ''
  };

  constructor(
    private _navCtrl: NavController
  ) { }

  // Helper to open a given page
  openPage(page: any) {
    this._navCtrl.push(page);
  }
}
