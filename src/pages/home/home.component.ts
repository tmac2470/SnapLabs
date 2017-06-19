// Angular
import { Component } from '@angular/core';
// Ionic
import { NavController, LoadingController } from 'ionic-angular';
// SnapApp
import { ConnectPageComponent } from '../connect';
import { SigninPageComponent, SignupPageComponent, AccountService } from '../account';
import { ToastService } from '../core/service';
import { InvestigationsPageComponent } from '../investigations';

@Component({
  selector: 'home-page-component',
  templateUrl: 'home.view.html',
  styles: ['./home.styles.scss']
})
export class HomePageComponent {
  connectPageComponent = ConnectPageComponent;
  investigationsPageComponent = InvestigationsPageComponent;
  signinPageComponent = SigninPageComponent;
  signupPageComponent = SignupPageComponent;

  isLoggedIn: boolean = false;

  constructor(
    private _accountService: AccountService,
    private _loadingCtrl: LoadingController,
    private _navCtrl: NavController,
    private _toastService: ToastService
  ) { }

  // LifeCycle methods
  ionViewWillEnter() {
    const loading = this.loading();

    this._accountService.getUser()
      .subscribe(user => {
        loading.dismiss();
        this.isLoggedIn = !!user && !!user.email;
      });
  }

  loading() {
    let loader = this._loadingCtrl.create({
      content: "Please wait...",
      duration: 3000
    });
    loader.present();
    return loader;
  }

  // Helper to open a given page
  openPage(page: any) {
    this._navCtrl.push(page);
  }

  // Logout user
  logout() {
    const loading = this.loading();

    this._accountService.logout()
      .subscribe(_ => {
        this.isLoggedIn = false;
        loading.dismiss();
        this._toastService.present({
          message: `Successfully logged out!`
        });
      });
  }
}
