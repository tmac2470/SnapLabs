// Angular
import { Component } from '@angular/core';
// Ionic
import { NavController } from 'ionic-angular';
// App
import { IUserCredentials } from '../account.model';

export enum DataType {
  PASSWORD,
  STRING,
  BOOLEAN
};
@Component({
  selector: 'signup-page-component',
  templateUrl: 'signup.view.html'
})
export class SignupPageComponent {
  DataType = DataType;
  passwordDataType: DataType = DataType.PASSWORD;
  credentials: IUserCredentials = {
    email: '',
    password: '',
    username: ''
  };

  constructor(
    private _navCtrl: NavController
  ) { }

  // Signup Handler
  signup(credentials: IUserCredentials) {
    console.log(credentials);
  }

  // Helper to open a given page
  openPage(page: any) {
    this._navCtrl.push(page);
  }

  // Toggle the visibility of password field
  togglePasswordVisibility() {
    if (this.passwordDataType === DataType.PASSWORD) {
      this.passwordDataType = DataType.STRING;
    } else {
      this.passwordDataType = DataType.PASSWORD;
    }
  }
}
