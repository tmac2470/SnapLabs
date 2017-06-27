// Angular
import { Component } from '@angular/core';
// Ionic
import { NavController } from 'ionic-angular';
// App
import { IUserCredentials } from '../account.model';
import { AccountService } from '../account.service';
import { ToastService } from '../../core/service';

@Component({
  selector: 'signin-page-component',
  templateUrl: 'signin.view.html'
})
export class SigninPageComponent {
  credentials: IUserCredentials = {
    email: ''
    // ,
    // password: ''
  };

  constructor(
    private _accountService: AccountService,
    private _navCtrl: NavController,
    private _toastService: ToastService
  ) { }

  // Signin Handler
  signin(credentials: IUserCredentials) {
    this._accountService.login(credentials)
      .subscribe(user => {
        if (user) {
          this._toastService.present({
            message: `Welcome ${user.username}!`
          });
          this._navCtrl.pop();
        } else {
          this._toastService.present({
            message: `Incorrect username/password!`
          });
        }
      });
  }

  // Helper to open a given page
  openPage(page: any) {
    this._navCtrl.push(page);
  }
}
