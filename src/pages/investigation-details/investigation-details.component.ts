// Angular
import { Component } from '@angular/core';
// Ionic
import { NavParams, NavController, LoadingController } from 'ionic-angular';
// SnapApp
import { ConnectPageComponent } from '../connect';
import { ToastService } from '../core/service';

@Component({
  selector: 'investigation-details-page-component',
  templateUrl: 'investigation-details.view.html',
  styles: ['./investigation-details.styles.scss']
})
export class InvestigationDetailsPageComponent {
  connectPageComponent = ConnectPageComponent;
  investigation: any;

  constructor(
    private _loadingCtrl: LoadingController,
    private _navCtrl: NavController,
    private _navParams: NavParams,
    private _toastService: ToastService
  ) {
    this.investigation = this._navParams.get('investigation');
  }

  // LifeCycle methods
  ionViewWillEnter() {

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
}
