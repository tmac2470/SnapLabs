// Angular
import { Component } from '@angular/core';
// Ionic
import { NavController, Platform } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';

@Component({
  selector: 'connect-page-component',
  templateUrl: 'connect.view.html'
})
export class ConnectPageComponent {
  devices: string[] = [];
  isScanning: boolean = false;

  constructor(
    private navCtrl: NavController,
    private platform: Platform
  ) {
    this.devices = [];
    this.isScanning = false;
  }

  ionViewDidEnter() {
    this.startScanning();
  }

  // Scan for bluetooth devices nearby
  startScanning() {
    if (!this.platform.is('cordova')) {
      return;
    }

    this.isScanning = true;
    const ble = new BLE();

    ble.startScan([]).subscribe(device => {
      this.devices.push(device);
    });

    // Scan for 3 seconds and then stop
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
