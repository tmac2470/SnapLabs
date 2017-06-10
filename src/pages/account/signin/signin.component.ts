// Angular
import { Component } from '@angular/core';
// Ionic
import { NavController } from 'ionic-angular';
// App
import { IUserCredentials } from '../account.model';

@Component({
  selector: 'signin-page-component',
  templateUrl: 'signin.view.html'
})
export class SigninPageComponent {
  credentials: IUserCredentials = {
    email: '',
    password: ''
  };

  constructor(
    private _navCtrl: NavController
  ) { }

  // Signin Handler
  signin(credentials: IUserCredentials) {
    console.log(credentials);
  }

  // Helper to open a given page
  openPage(page: any) {
    this._navCtrl.push(page);
  }
}
