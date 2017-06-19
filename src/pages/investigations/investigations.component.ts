// Angular
import { Component } from '@angular/core';
// Ionic
import { NavController, LoadingController } from 'ionic-angular';
// SnapApp
import { ConnectPageComponent } from '../connect';
import { ToastService } from '../core/service';

@Component({
  selector: 'investigations-page-component',
  templateUrl: 'investigations.view.html',
  styles: ['./investigations.styles.scss']
})
export class InvestigationsPageComponent {
  connectPageComponent = ConnectPageComponent;
  investigations: any = [{
    key: 'balloon_pressure_investigation',
    name: 'Balloon Pressure Investigation'
  }, {
    key: 'magnetic_mining_investigation',
    name: 'Magnetic Mining Investigation'
  }];

  constructor(
    private _loadingCtrl: LoadingController,
    private _navCtrl: NavController,
    private _toastService: ToastService
  ) { }

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
