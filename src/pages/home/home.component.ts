// Angular
import { Component } from '@angular/core';
// Ionic
import { NavController } from 'ionic-angular';
// SnapApp
import { ConnectPageComponent } from '../connect';
import { SigninPageComponent, SignupPageComponent, AccountService } from '../account';

@Component({
  selector: 'home-page-component',
  templateUrl: 'home.view.html',
  styles: ['./home.styles.scss']
})
export class HomePageComponent {
  connectPageComponent = ConnectPageComponent;
  signinPageComponent = SigninPageComponent;
  signupPageComponent = SignupPageComponent;

  isLoggedIn: boolean = false;

  constructor(
    private _accountService: AccountService,
    private _navCtrl: NavController
  ) { }

  // LifeCycle methods
  ionViewWillEnter() {
    this._accountService.getUser()
      .subscribe(user => {
        this.isLoggedIn = !!user && !!user.email;
      });
  }

  // Helper to open a given page
  openPage(page: any) {
    this._navCtrl.push(page);
  }
}
