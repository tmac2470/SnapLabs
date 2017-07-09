// Angular
import { Component } from '@angular/core';
// Ionic
import { NavParams, NavController, LoadingController } from 'ionic-angular';
// SnapApp
import { ConnectPageComponent } from '../connect';
import { ToastService } from '../core/service';
import { Investigation, ISensor, ISensorTag } from './investigation-details.model';

@Component({
  selector: 'investigation-details-page-component',
  templateUrl: 'investigation-details.view.html',
  styles: ['./investigation-details.styles.scss']
})
export class InvestigationDetailsPageComponent {
  connectPageComponent = ConnectPageComponent;
  investigation: Investigation;
  sensors: any[] = [];

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
    const sensorTags = this.investigation.data.experimentConfig.sensorTags;

    // Fetch all the configs for all different sensor tags
    for (let id in sensorTags) {
      const sensorTag: ISensorTag = sensorTags[id];

      // Fetch the sensor tags which have been switched "on"
      if (sensorTag.connect === 'on' || sensorTag.connect === '1') {
        const sensors: any = sensorTag.sensors;

        // Fetch each sensor from the sensor tags config
        for (let iSensor in sensors) {
          const sensor: ISensor = sensors[iSensor];
          // Fetch only the sensors which have been switched "on"
          if (sensor.data.display === "on" || sensor.graph.graphdisplay === "on" || sensor.grid.griddisplay === "on") {
            this.sensors.push({
              name: iSensor,
              config: sensor
            });
          }
        }
      }
    }

    console.log(this.sensors);
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
