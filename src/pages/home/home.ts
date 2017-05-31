// Angular
import { Component } from '@angular/core';
// Ionic
import { NavController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  devices: string[];
  isScanning: boolean;

  constructor(public navCtrl: NavController) {
    this.devices = [];
    this.isScanning = false;
  }


  startScanning() {
    console.log('Scanning Started');
    this.devices = [];
    this.isScanning = true;
    const ble = new BLE();

    ble.startScan([]).subscribe(device => {
      this.devices.push(device);
    });

    setTimeout(() => {
      ble.stopScan().then(() => {
        console.log('Scanning has stopped');
        console.log(JSON.stringify(this.devices))
        this.isScanning = false;
      });
    }, 3000);
  }

  connectToDevice(device) {
    console.log('Connect To Device');
    console.log(JSON.stringify(device))
    // this.nav.push(DevicePage, {
    //   device: device
    // });
  }

}
